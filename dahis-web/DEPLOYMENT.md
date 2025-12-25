# Deployment Rehberi

## Direkt Dosya Yükleme

Dosyaları direkt file manager'a yükleyecekseniz:

### 1. Gerekli Dosyalar
```
index.html
season.html
styles.css
data.js
script.js
season-script.js
kirmizi.png
turuncu.png
sari.png
yesil.png
mavi.png
```

### 2. Opsiyonel: Basit Koruma

Eğer kodları biraz korumak istiyorsanız:

**Online Obfuscator kullanın:**
1. https://obfuscator.io/ adresine gidin
2. `data.js`, `script.js`, `season-script.js` dosyalarını yükleyin
3. Obfuscate edilmiş dosyaları indirin
4. HTML dosyalarında script src'lerini güncelleyin

**Veya:**
- https://javascript-minifier.com/ - Sadece minify için
- https://www.minifier.org/ - Minify için

### 3. Önemli Notlar

⚠️ **Client-side kodlar tamamen gizlenemez!**
- Tarayıcıda çalışan tüm kod görülebilir
- Minify/obfuscate sadece okunmasını zorlaştırır
- Gerçek koruma için backend API kullanmalısınız

### 4. Yayınlama

1. Tüm dosyaları sunucuya yükleyin
2. `index.html` ana sayfa olmalı
3. URL'lerin doğru çalıştığını test edin

### 5. Test Checklist

- [ ] Ana sayfa açılıyor mu?
- [ ] Karakterler görünüyor mu?
- [ ] Sezonlar listesi çalışıyor mu?
- [ ] Sezon detay sayfası açılıyor mu?
- [ ] Bölümler görüntüleniyor mu?
- [ ] Mağaza butonu çalışıyor mu?
- [ ] Mobil görünüm düzgün mü?

## Alternatif: Build Kullanımı

Eğer build process kullanmak isterseniz:
```bash
npm install
npm run build
```
`dist/` klasöründeki dosyaları yükleyin.

