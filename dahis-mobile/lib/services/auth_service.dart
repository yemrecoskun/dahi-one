import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:flutter/services.dart';
import 'dart:io' show Platform;

class AuthService {
  FirebaseAuth? get _auth {
    if (Firebase.apps.isEmpty) return null;
    return FirebaseAuth.instance;
  }

  FirebaseFirestore? get _firestore {
    if (Firebase.apps.isEmpty) return null;
    return FirebaseFirestore.instance;
  }

  // Current user
  User? get currentUser => _auth?.currentUser;

  // Auth state stream
  Stream<User?> get authStateChanges => _auth?.authStateChanges() ?? const Stream.empty();

  // Email ile kayıt
  Future<UserCredential?> signUpWithEmail(String email, String password, String name) async {
    try {
      if (_auth == null || _firestore == null) return null;

      final userCredential = await _auth!.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Kullanıcı adını güncelle
      await userCredential.user?.updateDisplayName(name);

      // Firestore'da kullanıcı bilgilerini kaydet
      await _firestore!.collection('users').doc(userCredential.user?.uid).set({
        'email': email,
        'name': name,
        'createdAt': FieldValue.serverTimestamp(),
        'devices': [],
      });

      return userCredential;
    } catch (e) {
      print('Sign up error: $e');
      return null;
    }
  }

  // Email ile giriş
  Future<UserCredential?> signInWithEmail(String email, String password) async {
    try {
      if (_auth == null) return null;
      return await _auth!.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      print('Sign in error: $e');
      return null;
    }
  }

  // Google ile giriş
  Future<UserCredential?> signInWithGoogle() async {
    try {
      if (_auth == null || _firestore == null) {
        print('Google sign in: Firebase not initialized');
        throw Exception('Firebase başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
      }

      // Google Sign-In başlat (iOS için scopes belirt)
      final GoogleSignIn googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
      );
      
      GoogleSignInAccount? googleUser;
      try {
        // signIn() çağrısını doğrudan yap - signOut() crash'e neden olabilir
        googleUser = await googleSignIn.signIn();
      } on PlatformException catch (e) {
        // Platform exception - native tarafından gelen hata
        print('Google Sign-In PlatformException: ${e.code} - ${e.message}');
        String errorMessage = 'Google Sign-In yapılandırma hatası.';
        if (e.code == 'sign_in_failed' || 
            e.message?.contains('configuration') == true ||
            e.message?.contains('GoogleService-Info.plist') == true ||
            e.message?.contains('clientID') == true ||
            e.message?.contains('GIDClientID') == true) {
          errorMessage = 'Google Sign-In yapılandırması eksik. Lütfen GoogleService-Info.plist dosyasını kontrol edin.';
        } else if (e.code == 'network_error' || 
                   e.message?.contains('network') == true ||
                   e.message?.contains('connection') == true) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (e.code == 'sign_in_canceled') {
          // Kullanıcı iptal etti
          return null;
        }
        throw Exception(errorMessage);
      } catch (e) {
        // Diğer exception'lar
        print('Google Sign-In error: $e');
        String errorMessage = 'Google Sign-In yapılandırma hatası.';
        if (e.toString().contains('configuration') || 
            e.toString().contains('GoogleService-Info.plist') ||
            e.toString().contains('clientID') ||
            e.toString().contains('GIDClientID')) {
          errorMessage = 'Google Sign-In yapılandırması eksik. Lütfen GoogleService-Info.plist dosyasını kontrol edin.';
        } else if (e.toString().contains('network') || e.toString().contains('connection')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (e.toString().contains('cancelled') || e.toString().contains('canceled')) {
          return null;
        }
        throw Exception(errorMessage);
      }

      if (googleUser == null) {
        // Kullanıcı iptal etti
        print('Google sign in: User cancelled');
        return null;
      }

      // Google'dan authentication bilgilerini al
      GoogleSignInAuthentication googleAuth;
      try {
        googleAuth = await googleUser.authentication;
      } catch (e) {
        print('Google authentication error: $e');
        throw Exception('Google kimlik doğrulama hatası. Lütfen tekrar deneyin.');
      }

      if (googleAuth.idToken == null) {
        print('Google sign in: ID token is null');
        throw Exception('Google kimlik doğrulama hatası. Lütfen tekrar deneyin.');
      }

      // Firebase credential oluştur
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Firebase'e giriş yap
      final userCredential = await _auth!.signInWithCredential(credential);

      // Firestore'da kullanıcı bilgilerini kaydet/güncelle
      final user = userCredential.user;
      if (user != null) {
        try {
          final userDoc = _firestore!.collection('users').doc(user.uid);
          final userDocSnapshot = await userDoc.get();

          if (!userDocSnapshot.exists) {
            // Yeni kullanıcı, Firestore'a kaydet
            await userDoc.set({
              'email': user.email ?? '',
              'name': user.displayName ?? user.email?.split('@')[0] ?? 'Kullanıcı',
              'createdAt': FieldValue.serverTimestamp(),
              'devices': [],
              'authProvider': 'google',
            });
          } else {
            // Mevcut kullanıcı, authProvider'ı güncelle
            await userDoc.update({
              'authProvider': 'google',
            });
          }
        } catch (e) {
          // Firestore hatası kritik değil, giriş başarılı
          print('Firestore update error (non-critical): $e');
        }
      }

      return userCredential;
    } catch (e) {
      print('Google sign in error: $e');
      // Kullanıcı iptal ettiyse null döndür
      if (e.toString().contains('cancelled') || e.toString().contains('canceled')) {
        return null;
      }
      rethrow; // Diğer hataları yukarı fırlat
    }
  }

  // Apple ile giriş
  Future<UserCredential?> signInWithApple() async {
    try {
      if (_auth == null || _firestore == null) {
        print('Apple sign in: Firebase not initialized');
        throw Exception('Firebase başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
      }
      if (!Platform.isIOS) {
        print('Apple Sign-In sadece iOS\'ta kullanılabilir');
        throw Exception('Apple Sign-In sadece iOS\'ta kullanılabilir.');
      }

      // Apple Sign-In başlat
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      if (appleCredential.identityToken == null) {
        print('Apple sign in: Identity token is null');
        throw Exception('Apple kimlik doğrulama hatası. Lütfen tekrar deneyin.');
      }

      // OAuth credential oluştur
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
      );

      // Firebase'e giriş yap
      final userCredential = await _auth!.signInWithCredential(oauthCredential);

      // Firestore'da kullanıcı bilgilerini kaydet/güncelle
      final user = userCredential.user;
      if (user != null) {
        try {
          final userDoc = _firestore!.collection('users').doc(user.uid);
          final userDocSnapshot = await userDoc.get();

          // Kullanıcı adını belirle (Apple'dan gelen veya email'den)
          String userName = user.displayName ?? 
              (appleCredential.givenName != null && appleCredential.familyName != null
                  ? '${appleCredential.givenName} ${appleCredential.familyName}'
                  : user.email?.split('@')[0] ?? 'Kullanıcı');

          if (!userDocSnapshot.exists) {
            // Yeni kullanıcı, Firestore'a kaydet
            await userDoc.set({
              'email': user.email ?? appleCredential.email ?? '',
              'name': userName,
              'createdAt': FieldValue.serverTimestamp(),
              'devices': [],
              'authProvider': 'apple',
            });
          } else {
            // Mevcut kullanıcı, authProvider'ı güncelle
            await userDoc.update({
              'authProvider': 'apple',
              if (userDocSnapshot.data()?['name'] == null) 'name': userName,
            });
          }
        } catch (e) {
          // Firestore hatası kritik değil, giriş başarılı
          print('Firestore update error (non-critical): $e');
        }
      }

      return userCredential;
    } catch (e) {
      print('Apple sign in error: $e');
      
      // Kullanıcı iptal ettiyse null döndür
      if (e.toString().contains('cancelled') || 
          e.toString().contains('canceled') ||
          e.toString().contains('1001')) { // ASAuthorizationErrorCanceled
        return null;
      }
      
      // Error 1000 (unknown) genellikle yapılandırma hatası
      if (e.toString().contains('1000') || 
          e.toString().contains('unknown') ||
          e.toString().contains('AuthorizationError')) {
        throw Exception('Apple Sign-In yapılandırması eksik. Lütfen Xcode\'da "Sign in with Apple" capability\'sini aktifleştirin.');
      }
      
      rethrow; // Diğer hataları yukarı fırlat
    }
  }

  // Çıkış
  Future<void> signOut() async {
    if (_auth == null) return;
    
    // Google Sign-In'den de çıkış yap
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      await googleSignIn.signOut();
    } catch (e) {
      print('Google sign out error: $e');
    }
    
    await _auth!.signOut();
  }

  // Kullanıcı bilgilerini getir
  Future<Map<String, dynamic>?> getUserData() async {
    try {
      if (currentUser == null || _firestore == null) return null;
      
      final doc = await _firestore!.collection('users').doc(currentUser!.uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (e) {
      print('Get user data error: $e');
      return null;
    }
  }

  // Kullanıcının cihazlarını getir
  Future<List<Map<String, dynamic>>> getUserDevices() async {
    try {
      if (currentUser == null || _firestore == null) return [];

      final userDoc = await _firestore!.collection('users').doc(currentUser!.uid).get();
      if (!userDoc.exists) return [];

      final userData = userDoc.data();
      final deviceIds = userData?['devices'] as List<dynamic>? ?? [];

      if (deviceIds.isEmpty) return [];

      // Her device ID için dahiOS tag bilgisini getir
      final devices = <Map<String, dynamic>>[];
      for (final deviceId in deviceIds) {
        final tagDoc = await _firestore!.collection('dahios_tags').doc(deviceId).get();
        if (tagDoc.exists) {
          final tagData = tagDoc.data()!;
          devices.add({
            'dahiosId': deviceId,
            'characterId': tagData['characterId'],
            'redirectType': tagData['redirectType'],
            'isActive': tagData['isActive'],
            'createdAt': tagData['createdAt'],
          });
        }
      }

      return devices;
    } catch (e) {
      print('Get user devices error: $e');
      return [];
    }
  }

  // Cihaz ekle (satın alma sonrası)
  // Bir etiket sadece bir kullanıcıya tanımlanabilir
  Future<void> addDevice(String dahiosId) async {
    try {
      if (currentUser == null || _firestore == null) return;

      // Önce bu etiketin başka bir kullanıcıya ait olup olmadığını kontrol et
      final normalizedDahiosId = dahiosId.toLowerCase();
      final usersSnapshot = await _firestore!.collection('users').get();
      
      for (final userDoc in usersSnapshot.docs) {
        // Mevcut kullanıcıyı atla
        if (userDoc.id == currentUser!.uid) continue;
        
        final userData = userDoc.data();
        // Sadece devices field'ını kullan (güvenlik için)
        final deviceIds = userData['devices'] as List<dynamic>? ?? [];
        
        // Bu etiket başka bir kullanıcıya ait mi?
        final isOwnedByOtherUser = deviceIds.any(
          (deviceId) => (deviceId as String).toLowerCase() == normalizedDahiosId,
        );
        
        if (isOwnedByOtherUser) {
          throw Exception('Bu etiket başka bir kullanıcıya tanımlı. Bir etiket sadece bir kullanıcıya tanımlanabilir.');
        }
      }

      // Etiket başka bir kullanıcıya ait değilse, ekle
      await _firestore!.collection('users').doc(currentUser!.uid).update({
        'devices': FieldValue.arrayUnion([normalizedDahiosId]),
      });
    } catch (e) {
      print('Add device error: $e');
      rethrow; // Hata mesajını yukarı fırlat
    }
  }

  // Cihaz sil
  Future<void> removeDevice(String dahiosId) async {
    try {
      if (currentUser == null || _firestore == null) return;

      final normalizedDahiosId = dahiosId.toLowerCase();
      
      await _firestore!.collection('users').doc(currentUser!.uid).update({
        'devices': FieldValue.arrayRemove([normalizedDahiosId]),
      });
    } catch (e) {
      print('Remove device error: $e');
      rethrow; // Hata mesajını yukarı fırlat
    }
  }

  // Profil linklerini güncelle
  Future<void> updateProfileLinks(Map<String, String> profileLinks) async {
    try {
      if (currentUser == null || _firestore == null) return;

      final updateData = <String, dynamic>{};
      
      // Sadece boş olmayan değerleri ekle, boş olanları kaldır
      if (profileLinks['instagram'] != null && profileLinks['instagram']!.isNotEmpty) {
        updateData['instagram'] = profileLinks['instagram']!;
      } else {
        updateData['instagram'] = FieldValue.delete();
      }
      
      if (profileLinks['whatsapp'] != null && profileLinks['whatsapp']!.isNotEmpty) {
        updateData['whatsapp'] = profileLinks['whatsapp']!;
      } else {
        updateData['whatsapp'] = FieldValue.delete();
      }
      
      if (profileLinks['phone'] != null && profileLinks['phone']!.isNotEmpty) {
        updateData['phone'] = profileLinks['phone']!;
      } else {
        updateData['phone'] = FieldValue.delete();
      }
      
      if (profileLinks['email'] != null && profileLinks['email']!.isNotEmpty) {
        updateData['email'] = profileLinks['email']!;
      } else {
        updateData['email'] = FieldValue.delete();
      }

      await _firestore!.collection('users').doc(currentUser!.uid).update(updateData);
    } catch (e) {
      print('Update profile links error: $e');
      rethrow;
    }
  }
}

