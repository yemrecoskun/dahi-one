# App Icon Oluşturma

Bu klasöre `icon.png` dosyasını ekleyin.

## Logo Özellikleri

- **Boyut:** 1024x1024 px
- **Format:** PNG
- **Arka plan:** #0a0a0f (koyu)
- **Metin:** "dahi's"
- **Font:** Bold (w800)
- **Font Size:** ~320px
- **Renkler:** Gradient
  - Başlangıç: #667eea (mor-mavi)
  - Orta: #764ba2 (mor)
  - Bitiş: #f093fb (pembe)
- **Letter spacing:** -5px

## Oluşturma Yöntemleri

### Yöntem 1: Design Tool (Figma, Sketch, etc.)
1. 1024x1024 px canvas oluşturun
2. Arka plan: #0a0a0f
3. "dahi's" metnini ekleyin (yukarıdaki özelliklerle)
4. PNG olarak export edin
5. `assets/icon/icon.png` olarak kaydedin

### Yöntem 2: Online Logo Generator
1. Online logo generator kullanın
2. "dahi's" metnini gradient ile oluşturun
3. 1024x1024 px PNG olarak indirin
4. `assets/icon/icon.png` olarak kaydedin

### Yöntem 3: Screenshot
1. Uygulamayı çalıştırın
2. Logo widget'ının screenshot'ını alın
3. 1024x1024 px'e resize edin
4. `assets/icon/icon.png` olarak kaydedin

## App Icon Oluşturma

PNG dosyasını ekledikten sonra:

```bash
cd dahis-mobile
flutter pub run flutter_launcher_icons
```

Bu komut tüm platformlar için app icon'ları oluşturur.

