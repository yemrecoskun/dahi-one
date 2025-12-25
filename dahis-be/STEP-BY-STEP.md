# Adım Adım Firebase Kurulumu

## Adım 1: Firebase CLI Kurulumu (npx ile - Önerilen)

```bash
cd dahis-be
npx firebase-tools --version
```

Eğer çalışıyorsa devam edin. Çalışmıyorsa:

```bash
# npm cache iznini düzelt (eğer sorun varsa)
sudo chown -R $(whoami) ~/.npm

# Sonra tekrar deneyin
npx firebase-tools --version
```

## Adım 2: Firebase'e Giriş

```bash
npx firebase-tools login
```

Tarayıcı açılacak, Google hesabınızla giriş yapın.

## Adım 3: Firebase Projesi Oluştur/Bağla

### 3a. Firebase Console'da Proje Oluştur

1. https://console.firebase.google.com/ adresine gidin
2. "Add project" veya "Create a project" tıklayın
3. Proje adı: `dahisio` (veya istediğiniz isim)
4. Google Analytics: İsteğe bağlı (Skip edebilirsiniz)
5. "Create project" tıklayın

### 3b. Projeyi Bağla

```bash
cd dahis-be
npx firebase-tools use --add
```

Sorular:
- **Which project?** → Oluşturduğunuz projeyi seçin
- **What alias?** → `default` (Enter'a basın)

## Adım 4: Firebase Init

```bash
npx firebase-tools init
```

**Seçenekler:**
1. **Which Firebase features?** → `Functions` ve `Firestore` seçin (Space ile seçin, Enter ile onaylayın)
2. **Use an existing project?** → `Yes` → Projenizi seçin
3. **What language?** → `JavaScript`
4. **Do you want to use ESLint?** → `Yes` (önerilir)
5. **Do you want to install dependencies?** → `Yes`

## Adım 5: Functions Kodu Ekle

Init sonrası `functions/index.js` dosyası oluşacak. Bu dosyaya NFC endpoint'lerini ekleyeceğiz.

## Adım 6: Firestore Rules ve Indexes

Init sonrası `firestore.rules` ve `firestore.indexes.json` dosyaları oluşacak. Bunları güncelleyeceğiz.

## Adım 7: Test (Local)

```bash
npx firebase-tools emulators:start
```

## Adım 8: Deploy

**ÖNEMLİ:** Blaze plan gerekiyor!

```bash
# Sadece Firestore (Blaze plan olmadan)
npx firebase-tools deploy --only firestore

# Tümü (Blaze plan ile)
npx firebase-tools deploy
```

## Sorun Giderme

### npm cache izin sorunu:
```bash
sudo chown -R $(whoami) ~/.npm
```

### Firebase init hata verirse:
- `.firebaserc` dosyasını kontrol edin
- `firebase.json` dosyasını kontrol edin

