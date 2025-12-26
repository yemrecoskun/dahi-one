# Local Test Rehberi

## 🚀 Web Uygulamasını Test Etme

### Yöntem 1: Python HTTP Server (Önerilen)

```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-web
python3 -m http.server 8000
```

Tarayıcıda açın: **http://localhost:8000**

### Yöntem 2: Node.js http-server

```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-web
npx http-server -p 8000
```

Tarayıcıda açın: **http://localhost:8000**

### Yöntem 3: PHP Server

```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-web
php -S localhost:8000
```

Tarayıcıda açın: **http://localhost:8000**

## 🧪 Test Senaryoları

### 1. Karakter Modal Testi

**URL ile test:**
```
http://localhost:8000/?character=puls
http://localhost:8000/?character=zest
http://localhost:8000/?character=lumo
http://localhost:8000/?character=vigo
http://localhost:8000/?character=aura
```

**Beklenen:** Modal otomatik açılmalı ve karakter bilgileri görünmeli.

### 2. Karakter Kartı Tıklama

1. Ana sayfada karakter kartlarına tıklayın
2. Modal açılmalı
3. "SATIN AL" butonuna tıklayın → `https://dahis.shop/one-{characterId}` yönlendirmeli

### 3. URL Routing Testi

1. `http://localhost:8000/?character=puls` açın
2. Modal açılmalı
3. Modal'ı kapatın
4. URL'den `?character=puls` parametresi kalkmalı
5. Browser back butonuna basın → Modal tekrar açılmalı

### 4. Sezonlar ve Bölümler

1. "Sezonlar" bölümüne scroll edin
2. Sezon kartına tıklayın → `season.html?id=season1` açılmalı
3. Bölüm kartına tıklayın → Bölüm detayı görünmeli

### 5. Navigation Testi

1. Üst menüden "Onelar" tıklayın → Karakterler bölümüne scroll olmalı
2. Üst menüden "Sezonlar" tıklayın → Sezonlar bölümüne scroll olmalı
3. "Mağaza" butonuna tıklayın → `https://dahis.ikas.shop/` yeni sekmede açılmalı

## 🔧 Backend Test (Firebase Emulators)

Backend'i local'de test etmek için:

```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be
npx firebase-tools emulators:start
```

Bu komut:
- Firestore emulator'ü başlatır (port 8080)
- Functions emulator'ü başlatır (port 5001)
- Emulator UI'ı açar (port 4000)

**Emulator URL'leri:**
- UI: http://localhost:4000
- Functions: http://localhost:5001
- Firestore: http://localhost:8080

### Panel'i Emulator ile Test Etme

`dahis-panel/script.js` dosyasındaki API URL'ini değiştirin:

```javascript
// Local test için
const API_BASE = 'http://localhost:5001/dahisio/us-central1';

// Production için
// const API_BASE = 'https://us-central1-dahisio.cloudfunctions.net';
```

Sonra panel'i açın:
```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-panel
python3 -m http.server 8001
```

Panel: http://localhost:8001

## 🐛 Sorun Giderme

### Port zaten kullanılıyor

```bash
# Port'u değiştirin
python3 -m http.server 8080
```

### CORS Hatası

Backend test ederken CORS hatası alırsanız, emulator'de CORS ayarlarını kontrol edin.

### Modal Açılmıyor

1. Browser console'u açın (F12)
2. JavaScript hatalarını kontrol edin
3. `charactersData` objesinin yüklendiğinden emin olun

### URL Parametresi Çalışmıyor

1. Browser cache'i temizleyin (Ctrl+Shift+R veya Cmd+Shift+R)
2. Hard refresh yapın
3. Console'da `checkUrlForCharacter()` fonksiyonunu manuel çağırın

## 📝 Hızlı Test Scripti

Tüm testleri tek seferde çalıştırmak için:

```bash
# Terminal 1: Web server
cd /Users/yunusemrecoskun/dahi-one/dahis-web
python3 -m http.server 8000

# Terminal 2: Backend emulator (opsiyonel)
cd /Users/yunusemrecoskun/dahi-one/dahis-be
npx firebase-tools emulators:start

# Terminal 3: Panel (opsiyonel)
cd /Users/yunusemrecoskun/dahi-one/dahis-panel
python3 -m http.server 8001
```

## ✅ Test Checklist

- [ ] Ana sayfa yükleniyor
- [ ] Karakter kartları görünüyor
- [ ] Karakter kartına tıklayınca modal açılıyor
- [ ] URL parametresi ile modal açılıyor (`?character=puls`)
- [ ] Modal kapanınca URL temizleniyor
- [ ] Browser back butonu çalışıyor
- [ ] "SATIN AL" butonu doğru URL'ye yönlendiriyor
- [ ] Sezonlar bölümü görünüyor
- [ ] Sezon detay sayfası açılıyor
- [ ] Bölüm detayları görünüyor
- [ ] Navigation menüsü çalışıyor
- [ ] Mağaza butonu yeni sekmede açılıyor

