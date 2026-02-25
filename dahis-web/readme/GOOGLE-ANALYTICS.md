# Google Analytics Kurulumu

## Adımlar

### 1. Google Analytics Hesabı Oluştur
1. https://analytics.google.com/ adresine git
2. Google hesabınla giriş yap
3. "Ölçüm Başlat" butonuna tıkla
4. Hesap adı: "dahi's" (veya istediğin isim)
5. Mülk adı: "dahi's Website"
6. Raporlama saat dilimi: Türkiye
7. Para birimi: TRY

### 2. Measurement ID Al
1. "Veri Akışları" → "Web" seçeneğini seç
2. Web sitesi URL'ini gir (örn: https://dahis.io)
3. "Ölçüm Kimliği" görünecek (örn: `G-XXXXXXXXXX`)

### 3. Kodu Güncelle
1. `index.html` dosyasını aç
2. `GA_MEASUREMENT_ID` yerine kendi ID'ni yaz (2 yerde)
3. `season.html` dosyasını aç
4. Aynı şekilde `GA_MEASUREMENT_ID` yerine ID'ni yaz (2 yerde)

**Örnek:**
```html
<!-- Önce -->
gtag('config', 'GA_MEASUREMENT_ID');

<!-- Sonra -->
gtag('config', 'G-XXXXXXXXXX');
```

### 4. İstatistikleri Gör
- https://analytics.google.com/ → Raporlar
- **Gerçek Zamanlı**: Anlık ziyaretçiler
- **Kitle**: Toplam ziyaretçi sayısı
- **Edinme**: Ziyaretçilerin nereden geldiği
- **Davranış**: Hangi sayfalar daha çok ziyaret ediliyor

## Özellikler

✅ **Ücretsiz** - Sınırsız kullanım
✅ **Detaylı Raporlar** - Ziyaretçi sayısı, sayfa görüntüleme, süre, kaynak
✅ **Gerçek Zamanlı** - Anlık ziyaretçi takibi
✅ **Mobil/Desktop Ayrımı** - Cihaz bazlı istatistikler

## Notlar

- Veriler 24-48 saat içinde görünmeye başlar
- Gerçek zamanlı raporlar hemen görünür
- Measurement ID formatı: `G-XXXXXXXXXX`

