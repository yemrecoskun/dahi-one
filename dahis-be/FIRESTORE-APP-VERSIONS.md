# Firestore App Versions Collection Yapısı

## 📁 Collection: `app_versions`

### Document ID: `ios`

```json
{
  "minimumVersion": "1.0.1",
  "latestVersion": "1.0.2",
  "forceUpdate": true,
  "appStoreUrl": "https://apps.apple.com/app/dahis-one/id123456789",
  "playStoreUrl": null,
  "updateMessage": "Yeni özellikler ve iyileştirmeler için lütfen uygulamayı güncelleyin. Bu güncelleme zorunludur."
}
```

### Document ID: `android`

```json
{
  "minimumVersion": "1.0.1",
  "latestVersion": "1.0.2",
  "forceUpdate": true,
  "appStoreUrl": null,
  "playStoreUrl": "https://play.google.com/store/apps/details?id=com.dahis.mobile",
  "updateMessage": "Yeni özellikler ve iyileştirmeler için lütfen uygulamayı güncelleyin. Bu güncelleme zorunludur."
}
```

## 📋 Field Açıklamaları

### `minimumVersion` (string, zorunlu)
- **Açıklama**: Kullanıcının minimum sahip olması gereken versiyon
- **Format**: `MAJOR.MINOR.PATCH` (örn: `1.0.1`)
- **Kullanım**: Eğer kullanıcının versiyonu bu değerden düşükse güncelleme gerekir

### `latestVersion` (string, opsiyonel)
- **Açıklama**: En son yayınlanan versiyon
- **Format**: `MAJOR.MINOR.PATCH` (örn: `1.0.2`)
- **Kullanım**: Bilgilendirme amaçlı (şu an kullanılmıyor ama gelecekte kullanılabilir)

### `forceUpdate` (boolean, zorunlu)
- **Açıklama**: Güncelleme zorunlu mu?
- **Değerler**: 
  - `true`: Kullanıcı güncelleme yapmadan uygulamayı kullanamaz
  - `false`: Kullanıcı "Daha Sonra" diyebilir

### `appStoreUrl` (string, opsiyonel)
- **Açıklama**: iOS App Store linki
- **Format**: `https://apps.apple.com/app/...`
- **Kullanım**: iOS cihazlarda güncelleme butonuna tıklandığında açılır

### `playStoreUrl` (string, opsiyonel)
- **Açıklama**: Google Play Store linki
- **Format**: `https://play.google.com/store/apps/details?id=...`
- **Kullanım**: Android cihazlarda güncelleme butonuna tıklandığında açılır

### `updateMessage` (string, opsiyonel)
- **Açıklama**: Kullanıcıya gösterilecek güncelleme mesajı
- **Varsayılan**: "Yeni bir güncelleme mevcut. Lütfen uygulamayı güncelleyin."
- **Kullanım**: Dialog'da gösterilir

## 🎯 Kullanım Senaryoları

### Senaryo 1: Zorunlu Güncelleme (Force Update)

```json
{
  "minimumVersion": "1.0.1",
  "forceUpdate": true,
  "appStoreUrl": "https://apps.apple.com/app/...",
  "updateMessage": "Kritik güvenlik güncellemesi. Lütfen hemen güncelleyin."
}
```

**Sonuç:**
- Dialog gösterilir
- "Daha Sonra" butonu YOK
- Geri tuşu çalışmaz
- Kullanıcı güncelleme yapmadan uygulamayı kullanamaz

### Senaryo 2: İsteğe Bağlı Güncelleme (Optional Update)

```json
{
  "minimumVersion": "1.0.1",
  "forceUpdate": false,
  "appStoreUrl": "https://apps.apple.com/app/...",
  "updateMessage": "Yeni özellikler eklendi. Güncellemek ister misiniz?"
}
```

**Sonuç:**
- Dialog gösterilir
- "Daha Sonra" butonu VAR
- Kullanıcı uygulamayı kullanmaya devam edebilir

### Senaryo 3: Güncelleme Gerekmiyor

```json
{
  "minimumVersion": "1.0.0",
  "forceUpdate": false
}
```

**Sonuç:**
- Eğer kullanıcının versiyonu `1.0.0` veya üzeriyse dialog gösterilmez
- Uygulama normal çalışır

## 🔧 Firebase Console'da Oluşturma

1. Firebase Console'a git: https://console.firebase.google.com
2. Projeyi seç: `dahisio`
3. Firestore Database'e git
4. "Start collection" tıkla
5. Collection ID: `app_versions`
6. Document ID: `ios` (veya `android`)
7. Field'ları ekle:
   - `minimumVersion` (string)
   - `latestVersion` (string)
   - `forceUpdate` (boolean)
   - `appStoreUrl` (string)
   - `playStoreUrl` (string)
   - `updateMessage` (string)

## 📝 Örnek Veri

### iOS için:
```
Collection: app_versions
Document ID: ios

Fields:
- minimumVersion: "1.0.0"
- latestVersion: "1.0.1"
- forceUpdate: false
- appStoreUrl: "https://apps.apple.com/app/dahis-one/id123456789"
- playStoreUrl: null
- updateMessage: "Yeni özellikler eklendi! Güncellemek ister misiniz?"
```

### Android için:
```
Collection: app_versions
Document ID: android

Fields:
- minimumVersion: "1.0.0"
- latestVersion: "1.0.1"
- forceUpdate: false
- appStoreUrl: null
- playStoreUrl: "https://play.google.com/store/apps/details?id=com.dahis.mobile"
- updateMessage: "Yeni özellikler eklendi! Güncellemek ister misiniz?"
```

## 🔒 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // App Versions - Public read (herkes okuyabilir)
    match /app_versions/{platform} {
      allow read: if true;
      allow write: if false; // Sadece admin panelinden yazılabilir
    }
  }
}
```

## 💡 Notlar

- Her platform için ayrı document (`ios` ve `android`)
- Version formatı: `MAJOR.MINOR.PATCH` (örn: `1.0.1`)
- `forceUpdate: true` ise kullanıcı güncelleme yapmadan uygulamayı kullanamaz
- Store URL'leri opsiyonel ama önerilir (kullanıcı direkt store'a yönlendirilir)

