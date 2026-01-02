import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/character.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';

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
  final AuthService _authService = AuthService();
  Character? _character;
  bool _isLoading = true;
  late bool _isActive;
  bool _isUpdating = false;
  List<String> _selectedProfileLinks = [];
  Map<String, String> _profileLinks = {};
  bool _isLoadingProfile = true;

  @override
  void initState() {
    super.initState();
    _isActive = widget.isActive;
    _loadCharacter();
    _loadProfileData();
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

  Future<void> _loadProfileData() async {
    setState(() => _isLoadingProfile = true);
    try {
      final userData = await _authService.getUserData();
      if (userData != null) {
        setState(() {
          _profileLinks['instagram'] = userData['instagram'] ?? '';
          _profileLinks['whatsapp'] = userData['whatsapp'] ?? '';
          _profileLinks['phone'] = userData['phone'] ?? '';
          _profileLinks['email'] = userData['email'] ?? '';
        });
      }

      // Cihazın profil link tiplerini yükle
      final response = await http.get(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosInfo?dahiosId=${widget.dahiosId}'),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['status'] == 'success') {
          final data = responseData['data'];
          setState(() {
            // Backward compatibility: Eğer profileLinkType varsa array'e çevir
            if (data['profileLinkTypes'] != null && data['profileLinkTypes'] is List) {
              _selectedProfileLinks = List<String>.from(data['profileLinkTypes']);
            } else if (data['profileLinkType'] != null && data['profileLinkType'] != 'none') {
              _selectedProfileLinks = [data['profileLinkType']];
            } else {
              _selectedProfileLinks = [];
            }
          });
        }
      }
    } catch (e) {
      print('⚠️  Profil bilgisi yüklenirken hata: $e');
      setState(() {
        _selectedProfileLinks = [];
      });
    } finally {
      setState(() => _isLoadingProfile = false);
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

  Widget _buildProfileLinkSelector(Color characterColor) {
    final profileLinks = [
      {'key': 'instagram', 'label': 'Instagram', 'icon': Icons.camera_alt},
      {'key': 'whatsapp', 'label': 'WhatsApp', 'icon': Icons.chat},
      {'key': 'phone', 'label': 'Telefon', 'icon': Icons.phone},
      {'key': 'email', 'label': 'E-posta', 'icon': Icons.email},
    ];

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
        children: profileLinks.map((link) {
          final key = link['key'] as String;
          final label = link['label'] as String;
          final icon = link['icon'] as IconData;
          final value = _profileLinks[key] ?? '';
          final isSelected = _selectedProfileLinks.contains(key);
          final hasValue = value.isNotEmpty;

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0a0a0f),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? characterColor
                    : const Color(0xFF667eea).withValues(alpha: 0.2),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(icon, color: characterColor, size: 24),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      if (hasValue)
                        Text(
                          value,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFFb0b0b8),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        )
                      else
                        const Text(
                          'Profilde eklenmemiş',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF666666),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Checkbox(
                  value: isSelected,
                  onChanged: hasValue
                      ? (value) {
                          setState(() {
                            if (value == true) {
                              // Ekle
                              if (!_selectedProfileLinks.contains(key)) {
                                _selectedProfileLinks.add(key);
                              }
                            } else {
                              // Kaldır
                              _selectedProfileLinks.remove(key);
                            }
                          });
                          _updateProfileLinkTypes(_selectedProfileLinks);
                        }
                      : null,
                  activeColor: characterColor,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Future<void> _updateProfileLinkTypes(List<String> profileLinkTypes) async {
    if (_isUpdating) return;

    setState(() {
      _isUpdating = true;
    });

    try {
      final body = <String, dynamic>{
        'dahiosId': widget.dahiosId,
        'profileLinkTypes': profileLinkTypes.isEmpty ? null : profileLinkTypes,
      };

      final response = await http.put(
        Uri.parse('https://us-central1-dahisio.cloudfunctions.net/dahiosUpdate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['status'] == 'success') {
          setState(() {
            _isUpdating = false;
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(profileLinkTypes.isEmpty 
                  ? 'Profil link yönlendirmesi kaldırıldı'
                  : '${profileLinkTypes.length} profil link yönlendirmesi güncellendi'),
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
      print('❌ Profil link güncellenirken hata: $e');
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
                  // Profil Link Yönlendirme
                  const Text(
                    'Profil Link Yönlendirme',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Profilinizdeki iletişim bilgilerinden birini seçin',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFb0b0b8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (_isLoadingProfile)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else
                    _buildProfileLinkSelector(characterColor),
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

