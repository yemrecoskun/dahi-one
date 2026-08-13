import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/character.dart';
import '../services/auth_service.dart';
import '../services/data_service.dart';
import '../widgets/character_orb.dart';
import '../widgets/custom_toast.dart';

/// Profil kartından açılır: kullanıcı adı, isim, soyisim düzenleme.
class EditProfileIdentityScreen extends StatefulWidget {
  const EditProfileIdentityScreen({super.key});

  @override
  State<EditProfileIdentityScreen> createState() => _EditProfileIdentityScreenState();
}

class _EditProfileIdentityScreenState extends State<EditProfileIdentityScreen> {
  final _auth = AuthService();
  final _dataService = DataService();
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _userCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = true;
  bool _saving = false;
  String _selectedCharacterId = 'puls';
  Map<String, Character> _characters = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    Map<String, Character> chars;
    try {
      chars = await _dataService.getCharacters();
    } catch (_) {
      chars = Character.getCharacters();
    }

    if (Firebase.apps.isEmpty) {
      if (mounted) {
        setState(() {
          _characters = chars;
          _loading = false;
        });
      }
      return;
    }
    try {
      final data = await _auth.getUserData();
      if (!mounted) return;
      if (data != null) {
        var fn = (data['firstName'] as String?)?.trim() ?? '';
        var ln = (data['lastName'] as String?)?.trim() ?? '';
        if (fn.isEmpty && ln.isEmpty) {
          final n = (data['name'] as String?)?.trim() ?? '';
          final parts = n.split(RegExp(r'\s+'));
          if (parts.isNotEmpty) {
            fn = parts.first;
            if (parts.length > 1) {
              ln = parts.sublist(1).join(' ');
            }
          }
        }
        _firstCtrl.text = fn;
        _lastCtrl.text = ln;
        final u = (data['username'] as String?)?.trim() ??
            (data['usernameLower'] as String?)?.trim() ??
            '';
        _userCtrl.text = u;
        final cid = (data['profileCharacterId'] as String?)?.trim().toLowerCase() ?? '';
        if (cid.isNotEmpty && chars.containsKey(cid)) {
          _selectedCharacterId = cid;
        } else {
          _selectedCharacterId = 'puls';
        }
      }
      if (mounted) {
        setState(() {
          _characters = chars;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _characters = chars;
          _loading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _userCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await _auth.updateProfileIdentity(
        firstName: _firstCtrl.text,
        lastName: _lastCtrl.text,
        usernameRaw: _userCtrl.text,
        profileCharacterId: _selectedCharacterId,
      );
      if (mounted) {
        CustomToast.showSuccess(context, 'Profil güncellendi');
        context.pop(true);
      }
    } catch (e) {
      if (mounted) {
        CustomToast.showError(
          context,
          e.toString().replaceFirst('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profili düzenle'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Kullanıcı adın arkadaş aramada kullanılır; benzersiz olmalıdır. '
                      '«Hangi One sensin?» testinde çıkan sonuç da profil karakterin olarak kaydedilir.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Color(0xFFb0b0b8),
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Profil karakterin',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Ana sayfadaki Character Orbs ile aynı yapı
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        SizedBox(
                          height: 120,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            itemCount: _characters.isEmpty
                                ? Character.getCharacters().length
                                : _characters.length,
                            itemBuilder: (context, index) {
                              final character = _characters.isEmpty
                                  ? Character.getCharacters().values.elementAt(index)
                                  : _characters.values.elementAt(index);
                              final selected = character.id == _selectedCharacterId;
                              final ring = Color(
                                int.parse(character.colorCode.replaceFirst('#', '0xFF')),
                              );
                              return Container(
                                margin: const EdgeInsets.symmetric(horizontal: 12),
                                padding: const EdgeInsets.all(3),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: selected ? ring : Colors.transparent,
                                    width: 3,
                                  ),
                                ),
                                child: CharacterOrb(
                                  character: character,
                                  onTap: () {
                                    setState(() => _selectedCharacterId = character.id);
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _userCtrl,
                      textInputAction: TextInputAction.next,
                      autocorrect: false,
                      decoration: const InputDecoration(
                        labelText: 'Kullanıcı adı',
                        hintText: 'ornek_kullanici',
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) {
                        final t = v?.trim() ?? '';
                        if (t.length < 3) {
                          return 'En az 3 karakter';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _firstCtrl,
                      textCapitalization: TextCapitalization.words,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'İsim',
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'İsim gerekli';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _lastCtrl,
                      textCapitalization: TextCapitalization.words,
                      textInputAction: TextInputAction.done,
                      decoration: const InputDecoration(
                        labelText: 'Soyisim',
                        border: OutlineInputBorder(),
                      ),
                      onFieldSubmitted: (_) {
                        if (!_saving) _save();
                      },
                    ),
                    const SizedBox(height: 32),
                    FilledButton(
                      onPressed: _saving ? null : _save,
                      child: _saving
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Kaydet'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
