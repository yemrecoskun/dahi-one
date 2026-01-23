import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'dart:io' show Platform;
import '../services/auth_service.dart';
import '../widgets/custom_toast.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _authService = AuthService();
  bool _isLogin = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    if (_isLogin) {
      // Giriş
      final result = await _authService.signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (result != null && mounted) {
        CustomToast.showSuccess(context, 'Giriş başarılı!');
        context.pop();
      } else if (mounted) {
        CustomToast.showError(context, 'Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } else {
      // Kayıt
      final result = await _authService.signUpWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
        _nameController.text.trim(),
      );

      if (result != null && mounted) {
        CustomToast.showSuccess(context, 'Kayıt başarılı!');
        context.pop();
      } else if (mounted) {
        CustomToast.showError(context, 'Kayıt başarısız. Lütfen tekrar deneyin.');
      }
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    if (_isLoading) return;
    
    setState(() => _isLoading = true);

    try {
      final result = await _authService.signInWithGoogle();

      if (result != null && mounted) {
        context.pop();
      } else if (mounted) {
        // Kullanıcı iptal ettiyse sessizce devam et
        // Hata mesajı gösterme
      }
    } on PlatformException catch (e) {
      // Platform exception - native tarafından gelen hata
      if (mounted) {
        String errorMessage = 'Google ile giriş hatası oluştu.';
        final errorCode = e.code.toLowerCase();
        final errorMsg = e.message?.toLowerCase() ?? '';
        
        if (Platform.isAndroid) {
          // Android için özel hata mesajları
          if (errorCode == 'sign_in_failed' || 
              errorMsg.contains('configuration') ||
              errorMsg.contains('clientid') ||
              errorMsg.contains('google-services.json') ||
              errorMsg.contains('sha') ||
              errorMsg.contains('fingerprint')) {
            errorMessage = 'Google giriş yapılandırması eksik. Firebase Console\'da SHA parmak izlerini ekleyip google-services.json dosyasını yeniden indirin.';
          } else if (errorCode == 'network_error') {
            errorMessage = 'İnternet bağlantınızı kontrol edin.';
          } else if (errorCode == 'sign_in_canceled') {
            // Kullanıcı iptal etti, mesaj gösterme
            return;
          } else if (errorMsg.contains('developer_error') ||
                     errorMsg.contains('invalid_client')) {
            errorMessage = 'Google Sign-In yapılandırma hatası. Firebase Console ayarlarını kontrol edin.';
          }
        } else {
          // iOS için hata mesajları
          if (errorCode == 'sign_in_failed' || 
              errorMsg.contains('configuration') ||
              errorMsg.contains('googleservice-info.plist')) {
            errorMessage = 'Google Sign-In yapılandırması eksik. Lütfen GoogleService-Info.plist dosyasını kontrol edin.';
          } else if (errorCode == 'network_error') {
            errorMessage = 'İnternet bağlantınızı kontrol edin.';
          } else if (errorCode == 'sign_in_canceled') {
            return;
          }
        }
        CustomToast.showError(context, errorMessage);
      }
    } catch (e, stackTrace) {
      if (mounted) {
        String errorMessage = 'Google ile giriş yapılamadı.';
        final errorStr = e.toString().toLowerCase();
        
        if (Platform.isAndroid) {
          if (errorStr.contains('yapılandırma') || 
              errorStr.contains('configuration') ||
              errorStr.contains('clientid') ||
              errorStr.contains('google-services.json') ||
              errorStr.contains('sha') ||
              errorStr.contains('fingerprint')) {
            errorMessage = 'Google giriş yapılandırması eksik. Firebase Console\'da SHA parmak izlerini ekleyip google-services.json dosyasını yeniden indirin.';
          } else if (errorStr.contains('network') || 
                     errorStr.contains('connection') || 
                     errorStr.contains('internet')) {
            errorMessage = 'İnternet bağlantınızı kontrol edin.';
          } else if (errorStr.contains('cancelled') || 
                     errorStr.contains('canceled')) {
            return;
          } else if (errorStr.contains('developer_error') ||
                     errorStr.contains('invalid_client')) {
            errorMessage = 'Google Sign-In yapılandırma hatası. Firebase Console ayarlarını kontrol edin.';
          } else if (errorStr.contains('firebase başlatılamadı')) {
            errorMessage = 'Uygulama başlatılamadı. Lütfen uygulamayı yeniden başlatın.';
          }
        } else {
          if (errorStr.contains('yapılandırma') || 
              errorStr.contains('googleservice-info.plist') ||
              errorStr.contains('configuration') ||
              errorStr.contains('clientid') ||
              errorStr.contains('gidclientid')) {
            errorMessage = 'Google giriş yapılandırması eksik. Lütfen daha sonra tekrar deneyin.';
          } else if (errorStr.contains('network') || 
                     errorStr.contains('connection') || 
                     errorStr.contains('internet')) {
            errorMessage = 'İnternet bağlantınızı kontrol edin.';
          } else if (errorStr.contains('cancelled') || 
                     errorStr.contains('canceled')) {
            return;
          } else if (errorStr.contains('firebase başlatılamadı')) {
            errorMessage = 'Uygulama başlatılamadı. Lütfen uygulamayı yeniden başlatın.';
          }
        }
        CustomToast.showError(context, errorMessage);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleAppleSignIn() async {
    if (!Platform.isIOS) {
      CustomToast.showWarning(context, 'Apple Sign-In sadece iOS\'ta kullanılabilir.');
      return;
    }

    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final result = await _authService.signInWithApple();

      if (result != null && mounted) {
        CustomToast.showSuccess(context, 'Giriş başarılı!');
        context.pop();
      } else if (mounted) {
        // Kullanıcı iptal ettiyse sessizce devam et
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Apple ile giriş yapılamadı.';
        final errorStr = e.toString().toLowerCase();
        if (errorStr.contains('network') || errorStr.contains('connection') || errorStr.contains('internet')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (errorStr.contains('cancelled') || errorStr.contains('canceled')) {
          // Kullanıcı iptal etti, mesaj gösterme
          return;
        } else if (errorStr.contains('1000') || 
                   errorStr.contains('unknown') ||
                   errorStr.contains('authorizationerror') ||
                   errorStr.contains('yapılandırması eksik')) {
          errorMessage = 'Apple giriş yapılandırması eksik. Lütfen daha sonra tekrar deneyin.';
        } else if (errorStr.contains('not_handled') || errorStr.contains('invalid_request')) {
          errorMessage = 'Apple giriş yapılandırması eksik. Lütfen daha sonra tekrar deneyin.';
        }
        CustomToast.showError(context, errorMessage);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isLogin ? 'Giriş Yap' : 'Kayıt Ol'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (!_isLogin) ...[
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Ad Soyad',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Lütfen ad soyad girin';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
              ],
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'E-posta',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Lütfen e-posta girin';
                  }
                  if (!value.contains('@')) {
                    return 'Geçerli bir e-posta girin';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Şifre',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Lütfen şifre girin';
                  }
                  if (value.length < 6) {
                    return 'Şifre en az 6 karakter olmalı';
                  }
                  return null;
                },
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
                  onPressed: _isLoading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          _isLogin ? 'Giriş Yap' : 'Kayıt Ol',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              // Ayırıcı
              Row(
                children: [
                  Expanded(child: Divider(color: Colors.grey.withValues(alpha: 0.3))),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'veya',
                      style: TextStyle(
                        color: Colors.grey.withValues(alpha: 0.7),
                        fontSize: 14,
                      ),
                    ),
                  ),
                  Expanded(child: Divider(color: Colors.grey.withValues(alpha: 0.3))),
                ],
              ),
              const SizedBox(height: 24),
              // Google ile Giriş
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(25),
                  border: Border.all(
                    color: Colors.grey.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _handleGoogleSignIn,
                  icon: Image.asset(
                    'assets/google_logo.png',
                    height: 20,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(Icons.g_mobiledata, size: 20, color: Colors.black87);
                    },
                  ),
                  label: const Text(
                    'Google ile Devam Et',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Apple ile Giriş (sadece iOS)
              if (Platform.isIOS)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _handleAppleSignIn,
                    icon: const Icon(Icons.apple, size: 20, color: Colors.white),
                    label: const Text(
                      'Apple ile Devam Et',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                  ),
                ),
              if (Platform.isIOS)
                const SizedBox(height: 24),
              TextButton(
                onPressed: () {
                  setState(() => _isLogin = !_isLogin);
                },
                child: Text(
                  _isLogin
                      ? 'Hesabınız yok mu? Kayıt olun'
                      : 'Zaten hesabınız var mı? Giriş yapın',
                  style: const TextStyle(color: Color(0xFF667eea)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

