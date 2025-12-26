# 🚀 dahi's One - Komutlar Rehberi

Bu dosya, projede sık kullanılan tüm komutları içerir.

## 📁 Proje Yapısı

```
dahi-one/
├── dahis-web/          # Web uygulaması
├── dahis-mobile/        # React Native mobil uygulama
├── dahis-be/            # Firebase Backend
└── dahis-panel/         # Admin Panel
```

---

## 🔥 Firebase Backend Komutları

### Backend'e Git
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be
```

### Firebase CLI Kurulumu (npx ile - Önerilen)
```bash
npx firebase-tools --version
```

### Firebase'e Giriş
```bash
npx firebase-tools login
```

### Proje Bağlantısı
```bash
npx firebase-tools use --add
```

### Dependencies Yükle
```bash
cd dahisio
npm install
cd ..
```

### Tüm Functions Deploy
```bash
firebase deploy --only functions:dahisio
```

### Tek Function Deploy
```bash
# NFC Redirect
firebase deploy --only functions:dahisio/nfcRedirect

# NFC Info
firebase deploy --only functions:dahisio/nfcInfo

# NFC Stats
firebase deploy --only functions:dahisio/nfcStats

# NFC Create
firebase deploy --only functions:dahisio/nfcCreate

# NFC List
firebase deploy --only functions:dahisio/nfcList

# NFC Update
firebase deploy --only functions:dahisio/nfcUpdate
```

### Sadece Firestore Deploy (Blaze plan olmadan)
```bash
firebase deploy --only firestore
```

### Firestore Rules Deploy
```bash
firebase deploy --only firestore:rules
```

### Firestore Indexes Deploy
```bash
firebase deploy --only firestore:indexes
```

### Local Emulator Başlat
```bash
firebase emulators:start
```

### Emulator UI
```
http://localhost:4000
```

---

## 🌐 Web Uygulaması Komutları

### Web'e Git
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-web
```

### Local Test Server (Python)
```bash
python3 -m http.server 8000
```

### Local Test Server (Node.js)
```bash
npx http-server -p 8000
```

### Local Test Server (PHP)
```bash
php -S localhost:8000
```

### Test Scripti Çalıştır
```bash
./test-local.sh
```

### Test URL'leri
```
http://localhost:8000
http://localhost:8000/?character=puls
http://localhost:8000/?character=zest
http://localhost:8000/?character=lumo
http://localhost:8000/?character=vigo
http://localhost:8000/?character=aura
```

---

## 📱 Mobil Uygulama Komutları

### Mobile'e Git
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-mobile
```

### Dependencies Yükle
```bash
npm install
```

### Expo Başlat
```bash
npx expo start
```

### Web Build
```bash
npx expo export:web
```

### iOS Build
```bash
npx expo build:ios
```

### Android Build
```bash
npx expo build:android
```

---

## 🎛️ Admin Panel Komutları

### Panel'e Git
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-panel
```

### Local Test Server
```bash
python3 -m http.server 8001
```

### Panel URL
```
http://localhost:8001
```

---

## 📦 Git Komutları

### Proje Root'a Git
```bash
cd /Users/yunusemrecoskun/dahi-one
```

### Git Durumu Kontrol
```bash
git status
```

### Tüm Değişiklikleri Ekle
```bash
git add .
```

### Belirli Dosyaları Ekle
```bash
git add dahis-web/script.js
git add dahis-be/dahisio/index.js
git add dahis-panel/script.js
```

### Commit (Kısa Mesaj)
```bash
git commit -m "feat: NFC tag düzenleme özelliği eklendi"
```

### Commit (Detaylı Mesaj)
```bash
git commit -m "feat: NFC tag düzenleme özelliği

- Backend'e nfcUpdate endpoint'i eklendi
- Panel'e tag düzenleme modal'ı eklendi
- Aktif/pasif durumu güncellenebilir
- Yönlendirme tipi değiştirilebilir"
```

### Commit Mesaj Formatları

#### Feature (Yeni Özellik)
```bash
git commit -m "feat: karakter modal URL routing eklendi"
```

#### Fix (Hata Düzeltme)
```bash
git commit -m "fix: modal otomatik açılma sorunu düzeltildi"
```

#### Update (Güncelleme)
```bash
git commit -m "update: backend endpoint'leri güncellendi"
```

#### Refactor (Yeniden Yapılandırma)
```bash
git commit -m "refactor: kod yapısı iyileştirildi"
```

#### Docs (Dokümantasyon)
```bash
git commit -m "docs: komutlar rehberi eklendi"
```

#### Style (Stil Değişiklikleri)
```bash
git commit -m "style: panel modal tasarımı güncellendi"
```

### Branch İşlemleri

#### Yeni Branch Oluştur
```bash
git checkout -b feature/nfc-update
```

#### Branch Değiştir
```bash
git checkout main
```

#### Branch Listesi
```bash
git branch
```

#### Branch Birleştir
```bash
git merge feature/nfc-update
```

### Remote İşlemleri

#### Remote Kontrol
```bash
git remote -v
```

#### Push (İlk Kez)
```bash
git push -u origin main
```

#### Push (Sonraki)
```bash
git push
```

#### Pull (Güncelleme Çek)
```bash
git pull
```

#### Push Script Kullan
```bash
./PUSH-TO-GITHUB.sh
```

---

## 🔄 Tam Deploy Süreci

### 1. Backend Deploy
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be
cd dahisio
npm install
cd ..
firebase deploy --only functions:dahisio
```

### 2. Git Commit & Push
```bash
cd /Users/yunusemrecoskun/dahi-one
git add .
git commit -m "feat: yeni özellik eklendi"
git push
```

### 3. Web Test
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-web
python3 -m http.server 8000
```

---

## 🧪 Test Komutları

### Web Test
```bash
cd dahis-web
python3 -m http.server 8000
# Tarayıcıda: http://localhost:8000
```

### Panel Test
```bash
cd dahis-panel
python3 -m http.server 8001
# Tarayıcıda: http://localhost:8001
```

### Backend Emulator Test
```bash
cd dahis-be
firebase emulators:start
# UI: http://localhost:4000
```

---

## 🛠️ Yardımcı Komutlar

### Port Kontrolü
```bash
# Port 8000 kullanımda mı?
lsof -i :8000

# Port 8000'i kullanan process'i öldür
kill -9 $(lsof -t -i:8000)
```

### Node Modules Temizle
```bash
# Web
cd dahis-web
rm -rf node_modules package-lock.json
npm install

# Mobile
cd dahis-mobile
rm -rf node_modules package-lock.json
npm install

# Backend
cd dahis-be/dahisio
rm -rf node_modules package-lock.json
npm install
```

### Git Cache Temizle
```bash
git rm -r --cached .
git add .
```

### Firebase Logs
```bash
firebase functions:log
```

### Firebase Logs (Belirli Function)
```bash
firebase functions:log --only dahisio:nfcRedirect
```

---

## 📝 Hızlı Komutlar (Kopyala-Yapıştır)

### Backend Deploy
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be && cd dahisio && npm install && cd .. && firebase deploy --only functions:dahisio
```

### Web Test
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-web && python3 -m http.server 8000
```

### Panel Test
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-panel && python3 -m http.server 8001
```

### Git Commit & Push
```bash
cd /Users/yunusemrecoskun/dahi-one && git add . && git commit -m "update: değişiklikler" && git push
```

### Tüm Dependencies Yükle
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be/dahisio && npm install && cd ../../dahis-mobile && npm install
```

---

## 🚨 Sorun Giderme

### Firebase Permission Hatası
```bash
sudo chown -R $(whoami) ~/.npm
```

### Port Zaten Kullanılıyor
```bash
# Port'u değiştir veya process'i öldür
lsof -i :8000
kill -9 $(lsof -t -i:8000)
```

### Git Permission Hatası
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Firebase Login Sorunu
```bash
npx firebase-tools logout
npx firebase-tools login
```

---

## 📚 Ek Kaynaklar

- **Backend API Docs**: `dahis-be/REQUEST-README.md`
- **Test Rehberi**: `dahis-web/TEST-LOCAL.md`
- **GitHub Setup**: `GITHUB-SETUP.md`
- **Deploy Notları**: `dahis-panel/DEPLOY-NOTES.md`

---

## 💡 İpuçları

1. **Backend deploy'dan önce** `npm install` çalıştırın
2. **Git commit'lerde** açıklayıcı mesajlar kullanın
3. **Test etmeden** production'a push yapmayın
4. **Firebase emulator** ile local test yapın
5. **Port çakışması** durumunda farklı port kullanın

---

**Son Güncelleme**: 2024
**Proje**: dahi's One
**Versiyon**: 1.0

