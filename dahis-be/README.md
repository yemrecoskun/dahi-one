# dahi's One Backend - Firebase

Firebase Functions ve Firestore kullanarak dahiOS yönlendirme sistemi.

## ✅ Kurulum Tamamlandı

Firebase init başarıyla tamamlandı:
- ✅ Firestore kuruldu
- ✅ Functions codebase oluşturuldu (`dahisio/`)
- ✅ dahiOS Functions kodları eklendi

## 📁 Proje Yapısı

```
dahis-be/
├── dahisio/              # Functions codebase (JavaScript)
│   ├── index.js         # dahiOS Functions kodları
│   └── package.json
├── firestore.rules      # Firestore güvenlik kuralları
├── firestore.indexes.json # Firestore indexleri
├── firebase.json        # Firebase yapılandırması
└── .firebaserc          # Firebase proje bağlantısı
```

## 🔧 Sonraki Adımlar

### 1. Dependencies Yükle

```bash
cd dahisio
npm install
```

### 2. Firestore Rules Deploy (Zaten yapıldı ✅)

```bash
cd ..
firebase deploy --only firestore
```

### 3. Functions Deploy (Blaze Plan Gerekli)

**ÖNEMLİ:** Blaze plan'a geçiş yapın:
https://console.firebase.google.com/project/dahisio/usage/details

Sonra:
```bash
firebase deploy --only functions:dahisio
```

## 📡 API Endpoints

✅ **Tüm fonksiyonlar başarıyla deploy edildi!**

### dahiOS Yönlendirme
```
https://nfcredirect-6elk3up56q-uc.a.run.app?nfcId={nfcId}
```
veya
```
https://us-central1-dahisio.cloudfunctions.net/nfcRedirect?nfcId={nfcId}
```

**Örnek:**
```
https://nfcredirect-6elk3up56q-uc.a.run.app?nfcId=puls-001
```

### dahiOS Bilgisi
```
https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId={nfcId}
```
veya
```
https://us-central1-dahisio.cloudfunctions.net/nfcInfo?nfcId={nfcId}
```

**Örnek:**
```
https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=puls-001
```

### İstatistikler
```
https://nfcstats-6elk3up56q-uc.a.run.app?characterId={id}
```
veya
```
https://us-central1-dahisio.cloudfunctions.net/nfcStats?characterId={id}
```

**Örnek:**
```
https://nfcstats-6elk3up56q-uc.a.run.app?characterId=puls
```

## 🗄️ Firestore Yapısı

### Collection: `nfc_tags`

```javascript
{
  nfcId: "puls-001",
  characterId: "puls",
  redirectType: "character", // "character" | "store" | "campaign"
  customUrl: "", // Özel URL (campaign için)
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `nfc_scans`

```javascript
{
  nfcId: "puls-001",
  characterId: "puls",
  redirectType: "character",
  redirectUrl: "https://dahis.io/character/puls",
  ipAddress: "xxx.xxx.xxx.xxx",
  userAgent: "Mozilla/5.0...",
  timestamp: Timestamp
}
```

## 📝 Örnek dahiOS Tag Oluşturma

Firebase Console'dan veya Admin SDK ile:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

// Puls karakteri için dahiOS tag
await db.collection('nfc_tags').doc('puls-001').set({
  nfcId: 'puls-001',
  characterId: 'puls',
  redirectType: 'character',
  isActive: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});
```

## 🚀 Hızlı Başlangıç

```bash
# 1. Dependencies yükle
cd dahisio
npm install

# 2. Firestore deploy (zaten yapıldı)
cd ..
firebase deploy --only firestore

# 3. Blaze plan'a geçiş yap
# https://console.firebase.google.com/project/dahisio/usage/details

# 4. Functions deploy
firebase deploy --only functions:dahisio
```

## ✅ Deploy Durumu

- ✅ Firestore deploy edildi
- ✅ Functions deploy edildi (3 fonksiyon aktif)
- ✅ Cleanup policy ayarlandı

## ⚠️ Notlar

- Functions deploy için **Blaze plan** gerekiyor (aktif ✅)
- dahiOS tag'leri Firebase Console'dan oluşturabilirsiniz
- Tüm fonksiyonlar `us-central1` region'unda çalışıyor

