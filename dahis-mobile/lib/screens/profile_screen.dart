import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import '../services/auth_service.dart';
import '../widgets/custom_toast.dart';
import 'devices_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authService = AuthService();
  bool _isLoading = true;
  bool _isDeleting = false;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);
    try {
      await _authService.getUserData();
    } catch (e) {
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    
    // Firebase başlatılmamışsa bilgilendirme mesajı göster
    if (Firebase.apps.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Profil'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.cloud_off,
                  size: 64,
                  color: Color(0xFFb0b0b8),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Firebase bağlantısı kurulamadı',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFb0b0b8),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Profil özelliklerini kullanmak için Firebase yapılandırması gereklidir.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFFb0b0b8),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
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
                      context.pop();
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
                      'Geri Dön',
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
        ),
      );
    }

    final user = _authService.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: StreamBuilder<User?>(
        stream: _authService.authStateChanges,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.data == null) {
            // Kullanıcı giriş yapmamış
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.person_outline,
                    size: 80,
                    color: Color(0xFFb0b0b8),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Giriş yaparak profilinize erişin',
                    style: TextStyle(
                      fontSize: 18,
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
                        context.push('/login');
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
                        'Giriş Yap',
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
            );
          }

          // Kullanıcı giriş yapmış
          return FutureBuilder<Map<String, dynamic>?>(
            future: _authService.getUserData(),
            builder: (context, userDataSnapshot) {
              final userData = userDataSnapshot.data ?? {};
              final userName = userData['name'] as String? ?? user?.displayName ?? user?.email?.split('@')[0] ?? 'Kullanıcı';

              if (_isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              return SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Profil Header
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFF667eea),
                            Color(0xFF764ba2),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.2),
                            ),
                            child: const Icon(
                              Icons.person,
                              size: 40,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  userName,
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  user?.email ?? '',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Cihazlarım Butonu
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1a1a2e),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF667eea).withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        leading: const Icon(
                          Icons.watch,
                          color: Color(0xFF667eea),
                          size: 32,
                        ),
                        title: const Text(
                          'Cihazlarım',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: const Text(
                          'dahiOS',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFFb0b0b8),
                          ),
                        ),
                        trailing: const Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: Color(0xFFb0b0b8),
                        ),
                        onTap: () {
                          context.push('/devices');
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // İletişim Bilgileri Menü Öğesi
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1a1a2e),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF667eea).withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        leading: const Icon(
                          Icons.contact_mail,
                          color: Color(0xFF667eea),
                          size: 32,
                        ),
                        title: const Text(
                          'Kişisel Bilgilerim',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: const Text(
                          'İletişim bilgileri',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFFb0b0b8),
                          ),
                        ),
                        trailing: const Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: Color(0xFFb0b0b8),
                        ),
                        onTap: () {
                          context.push('/contact-info');
                        },
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Ödeme Bilgilerim Menü Öğesi
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1a1a2e),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF667eea).withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        leading: const Icon(
                          Icons.payment,
                          color: Color(0xFF667eea),
                          size: 32,
                        ),
                        title: const Text(
                          'Ödeme Bilgilerim',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: const Text(
                          'IBAN, banka, ad soyad',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFFb0b0b8),
                          ),
                        ),
                        trailing: const Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: Color(0xFFb0b0b8),
                        ),
                        onTap: () {
                          context.push('/payment-info');
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Hesabı Sil Butonu
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.orange.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        leading: const Icon(
                          Icons.delete_forever,
                          color: Colors.orange,
                        ),
                        title: const Text(
                          'Hesabı Sil',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.orange,
                          ),
                        ),
                        onTap: () => _showDeleteAccountDialog(context),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Çıkış Butonu
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.red.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        leading: const Icon(
                          Icons.logout,
                          color: Colors.red,
                        ),
                        title: const Text(
                          'Çıkış Yap',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.red,
                          ),
                        ),
                        onTap: () async {
                          await _authService.signOut();
                          if (context.mounted) {
                            context.pop();
                          }
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1a1a2e),
          title: const Text(
            'Hesabı Sil',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          content: const Text(
            'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. Tüm cihazlarınız ve verileriniz kalıcı olarak silinecektir.',
            style: TextStyle(
              color: Color(0xFFb0b0b8),
            ),
          ),
          actions: [
            TextButton(
              onPressed: _isDeleting ? null : () {
                Navigator.of(dialogContext).pop();
              },
              child: const Text(
                'İptal',
                style: TextStyle(
                  color: Color(0xFFb0b0b8),
                ),
              ),
            ),
            TextButton(
              onPressed: _isDeleting ? null : () async {
                Navigator.of(dialogContext).pop();
                await _deleteAccount(context);
              },
              child: _isDeleting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.orange,
                      ),
                    )
                  : const Text(
                      'Sil',
                      style: TextStyle(
                        color: Colors.orange,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteAccount(BuildContext context) async {
    setState(() {
      _isDeleting = true;
    });

    try {
      await _authService.deleteAccount();

      if (context.mounted) {
        CustomToast.showSuccess(
          context,
          'Hesabınız başarıyla silindi',
        );

        // Ana ekrana yönlendir
        await Future.delayed(const Duration(seconds: 1));
        if (context.mounted) {
          context.go('/');
        }
      }
    } catch (e) {
      setState(() {
        _isDeleting = false;
      });

      if (context.mounted) {
        String errorMessage = 'Hesap silinirken bir sorun oluştu.';
        final errorStr = e.toString().toLowerCase();
        if (errorStr.contains('requires-recent-login') ||
            errorStr.contains('son zamanlarda giriş')) {
          errorMessage = 'Hesap silmek için son zamanlarda giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.';
        } else if (errorStr.contains('network') ||
            errorStr.contains('connection') ||
            errorStr.contains('internet')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (errorStr.contains('permission') ||
            errorStr.contains('unauthorized')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
        }
        CustomToast.showError(context, errorMessage);
      }
    }
  }
}

