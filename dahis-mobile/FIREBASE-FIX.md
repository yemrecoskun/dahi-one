# Firebase Bağlantı Sorunu Çözümü

Eğer profil ekranında "Firebase bağlantısı kurulamadı" hatası görüyorsanız, `GoogleService-Info.plist` dosyasının Xcode projesine eklenmesi gerekiyor.

## Hızlı Çözüm

### 1. Xcode'da Projeyi Açın

```bash
cd dahis-mobile/ios
open Runner.xcworkspace
```

**ÖNEMLİ:** `.xcworkspace` dosyasını açın, `.xcodeproj` değil!

### 2. GoogleService-Info.plist Dosyasını Ekleyin

1. Xcode'da sol panelde `Runner` klasörüne sağ tıklayın
2. **Add Files to "Runner"...** seçeneğini tıklayın
3. `ios/Runner/GoogleService-Info.plist` dosyasını seçin
4. ✅ **Copy items if needed** işaretini kaldırın (dosya zaten doğru yerde)
5. ✅ **Add to targets: Runner** işaretli olduğundan emin olun
6. **Add** butonuna tıklayın

### 3. Dosyanın Doğru Eklendiğini Kontrol Edin

1. Sol panelde `Runner` klasörü altında `GoogleService-Info.plist` dosyasını görmelisiniz
2. Dosyaya tıklayın ve sağ panelde **Target Membership** bölümünde **Runner** işaretli olmalı

### 4. Projeyi Temizleyin ve Yeniden Derleyin

```bash
cd dahis-mobile
flutter clean
flutter pub get
cd ios
pod install
cd ..
flutter run
```

## Alternatif: Terminal ile Kontrol

Eğer Xcode'u kullanmak istemiyorsanız, dosyanın varlığını kontrol edin:

```bash
ls -la dahis-mobile/ios/Runner/GoogleService-Info.plist
```

Dosya varsa, Xcode'da manuel olarak eklemeniz gerekiyor.

## Sorun Devam Ederse

1. Firebase Console'da bundle ID'nin `com.dahis.io` olduğundan emin olun
2. Yeni bir `GoogleService-Info.plist` dosyası indirin
3. Eski dosyayı silin ve yenisini ekleyin
4. Projeyi temizleyin ve yeniden derleyin

