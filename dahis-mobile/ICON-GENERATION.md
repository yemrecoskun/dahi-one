# App Icon Oluşturma Rehberi

Logo widget'ını kullanarak app icon oluşturmak için:

## Yöntem 1: Manuel PNG Oluşturma (Önerilen)

1. Logo widget'ını kullanarak bir screenshot alın veya
2. Logo widget'ını kullanarak bir PNG oluşturun

### Adımlar:

1. **Logo widget'ını kullanarak PNG oluşturun:**
   - Logo widget'ı zaten `lib/widgets/logo.dart` dosyasında
   - Bu widget'ı kullanarak 1024x1024 boyutunda bir PNG oluşturmanız gerekiyor

2. **PNG'yi kaydedin:**
   ```bash
   # assets/icon/ klasörüne icon.png olarak kaydedin
   # Boyut: 1024x1024 px
   # Arka plan: #0a0a0f (koyu)
   # Logo: "dahi's" metni gradient ile
   ```

3. **flutter_launcher_icons çalıştırın:**
   ```bash
   cd dahis-mobile
   flutter pub get
   flutter pub run flutter_launcher_icons
   ```

## Yöntem 2: Online Tool Kullanma

1. Logo widget'ının görselini oluşturun (screenshot veya design tool)
2. 1024x1024 px PNG olarak kaydedin
3. `assets/icon/icon.png` olarak kaydedin
4. `flutter pub run flutter_launcher_icons` çalıştırın

## Logo Özellikleri

- **Metin:** "dahi's"
- **Font:** Bold (w800)
- **Boyut:** 1024x1024 px için ~320px font size
- **Renkler:** Gradient (#667eea → #764ba2 → #f093fb)
- **Arka plan:** #0a0a0f (koyu)
- **Letter spacing:** -5px
- **Gölge:** 2 katmanlı

## Hızlı Başlangıç

Eğer logo PNG'sini manuel oluşturmak istemiyorsanız:

1. Logo widget'ını kullanarak bir screenshot alın
2. 1024x1024 px'e resize edin
3. `assets/icon/icon.png` olarak kaydedin
4. `flutter pub run flutter_launcher_icons` çalıştırın

## Not

Logo widget'ı zaten projede mevcut. PNG oluşturmak için:
- Design tool kullanabilirsiniz (Figma, Sketch, etc.)
- Screenshot alabilirsiniz
- Online logo generator kullanabilirsiniz

