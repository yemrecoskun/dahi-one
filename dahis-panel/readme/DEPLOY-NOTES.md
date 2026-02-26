# Panel Deploy Notları

## ⚠️ Önemli: Backend Deploy Gerekli

Panel'in tam çalışması için backend'deki yeni endpoint'in deploy edilmesi gerekiyor.

## 🔧 Deploy Komutu

```bash
cd /Users/yunusemrecoskun/dahi-one/dahis-be
firebase deploy --only functions:dahisio
```

## 📡 Yeni Endpoint

**GET** `/nfcList?characterId={id}` - Tag listesi için

Bu endpoint deploy edilmeden tag listesi çalışmayacak.

## ✅ Link Özellikleri

### Tag Oluşturma
- ✅ dahiOS Redirect URL gösteriliyor
- ✅ Yönlendirme URL gösteriliyor
- ✅ Kopyala butonları var
- ✅ Test butonları var

### Tag Bilgisi
- ✅ dahiOS Redirect URL gösteriliyor
- ✅ Yönlendirme URL gösteriliyor
- ✅ Kopyala butonları var
- ✅ Test butonları var

### Tag Listesi
- ✅ Her tag için NFC Redirect URL gösteriliyor
- ✅ Her tag için Yönlendirme URL gösteriliyor
- ✅ Kopyala butonları var
- ✅ Test butonları var
- ⚠️ Backend deploy edilene kadar çalışmayacak

## 🐛 Sorun Giderme

### Tag Listesi Çalışmıyor
1. Backend'i deploy edin: `firebase deploy --only functions:dahisio`
2. Browser console'u kontrol edin (F12)
3. Network tab'inde `/nfcList` request'ini kontrol edin

### Linkler Görünmüyor
1. Browser'ı yenileyin (Ctrl+F5 veya Cmd+Shift+R)
2. Console'da JavaScript hatası var mı kontrol edin
3. Tag oluşturma sonrası linkler otomatik görünmeli

