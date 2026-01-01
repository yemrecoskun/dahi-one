# GIDClientID Kurulum Rehberi

## Hata: "No active configuration. Make sure GIDClientID is set in Info.plist."

Bu hata, Google Sign-In için `GIDClientID` değerinin `Info.plist` dosyasına eklenmemesinden kaynaklanır.

## Çözüm

### 1. Firebase Console'dan OAuth Client ID'yi Alın

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin (`dahisio`)
2. **Project Settings** (⚙️) → **General** sekmesine gidin
3. **Your apps** bölümünde iOS uygulamanızı seçin (`com.dahis.io`)
4. Sayfayı aşağı kaydırın ve **OAuth 2.0 Client IDs** bölümünü bulun
5. iOS client ID'sini kopyalayın (format: `XXXXX-XXXXX.apps.googleusercontent.com`)

### 2. Info.plist Dosyasını Güncelleyin

1. `ios/Runner/Info.plist` dosyasını açın
2. `GIDClientID` anahtarını bulun:
   ```xml
   <key>GIDClientID</key>
   <string>412418089622-YOUR_CLIENT_ID.apps.googleusercontent.com</string>
   ```
3. `YOUR_CLIENT_ID` kısmını Firebase Console'dan aldığınız OAuth client ID ile değiştirin

**Örnek:**
```xml
<key>GIDClientID</key>
<string>412418089622-abc123def456.apps.googleusercontent.com</string>
```

### 3. Alternatif: GoogleService-Info.plist'ten CLIENT_ID Kullanın

Eğer `GoogleService-Info.plist` dosyanızda `CLIENT_ID` anahtarı varsa:

1. `ios/Runner/GoogleService-Info.plist` dosyasını açın
2. `CLIENT_ID` değerini kopyalayın
3. `ios/Runner/Info.plist` dosyasında `GIDClientID` değerini bu değerle değiştirin

### 4. Uygulamayı Yeniden Derleyin

```bash
cd dahis-mobile
flutter clean
flutter pub get
cd ios
pod install
cd ..
flutter run
```

## Kontrol

Uygulamayı çalıştırdığınızda "No active configuration" hatası görünmemeli. Google Sign-In butonuna tıkladığınızda Google hesap seçim ekranı açılmalı.

## Notlar

- `GIDClientID` değeri, Firebase Console'dan alınan OAuth 2.0 Client ID ile aynı olmalıdır
- Eğer hala hata alıyorsanız, Firebase Console'da Google Sign-In'in etkin olduğundan emin olun
- `GoogleService-Info.plist` dosyasının Xcode projesine eklendiğinden emin olun

