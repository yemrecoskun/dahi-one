import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
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
    // Uygulama arka plana gittiğinde NFC okumayı durdur
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      if (_isNfcScanning) {
        print('⚠️ Uygulama arka plana gitti, NFC durduruluyor...');
        NfcManager.instance.stopSession().catchError((e) {
          print('⚠️ NFC stop hatası: $e');
        });
        setState(() {
          _isNfcScanning = false;
        });
        if (mounted) {
          Navigator.of(context).pop(); // Dialog'u kapat
        }
      }
    }
  }

  Future<void> _loadDevices() async {
    setState(() => _isLoading = true);
    final devices = await _authService.getUserDevices();
    setState(() {
      _devices = devices;
      _isLoading = false;
    });
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
    // iOS'ta isAvailable() bazen yanlış sonuç verebilir
    // Bu yüzden kontrolü atlayıp direkt okumayı deniyoruz
    // Dialog göster - iOS'ta NFC session'ın çalışması için dialog gerekli
    if (!mounted) return;
    
    setState(() {
      _isNfcScanning = true;
    });
    
    // Dialog'u göster ve session'ı dialog içinde başlat
    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => _NfcScanDialog(
          onCancel: () async {
            print('🛑 İptal butonuna basıldı, session durduruluyor...');
            try {
              await NfcManager.instance.stopSession();
            } catch (e) {
              print('⚠️ NFC stop hatası: $e');
            }
            setState(() {
              _isNfcScanning = false;
            });
            if (mounted) {
              Navigator.of(context).pop();
            }
          },
          onTagDiscovered: (String nfcId) async {
            // Tag bulundu, dialog'u kapat ve işlemi tamamla
            if (mounted) {
              setState(() {
                _isNfcScanning = false;
              });
              Navigator.of(context).pop();
            }
            
            // Tag ID'yi küçük harfe çevir (Firestore document ID'leri case-sensitive)
            final normalizedNfcId = nfcId.toLowerCase();
            print('🌐 Backend\'e istek gönderiliyor: $normalizedNfcId (orijinal: $nfcId)');
            
            try {
              final response = await http.get(
                Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosInfo?dahiosId=$normalizedNfcId'),
              );

              print('📡 Backend yanıtı: ${response.statusCode}');
              print('📡 Backend body: ${response.body}');
              
              if (response.statusCode == 200) {
                final responseData = json.decode(response.body);
                print('✅ Backend data: $responseData');
                
                // Backend response formatı: {status: "success", data: {...}}
                final data = responseData['data'];
                final characterId = data?['characterId'] ?? normalizedNfcId;
                
                // Cihazın zaten ekli olup olmadığını kontrol et
                final isAlreadyAdded = _devices.any(
                  (device) => (device['dahiosId'] as String? ?? '').toLowerCase() == normalizedNfcId,
                );
                
                if (isAlreadyAdded) {
                  // Cihaz zaten ekli
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Bu cihaz zaten ekli: $characterId'),
                        backgroundColor: Colors.orange,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  }
                  return;
                }
                
                // Kullanıcının cihazlarına ekle (normalized ID ile)
                await _authService.addDevice(normalizedNfcId);
                
                // Cihaz listesini yenile
                await _loadDevices();
                
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Cihaz başarıyla tanımlandı: $characterId'),
                      backgroundColor: Colors.green,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              } else {
                final errorBody = response.body;
                print('❌ Backend hatası: $errorBody');
                throw Exception('dahiOS tag bulunamadı (ID: $normalizedNfcId)');
              }
            } catch (e) {
              print('❌ Backend istek hatası: $e');
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Hata: ${e.toString()}'),
                    backgroundColor: Colors.red,
                    duration: const Duration(seconds: 3),
                  ),
                );
              }
            }
          },
        ),
      );
    }
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
              ? Center(
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
                      Container(
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
                      ),
                      const SizedBox(height: 16),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF1a1a2e),
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                            color: const Color(0xFF667eea).withValues(alpha: 0.3),
                            width: 1,
                          ),
                        ),
                        child: ElevatedButton.icon(
                          onPressed: _handleNfcScan,
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
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadDevices,
                  child: CustomScrollView(
                    slivers: [
                      // Butonlar
                      SliverToBoxAdapter(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        Color(0xFF667eea),
                                        Color(0xFF764ba2),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      context.push('/store');
                                    },
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
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1a1a2e),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: const Color(0xFF667eea).withValues(alpha: 0.3),
                                      width: 1,
                                    ),
                                  ),
                                  child: ElevatedButton.icon(
                                    onPressed: _handleNfcScan,
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
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Cihaz Listesi
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                      final device = _devices[index];
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
                          leading: Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: characterColor.withValues(alpha: 0.2),
                            ),
                            child: Center(
                              child: Text(
                                characterName[0],
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                  color: characterColor,
                                ),
                              ),
                            ),
                          ),
                          title: Text(
                            characterName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(
                                'dahiOS ID: ${dahiosId.substring(0, 8)}...',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFb0b0b8),
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
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
                                  ),
                                ],
                              ),
                            ],
                          ),
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
                            },
                            childCount: _devices.length,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}

// NFC Scan Dialog Widget - Session'ı dialog içinde başlat
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
        _startNfcNative();
      }
    });
  }

  Future<void> _startNfcNative() async {
    setState(() {
      _scanning = true;
      _error = null;
    });

    try {
      print('🚀 Native iOS NFC session başlatılıyor...');
      final nfcId = await IosNfc.startSession();
      print('✅ NFC ID okundu: $nfcId');

      if (mounted) {
        // Native iOS NFC session otomatik olarak kapanır
        widget.onTagDiscovered(nfcId);
      }
    } catch (e) {
      print('❌ Native NFC hatası: $e');
      if (mounted) {
        setState(() {
          _error = e.toString();
          _scanning = false;
        });
      }
    }
  }

  Future<void> _startNfc() async {
    print('🚀 NFC session başlatılıyor (nfc_manager)');
    
    setState(() {
      _scanning = true;
      _error = null;
    });

    try {
      // iOS'ta NFC kullanılabilirliğini kontrol et
      final isAvailable = await NfcManager.instance.isAvailable();
      if (!isAvailable) {
        throw Exception('NFC özelliği bu cihazda desteklenmiyor veya kapalı');
      }

      print('✅ NFC kullanılabilir, tag okuma başlatılıyor...');
      
      // NFC session başlat
      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          print('🔥🔥🔥 TAG ALGILANDI 🔥🔥🔥');
          print('📱 Tag handle: ${tag.handle}');
          
          try {
            String? nfcId;
            
            // ÖNCE NDEF mesajını oku (tag'lere yazılan URL'den UID almak için)
            final ndef = Ndef.from(tag);
            if (ndef != null) {
              print('📄 NDEF formatı bulundu, mesaj okunuyor...');
              try {
                final ndefMessage = await ndef.read();
                print('📄 NDEF Message records: ${ndefMessage.records.length}');
                
                if (ndefMessage.records.isNotEmpty) {
                  final firstRecord = ndefMessage.records.first;
                  print('📄 First record type: ${firstRecord.type}');
                  print('📄 First record payload: ${firstRecord.payload}');
                  
                  // Payload'dan string oluştur
                  if (firstRecord.payload != null && firstRecord.payload!.isNotEmpty) {
                    final payload = firstRecord.payload!;
                    // İlk byte language code length olabilir (Text Record için)
                    final langLen = payload.isNotEmpty ? (payload[0] & 0x3F) : 0;
                    if (langLen > 0 && payload.length > langLen) {
                      nfcId = String.fromCharCodes(payload.sublist(langLen + 1)).trim();
                    } else {
                      nfcId = String.fromCharCodes(payload).trim();
                    }
                    print('✅ NDEF Payload string: $nfcId');
                    
                    // URL formatından UID'yi çıkar
                    if (nfcId != null && nfcId.isNotEmpty) {
                      if (nfcId.startsWith('http://') || nfcId.startsWith('https://')) {
                        final uri = Uri.tryParse(nfcId);
                        if (uri != null && uri.pathSegments.isNotEmpty) {
                          nfcId = uri.pathSegments.last;
                          print('✅ URL\'den UID çıkarıldı: $nfcId');
                        }
                      } else if (nfcId.contains('/')) {
                        nfcId = nfcId.split('/').last;
                        print('✅ Path\'den UID çıkarıldı: $nfcId');
                      }
                    }
                  }
                }
              } catch (e) {
                print('⚠️ NDEF okuma hatası: $e');
              }
            }
            
            // Eğer NDEF'ten UID alınamadıysa, tag ID'yi kullan (fallback)
            if (nfcId == null || nfcId.isEmpty) {
              print('📱 NDEF\'ten UID alınamadı, tag ID kullanılıyor...');
              print('📱 Tag data: ${tag.data}');
              
              // iOS/Android'de tag ID genellikle data içinde identifier olarak gelir
              final nfca = tag.data['nfca'];
              final nfcb = tag.data['nfcb'];
              final nfcf = tag.data['nfcf'];
              final nfcv = tag.data['nfcv'];
              
              dynamic identifier;
              if (nfca != null && nfca['identifier'] != null) {
                identifier = nfca['identifier'];
              } else if (nfcb != null && nfcb['identifier'] != null) {
                identifier = nfcb['identifier'];
              } else if (nfcf != null && nfcf['identifier'] != null) {
                identifier = nfcf['identifier'];
              } else if (nfcv != null && nfcv['identifier'] != null) {
                identifier = nfcv['identifier'];
              }
              
              if (identifier != null) {
                if (identifier is List) {
                  nfcId = (identifier as List<int>)
                      .map((e) => e.toRadixString(16).padLeft(2, '0'))
                      .join();
                  print('✅ Tag ID kullanıldı (List): $nfcId');
                } else if (identifier is String) {
                  nfcId = identifier;
                  print('✅ Tag ID kullanıldı (String): $nfcId');
                }
              }
            }
            
            if (nfcId == null || nfcId.isEmpty) {
              throw Exception('NFC ID okunamadı');
            }
            
            print('✅ NFC ID okundu: $nfcId');
            
            // Session'ı durdur
            await NfcManager.instance.stopSession();
            
            // Callback'i çağır
            if (mounted) {
              widget.onTagDiscovered(nfcId);
            }
          } catch (e) {
            print('❌ Tag işleme hatası: $e');
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
      print('❌ NFC session hatası: $e');
      setState(() {
        _error = e.toString();
        _scanning = false;
      });
      try {
        await NfcManager.instance.stopSession();
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    NfcManager.instance.stopSession().catchError((_) {});
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('NFC Okutun'),
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
