# Favicon Kurulumu

## Favicon Dosyası Ekleme

Favicon dosyasını `dahis-web` klasörüne eklemeniz gerekiyor.

### Seçenekler:

1. **Mevcut görsellerden biri:**
   - `kirmizi.png`, `turuncu.png`, `sari.png`, `yesil.png`, `mavi.png` dosyalarından birini `favicon.png` olarak kopyalayın
   - Veya tüm karakterleri içeren bir favicon oluşturun

2. **Özel favicon oluşturma:**
   - Online araçlar: https://favicon.io/ veya https://realfavicongenerator.net/
   - "dahi's" yazısı veya "D" harfi ile favicon oluşturun
   - PNG formatında, 32x32 veya 64x64 piksel boyutunda

3. **Hızlı çözüm:**
   ```bash
   # Mevcut görsellerden birini favicon olarak kullan
   cp kirmizi.png favicon.png
   ```

### Dosya Adı:
- `favicon.png` (veya `favicon.ico`)

### Boyut Önerileri:
- 32x32 piksel (standart)
- 64x64 piksel (yüksek çözünürlük)
- 180x180 piksel (Apple touch icon)

## Notlar

- HTML dosyalarında favicon linki zaten ekli
- Dosyayı `dahis-web` klasörüne eklemeniz yeterli
- Tarayıcı cache'ini temizlemek gerekebilir (Ctrl+F5)

