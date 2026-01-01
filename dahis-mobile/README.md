# dahi's One - Flutter Mobile App

Web projesinin Flutter'a çevrilmiş mobil versiyonu.

## 📱 Özellikler

- ✅ Hero section ile karakter orb animasyonları
- ✅ Karakter kartları ve detay sayfaları
- ✅ Sezonlar ve bölümler
- ✅ Deep linking desteği (URL routing)
- ✅ Modern ve responsive tasarım
- ✅ Web projesiyle aynı içerik ve özellikler

## 🚀 Kurulum

### Gereksinimler

- Flutter SDK (3.0.0 veya üzeri)
- Dart SDK
- Android Studio / Xcode (mobil geliştirme için)

### Adımlar

1. **Flutter'ı yükleyin** (eğer yüklü değilse):
   ```bash
   # macOS için
   brew install flutter
   
   # veya manuel olarak
   git clone https://github.com/flutter/flutter.git
   export PATH="$PATH:`pwd`/flutter/bin"
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   cd dahis-mobile
   flutter pub get
   ```

3. **Uygulamayı çalıştırın**:
   ```bash
   flutter run
   ```

## 📁 Proje Yapısı

```
dahis-mobile/
├── lib/
│   ├── main.dart                 # Ana uygulama ve routing
│   ├── models/                   # Veri modelleri
│   │   ├── character.dart
│   │   ├── episode.dart
│   │   └── season.dart
│   ├── screens/                  # Ekranlar
│   │   ├── home_screen.dart
│   │   ├── character_detail_screen.dart
│   │   ├── season_detail_screen.dart
│   │   └── episode_detail_screen.dart
│   └── widgets/                 # Widget'lar
│       ├── character_orb.dart
│       ├── character_card.dart
│       ├── season_card.dart
│       └── episode_card.dart
├── assets/
│   └── characters/              # Karakter resimleri
└── pubspec.yaml                 # Proje yapılandırması
```

## 🔗 Deep Linking

Uygulama deep linking destekler:

- `/character/{characterId}` - Karakter detay sayfası
- `/season/{seasonId}` - Sezon detay sayfası
- `/season/{seasonId}/episode/{episodeId}` - Bölüm detay sayfası

## 🎨 Tasarım

Web projesiyle aynı tasarım dili kullanılmıştır:
- Koyu tema (#0a0a0f)
- Gradient renkler
- Poppins font ailesi
- Smooth animasyonlar

## 📦 Kullanılan Paketler

- `go_router`: Routing ve navigation
- `url_launcher`: Harici link açma (mağaza)

## 🔄 Web Projesiyle Farklar

- Flutter widget yapısı kullanılıyor
- Native mobil performans
- Platform-specific özellikler eklenebilir
- App Store / Play Store'a yayınlanabilir

## 📝 Notlar

- Karakter resimleri `assets/characters/` klasöründe olmalı
- Web projesindeki tüm içerik Flutter'a aktarılmıştır
- URL routing web projesiyle uyumludur

