# dahi's One

Harmonya'nın Ritmini Koruyan Kahramanlar - dahi's One projesi.

## ⌚ Ürün Konsepti

dahi's One karakterleri **Casio F91W** tarzı dijital saatler olarak somutlaşıyor. Her karakter için saat özel renklerle tasarlanıyor; içine yerleştirilen **NFC çipi** sayesinde saat dokunulduğunda ilgili karakterin dijital dünyasına (karakter sayfası, mağaza, kampanya vb.) yönlendiriyor. Yani hem giyilebilir ürün hem de fizikselden dijitale köprü.

## 📁 Proje Yapısı

```
dahi-one/
├── dahis-web/          # Web uygulaması (HTML/CSS/JS)
├── dahis-mobile/       # React Native mobil uygulaması
└── dahis-be/          # Firebase Backend (Functions + Firestore)
```

## 🚀 Hızlı Başlangıç

### Web Uygulaması
```bash
cd dahis-web
# Dosyaları file manager'a yükleyin
```

### Mobil Uygulama
```bash
cd dahis-mobile
npm install
npm start
```

### Backend
```bash
cd dahis-be
cd dahisio
npm install
firebase deploy --only functions:dahisio
```

## 📚 Dokümantasyon

- [Pazarlama rehberi (aşama aşama)](PAZARLAMA.md)
- [Oyunlar ve Eğlence (quiz, puzzle, Five Forces vb.)](dahis-web/OYUNLAR.md)
- [Backend README](dahis-be/README.md)
- [API Request Kılavuzu](dahis-be/REQUEST-README.md)
- [Web Deployment](dahis-web/DEPLOYMENT.md)
- [Mobile Build](dahis-mobile/README.md)

## 🔧 Teknolojiler

- **Web**: HTML5, CSS3, JavaScript (ES6+)
- **Mobile**: React Native (Expo)
- **Backend**: Firebase (Cloud Functions, Firestore)
- **NFC**: UUID tabanlı tag yönetimi

## 📝 Lisans

Private project

