import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;
import 'dart:typed_data';
import '../services/auth_service.dart';
import '../models/character.dart';
import '../ios_nfc_service.dart';

class DevicesScreen extends StatefulWidget {
  const DevicesScreen({super.key});

  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> with WidgetsBindingObserver {
  final _authService = AuthService();
  List<Map<String, dynamic>> _devices = [];
  bool _isLoading = true;
  bool _isNfcScanning = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadDevices();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      if (_isNfcScanning && !Platform.isIOS) {
        _stopNfcSession();
      }
    }
  }

  Future<void> _loadDevices() async {
    setState(() => _isLoading = true);
    final devices = await _authService.getUserDevices();
    if (mounted) {
      setState(() {
        _devices = devices;
        _isLoading = false;
      });
    }
  }

  Color _parseColor(String colorCode) {
    return Color(int.parse(colorCode.replaceFirst('#', '0xFF')));
  }

  String _getCharacterName(String characterId) {
    final characters = Character.getCharacters();
    return characters[characterId]?.name ?? characterId;
  }

  Color _getCharacterColor(String characterId) {
    final characters = Character.getCharacters();
    return _parseColor(characters[characterId]?.colorCode ?? '#667eea');
  }

  Future<void> _handleNfcScan() async {
    if (!mounted) return;
    
    setState(() => _isNfcScanning = true);
    
    if (Platform.isIOS) {
      await _handleIosNfcScan();
    } else {
      await _handleAndroidNfcScan();
    }
  }

  Future<void> _handleIosNfcScan() async {
    try {
      print('🚀 iOS Native NFC başlatılıyor...');
      final nfcId = await IosNfc.startSession();
      print('✅ NFC ID okundu: $nfcId');
      await _processNfcId(nfcId);
    } catch (e) {
      print('❌ iOS NFC hatası: $e');
      if (mounted) {
        _showError('NFC okuma hatası: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() => _isNfcScanning = false);
      }
    }
  }

  Future<void> _handleAndroidNfcScan() async {
    if (!mounted) return;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => _NfcScanDialog(
        onCancel: () {
          _stopNfcSession();
          setState(() => _isNfcScanning = false);
          Navigator.of(context).pop();
        },
        onTagDiscovered: (nfcId) async {
          Navigator.of(context).pop();
          await _processNfcId(nfcId);
        },
      ),
    );
  }

  Future<void> _stopNfcSession() async {
    try {
      await NfcManager.instance.stopSession();
    } catch (e) {
      print('⚠️ NFC stop hatası: $e');
    }
  }

  Future<void> _processNfcId(String nfcId) async {
    if (!mounted) return;
    
    setState(() => _isNfcScanning = false);
    
    final normalizedNfcId = nfcId.toLowerCase();
    print('🌐 Backend\'e istek gönderiliyor: $normalizedNfcId');

    try {
      final response = await http.get(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosInfo?dahiosId=$normalizedNfcId'),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        final data = responseData['data'];
        final characterId = data?['characterId'] ?? normalizedNfcId;

        // Duplicate kontrolü - güncel listeyi kullan
        final currentDevices = await _authService.getUserDevices();
        final isAlreadyAdded = currentDevices.any(
          (device) => (device['dahiosId'] as String? ?? '').toLowerCase() == normalizedNfcId,
        );

        if (isAlreadyAdded) {
          if (mounted) {
            setState(() => _isNfcScanning = false);
            _showMessage('Bu cihaz zaten ekli: $characterId', Colors.orange);
          }
          return;
        }

        // Cihazı ekle
        try {
          await _authService.addDevice(normalizedNfcId);
          
          // Cihaz listesini yenile ve state'i güncelle
          await _loadDevices();

          if (mounted) {
            setState(() => _isNfcScanning = false);
            _showMessage('Cihaz başarıyla tanımlandı: $characterId', Colors.green);
          }
        } catch (e) {
          // addDevice hatası (örneğin etiket başka kullanıcıya ait)
          if (mounted) {
            setState(() => _isNfcScanning = false);
            final errorMessage = e.toString().contains('başka bir kullanıcıya tanımlı')
                ? 'Bu etiket başka bir kullanıcıya tanımlı. Bir etiket sadece bir kullanıcıya tanımlanabilir.'
                : 'Cihaz eklenirken bir hata oluştu: ${e.toString()}';
            _showError(errorMessage);
          }
          return;
        }
      } else {
        throw Exception('dahiOS tag bulunamadı (ID: $normalizedNfcId)');
      }
    } catch (e) {
      print('❌ Backend istek hatası: $e');
      if (mounted) {
        setState(() => _isNfcScanning = false);
        _showError('Hata: ${e.toString()}');
      }
    }
  }

  void _showMessage(String message, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showError(String message) {
    _showMessage(message, Colors.red);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cihazlarım'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _devices.isEmpty
              ? _buildEmptyState()
              : _buildDevicesList(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.watch_off,
            size: 80,
            color: Color(0xFFb0b0b8),
          ),
          const SizedBox(height: 24),
          const Text(
            'Henüz cihazınız yok',
            style: TextStyle(
              fontSize: 18,
              color: Color(0xFFb0b0b8),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Mağazadan cihazı satın alarak veya cihazınızı okutarak \ncihazlarınızı burada görebilirsiniz',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFFb0b0b8),
            ),
          ),
          const SizedBox(height: 32),
          _buildEmptyStateStoreButton(),
          const SizedBox(height: 16),
          _buildEmptyStateNfcButton(),
        ],
      ),
    );
  }

  Widget _buildDevicesList() {
    return RefreshIndicator(
      onRefresh: _loadDevices,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(child: _buildStoreButton()),
                  const SizedBox(width: 12),
                  Expanded(child: _buildNfcButton()),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildDeviceCard(_devices[index]),
                childCount: _devices.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyStateStoreButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF667eea),
            Color(0xFF764ba2),
          ],
        ),
        borderRadius: BorderRadius.circular(25),
      ),
      child: ElevatedButton(
        onPressed: () {
          context.push('/store');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(
            horizontal: 32,
            vertical: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
        ),
        child: const Text(
          'Mağazaya Git',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyStateNfcButton() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(25),
        border: Border.all(
          color: const Color(0xFF667eea).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: ElevatedButton.icon(
        onPressed: _isNfcScanning ? null : _handleNfcScan,
        icon: const Icon(Icons.nfc, color: Color(0xFF667eea)),
        label: const Text(
          'Cihaz Tanımla',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF667eea),
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(
            horizontal: 32,
            vertical: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
        ),
      ),
    );
  }

  Widget _buildStoreButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF667eea), Color(0xFF764ba2)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ElevatedButton.icon(
        onPressed: () => context.push('/store'),
        icon: const Icon(Icons.shopping_bag, color: Colors.white),
        label: const Text(
          'Mağazaya Git',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildNfcButton() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF667eea).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: ElevatedButton.icon(
        onPressed: _isNfcScanning ? null : _handleNfcScan,
        icon: const Icon(Icons.nfc, color: Color(0xFF667eea)),
        label: const Text(
          'Cihaz Tanımla',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF667eea),
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildDeviceCard(Map<String, dynamic> device) {
    final characterId = device['characterId'] as String? ?? '';
    final dahiosId = device['dahiosId'] as String? ?? '';
    final characterName = _getCharacterName(characterId);
    final characterColor = _getCharacterColor(characterId);
    final isActive = device['isActive'] as bool? ?? false;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            characterColor.withValues(alpha: 0.2),
            characterColor.withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: characterColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: _buildCharacterAvatar(characterName, characterColor),
        title: Text(
          characterName,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: _buildDeviceSubtitle(dahiosId, isActive),
        trailing: Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: characterColor,
        ),
        onTap: () {
          context.push(
            '/device/${dahiosId}?characterId=$characterId&isActive=$isActive',
          );
        },
      ),
    );
  }

  Widget _buildCharacterAvatar(String characterName, Color color) {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.2),
      ),
      child: Center(
        child: Text(
          characterName[0],
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ),
    );
  }

  Widget _buildDeviceSubtitle(String dahiosId, bool isActive) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 4),
        Text(
          'dahiOS ID: ${dahiosId.length > 8 ? '${dahiosId.substring(0, 8)}...' : dahiosId}',
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFFb0b0b8),
            fontFamily: 'monospace',
          ),
        ),
        const SizedBox(height: 4),
        _buildStatusBadge(isActive),
      ],
    );
  }

  Widget _buildStatusBadge(bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive
            ? Colors.green.withValues(alpha: 0.2)
            : Colors.grey.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        isActive ? 'Aktif' : 'Pasif',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: isActive ? Colors.green : Colors.grey,
        ),
      ),
    );
  }
}

// NFC Scan Dialog Widget
class _NfcScanDialog extends StatefulWidget {
  final VoidCallback onCancel;
  final Function(String) onTagDiscovered;

  const _NfcScanDialog({
    required this.onCancel,
    required this.onTagDiscovered,
  });

  @override
  State<_NfcScanDialog> createState() => _NfcScanDialogState();
}

class _NfcScanDialogState extends State<_NfcScanDialog> {
  bool _scanning = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) {
        _startNfc();
      }
    });
  }

  Future<void> _startNfc() async {
    if (!mounted) return;
    
    setState(() {
      _scanning = true;
      _error = null;
    });

    try {
      // In nfc_manager 3.x, we start the session directly
      // Availability errors will be caught in the catch block
      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          try {
            final nfcId = await _extractNfcId(tag);
            await NfcManager.instance.stopSession();
            
            if (mounted) {
              widget.onTagDiscovered(nfcId);
            }
          } catch (e) {
            await NfcManager.instance.stopSession();
            if (mounted) {
              setState(() {
                _error = e.toString();
                _scanning = false;
              });
            }
          }
        },
        pollingOptions: {
          NfcPollingOption.iso14443,
          NfcPollingOption.iso15693,
          NfcPollingOption.iso18092,
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _scanning = false;
        });
      }
    }
  }
  
Future<String> _extractNfcId(NfcTag tag) async {
  String? nfcId;

  try {
    print(tag);
    final ndef = Ndef.from(tag);
    if (ndef == null) {
      throw Exception('NDEF desteklenmiyor');
    }

    final message = await ndef.read();
    if (message.records.isEmpty) {
      throw Exception('NDEF boş');
    }

    for (final record in message.records) {
      // URI / URL record
      if (record.typeNameFormat == NdefTypeNameFormat.nfcWellknown &&
          String.fromCharCodes(record.type) == 'U') {
        final payload = record.payload;

        if (payload.isEmpty) continue;

        // URI prefix byte’ını atla
        final uriString = String.fromCharCodes(payload.skip(1)).trim();
        print('🔗 NDEF URL: $uriString');

        final uri = Uri.tryParse(uriString);
        if (uri != null && uri.pathSegments.isNotEmpty) {
          nfcId = uri.pathSegments.last.toLowerCase();
          print('✅ UID bulundu: $nfcId');
          break;
        }
      }
    }
  } catch (e) {
    print('❌ NDEF okuma hatası: $e');
  }

  if (nfcId == null || nfcId.isEmpty) {
    throw Exception('NFC ID okunamadı');
  }

  return nfcId;
}

  @override
  void dispose() {
    NfcManager.instance.stopSession().catchError((_) {});
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('dahiOS etiketini Okutun'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.nfc, size: 64),
          const SizedBox(height: 12),
          if (_scanning)
            const Text('Etiketi yaklaştırın...')
          else if (_error != null)
            Text(_error!, style: const TextStyle(color: Colors.red)),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () async {
            await NfcManager.instance.stopSession().catchError((_) {});
            widget.onCancel();
          },
          child: const Text('İptal'),
        ),
      ],
    );
  }
}
