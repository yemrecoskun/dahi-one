import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/character.dart';
import '../services/data_service.dart';

class DeviceDetailScreen extends StatefulWidget {
  final String dahiosId;
  final String characterId;
  final bool isActive;

  const DeviceDetailScreen({
    super.key,
    required this.dahiosId,
    required this.characterId,
    required this.isActive,
  });

  @override
  State<DeviceDetailScreen> createState() => _DeviceDetailScreenState();
}

class _DeviceDetailScreenState extends State<DeviceDetailScreen> {
  final DataService _dataService = DataService();
  Character? _character;
  bool _isLoading = true;
  late bool _isActive;
  bool _isUpdating = false;
  String? _redirectType;
  String? _customUrl;
  bool _isLoadingDeviceInfo = true;

  @override
  void initState() {
    super.initState();
    _isActive = widget.isActive;
    _loadCharacter();
    _loadDeviceInfo();
  }

  Future<void> _loadCharacter() async {
    try {
      final character = await _dataService.getCharacterById(widget.characterId);
      setState(() {
        _character = character;
        _isLoading = false;
      });
    } catch (e) {
      print('⚠️  Karakter yüklenirken hata: $e');
      // Hata durumunda local data kullan
      setState(() {
        _character = Character.getCharacters()[widget.characterId];
        _isLoading = false;
      });
    }
  }

  Future<void> _loadDeviceInfo() async {
    try {
      final response = await http.get(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosInfo?dahiosId=${widget.dahiosId}'),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['status'] == 'success') {
          final data = responseData['data'];
          setState(() {
            _redirectType = data['redirectType'] ?? 'character';
            _customUrl = data['customUrl'];
            _isLoadingDeviceInfo = false;
          });
        }
      }
    } catch (e) {
      print('⚠️  Cihaz bilgisi yüklenirken hata: $e');
      setState(() {
        _redirectType = 'character';
        _isLoadingDeviceInfo = false;
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

  Widget _buildRedirectSettings(Color characterColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: characterColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Yönlendirme Tipi Seçimi
          const Text(
            'Yönlendirme Tipi',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFFb0b0b8),
            ),
          ),
          const SizedBox(height: 12),
          _buildRedirectTypeSelector(characterColor),
          const SizedBox(height: 20),
          // Özel URL/Değer Girişi
          if (_redirectType != null && _needsCustomValue(_redirectType!))
            _buildCustomValueInput(characterColor),
        ],
      ),
    );
  }

  bool _needsCustomValue(String redirectType) {
    return redirectType == 'instagram' ||
        redirectType == 'whatsapp' ||
        redirectType == 'phone' ||
        redirectType == 'email' ||
        redirectType == 'campaign';
  }

  Widget _buildRedirectTypeSelector(Color characterColor) {
    final redirectTypes = [
      {'value': 'character', 'label': 'Karakter Sayfası', 'icon': Icons.person},
      {'value': 'store', 'label': 'Mağaza', 'icon': Icons.shopping_bag},
      {'value': 'instagram', 'label': 'Instagram', 'icon': Icons.camera_alt},
      {'value': 'whatsapp', 'label': 'WhatsApp', 'icon': Icons.chat},
      {'value': 'phone', 'label': 'Telefon', 'icon': Icons.phone},
      {'value': 'email', 'label': 'E-posta', 'icon': Icons.email},
      {'value': 'campaign', 'label': 'Özel Link', 'icon': Icons.link},
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0a0a0f),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF667eea).withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: DropdownButtonFormField<String>(
        value: _redirectType ?? 'character',
        decoration: const InputDecoration(
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          border: InputBorder.none,
        ),
        dropdownColor: const Color(0xFF1a1a2e),
        style: const TextStyle(color: Colors.white, fontSize: 16),
        icon: Icon(Icons.arrow_drop_down, color: characterColor),
        items: redirectTypes.map((type) {
          return DropdownMenuItem<String>(
            value: type['value'] as String,
            child: Row(
              children: [
                Icon(
                  type['icon'] as IconData,
                  size: 20,
                  color: characterColor,
                ),
                const SizedBox(width: 12),
                Text(
                  type['label'] as String,
                  style: const TextStyle(color: Colors.white),
                ),
              ],
            ),
          );
        }).toList(),
        onChanged: (value) {
          if (value != null) {
            setState(() {
              _redirectType = value;
              // Yeni tip için customUrl'i temizle
              if (!_needsCustomValue(value)) {
                _customUrl = null;
              } else if (_customUrl == null) {
                _customUrl = '';
              }
            });
            _updateRedirectType(value, _customUrl ?? '');
          }
        },
      ),
    );
  }

  Widget _buildCustomValueInput(Color characterColor) {
    String label = '';
    String hint = '';
    TextInputType keyboardType = TextInputType.text;

    switch (_redirectType) {
      case 'instagram':
        label = 'Instagram Kullanıcı Adı';
        hint = '@kullaniciadi veya kullaniciadi';
        keyboardType = TextInputType.text;
        break;
      case 'whatsapp':
        label = 'WhatsApp Numarası';
        hint = '905551234567 (ülke kodu ile)';
        keyboardType = TextInputType.phone;
        break;
      case 'phone':
        label = 'Telefon Numarası';
        hint = '905551234567';
        keyboardType = TextInputType.phone;
        break;
      case 'email':
        label = 'E-posta Adresi';
        hint = 'ornek@email.com';
        keyboardType = TextInputType.emailAddress;
        break;
      case 'campaign':
        label = 'Özel URL';
        hint = 'https://ornek.com';
        keyboardType = TextInputType.url;
        break;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFFb0b0b8),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: TextEditingController(text: _customUrl ?? ''),
          style: const TextStyle(color: Colors.white),
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF666666)),
            filled: true,
            fillColor: const Color(0xFF0a0a0f),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: const Color(0xFF667eea).withValues(alpha: 0.2),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: const Color(0xFF667eea).withValues(alpha: 0.2),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: characterColor,
                width: 2,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
          onChanged: (value) {
            setState(() {
              _customUrl = value;
            });
          },
          onSubmitted: (value) {
            _updateRedirectType(_redirectType!, value);
          },
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isUpdating
                ? null
                : () => _updateRedirectType(_redirectType!, _customUrl ?? ''),
            style: ElevatedButton.styleFrom(
              backgroundColor: characterColor,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: _isUpdating
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Kaydet',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Future<void> _updateRedirectType(String redirectType, String? customUrl) async {
    if (_isUpdating) return;

    setState(() {
      _isUpdating = true;
    });

    try {
      final body = <String, dynamic>{
        'dahiosId': widget.dahiosId,
        'redirectType': redirectType,
      };

      if (_needsCustomValue(redirectType)) {
        final customValue = customUrl ?? '';
        if (customValue.isEmpty) {
          throw Exception('${_getRedirectTypeLabel(redirectType)} için değer gerekli');
        }
        body['customUrl'] = customValue;
      } else {
        // Custom value gerektirmeyen tipler için customUrl'i temizle
        body['customUrl'] = null;
      }

      final response = await http.put(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosUpdate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['status'] == 'success') {
          setState(() {
            _redirectType = redirectType;
                _customUrl = (customUrl?.isEmpty ?? true) ? null : customUrl;
            _isUpdating = false;
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Yönlendirme ayarları güncellendi'),
                backgroundColor: Colors.green,
                duration: Duration(seconds: 2),
              ),
            );
          }
        } else {
          throw Exception(responseData['message'] ?? 'Güncelleme başarısız');
        }
      } else {
        final errorBody = json.decode(response.body);
        throw Exception(errorBody['message'] ?? 'Güncelleme başarısız');
      }
    } catch (e) {
      print('❌ Yönlendirme güncellenirken hata: $e');
      setState(() {
        _isUpdating = false;
      });

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
  }

  String _getRedirectTypeLabel(String redirectType) {
    switch (redirectType) {
      case 'instagram':
        return 'Instagram';
      case 'whatsapp':
        return 'WhatsApp';
      case 'phone':
        return 'Telefon';
      case 'email':
        return 'E-posta';
      case 'campaign':
        return 'Özel Link';
      default:
        return redirectType;
    }
  }

  Future<void> _toggleActiveStatus() async {
    if (_isUpdating) return;

    setState(() {
      _isUpdating = true;
    });

    try {
      final response = await http.put(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosUpdate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'dahiosId': widget.dahiosId,
          'isActive': !_isActive,
        }),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['status'] == 'success') {
          setState(() {
            _isActive = !_isActive;
            _isUpdating = false;
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  _isActive ? 'Cihaz aktif edildi' : 'Cihaz pasif edildi',
                ),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 2),
              ),
            );
          }
        } else {
          throw Exception(responseData['message'] ?? 'Güncelleme başarısız');
        }
      } else {
        final errorBody = json.decode(response.body);
        throw Exception(errorBody['message'] ?? 'Güncelleme başarısız');
      }
    } catch (e) {
      print('❌ Cihaz durumu güncellenirken hata: $e');
      setState(() {
        _isUpdating = false;
      });

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
  }

  @override
  Widget build(BuildContext context) {
    final characterColor = _getCharacterColor(widget.characterId);
    final characterName = _getCharacterName(widget.characterId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cihaz Detayı'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cihaz Kartı
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          characterColor.withValues(alpha: 0.3),
                          characterColor.withValues(alpha: 0.1),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: characterColor.withValues(alpha: 0.3),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        // Karakter İkonu
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: characterColor.withValues(alpha: 0.2),
                          ),
                          child: Center(
                            child: Text(
                              characterName[0],
                              style: TextStyle(
                                fontSize: 48,
                                fontWeight: FontWeight.w700,
                                color: characterColor,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Karakter Adı
                        Text(
                          characterName,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Durum Badge ve Toggle
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: _isActive
                                    ? Colors.green.withValues(alpha: 0.2)
                                    : Colors.grey.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _isActive ? Icons.check_circle : Icons.cancel,
                                    size: 16,
                                    color: _isActive ? Colors.green : Colors.grey,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _isActive ? 'Aktif' : 'Pasif',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: _isActive ? Colors.green : Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            // Toggle Switch
                            if (_isUpdating)
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFF667eea),
                                ),
                              )
                            else
                              Switch(
                                value: _isActive,
                                onChanged: (value) => _toggleActiveStatus(),
                                activeColor: Colors.green,
                                inactiveThumbColor: Colors.grey,
                                inactiveTrackColor: Colors.grey.withValues(alpha: 0.3),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  // dahiOS ID
                  const Text(
                    'dahiOS ID',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1a1a2e),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFF667eea).withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: SelectableText(
                      widget.dahiosId,
                      style: const TextStyle(
                        fontSize: 16,
                        fontFamily: 'monospace',
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Link Yönlendirme Ayarları
                  const Text(
                    'Link Yönlendirme',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (_isLoadingDeviceInfo)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else
                    _buildRedirectSettings(characterColor),
                  const SizedBox(height: 24),
                  // Karakter Detayına Git Butonu
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          characterColor,
                          characterColor.withValues(alpha: 0.8),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        context.push('/character/${widget.characterId}');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.person, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'Karakter Detayına Git',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // dahiOS Link
                  const Text(
                    'dahiOS Link',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1a1a2e),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFF667eea).withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: SelectableText(
                      'https://os.dahis.io/${widget.dahiosId}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF667eea),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

