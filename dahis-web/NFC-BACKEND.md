# NFC Backend Entegrasyonu

## Genel Bakış

Her dahi's One saatinde NFC etiketi bulunuyor. NFC'ye okutulduğunda backend'e istek atılır ve dinamik URL yönlendirmesi yapılır.

## NFC URL Yapısı

### Örnek NFC URL Formatı:
```
https://api.dahis.io/nfc/{nfc-id}
```

veya

```
https://dahis.io/nfc/{nfc-id}
```

## Backend Endpoint Yapısı

### 1. NFC Okutma Endpoint'i

**Endpoint:** `GET /nfc/{nfc-id}`

**Örnek:**
```
GET https://api.dahis.io/nfc/abc123xyz
```

**Response:**
```json
{
  "status": "success",
  "redirect": "https://dahis.io/character/puls",
  "characterId": "puls",
  "type": "character"
}
```

### 2. Karakter Yönlendirme

**Endpoint:** `GET /nfc/{nfc-id}`

**Response Örnekleri:**

#### Karakter Sayfasına Yönlendirme:
```json
{
  "status": "success",
  "redirect": "https://dahis.io/character/puls",
  "characterId": "puls",
  "type": "character"
}
```

#### Mağaza Sayfasına Yönlendirme:
```json
{
  "status": "success",
  "redirect": "https://dahis.shop/one-puls",
  "characterId": "puls",
  "type": "store"
}
```

#### Özel Kampanya Sayfasına Yönlendirme:
```json
{
  "status": "success",
  "redirect": "https://dahis.io/campaign/special",
  "type": "campaign"
}
```

## Backend Veritabanı Yapısı

### NFC Tablosu Örneği:

```sql
CREATE TABLE nfc_tags (
    id VARCHAR(50) PRIMARY KEY,
    nfc_id VARCHAR(100) UNIQUE NOT NULL,
    character_id VARCHAR(50),
    redirect_type ENUM('character', 'store', 'campaign', 'custom'),
    redirect_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Backend API Örnekleri

### Node.js/Express Örneği:

```javascript
app.get('/nfc/:nfcId', async (req, res) => {
    const { nfcId } = req.params;
    
    try {
        // NFC ID'yi veritabanında ara
        const nfcTag = await db.query(
            'SELECT * FROM nfc_tags WHERE nfc_id = ? AND is_active = true',
            [nfcId]
        );
        
        if (!nfcTag || nfcTag.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'NFC tag not found'
            });
        }
        
        const tag = nfcTag[0];
        
        // Yönlendirme URL'ini oluştur
        let redirectUrl;
        
        switch(tag.redirect_type) {
            case 'character':
                redirectUrl = `https://dahis.io/character/${tag.character_id}`;
                break;
            case 'store':
                redirectUrl = `https://dahis.shop/one-${tag.character_id}`;
                break;
            case 'campaign':
                redirectUrl = tag.redirect_url;
                break;
            default:
                redirectUrl = tag.redirect_url;
        }
        
        // İstatistik kaydet (opsiyonel)
        await db.query(
            'INSERT INTO nfc_scans (nfc_id, ip_address, user_agent, scanned_at) VALUES (?, ?, ?, NOW())',
            [nfcId, req.ip, req.get('user-agent')]
        );
        
        // Yönlendirme
        res.redirect(302, redirectUrl);
        
    } catch (error) {
        console.error('NFC redirect error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});
```

### Python/Flask Örneği:

```python
from flask import Flask, redirect, request
import mysql.connector

app = Flask(__name__)

@app.route('/nfc/<nfc_id>')
def nfc_redirect(nfc_id):
    try:
        # Veritabanı bağlantısı
        db = mysql.connector.connect(
            host="localhost",
            user="user",
            password="password",
            database="dahis_db"
        )
        
        cursor = db.cursor()
        cursor.execute(
            "SELECT * FROM nfc_tags WHERE nfc_id = %s AND is_active = 1",
            (nfc_id,)
        )
        
        tag = cursor.fetchone()
        
        if not tag:
            return {"status": "error", "message": "NFC tag not found"}, 404
        
        # Yönlendirme URL'ini oluştur
        redirect_type = tag[3]  # redirect_type
        character_id = tag[2]   # character_id
        
        if redirect_type == 'character':
            redirect_url = f"https://dahis.io/character/{character_id}"
        elif redirect_type == 'store':
            redirect_url = f"https://dahis.shop/one-{character_id}"
        else:
            redirect_url = tag[4]  # redirect_url
        
        # İstatistik kaydet
        cursor.execute(
            "INSERT INTO nfc_scans (nfc_id, ip_address, user_agent) VALUES (%s, %s, %s)",
            (nfc_id, request.remote_addr, request.user_agent.string)
        )
        db.commit()
        
        return redirect(redirect_url, code=302)
        
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500
```

## NFC Etiket Yazma

### NFC Etiketine URL Yazma:

Her NFC etiketine backend URL'i yazılmalı:

```
https://api.dahis.io/nfc/{unique-nfc-id}
```

**Örnek:**
- Puls karakteri için: `https://api.dahis.io/nfc/puls-001`
- Zest karakteri için: `https://api.dahis.io/nfc/zest-001`

## Güvenlik

1. **Rate Limiting**: NFC endpoint'ine rate limiting ekleyin
2. **Validation**: NFC ID formatını doğrulayın
3. **Logging**: Tüm NFC okutmalarını loglayın
4. **Analytics**: Hangi karakterlerin daha çok okutulduğunu takip edin

## İstatistikler

### NFC Scan Tablosu:

```sql
CREATE TABLE nfc_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nfc_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nfc_id) REFERENCES nfc_tags(nfc_id)
);
```

## Test

### Test NFC URL'leri:

```bash
# Puls karakteri
curl https://api.dahis.io/nfc/puls-001

# Zest karakteri
curl https://api.dahis.io/nfc/zest-001

# Mağaza yönlendirmesi
curl https://api.dahis.io/nfc/store-puls-001
```

## Notlar

- NFC etiketlerine backend URL'i yazılmalı
- Backend dinamik yönlendirme yapmalı
- Her karakter için benzersiz NFC ID kullanılmalı
- İstatistikler için tüm okutmalar kaydedilmeli

