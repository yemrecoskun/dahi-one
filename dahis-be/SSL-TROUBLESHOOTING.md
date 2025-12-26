# 🔒 SSL Sertifikası Sorun Giderme

## 🔍 SSL Durumunu Kontrol Et

### 1. Firebase Console'dan Kontrol

1. Firebase Console'a gidin: https://console.firebase.google.com/project/dahisio/hosting
2. "Custom domains" sekmesine gidin
3. `os.dahis.io` domain'inin durumunu kontrol edin

**Olası Durumlar:**
- ✅ **Active** - SSL aktif, çalışıyor
- ⏳ **Pending / Minting certificate** - SSL oluşturuluyor (5 dakika - 24 saat arası sürebilir, genelde 1-2 saat)
- ❌ **Failed** - SSL oluşturulamadı (DNS sorunu olabilir)
- ⚠️ **Pending verification** - DNS doğrulaması bekleniyor

### 2. DNS Kayıtlarını Kontrol Et

Terminal'de kontrol edin:

```bash
dig os.dahis.io
```

veya

```bash
nslookup os.dahis.io
```

**Beklenen Sonuç:**
- CNAME kaydı `dahisio.web.app` veya `dahisio.firebaseapp.com` olmalı
- VEYA A kaydı Firebase'in verdiği IP adreslerini göstermeli

## 🐛 Yaygın Sorunlar ve Çözümler

### Sorun 1: DNS Kayıtları Yanlış

**Belirtiler:**
- SSL "Pending verification" durumunda kalıyor
- Firebase Console'da "DNS verification failed" hatası

**Çözüm:**
1. GoDaddy DNS yönetim panelini açın
2. Firebase'in verdiği DNS kayıtlarını kontrol edin
3. Kayıtları silip yeniden ekleyin
4. 5-10 dakika bekleyin
5. Firebase Console'da "Verify" butonuna tıklayın

### Sorun 2: DNS Yayılımı Bekleniyor

**Belirtiler:**
- DNS kayıtları doğru görünüyor ama SSL oluşmuyor

**Çözüm:**
- DNS değişikliklerinin yayılması 24-48 saat sürebilir
- `dig os.dahis.io` ile DNS kayıtlarını kontrol edin
- Eğer kayıtlar doğruysa, Firebase'in SSL oluşturmasını bekleyin

### Sorun 3: CNAME vs A Kaydı Karışıklığı

**Önerilen:** CNAME kaydı kullanın

**GoDaddy'de:**
```
Type: CNAME
Name: os
Value: dahisio.web.app
TTL: 600
```

**Eğer A kaydı kullanıyorsanız:**
- Firebase Console'dan verilen IP adreslerini kullanın
- Genellikle 2-4 IP adresi verilir, hepsini ekleyin

### Sorun 4: SSL Sertifikası Oluşturulamıyor

**Belirtiler:**
- SSL "Failed" durumunda

**Çözüm:**
1. Firebase Console'da domain'i silin
2. DNS kayıtlarını kontrol edin ve düzeltin
3. Domain'i yeniden ekleyin
4. SSL oluşturulmasını bekleyin (5-10 dakika)

## 🔧 Manuel SSL Kontrolü

### Terminal'den Test

```bash
# SSL sertifikasını kontrol et
openssl s_client -connect os.dahis.io:443 -servername os.dahis.io

# veya curl ile
curl -I https://os.dahis.io
```

### Browser'dan Test

1. `https://os.dahis.io` adresini açın
2. Browser'da kilit ikonuna tıklayın
3. "Certificate" veya "Sertifika" bilgilerini kontrol edin
4. Let's Encrypt sertifikası görünmeli

## ⚡ Hızlı Çözüm Adımları

1. **DNS Kontrolü:**
   ```bash
   dig os.dahis.io
   ```

2. **Firebase Console Kontrolü:**
   - Hosting → Custom domains → `os.dahis.io` durumunu kontrol et

3. **Eğer "Pending verification":**
   - GoDaddy'de DNS kayıtlarını kontrol et
   - Firebase'in verdiği kayıtları kullan
   - 5-10 dakika bekle
   - Firebase Console'da "Verify" butonuna tıkla

4. **Eğer "Failed":**
   - Domain'i sil
   - DNS kayıtlarını düzelt
   - Domain'i yeniden ekle

5. **Eğer "Minting certificate" veya "Pending" (uzun süre):**
   - **NORMAL DURUM** - SSL oluşturulması 5 dakika - 24 saat arası sürebilir
   - Genelde 1-2 saat içinde tamamlanır
   - Firebase Console'da durumu kontrol edebilirsiniz
   - Beklemeye devam edin, otomatik olarak tamamlanacak
   - Bu süreçte hiçbir şey yapmanıza gerek yok

## 📞 Firebase Support

Eğer sorun devam ederse:
1. Firebase Console → Support
2. Veya: https://firebase.google.com/support

## ✅ SSL Aktif Olduğunda

SSL aktif olduğunda:
- `https://os.dahis.io` çalışmalı
- Browser'da yeşil kilit ikonu görünmeli
- Redirect'ler çalışmalı

Test:
```bash
curl -I https://os.dahis.io/test-tag-id
```

Response'da `302` redirect kodu görünmeli.

