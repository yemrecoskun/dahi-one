# dahi's One Admin Panel

Backend API endpoint'leri için basit ve kullanıcı dostu admin panel arayüzü.

## 🚀 Özellikler

- ✅ **NFC Tag Oluşturma**: UUID ile otomatik tag oluşturma
- ✅ **Tag Bilgisi Sorgulama**: UUID ile tag bilgilerini görüntüleme
- ✅ **İstatistikler**: NFC okutma istatistiklerini görüntüleme
- ✅ **Responsive Tasarım**: Mobil ve desktop uyumlu
- ✅ **Modern UI**: Gradient tasarım ve animasyonlar

## 📁 Dosya Yapısı

```
dahis-panel/
├── index.html      # Ana HTML dosyası
├── styles.css      # Stil dosyası
├── script.js       # JavaScript logic
└── README.md       # Bu dosya
```

## 🔧 Kullanım

### Yerel Çalıştırma

1. Dosyaları bir web sunucusunda çalıştırın:

```bash
# Python ile
python3 -m http.server 8000

# Node.js ile (http-server)
npx http-server

# PHP ile
php -S localhost:8000
```

2. Tarayıcıda açın: `http://localhost:8000`

### Production Deploy

Dosyaları herhangi bir static hosting servisine yükleyebilirsiniz:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Herhangi bir web sunucusu

## 📡 API Endpoints

Panel şu endpoint'leri kullanır:

- `POST /nfcCreate` - NFC tag oluşturma
- `GET /nfcInfo?nfcId={uuid}` - Tag bilgisi getirme
- `GET /nfcStats?characterId={id}` - İstatistikler

API Base URL: `https://us-central1-dahisio.cloudfunctions.net`

## 🎨 Özellikler

### NFC Tag Oluştur
- Karakter seçimi (Puls, Mavi, Sarı, Turuncu, Yeşil)
- Yönlendirme tipi seçimi (Karakter, Mağaza, Kampanya)
- Otomatik UUID oluşturma
- Oluşturulan UUID'yi kopyalama

### Tag Bilgisi
- UUID ile tag sorgulama
- Tag durumu görüntüleme
- Detaylı bilgi gösterimi

### İstatistikler
- Tüm scan kayıtları
- Karakter bazlı filtreleme
- Tarih ve IP bilgileri

## 🔐 Güvenlik Notları

- Bu panel public erişime açık olmamalıdır
- Production'da authentication eklenmelidir
- API endpoint'leri CORS ile korunmalıdır

## 🛠️ Geliştirme

### Yeni Özellik Ekleme

1. `index.html`'e yeni tab/section ekleyin
2. `styles.css`'e stil ekleyin
3. `script.js`'e logic ekleyin

### API URL Değiştirme

`script.js` dosyasındaki `API_BASE` değişkenini güncelleyin:

```javascript
const API_BASE = 'https://your-api-url.com';
```

## 📝 Notlar

- Tag listesi özelliği için Firebase SDK entegrasyonu gereklidir
- Şu an için tag bilgileri UUID ile sorgulanabilir
- İstatistikler en son 100 kaydı gösterir

## 🚀 Hızlı Başlangıç

```bash
# Projeyi klonlayın veya dosyaları kopyalayın
cd dahis-panel

# Basit HTTP sunucusu başlatın
python3 -m http.server 8000

# Tarayıcıda açın
open http://localhost:8000
```

