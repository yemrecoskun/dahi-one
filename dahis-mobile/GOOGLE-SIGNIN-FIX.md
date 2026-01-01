# Google Sign-In Crash Çözümü

Google Sign-In crash'i genellikle şu nedenlerden kaynaklanır:

## 1. Firebase Console'da Google Sign-In Etkin Değil

### Kontrol:
1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. **Authentication** → **Sign-in method** sekmesine gidin
3. **Google** provider'ını bulun
4. **Enable** butonuna tıklayın
5. **Support email** seçin
6. **Save** tıklayın

## 2. GoogleService-Info.plist Xcode Projesine Eklenmemiş

### Kontrol:
1. Xcode'da `ios/Runner.xcworkspace` dosyasını açın
2. Sol panelde `Runner` klasörü altında `GoogleService-Info.plist` dosyasını görmelisiniz
3. Dosyaya tıklayın ve sağ panelde **Target Membership** bölümünde **Runner** işaretli olmalı

### Eğer yoksa:
1. Sol panelde `Runner` klasörüne sağ tıklayın
2. **Add Files to "Runner"...** seçin
3. `ios/Runner/GoogleService-Info.plist` dosyasını seçin
4. ✅ **Copy items if needed** işaretini kaldırın
5. ✅ **Add to targets: Runner** işaretli olduğundan emin olun
6. **Add** tıklayın

## 3. URL Scheme Yanlış Yapılandırılmış

### Kontrol:
`ios/Runner/Info.plist` dosyasında şu bölüm olmalı:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.412418089622</string>
        </array>
    </dict>
</array>
```

**Not:** Eğer `GoogleService-Info.plist` dosyanızda `REVERSED_CLIENT_ID` varsa, o değeri kullanın.

## 4. Projeyi Temizleyin ve Yeniden Derleyin

```bash
cd dahis-mobile
flutter clean
flutter pub get
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
flutter run
```

## 5. Simülatör vs Gerçek Cihaz

- **Simülatör:** Google Sign-In çalışabilir ama bazı durumlarda sorun çıkarabilir
- **Gerçek Cihaz:** Daha güvenilir sonuç verir

## 6. Hata Mesajlarını Kontrol Edin

Uygulamayı çalıştırırken terminal'de şu hataları kontrol edin:

```
Google sign in: Firebase not initialized
Google sign in: User cancelled
Google sign in: ID token is null
Google sign in error: [hata mesajı]
```

## 7. Firebase Yapılandırmasını Kontrol Edin

`GoogleService-Info.plist` dosyasında şu alanlar olmalı:

- `API_KEY`
- `GCM_SENDER_ID`
- `BUNDLE_ID` (com.dahis.io olmalı)
- `PROJECT_ID`
- `GOOGLE_APP_ID`

## Test Adımları

1. Firebase Console'da Google Sign-In'in etkin olduğundan emin olun
2. Xcode'da GoogleService-Info.plist'in projeye eklendiğini kontrol edin
3. Info.plist'te URL Scheme'in doğru olduğunu kontrol edin
4. Projeyi temizleyin ve yeniden derleyin
5. Uygulamayı çalıştırın ve Google Sign-In butonuna tıklayın
6. Terminal'deki hata mesajlarını kontrol edin

## Yaygın Hatalar

### "Google sign in: Firebase not initialized"
- Firebase başlatılamamış
- `FIREBASE-FIX.md` dosyasına bakın

### "Google sign in: ID token is null"
- Google Sign-In başarısız
- Firebase Console'da Google Sign-In'in etkin olduğundan emin olun

### "EXC_CRASH (SIGABRT)"
- Genellikle GoogleService-Info.plist'in yüklenmemesinden kaynaklanır
- Xcode'da dosyanın projeye eklendiğinden emin olun

