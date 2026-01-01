# Universal Links & App Links Sorun Giderme

## ✅ Yapılan Değişiklikler

1. **Android uygulama adı:** "dahi's" → "dahis"
2. **Package name:** `com.dahis.io` (doğrulandı)
3. **Universal Links dosyaları:** `public/.well-known/` klasörüne eklendi

## 🔍 Universal Links Test Etme

### Android App Links Test:

1. **assetlinks.json dosyasını kontrol edin:**
   ```bash
   curl https://www.dahis.io/.well-known/assetlinks.json
   ```
   - `Content-Type: application/json` olmalı
   - JSON formatı doğru olmalı
   - Package name: `com.dahis.io` olmalı
   - SHA-256 fingerprint doğru olmalı

2. **Android'de domain doğrulamasını kontrol edin:**
   ```bash
   adb shell pm get-app-links com.dahis.io
   ```
   veya
   ```bash
   adb shell pm verify-app-links --re-verify com.dahis.io
   ```

3. **Test linki:**
   - Chrome'da `https://www.dahis.io/character/puls` açın
   - Uygulama yüklüyse, uygulama açılmalı
   - Uygulama yoksa, web sayfası açılmalı

### iOS Universal Links Test:

1. **apple-app-site-association dosyasını kontrol edin:**
   ```bash
   curl https://www.dahis.io/.well-known/apple-app-site-association
   ```
   - `Content-Type: application/json` olmalı
   - JSON formatı doğru olmalı
   - appID: `QH2CGK27UU.com.dahis.io` olmalı

2. **iOS'te test:**
   - Safari'de `https://www.dahis.io/character/puls` açın
   - Uygulama yüklüyse, uygulama açılmalı
   - Uygulama yoksa, web sayfası açılmalı

## ⚠️ Yaygın Sorunlar

### 1. Dosyalar ignore ediliyor

**Sorun:** `firebase.json`'da `**/.*` ignore kuralı `.well-known` klasörünü ignore ediyor.

**Çözüm:** `firebase.json`'da headers eklendi, dosyalar artık serve edilecek.

### 2. Content-Type yanlış

**Sorun:** Dosyalar `text/plain` olarak serve ediliyor.

**Çözüm:** `firebase.json`'da headers eklendi:
```json
"headers": [
  {
    "source": "/.well-known/apple-app-site-association",
    "headers": [{"key": "Content-Type", "value": "application/json"}]
  },
  {
    "source": "/.well-known/assetlinks.json",
    "headers": [{"key": "Content-Type", "value": "application/json"}]
  }
]
```

### 3. Android App Links çalışmıyor

**Kontrol listesi:**
- ✅ Package name: `com.dahis.io`
- ✅ SHA-256 fingerprint doğru mu?
- ✅ `assetlinks.json` dosyası erişilebilir mi?
- ✅ `android:autoVerify="true"` var mı?
- ✅ Intent-filter doğru yapılandırılmış mı?

**Debug:**
```bash
# Domain doğrulamasını yeniden yap
adb shell pm verify-app-links --re-verify com.dahis.io

# App links durumunu kontrol et
adb shell pm get-app-links com.dahis.io
```

### 4. iOS Universal Links çalışmıyor

**Kontrol listesi:**
- ✅ Team ID: `QH2CGK27UU`
- ✅ Bundle ID: `com.dahis.io`
- ✅ `apple-app-site-association` dosyası erişilebilir mi?
- ✅ Associated Domains: `applinks:www.dahis.io` eklendi mi?

**Debug:**
- Xcode'da Associated Domains'ı kontrol edin
- Safari'de linki açıp, sağ üstte "Open in App" butonu görünüyor mu?

## 🚀 Deploy

```bash
cd dahis-be
firebase deploy --only hosting
```

Deploy sonrası dosyaların erişilebilir olduğunu kontrol edin:
- `https://www.dahis.io/.well-known/apple-app-site-association`
- `https://www.dahis.io/.well-known/assetlinks.json`

## 📝 Notlar

1. **Android:** App Links için domain doğrulaması gerekiyor. İlk yüklemede veya güncellemede Android otomatik olarak doğrulama yapar.

2. **iOS:** Universal Links için Associated Domains yapılandırması gerekiyor. Xcode'da entitlements dosyasında kontrol edin.

3. **Test:** Her iki platformda da uygulama yüklü değilse, web sayfası açılmalı. Bu normal davranış.

4. **Custom URL Scheme:** `dahis://` scheme'i her zaman çalışır, domain doğrulaması gerektirmez.

