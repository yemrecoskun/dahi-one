# Firestore Data Push Script

Bu script, karakter ve sezon verilerini Firestore'a push eder.

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
cd dahis-be
npm install firebase-admin
```

2. Firebase Admin SDK için kimlik bilgilerini ayarlayın (3 yöntemden biri):

### Yöntem 1: Service Account Key Dosyası (Önerilen)
- Firebase Console > Project Settings > Service Accounts
- "Generate new private key" butonuna tıklayın
- İndirilen JSON dosyasını `dahis-be/serviceAccountKey.json` olarak kaydedin

### Yöntem 2: Environment Variable
```bash
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

### Yöntem 3: Firebase Functions İçinde Çalıştırma
Eğer script'i Firebase Functions içinde çalıştırıyorsanız, Application Default Credentials otomatik kullanılır.

## Kullanım

```bash
node scripts/push-data-to-firestore.js
```

## Veri Yapısı

### Characters Collection
- `id`: Karakter ID'si (puls, zest, lumo, vigo, aura)
- `name`: Karakter adı
- `color`: Renk adı (Kırmızı, Turuncu, vb.)
- `colorCode`: Hex renk kodu
- `image`: Görsel yolu
- `description`: Kısa açıklama
- `traits`: Özellikler listesi
- `fullDescription`: Detaylı açıklama

### Seasons Collection
- `id`: Sezon ID'si (season1, vb.)
- `title`: Sezon başlığı
- `subtitle`: Sezon alt başlığı
- `summary`: Sezon özeti
- `episodes`: Subcollection (episodes)

### Episodes Subcollection
- `id`: Bölüm ID'si (episode1, vb.)
- `number`: Bölüm numarası
- `title`: Bölüm başlığı
- `character`: Odak karakter
- `characterColor`: Karakter rengi
- `summary`: Bölüm özeti
- `content`: Bölüm içeriği

## Notlar

- Script, mevcut verileri üzerine yazar (upsert)
- Firestore security rules, bu collection'ları public read olarak ayarlanmıştır
- Write işlemleri sadece admin scriptinden yapılabilir

