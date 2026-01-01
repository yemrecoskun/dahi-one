# Android Firebase Kurulumu

Android için Firebase yapılandırması yapıldı, ancak `google-services.json` dosyasını eklemeniz gerekiyor.

## Adımlar

### 1. Firebase Console'dan `google-services.json` İndirin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. ⚙️ **Project Settings** → **Your apps** bölümüne gidin
3. Android uygulaması yoksa **Add app** → **Android** seçin
4. **Package name** girin: `com.dahis.io`
5. **App nickname** (opsiyonel): `dahi's Android`
6. **Register app** tıklayın
7. `google-services.json` dosyasını indirin

### 2. Dosyayı Projeye Ekleyin

```bash
# İndirdiğiniz google-services.json dosyasını şuraya kopyalayın:
cp ~/Downloads/google-services.json dahis-mobile/android/app/
```

**Önemli:** Dosya `android/app/` klasörüne kopyalanmalı, `android/` klasörüne değil!

### 3. Dosya Yapısı Kontrolü

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

### 4. Uygulamayı Yeniden Derleyin

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

## Notlar

- `google-services.json` dosyası Firebase projenize özeldir, başka projelerle paylaşmayın
- Dosya `android/app/` klasöründe olmalı (root değil)
- Gradle yapılandırması zaten yapıldı, sadece JSON dosyasını eklemeniz yeterli

