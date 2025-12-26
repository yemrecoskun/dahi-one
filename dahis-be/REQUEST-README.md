# API Request Kılavuzu

dahi's One Backend API'lerine nasıl request atılacağını gösteren kılavuz.

## 📡 API Endpoints

### 1. NFC Redirect (Yönlendirme)

dahiOS tag okutulduğunda karakter sayfasına yönlendirir.

**Endpoint:**
```
GET 
```

veya

```
GET https://us-central1-dahisio.cloudfunctions.net/nfcRedirect?nfcId={nfcId}
```

**Parametreler:**
- `nfcId` (required): dahiOS tag ID'si (örn: `puls-001`)

**Örnek Request:**

```bash
# cURL
curl "https://nfcredirect-6elk3up56q-uc.a.run.app?nfcId=puls-001"

# JavaScript (Fetch)
fetch('https://nfcredirect-6elk3up56q-uc.a.run.app?nfcId=puls-001')
  .then(response => {
    // Redirect otomatik yapılır
    window.location.href = response.url;
  });

# JavaScript (Axios)
axios.get('https://nfcredirect-6elk3up56q-uc.a.run.app', {
  params: { nfcId: 'puls-001' },
  maxRedirects: 0
})
.then(response => {
  window.location.href = response.headers.location;
});
```

**Response:**
- `302 Redirect` → Karakter sayfasına yönlendirir
- `400 Bad Request` → NFC ID eksik
- `404 Not Found` → dahiOS tag bulunamadı
- `403 Forbidden` → dahiOS tag aktif değil
- `500 Internal Server Error` → Sunucu hatası

**Yönlendirme URL'leri:**
- `redirectType: "character"` → `https://dahis.io/character/{characterId}`
- `redirectType: "store"` → `https://dahis.shop/one-{characterId}`
- `redirectType: "campaign"` → `customUrl` veya `https://dahis.io`

---

### 2. dahiOS Info (Bilgi)

dahiOS tag bilgilerini getirir.

**Endpoint:**
```
GET https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId={nfcId}
```

veya

```
GET https://us-central1-dahisio.cloudfunctions.net/nfcInfo?nfcId={nfcId}
```

**Parametreler:**
- `nfcId` (required): dahiOS tag ID'si

**Örnek Request:**

```bash
# cURL
curl "https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=puls-001"

# JavaScript (Fetch)
fetch('https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=puls-001')
  .then(response => response.json())
  .then(data => console.log(data));

# JavaScript (Axios)
axios.get('https://nfcinfo-6elk3up56q-uc.a.run.app', {
  params: { nfcId: 'puls-001' }
})
.then(response => console.log(response.data));
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "nfcId": "puls-001",
    "characterId": "puls",
    "redirectType": "character",
    "isActive": true
  }
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "message": "NFC ID is required"
}
```

**Response (Error - 404):**
```json
{
  "status": "error",
  "message": "dahiOS tag not found"
}
```

---

### 3. dahiOS Stats (İstatistikler)

dahiOS okutma istatistiklerini getirir.

**Endpoint:**
```
GET https://nfcstats-6elk3up56q-uc.a.run.app?characterId={characterId}
```

veya

```
GET https://us-central1-dahisio.cloudfunctions.net/nfcStats?characterId={characterId}
```

**Parametreler:**
- `characterId` (optional): Karakter ID'si (filtreleme için)

**Örnek Request:**

```bash
# Tüm istatistikler
curl "https://nfcstats-6elk3up56q-uc.a.run.app"

# Belirli karakter için
curl "https://nfcstats-6elk3up56q-uc.a.run.app?characterId=puls"

# JavaScript (Fetch)
fetch('https://nfcstats-6elk3up56q-uc.a.run.app?characterId=puls')
  .then(response => response.json())
  .then(data => console.log(data));

# JavaScript (Axios)
axios.get('https://nfcstats-6elk3up56q-uc.a.run.app', {
  params: { characterId: 'puls' }
})
.then(response => console.log(response.data));
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "scan-001",
      "nfcId": "puls-001",
      "characterId": "puls",
      "redirectType": "character",
      "redirectUrl": "https://dahis.io/character/puls",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-12-25T10:30:00Z"
    },
    {
      "id": "scan-002",
      "nfcId": "puls-001",
      "characterId": "puls",
      "redirectType": "character",
      "redirectUrl": "https://dahis.io/character/puls",
      "ipAddress": "192.168.1.2",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-12-25T10:25:00Z"
    }
  ]
}
```

**Not:** En son 100 scan kaydı döner, `timestamp`'e göre sıralı (en yeni önce).

---

### 4. dahiOS Create (Tag Oluştur) - UUID ile

Yeni dahiOS tag oluşturur. Tag ID otomatik olarak UUID olarak oluşturulur.

**Endpoint:**
```
POST https://us-central1-dahisio.cloudfunctions.net/nfcCreate
```

**Request Body:**
```json
{
  "characterId": "puls",
  "redirectType": "character",
  "isActive": true,
  "customUrl": "https://dahis.io/campaign" // Sadece campaign için
}
```

**Parametreler:**
- `characterId` (required): Karakter ID'si (örn: `puls`, `mavi`, `sari`)
- `redirectType` (required): Yönlendirme tipi (`character`, `store`, `campaign`)
- `isActive` (optional): Aktif durumu (default: `true`)
- `customUrl` (optional): Özel URL (sadece `redirectType: "campaign"` için gerekli)

**Örnek Request:**

```bash
# cURL
curl -X POST "https://us-central1-dahisio.cloudfunctions.net/nfcCreate" \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "puls",
    "redirectType": "character",
    "isActive": true
  }'

# JavaScript (Fetch)
fetch('https://us-central1-dahisio.cloudfunctions.net/nfcCreate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    characterId: 'puls',
    redirectType: 'character',
    isActive: true
  })
})
.then(response => response.json())
.then(data => console.log(data));

# JavaScript (Axios)
axios.post('https://us-central1-dahisio.cloudfunctions.net/nfcCreate', {
  characterId: 'puls',
  redirectType: 'character',
  isActive: true
})
.then(response => console.log(response.data));
```

**Response (Success - 201):**
```json
{
  "status": "success",
  "message": "NFC tag created successfully",
  "data": {
    "nfcId": "550e8400-e29b-41d4-a716-446655440000",
    "characterId": "puls",
    "redirectType": "character",
    "isActive": true,
    "customUrl": null
  }
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "message": "characterId is required"
}
```

veya

```json
{
  "status": "error",
  "message": "redirectType must be 'character', 'store', or 'campaign'"
}
```

**Örnek: Campaign Tag Oluşturma**
```json
{
  "characterId": "puls",
  "redirectType": "campaign",
  "customUrl": "https://dahis.io/special-campaign",
  "isActive": true
}
```

**Not:** Oluşturulan `nfcId` UUID formatında olacaktır (örn: `550e8400-e29b-41d4-a716-446655440000`). Bu ID'yi dahiOS tag'inize yazdırmanız gerekecek.

---

## 🔧 Web Uygulamasında Kullanım

### HTML/JavaScript Örneği

```html
<!DOCTYPE html>
<html>
<head>
  <title>NFC Test</title>
</head>
<body>
  <button onclick="testNfcRedirect('puls-001')">NFC Redirect Test</button>
  <button onclick="testNfcInfo('puls-001')">NFC Info Test</button>
  <button onclick="testNfcStats('puls')">NFC Stats Test</button>

  <script>
    // NFC Redirect
    async function testNfcRedirect(nfcId) {
      try {
        const response = await fetch(
          `https://nfcredirect-6elk3up56q-uc.a.run.app?nfcId=${nfcId}`,
          { redirect: 'follow' }
        );
        if (response.redirected) {
          window.location.href = response.url;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // NFC Info
    async function testNfcInfo(nfcId) {
      try {
        const response = await fetch(
          `https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=${nfcId}`
        );
        const data = await response.json();
        console.log('NFC Info:', data);
        alert(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // NFC Stats
    async function testNfcStats(characterId) {
      try {
        const url = characterId
          ? `https://nfcstats-6elk3up56q-uc.a.run.app?characterId=${characterId}`
          : 'https://nfcstats-6elk3up56q-uc.a.run.app';
        const response = await fetch(url);
        const data = await response.json();
        console.log('NFC Stats:', data);
        alert(`Toplam ${data.count} scan kaydı bulundu.`);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  </script>
</body>
</html>
```

---

## 📱 React Native'de Kullanım

```javascript
import axios from 'axios';

// NFC Redirect
const handleNfcRedirect = async (nfcId) => {
  try {
    const response = await axios.get(
      'https://nfcredirect-6elk3up56q-uc.a.run.app',
      { params: { nfcId } }
    );
    // Redirect URL'i response.headers.location'da olabilir
    // veya response.request.responseURL kullanılabilir
    if (response.status === 302 || response.status === 200) {
      // React Navigation ile yönlendirme
      navigation.navigate('Character', { id: nfcId });
    }
  } catch (error) {
    console.error('NFC Redirect Error:', error);
  }
};

// NFC Info
const getNfcInfo = async (nfcId) => {
  try {
    const response = await axios.get(
      'https://nfcinfo-6elk3up56q-uc.a.run.app',
      { params: { nfcId } }
    );
    return response.data;
  } catch (error) {
    console.error('NFC Info Error:', error);
    throw error;
  }
};

// NFC Stats
const getNfcStats = async (characterId = null) => {
  try {
    const params = characterId ? { characterId } : {};
    const response = await axios.get(
      'https://nfcstats-6elk3up56q-uc.a.run.app',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('NFC Stats Error:', error);
    throw error;
  }
};
```

---

## 🔐 CORS

Tüm endpoint'ler CORS destekliyor. Herhangi bir domain'den request atabilirsiniz.

---

## ⚠️ Hata Yönetimi

```javascript
async function safeNfcRequest(nfcId) {
  try {
    const response = await fetch(
      `https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=${nfcId}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message === 'dahiOS tag not found') {
      // dahiOS tag bulunamadı
      console.error('dahiOS tag bulunamadı:', nfcId);
    } else if (error.message === 'NFC ID is required') {
      // NFC ID eksik
      console.error('NFC ID gerekli');
    } else {
      // Diğer hatalar
      console.error('Beklenmeyen hata:', error);
    }
    throw error;
  }
}
```

---

## 📝 dahiOS Tag Oluşturma

dahiOS tag'leri artık UUID ile otomatik oluşturuluyor. `nfcCreate` endpoint'ini kullanarak yeni tag oluşturabilirsiniz.

**Örnek: Puls karakteri için tag oluştur**
```bash
curl -X POST "https://us-central1-dahisio.cloudfunctions.net/nfcCreate" \
  -H "Content-Type: application/json" \
  -d '{"characterId": "puls", "redirectType": "character"}'
```

**Response:**
```json
{
  "status": "success",
  "message": "NFC tag created successfully",
  "data": {
    "nfcId": "550e8400-e29b-41d4-a716-446655440000",
    "characterId": "puls",
    "redirectType": "character",
    "isActive": true
  }
}
```

Bu `nfcId` (UUID) değerini dahiOS tag'inize yazdırmanız gerekecek.

**Not:** Eski manuel tag ID'leri (`puls-001` gibi) hala çalışır, ancak yeni tag'ler UUID formatında oluşturulur.

---

## 🚀 Hızlı Test

```bash
# Terminal'den test
curl "https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=puls-001"

# Browser'dan test
# Adres çubuğuna yazın:
https://nfcinfo-6elk3up56q-uc.a.run.app?nfcId=puls-001
```

---

## 📚 Daha Fazla Bilgi

- Firebase Console: https://console.firebase.google.com/project/dahisio/overview
- Firestore Database: https://console.firebase.google.com/project/dahisio/firestore
- Functions Logs: https://console.firebase.google.com/project/dahisio/functions

