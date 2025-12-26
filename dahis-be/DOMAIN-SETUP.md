# 🌐 os.dahis.io Domain Kurulumu

## 📋 Özet

`os.dahis.io` subdomain'i Firebase Hosting üzerinden çalışacak ve tag ID'leri ile redirect yapacak.

## 🔧 GoDaddy DNS Ayarları

### 1. GoDaddy'de DNS Kayıtları

GoDaddy DNS yönetim panelinde şu kaydı ekleyin:

**CNAME Kaydı:**
```
Type: CNAME
Name: os
Value: dahisio.web.app
TTL: 600 (veya otomatik)
```

**Not:** Firebase Hosting custom domain ekledikten sonra Firebase size DNS kayıtlarını verecek.

## 🔥 Firebase Hosting Kurulumu

### 1. Firebase Console'da Custom Domain Ekle

1. Firebase Console'a gidin: https://console.firebase.google.com/project/dahisio/hosting
2. "Add custom domain" butonuna tıklayın
3. `os.dahis.io` yazın
4. Firebase size DNS kayıtlarını verecek
5. GoDaddy'de bu kayıtları ekleyin

### 2. SSL Sertifikası

Firebase otomatik olarak SSL sertifikası oluşturacak (Let's Encrypt). Bu işlem birkaç dakika sürebilir.

**SSL Sorunları İçin:** `SSL-TROUBLESHOOTING.md` dosyasına bakın.

### 3. Deploy

```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be
firebase deploy --only hosting
```

## 🔄 Redirect Yapısı

### Nasıl Çalışıyor?

1. **Kullanıcı NFC'yi okuttuğunda:**
   - NFC tag'de `https://os.dahis.io/{tagId}` URL'si var
   - Örnek: `https://os.dahis.io/550e8400-e29b-41d4-a716-446655440000`

2. **Firebase Hosting:**
   - `os.dahis.io/{tagId}` isteğini alır
   - Redirect kuralı devreye girer
   - `https://us-central1-dahisio.cloudfunctions.net/dahiosRedirect?dahiosId={tagId}` adresine redirect eder

3. **Firebase Function:**
   - Tag ID'yi alır
   - Firestore'dan tag bilgisini getirir
   - Karakter sayfasına yönlendirir

## 📝 Örnek Kullanım

### Tag Oluşturma

```bash
POST https://us-central1-dahisio.cloudfunctions.net/dahiosCreate
{
  "characterId": "puls",
  "redirectType": "character",
  "isActive": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "dahiosId": "550e8400-e29b-41d4-a716-446655440000",
    "characterId": "puls",
    "redirectType": "character"
  }
}
```

### NFC Tag'e Yazılacak URL

```
https://os.dahis.io/550e8400-e29b-41d4-a716-446655440000
```

### Akış

1. Kullanıcı NFC'yi okutur
2. `os.dahis.io/{tagId}` açılır
3. Firebase Hosting redirect yapar → Function'a gider
4. Function tag bilgisini alır
5. `https://dahis.io/?character=puls` adresine yönlendirir

## ✅ Test

1. **Local Test:**
   ```bash
   firebase emulators:start
   ```

2. **Production Test:**
   - Tag oluşturun
   - `os.dahis.io/{tagId}` URL'sini tarayıcıda açın
   - Redirect çalışmalı ve karakter sayfasına yönlendirmeli

## 🐛 Sorun Giderme

### DNS Sorunları
- DNS kayıtlarının yayılması 24-48 saat sürebilir
- `dig os.dahis.io` ile DNS kayıtlarını kontrol edin

### SSL Sertifikası
- Firebase otomatik SSL oluşturur
- Sertifika oluşması birkaç dakika sürebilir

### Redirect Çalışmıyor
- `firebase.json`'daki redirect kurallarını kontrol edin
- Function'ın deploy edildiğinden emin olun
- Firebase Console'da hosting loglarını kontrol edin

