# Android Firebase Kurulumu

Android için Firebase yapılandırması yapıldı, ancak Google Sign-In için SHA-1 ve SHA-256 parmak izlerinin Firebase Console'a eklenmesi gerekiyor.

## Adımlar

### 1. SHA-1 ve SHA-256 Parmak İzlerini Alın

#### Debug Keystore için:
```bash
cd dahis-mobile/android
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Debug Keystore Parmak İzleri:**
- **SHA1:** `F1:0C:65:62:5B:EC:66:4A:BD:06:D8:FE:62:E1:A1:3C:00:FA:12:4C`
- **SHA256:** `DA:BB:51:1F:24:86:39:22:F2:61:E5:7F:43:2E:D1:E4:C6:FC:DF:DB:73:4B:D4:94:94:F7:2C:9D:6D:EA:E2:D1`

#### Release Keystore için:
```bash
cd dahis-mobile/android
keytool -list -v -keystore upload-keystore.jks -alias upload -storepass dahis2025 -keypass dahis2025
```

**Release Keystore Parmak İzleri:**
- **SHA1:** `B2:64:E7:BC:78:4A:7D:39:84:8D:25:61:DC:C7:D2:44:E4:68:00:6A`
- **SHA256:** `79:5B:3A:C2:08:D7:41:21:FB:91:D7:19:D8:98:6B:DC:A8:0E:50:1F:4F:69:BC:28:CB:7F:A7:7E:B3:7B:05:5D`

### 2. Firebase Console'a Parmak İzlerini Ekleyin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin (`dahisio`)
2. ⚙️ **Project Settings** → **Your apps** bölümüne gidin
3. Android uygulamanızı seçin (`com.dahis.app`)
4. **SHA certificate fingerprints** bölümüne gidin
5. **Add fingerprint** butonuna tıklayın
6. Debug keystore için SHA-1 ve SHA-256 parmak izlerini ekleyin
7. Release keystore için SHA-1 ve SHA-256 parmak izlerini ekleyin
8. **Save** tıklayın

**ÖNEMLİ:** Her iki keystore için de (debug ve release) hem SHA-1 hem de SHA-256 parmak izlerini eklemeniz gerekiyor!

### 3. Firebase Console'dan `google-services.json` İndirin (Güncel)

1. Firebase Console'da Android uygulamanızı seçin
2. **Download google-services.json** butonuna tıklayın
3. Dosyayı `dahis-mobile/android/app/` klasörüne kopyalayın

### 4. Dosyayı Projeye Ekleyin

```bash
# İndirdiğiniz google-services.json dosyasını şuraya kopyalayın:
cp ~/Downloads/google-services.json dahis-mobile/android/app/
```

**Önemli:** Dosya `android/app/` klasörüne kopyalanmalı, `android/` klasörüne değil!

### 5. Dosya Yapısı Kontrolü

Dosya yapısı şöyle olmalı:

```
dahis-mobile/
  android/
    app/
      google-services.json  ← Buraya kopyalayın
      build.gradle.kts
      src/
        ...
```

### 6. Uygulamayı Yeniden Derleyin

```bash
cd dahis-mobile
flutter clean
flutter pub get
flutter run -d <android-device-id>
```

## Kontrol

Uygulama başladığında terminal'de şu mesajı görmelisiniz:

```
✅ Firebase başarıyla başlatıldı
```

Eğer hata görürseniz, `google-services.json` dosyasının doğru konumda olduğundan emin olun.

## Google Sign-In Yapılandırması

Android için Google Sign-In'in çalışması için:

1. ✅ `serverClientId` parametresi `auth_service.dart` dosyasına eklendi
2. ⚠️ **SHA-1 ve SHA-256 parmak izlerini Firebase Console'a eklemeniz gerekiyor**
3. ⚠️ Firebase Console'dan güncel `google-services.json` dosyasını indirip `android/app/` klasörüne kopyalayın

**ÖNEMLİ:** SHA parmak izlerini ekledikten sonra Firebase Console otomatik olarak Android OAuth client ID oluşturacak. Bu yüzden `google-services.json` dosyasını yeniden indirmeniz gerekiyor!

## Notlar

- `google-services.json` dosyası Firebase projenize özeldir, başka projelerle paylaşmayın
- Dosya `android/app/` klasöründe olmalı (root değil)
- Gradle yapılandırması zaten yapıldı
- Google Sign-In için `serverClientId` parametresi kodda eklendi

