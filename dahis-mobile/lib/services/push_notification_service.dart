import "package:firebase_messaging/firebase_messaging.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/foundation.dart";
import "dart:io" show Platform;

/// Firebase Cloud Messaging servisi
/// Push notification'ları yönetir
class PushNotificationService {
  static final PushNotificationService _instance =
      PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  String? _fcmToken;
  bool _initialized = false;

  String? get fcmToken => _fcmToken;
  bool get isInitialized => _initialized;

  /// Push notification servisini başlat
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // İzin iste (iOS için)
      if (Platform.isIOS) {
        final settings = await _messaging.requestPermission(
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        );

        debugPrint("📱 iOS Push Notification İzni: ${settings.authorizationStatus}");
        
        if (settings.authorizationStatus == AuthorizationStatus.authorized) {
          debugPrint("✅ Push notification izni verildi");
        } else if (settings.authorizationStatus ==
            AuthorizationStatus.provisional) {
          debugPrint("⚠️  Push notification geçici izin verildi");
        } else {
          debugPrint("❌ Push notification izni reddedildi: ${settings.authorizationStatus}");
          return;
        }
      }

      // FCM token al
      try {
        _fcmToken = await _messaging.getToken();
        if (_fcmToken != null) {
          debugPrint("✅ FCM Token alındı: ${_fcmToken!.substring(0, 20)}...");
          await _saveTokenToFirestore(_fcmToken!);
          
          // Topic'e subscribe ol (tüm kullanıcılar için)
          try {
            await _messaging.subscribeToTopic("all_users");
            debugPrint("✅ Topic'e subscribe olundu: all_users");
            
            if (Platform.isIOS) {
              debugPrint("📱 iOS: Topic subscribe başarılı, bildirimler alınabilir");
            }
          } catch (topicError) {
            debugPrint("⚠️  Topic'e subscribe olunamadı: $topicError");
            if (Platform.isIOS) {
              debugPrint("📱 iOS: Topic subscribe hatası - token bazlı gönderim kullanılacak");
            }
            // Hata olsa bile devam et, token bazlı gönderim çalışır
          }
        }
      } catch (tokenError) {
        // Android'de SERVICE_NOT_AVAILABLE hatası Google Play Services eksikliğinden kaynaklanabilir
        final errorStr = tokenError.toString().toLowerCase();
        if (errorStr.contains("service_not_available") ||
            errorStr.contains("service not available")) {
          debugPrint(
            "⚠️  Push notification servisi kullanılamıyor. "
            "Google Play Services'in yüklü ve güncel olduğundan emin olun.",
          );
          // Hata durumunda sessizce devam et, uygulama çalışmaya devam eder
          return;
        }
        rethrow; // Diğer hataları yukarı fırlat
      }

      // Token yenilendiğinde güncelle
      _messaging.onTokenRefresh.listen((newToken) async {
        debugPrint("🔄 FCM Token yenilendi");
        _fcmToken = newToken;
        await _saveTokenToFirestore(newToken);
        
        // Token yenilendiğinde topic'e tekrar subscribe ol
        try {
          await _messaging.subscribeToTopic("all_users");
          debugPrint("✅ Token yenilendi, topic'e tekrar subscribe olundu");
        } catch (e) {
          debugPrint("⚠️  Token yenilendi ama topic'e subscribe olunamadı: $e");
        }
      });

      // Foreground mesajları için handler
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Background'dan açıldığında handler
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpened);

      // Uygulama kapalıyken gelen bildirim
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleMessageOpened(initialMessage);
      }

      _initialized = true;
    } catch (e) {
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains("service_not_available") ||
          errorStr.contains("service not available")) {
        debugPrint(
          "⚠️  Push notification servisi kullanılamıyor. "
          "Google Play Services'in yüklü ve güncel olduğundan emin olun.",
        );
      } else {
        debugPrint("❌ Push notification servisi başlatılamadı: $e");
      }
      // Hata durumunda sessizce devam et, uygulama çalışmaya devam eder
    }
  }

  /// FCM token'ı Firestore'a kaydet
  Future<void> _saveTokenToFirestore(String token) async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return;

      await FirebaseFirestore.instance
          .collection("users")
          .doc(user.uid)
          .update({
        "fcmToken": token,
        "fcmTokenUpdatedAt": FieldValue.serverTimestamp(),
        "platform": Platform.isIOS ? "ios" : "android",
      });
    } catch (e) {
      debugPrint("❌ FCM token Firestore'a kaydedilemedi: $e");
    }
  }

  /// Foreground'da gelen bildirimi işle
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint("📬 Foreground bildirim alındı: ${message.notification?.title}");
    debugPrint("📬 Bildirim detayları: ${message.data}");
    // Burada bildirimi gösterebilirsiniz (örneğin flutter_local_notifications kullanarak)
    // Şimdilik sadece log
  }

  /// Bildirim tıklandığında işle
  void _handleMessageOpened(RemoteMessage message) {
    debugPrint("🔔 Bildirim tıklandı: ${message.notification?.title}");
    // Deep link veya navigation işlemleri burada yapılabilir
    final data = message.data;
    if (data.containsKey("route")) {
      // GoRouter ile yönlendirme yapılabilir
      debugPrint("📍 Yönlendirme: ${data["route"]}");
    }
  }

  /// Token'ı temizle (çıkış yapıldığında)
  Future<void> clearToken() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        await FirebaseFirestore.instance
            .collection("users")
            .doc(user.uid)
            .update({
          "fcmToken": FieldValue.delete(),
          "fcmTokenUpdatedAt": FieldValue.serverTimestamp(),
        });
      }
      _fcmToken = null;
    } catch (e) {
      debugPrint("❌ FCM token temizlenemedi: $e");
    }
  }
}

/// Background message handler
/// Bu fonksiyon uygulama kapalıyken veya background'dayken çalışır
@pragma("vm:entry-point")
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("📬 Background bildirim alındı: ${message.notification?.title}");
  // Background'da bildirim işlemleri burada yapılabilir
}
