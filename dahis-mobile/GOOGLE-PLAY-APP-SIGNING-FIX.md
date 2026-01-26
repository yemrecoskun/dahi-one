# Google Play App Signing - Google Sign-In Çözümü

Google Play Store'dan indirilen uygulamalarda Google Sign-In çalışmıyorsa, bu genellikle **Google Play App Signing** kullanımından kaynaklanır.

## Sorun

Google Play, uygulamanızı kendi sertifikasıyla imzalıyor. Bu sertifikanın SHA fingerprint'i Firebase Console'da yoksa Google Sign-In çalışmaz.

## Çözüm

### 1. Google Play Console'da App Signing Sertifikasını Bulun

1. [Google Play Console](https://play.google.com/console) → Uygulamanızı seçin
2. **Release** → **Setup** → **App signing** sekmesine gidin
3. **App signing key certificate** bölümünde:
   - **SHA-1 certificate fingerprint** değerini kopyalayın
   - **SHA-256 certificate fingerprint** değerini kopyalayın

**Örnek:**
```
SHA-1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD
SHA-256: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00
```

### 2. Firebase Console'a App Signing SHA Fingerprint'lerini Ekleyin

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin (`dahisio`)
2. ⚙️ **Project Settings** → **Your apps** bölümüne gidin
3. Android uygulamanızı seçin (`com.dahis.app`)
4. **SHA certificate fingerprints** bölümüne gidin
5. **Add fingerprint** butonuna tıklayın
6. Google Play App Signing **SHA-1** fingerprint'ini ekleyin
7. **Add fingerprint** butonuna tekrar tıklayın
8. Google Play App Signing **SHA-256** fingerprint'ini ekleyin
9. **Save** tıklayın

**ÖNEMLİ:** 
- Hem SHA-1 hem de SHA-256 eklemeniz gerekiyor
- Mevcut debug ve release SHA fingerprint'lerini silmeyin, sadece App Signing fingerprint'lerini ekleyin

### 3. google-services.json Dosyasını Yeniden İndirin

1. Firebase Console'da Android uygulamanızı seçin
2. **Download google-services.json** butonuna tıklayın
3. Dosyayı `dahis-mobile/android/app/` klasörüne kopyalayın (mevcut dosyanın üzerine yazın)

```bash
# İndirdiğiniz google-services.json dosyasını şuraya kopyalayın:
cp ~/Downloads/google-services.json dahis-mobile/android/app/
```

### 4. Yeni AAB Oluşturun ve Yükleyin

```bash
cd dahis-mobile
flutter build appbundle --release
```

Oluşturulan AAB dosyasını Google Play Console'a yükleyin.

## Kontrol Listesi

- [ ] Google Play Console'da App Signing SHA-1 fingerprint'i alındı
- [ ] Google Play Console'da App Signing SHA-256 fingerprint'i alındı
- [ ] Firebase Console'a App Signing SHA-1 eklendi
- [ ] Firebase Console'a App Signing SHA-256 eklendi
- [ ] google-services.json dosyası yeniden indirildi ve projeye kopyalandı
- [ ] Yeni AAB oluşturuldu ve Google Play Console'a yüklendi

## Notlar

- **App Signing'i devre dışı bırakmayın:** Google Play App Signing güvenlik ve güncelleme kolaylığı sağlar
- **Tüm SHA fingerprint'leri ekleyin:** Debug, Release ve App Signing fingerprint'lerinin hepsi Firebase Console'da olmalı
- **google-services.json güncel olmalı:** Her SHA fingerprint ekledikten sonra google-services.json dosyasını yeniden indirin

## Sorun Devam Ederse

1. Firebase Console'da tüm SHA fingerprint'lerinin eklendiğini kontrol edin
2. google-services.json dosyasının güncel olduğundan emin olun
3. Uygulamayı tamamen kaldırıp yeniden yükleyin
4. Google Play Console'da yeni bir release oluşturup test edin
