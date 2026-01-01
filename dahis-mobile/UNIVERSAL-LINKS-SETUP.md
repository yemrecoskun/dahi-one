# Universal Links & App Links Kurulum Rehberi

Bu rehber, iOS Universal Links ve Android App Links yapılandırmasını açıklar.

## 📱 iOS Universal Links

### 1. Apple Developer Console'dan Team ID Alın

1. [Apple Developer Console](https://developer.apple.com/account/) → **Membership** bölümüne gidin
2. **Team ID**'yi kopyalayın (örn: `ABC123DEF4`)

### 2. Backend'de Team ID'yi Güncelleyin

`dahis-be/dahisio/index.js` dosyasındaki `appleAppSiteAssociation` fonksiyonunda:

```javascript
appID: "TEAM_ID.com.dahis.io", // TEAM_ID'yi buraya yazın
```

### 3. apple-app-site-association Dosyasını Deploy Edin

Backend'deki endpoint zaten hazır:
- `GET https://us-central1-dahisio.cloudfunctions.net/appleAppSiteAssociation`

**www.dahis.io domain'inde bu dosyayı serve etmek için:**

1. Firebase Hosting'de `public/.well-known/apple-app-site-association` dosyası oluşturun
2. Veya web sunucunuzda bu dosyayı serve edin

**Örnek dosya içeriği:**
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.dahis.io",
        "paths": [
          "/character/*",
          "/season/*",
          "/store",
          "/devices",
          "/profile"
        ]
      }
    ]
  }
}
```

**Önemli:** Dosya `.json` uzantısı OLMADAN olmalı ve `Content-Type: application/json` header'ı ile serve edilmeli.

## 🤖 Android App Links

### 1. SHA-256 Fingerprint'leri Alın

#### Debug Key (Geliştirme):
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Enter keystore password:  
Alias name: androiddebugkey
Creation date: Jan 1, 2026
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: C=US, O=Android, CN=Android Debug
Issuer: C=US, O=Android, CN=Android Debug
Serial number: 1
Valid from: Thu Jan 01 12:46:11 GMT+03:00 2026 until: Sat Dec 25 12:46:11 GMT+03:00 2055
Certificate fingerprints:
         SHA1: F1:0C:65:62:5B:EC:66:4A:BD:06:D8:FE:62:E1:A1:3C:00:FA:12:4C
         SHA256: DA:BB:51:1F:24:86:39:22:F2:61:E5:7F:43:2E:D1:E4:C6:FC:DF:DB:73:4B:D4:94:94:F7:2C:9D:6D:EA:E2:D1
Signature algorithm name: SHA256withRSA
Subject Public Key Algorithm: 2048-bit RSA key
Version: 1

#### Release Key (Production):
```bash
keytool -list -v -keystore /path/to/release.keystore -alias your-key-alias
```

### 2. Backend'de Fingerprint'leri Güncelleyin

`dahis-be/dahisio/index.js` dosyasındaki `assetlinks` fonksiyonunda:

```javascript
sha256_cert_fingerprints: [
  "SHA256_FINGERPRINT_DEBUG",   // Debug key fingerprint
  "SHA256_FINGERPRINT_RELEASE", // Release key fingerprint
],
```

### 3. assetlinks.json Dosyasını Deploy Edin

Backend'deki endpoint zaten hazır:
- `GET https://us-central1-dahisio.cloudfunctions.net/assetlinks`

**www.dahis.io domain'inde bu dosyayı serve etmek için:**

1. Firebase Hosting'de `public/.well-known/assetlinks.json` dosyası oluşturun
2. Veya web sunucunuzda bu dosyayı serve edin

**Örnek dosya içeriği:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.dahis.io",
      "sha256_cert_fingerprints": [
        "SHA256_FINGERPRINT_DEBUG",
        "SHA256_FINGERPRINT_RELEASE"
      ]
    }
  }
]
```

## 🔗 Deep Link Yapılandırması

### iOS (Info.plist)
✅ Zaten yapılandırıldı:
- Custom URL Scheme: `dahis://`
- Associated Domains: `applinks:www.dahis.io`

### Android (AndroidManifest.xml)
✅ Zaten yapılandırıldı:
- App Links: `https://www.dahis.io/*`
- Custom URL Scheme: `dahis://`

## 🧪 Test Etme

### iOS:
1. Safari'de `https://www.dahis.io/character/puls` linkini açın
2. Uygulama yüklüyse, uygulama açılmalı
3. Uygulama yoksa, web sayfası açılmalı

### Android:
1. Chrome'da `https://www.dahis.io/character/puls` linkini açın
2. Uygulama yüklüyse, uygulama açılmalı
3. Uygulama yoksa, web sayfası açılmalı

### Custom URL Scheme:
- `dahis://character/puls` → Uygulamayı açmalı

## 📝 Notlar

1. **Domain Doğrulama:** iOS ve Android, domain'in sahibi olduğunuzu doğrulamak için `.well-known` klasöründeki dosyaları kontrol eder.

2. **SSL Sertifikası:** Universal Links ve App Links için HTTPS zorunludur.

3. **Path Matching:** 
   - iOS: `paths` array'inde belirtilen path'ler eşleşir
   - Android: `intent-filter` içindeki `pathPrefix` değerleri eşleşir

4. **Backend Redirect:** Backend'deki `dahiosRedirect` fonksiyonu artık `https://www.dahis.io/character/{characterId}` formatında URL'ler oluşturuyor.

## 🚀 Deploy

Backend değişikliklerini deploy edin:

```bash
cd dahis-be
firebase deploy --only functions
```

Web sunucunuzda `.well-known` klasörünü oluşturup dosyaları ekleyin.

