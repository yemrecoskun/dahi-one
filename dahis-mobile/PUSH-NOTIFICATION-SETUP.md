# Push Notification Kurulum Rehberi

Bu rehber, dahi's One uygulamasına push notification desteği eklemek için gerekli adımları içerir.

## Genel Bakış

Uygulama Firebase Cloud Messaging (FCM) kullanarak push notification gönderir ve alır. Hem iOS hem de Android platformları desteklenmektedir.

## 1. Firebase Console Yapılandırması

### iOS için APNs Sertifikası (ÖNEMLİ!)

**iOS'ta push notification çalışması için mutlaka APNs yapılandırması gereklidir:**

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. **Project Settings** (⚙️) → **Cloud Messaging** sekmesine gidin
3. **Apple app configuration** bölümünde iOS uygulamanızı seçin
4. **APNs Authentication Key** veya **APNs Certificates** yükleyin:
   - **APNs Authentication Key** (önerilen): 
     - [Apple Developer Console](https://developer.apple.com/account/resources/authkeys/list) → **Keys** → **+** butonuna tıklayın
     - **Key Name** girin (örn: "dahi's Push Notification Key")
     - **Apple Push Notifications service (APNs)** işaretleyin
     - **Continue** → **Register** → `.p8` dosyasını indirin
     - **Key ID**'yi not edin
     - Firebase Console'da **APNs Authentication Key** seçeneğini seçin
     - `.p8` dosyasını yükleyin ve **Key ID**'yi girin
   - **APNs Certificates** (alternatif):
     - Development ve Production sertifikalarını yükleyin
5. **Save** tıklayın

**ÖNEMLİ:** APNs yapılandırması olmadan iOS'ta push notification çalışmaz!

### Android için

Android için ek bir yapılandırma gerekmez. `google-services.json` dosyası yeterlidir.

## 2. iOS Yapılandırması

### Xcode Capabilities

1. Xcode'da `ios/Runner.xcworkspace` dosyasını açın
2. **Runner** projesini seçin
3. **Signing & Capabilities** sekmesine gidin
4. **+ Capability** butonuna tıklayın
5. **Push Notifications** seçin
6. **Background Modes** seçin ve **Remote notifications** işaretleyin

### Info.plist

`ios/Runner/Info.plist` dosyasına ek bir yapılandırma gerekmez. Firebase SDK otomatik olarak yapılandırır.

## 3. Android Yapılandırması

Android için `google-services.json` dosyası yeterlidir. Ek bir yapılandırma gerekmez.

## 4. Test Etme

### Flutter Uygulamasında

```bash
cd dahis-mobile
flutter clean
flutter pub get
flutter run
```

Uygulama açıldığında:
- iOS'ta push notification izni istenir
- FCM token otomatik olarak Firestore'a kaydedilir
- `users/{userId}` dokümanında `fcmToken` alanı görülebilir

### Panel'den Bildirim Gönderme

1. [Admin Panel](https://panel.dahis.io) → **Push Bildirim** sekmesine gidin
2. Başlık ve mesaj girin
3. **Tüm Kullanıcılara Gönder** veya **Belirli Kullanıcılara Gönder** seçin
4. **Bildirim Gönder** butonuna tıklayın

### API ile Bildirim Gönderme

```bash
curl -X POST https://us-central1-dahisio.cloudfunctions.net/sendPushNotification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bildirimi",
    "body": "Bu bir test bildirimidir",
    "allUsers": true
  }'
```

## 5. Kod Yapısı

### Push Notification Servisi

`lib/services/push_notification_service.dart` dosyası:
- FCM token yönetimi
- Bildirim alma ve işleme
- Token'ı Firestore'a kaydetme

### Backend Endpoint

`dahis-be/dahisio/index.js` dosyasında `sendPushNotification` fonksiyonu:
- Tüm kullanıcılara veya belirli kullanıcılara bildirim gönderme
- Toplu gönderim desteği (500 token'a kadar)
- Hata yönetimi ve raporlama

### Panel Arayüzü

`dahis-panel/index.html` ve `dahis-panel/script.js`:
- Push notification gönderme formu
- Tüm kullanıcılara veya belirli kullanıcılara gönderme seçenekleri
- Sonuç raporlama

## 6. Sorun Giderme

### iOS'ta Bildirim Gelmiyor

1. Xcode'da **Push Notifications** capability'sinin eklendiğinden emin olun
2. **Background Modes** → **Remote notifications** işaretli olduğundan emin olun
3. Firebase Console'da APNs sertifikasının yüklendiğinden emin olun
4. Gerçek cihazda test edin (simülatörde push notification çalışmaz)

### Android'de Bildirim Gelmiyor

1. `google-services.json` dosyasının doğru yüklendiğinden emin olun
2. Firebase Console'da Android uygulamasının kayıtlı olduğundan emin olun
3. FCM token'ın Firestore'a kaydedildiğini kontrol edin

### SERVICE_NOT_AVAILABLE Hatası (Android)

Bu hata genellikle Google Play Services'in eksik veya güncel olmamasından kaynaklanır:

1. **Gerçek Cihazda:**
   - Google Play Services'in yüklü ve güncel olduğundan emin olun
   - Google Play Store'dan Google Play Services'i güncelleyin
   - Cihazı yeniden başlatın

2. **Emülatörde:**
   - Google Play Services içeren bir emülatör kullanın (Google APIs sistem imajı)
   - AVD Manager'da emülatör oluştururken "Google APIs" veya "Google Play" sistem imajını seçin
   - Emülatörü yeniden başlatın

3. **Not:**
   - Bu hata durumunda uygulama normal şekilde çalışmaya devam eder
   - Push notification özelliği kullanılamaz ancak diğer özellikler çalışır

### Token Bulunamıyor

1. Uygulamanın Firebase'e bağlı olduğundan emin olun
2. Kullanıcının giriş yaptığından emin olun
3. Firestore'da `users/{userId}` dokümanında `fcmToken` alanını kontrol edin

## 7. Özellikler

- ✅ iOS ve Android desteği
- ✅ Foreground ve background bildirimleri
- ✅ Bildirim tıklandığında deep link desteği
- ✅ Toplu bildirim gönderme (500 token'a kadar)
- ✅ Belirli kullanıcılara veya tüm kullanıcılara gönderme
- ✅ Ek veri (data) desteği
- ✅ Hata raporlama

## 8. Paketler

- `firebase_messaging: ^15.1.3` - Firebase Cloud Messaging için

Bu paket `pubspec.yaml` dosyasına eklenmiştir. Yüklemek için:

```bash
cd dahis-mobile
flutter pub get
```
