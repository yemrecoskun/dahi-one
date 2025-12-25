# URL Routing - Karakter Detay Sayfaları

## 📋 Özet

Web sitesi artık `/character/{characterId}` formatındaki URL'leri destekliyor. NFC tag'lerden gelen yönlendirmeler doğrudan karakter detay modalını açacak.

## 🔗 Desteklenen URL Formatları

### 1. Clean URL (Önerilen)
```
https://dahis.io/character/puls
https://dahis.io/character/zest
https://dahis.io/character/lumo
https://dahis.io/character/vigo
https://dahis.io/character/aura
```

### 2. Query Parameter (Alternatif)
```
https://dahis.io/index.html?character=puls
https://dahis.io/?character=zest
```

## ⚙️ Nasıl Çalışıyor?

1. **Sayfa Yüklendiğinde:**
   - URL kontrol edilir
   - Eğer `/character/{id}` formatında ise, karakter modalı otomatik açılır
   - Karakterler bölümüne scroll yapılır

2. **Modal Açıldığında:**
   - URL güncellenir (sayfa yenilenmeden)
   - Browser history'ye eklenir

3. **Modal Kapatıldığında:**
   - URL temizlenir
   - Ana sayfaya dönülür

## 🚀 Server Yapılandırması

### Apache (.htaccess)
`.htaccess` dosyası projeye eklendi. Apache sunucularda otomatik çalışır.

### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~ ^/character/([^/]+)$ {
    rewrite ^/character/(.*)$ /index.html?character=$1 last;
}
```

### Netlify
`netlify.toml` dosyası oluşturun:
```toml
[[redirects]]
  from = "/character/*"
  to = "/index.html?character=:splat"
  status = 200
```

### Vercel
`vercel.json` dosyası oluşturun:
```json
{
  "rewrites": [
    {
      "source": "/character/:character",
      "destination": "/index.html?character=:character"
    }
  ]
}
```

## 🔄 Backend Entegrasyonu

Backend'deki `nfcRedirect` fonksiyonu zaten doğru URL formatını kullanıyor:
```javascript
redirectUrl = `https://dahis.io/character/${characterId}`;
```

## ✅ Test

1. **Manuel Test:**
   - Tarayıcıda `https://dahis.io/character/puls` açın
   - Modal otomatik açılmalı

2. **NFC Test:**
   - NFC tag okuyun
   - Karakter detay modalı açılmalı

3. **Browser Navigation:**
   - Geri/ileri butonları çalışmalı
   - URL değişmeli ama sayfa yenilenmemeli

## 📝 Notlar

- URL routing client-side (JavaScript) ile yapılıyor
- Server-side routing için `.htaccess` veya benzeri yapılandırma gerekli
- Modal kapatıldığında URL otomatik temizlenir
- Browser history desteği var

