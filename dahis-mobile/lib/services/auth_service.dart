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
      return null;
    }
  }

  // Google ile giriş
  Future<UserCredential?> signInWithGoogle() async {
    try {
      if (_auth == null || _firestore == null) {
        throw Exception('Uygulama başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
      }

      // Google Sign-In başlat
      // Android için serverClientId gerekli (web client ID)
      // iOS için scopes belirt
      final GoogleSignIn googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        // Android için web client ID (google-services.json'dan alınan)
        serverClientId: Platform.isAndroid
            ? '412418089622-dq5r9ntoqjrbgdavl6ikuftra395lu0h.apps.googleusercontent.com'
            : null,
      );
      
      GoogleSignInAccount? googleUser;
      try {
        // signIn() çağrısını doğrudan yap - signOut() crash'e neden olabilir
        googleUser = await googleSignIn.signIn();
      } on PlatformException catch (e) {
        // Platform exception - native tarafından gelen hata
        String errorMessage = 'Google ile giriş yapılamadı.';
        if (e.code == 'sign_in_failed' || 
            e.message?.toLowerCase().contains('configuration') == true ||
            e.message?.toLowerCase().contains('googleservice-info.plist') == true ||
            e.message?.toLowerCase().contains('clientid') == true ||
            e.message?.toLowerCase().contains('gidclientid') == true) {
          errorMessage = 'Google giriş yapılandırması eksik. Lütfen daha sonra tekrar deneyin.';
        } else if (e.code == 'network_error' || 
                   e.message?.toLowerCase().contains('network') == true ||
                   e.message?.toLowerCase().contains('connection') == true) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (e.code == 'sign_in_canceled') {
          // Kullanıcı iptal etti
          return null;
        }
        throw Exception(errorMessage);
      } catch (e) {
        // Diğer exception'lar
        String errorMessage = 'Google ile giriş yapılamadı.';
        final errorStr = e.toString().toLowerCase();
        if (errorStr.contains('configuration') || 
            errorStr.contains('googleservice-info.plist') ||
            errorStr.contains('clientid') ||
            errorStr.contains('gidclientid')) {
          errorMessage = 'Google giriş yapılandırması eksik. Lütfen daha sonra tekrar deneyin.';
        } else if (errorStr.contains('network') || errorStr.contains('connection') || errorStr.contains('internet')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (errorStr.contains('cancelled') || errorStr.contains('canceled')) {
          return null;
        }
        throw Exception(errorMessage);
      }

      if (googleUser == null) {
        // Kullanıcı iptal etti
        return null;
      }

      // Google'dan authentication bilgilerini al
      GoogleSignInAuthentication googleAuth;
      try {
        googleAuth = await googleUser.authentication;
      } catch (e) {
        throw Exception('Google kimlik doğrulama başarısız. Lütfen tekrar deneyin.');
      }

      if (googleAuth.idToken == null) {
        throw Exception('Google kimlik doğrulama başarısız. Lütfen tekrar deneyin.');
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
      // Kullanıcı iptal ettiyse null döndür
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('cancelled') || errorStr.contains('canceled')) {
        return null;
      }
      rethrow; // Diğer hataları yukarı fırlat
    }
  }

  // Apple ile giriş
  Future<UserCredential?> signInWithApple() async {
    try {
      if (_auth == null || _firestore == null) {
        throw Exception('Uygulama başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
      }
      if (!Platform.isIOS) {
        throw Exception('Apple ile giriş sadece iOS\'ta kullanılabilir.');
      }

      // Apple Sign-In başlat
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      if (appleCredential.identityToken == null) {
        throw Exception('Apple kimlik doğrulama başarısız. Lütfen tekrar deneyin.');
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
      // Kullanıcı iptal ettiyse null döndür
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('cancelled') || 
          errorStr.contains('canceled') ||
          errorStr.contains('1001')) {
        return null;
      }
      
      // Error 1000 (unknown) genellikle yapılandırma hatası
      if (errorStr.contains('1000') || 
          errorStr.contains('unknown') ||
          errorStr.contains('authorizationerror')) {
        throw Exception('Apple giriş yapılandırması eksik. Lütfen daha sonra tekrar deneyin.');
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
      // Google sign out hatası önemli değil
    }
    
    await _auth!.signOut();
  }

  // Hesabı sil
  Future<void> deleteAccount() async {
    if (_auth == null || _firestore == null || currentUser == null) {
      throw Exception('Kullanıcı bilgisi bulunamadı');
    }

    final userId = currentUser!.uid;

    try {
      // 1. Kullanıcının tüm cihazlarını dahios_tags'den temizle
      final userDoc = await _firestore!.collection('users').doc(userId).get();
      if (userDoc.exists) {
        final userData = userDoc.data();
        final deviceIds = userData?['devices'] as List<dynamic>? ?? [];

        // Her cihaz için dahios_tags'den user ve yönlendirme alanlarını sil
        for (final deviceId in deviceIds) {
          try {
            final tagRef = _firestore!.collection('dahios_tags').doc(deviceId.toString().toLowerCase());
            final tagDoc = await tagRef.get();

            if (tagDoc.exists) {
              final updateData = <String, dynamic>{};
              final tagData = tagDoc.data()!;

              // user alanı varsa sil
              if (tagData.containsKey('user')) {
                updateData['user'] = FieldValue.delete();
              }

              // yönlendirme alanı varsa sil
              if (tagData.containsKey('yönlendirme')) {
                updateData['yönlendirme'] = FieldValue.delete();
              }

              // Varsa güncelle
              if (updateData.isNotEmpty) {
                await tagRef.update(updateData);
              }
            }
          } catch (e) {
            // Tek bir cihaz için hata olsa bile devam et
          }
        }
      }

      // 2. Firestore'daki users dokümanını sil
      await _firestore!.collection('users').doc(userId).delete();

      // 3. Google Sign-In'den çıkış yap
      try {
        final GoogleSignIn googleSignIn = GoogleSignIn();
        await googleSignIn.signOut();
      } catch (e) {
        // Google sign out hatası önemli değil
      }

      // 4. Firebase Auth'dan kullanıcıyı sil
      await currentUser!.delete();
    } catch (e) {
      // Hata durumunda kullanıcıya bilgi ver
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('requires-recent-login')) {
        throw Exception('Hesap silmek için son zamanlarda giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.');
      }
      rethrow;
    }
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
      rethrow;
    }
  }
}

