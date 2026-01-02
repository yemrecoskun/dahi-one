import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class ContactInfoScreen extends StatefulWidget {
  const ContactInfoScreen({super.key});

  @override
  State<ContactInfoScreen> createState() => _ContactInfoScreenState();
}

class _ContactInfoScreenState extends State<ContactInfoScreen> {
  final _authService = AuthService();
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, String> _profileLinks = {};
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  @override
  void dispose() {
    // Controller'ları temizle
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    _controllers.clear();
    super.dispose();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);
    try {
      final userData = await _authService.getUserData();
      if (userData != null) {
        setState(() {
          // Sadece Firestore'da değeri olanları ekle, yoksa ekleme
          if (userData['instagram'] != null) {
            final value = userData['instagram'] as String;
            _profileLinks['instagram'] = value;
            _controllers['instagram'] = TextEditingController(text: value);
          }
          if (userData['whatsapp'] != null) {
            final value = userData['whatsapp'] as String;
            _profileLinks['whatsapp'] = value;
            _controllers['whatsapp'] = TextEditingController(text: value);
          }
          if (userData['phone'] != null) {
            final value = userData['phone'] as String;
            _profileLinks['phone'] = value;
            _controllers['phone'] = TextEditingController(text: value);
          }
          if (userData['email'] != null) {
            final value = userData['email'] as String;
            _profileLinks['email'] = value;
            _controllers['email'] = TextEditingController(text: value);
          }
        });
      }
    } catch (e) {
      print('Profil yükleme hatası: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  bool _hasAddedContacts() {
    // Map'te en az bir key varsa (boş string olsa bile) true döner
    return _profileLinks.isNotEmpty;
  }

  Future<void> _saveProfileData() async {
    if (_isSaving) return;

    setState(() => _isSaving = true);
    try {
      await _authService.updateProfileLinks(_profileLinks);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profil bilgileri güncellendi'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      print('Profil kaydetme hatası: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Hata: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _showAddContactDialog() async {
    final availableContacts = [
      {'key': 'instagram', 'label': 'Instagram', 'icon': Icons.camera_alt},
      {'key': 'whatsapp', 'label': 'WhatsApp', 'icon': Icons.chat},
      {'key': 'phone', 'label': 'Telefon', 'icon': Icons.phone},
      {'key': 'email', 'label': 'E-posta', 'icon': Icons.email},
    ].where((contact) {
      final key = contact['key'] as String;
      // Key yoksa veya boş string ise eklenebilir
      final value = _profileLinks[key];
      return value == null || value.isEmpty;
    }).toList();

    if (availableContacts.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tüm iletişim bilgileri zaten eklenmiş'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 2),
          ),
        );
      }
      return;
    }

    if (!mounted) return;

    final selected = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('İletişim Bilgisi Ekle'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: availableContacts.map((contact) {
            return ListTile(
              leading: Icon(
                contact['icon'] as IconData,
                color: const Color(0xFF667eea),
              ),
              title: Text(contact['label'] as String),
              onTap: () {
                Navigator.of(context).pop(contact);
              },
            );
          }).toList(),
        ),
      ),
    );

    if (selected != null && mounted) {
      final key = selected['key'] as String;
      setState(() {
        _profileLinks[key] = '';
        // Controller oluştur
        if (!_controllers.containsKey(key)) {
          _controllers[key] = TextEditingController(text: '');
        }
      });
    }
  }

  Widget _buildContactFieldsList() {
    final contactTypes = [
      {'key': 'instagram', 'label': 'Instagram', 'icon': Icons.camera_alt, 'hint': 'Kullanıcı adı (@kullaniciadi)'},
      {'key': 'whatsapp', 'label': 'WhatsApp', 'icon': Icons.chat, 'hint': 'Telefon numarası (905551234567)'},
      {'key': 'phone', 'label': 'Telefon', 'icon': Icons.phone, 'hint': 'Telefon numarası (905551234567)'},
      {'key': 'email', 'label': 'E-posta', 'icon': Icons.email, 'hint': 'E-posta adresi'},
    ];

    final addedFields = <Widget>[];
    
    for (final contact in contactTypes) {
      final key = contact['key'] as String;
      // Key map'te varsa göster (boş string olsa bile, kullanıcı eklemiş demektir)
      if (_profileLinks.containsKey(key)) {
        addedFields.add(
          Padding(
            key: ValueKey('contact-$key'),
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildProfileLinkField(
              key,
              contact['label'] as String,
              contact['icon'] as IconData,
              contact['hint'] as String,
            ),
          ),
        );
      }
    }

    if (addedFields.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1a1a2e),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: const Color(0xFF667eea).withValues(alpha: 0.2),
            width: 1,
          ),
        ),
        child: const Center(
          child: Text(
            'Henüz iletişim bilgisi eklenmemiş\n+ butonuna tıklayarak ekleyebilirsiniz',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFFb0b0b8),
            ),
          ),
        ),
      );
    }

    return Column(children: addedFields);
  }

  Widget _buildProfileLinkField(String key, String label, IconData icon, String hint) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF667eea).withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF667eea), size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFb0b0b8),
                      ),
                    ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                        onPressed: () {
                          setState(() {
                            _profileLinks.remove(key);
                            // Controller'ı temizle
                            _controllers[key]?.dispose();
                            _controllers.remove(key);
                          });
                        },
                        tooltip: 'Kaldır',
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _controllers[key] ??= TextEditingController(text: _profileLinks[key] ?? ''),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: const TextStyle(color: Color(0xFF666666)),
                    filled: true,
                    fillColor: const Color(0xFF0a0a0f),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                  ),
                  onChanged: (value) {
                    _profileLinks[key] = value;
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('İletişim Bilgileri'),
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
                  // Profil Linkleri Bölümü
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'İletişim Bilgileri',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      // + Butonu
                      IconButton(
                        onPressed: _showAddContactDialog,
                        icon: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFF667eea),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        tooltip: 'İletişim bilgisi ekle',
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Sadece eklenmiş iletişim bilgilerini göster
                  _buildContactFieldsList(),
                  const SizedBox(height: 24),

                  // Kaydet Butonu (sadece eklenmiş alanlar varsa göster)
                  if (_hasAddedContacts())
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _saveProfileData,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF667eea),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: _isSaving
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
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

