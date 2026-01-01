# Firestore Users Collection Yapısı

## 📁 Collection: `users`

### Document ID: `{userId}` (Firebase Auth UID)

```json
{
  "email": "user@example.com",
  "name": "Kullanıcı Adı",
  "createdAt": "2024-01-01T00:00:00Z",
  "devices": [
    "dahios-id-1",
    "dahios-id-2",
    "dahios-id-3"
  ]
}
```

## 📋 Field Açıklamaları

### `email` (string, zorunlu)
- **Açıklama**: Kullanıcının e-posta adresi
- **Kaynak**: Firebase Auth'dan alınır

### `name` (string, zorunlu)
- **Açıklama**: Kullanıcının adı soyadı
- **Kaynak**: Kayıt sırasında kullanıcıdan alınır

### `createdAt` (timestamp, zorunlu)
- **Açıklama**: Hesap oluşturulma tarihi
- **Format**: Firestore Timestamp

### `devices` (array, zorunlu)
- **Açıklama**: Kullanıcının sahip olduğu dahiOS tag ID'leri
- **Format**: `["dahios-id-1", "dahios-id-2", ...]`
- **Varsayılan**: `[]` (boş array)

## 🔗 İlişki: `users` ↔ `dahios_tags`

- `users/{userId}/devices` array'inde `dahios_tags/{dahiosId}` referansları tutulur
- Kullanıcı cihazlarını görüntülerken, her device ID için `dahios_tags` collection'ından detay bilgisi çekilir

## 🔒 Firestore Rules

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId;
}
```

**Açıklama:**
- Kullanıcı sadece kendi verilerini okuyabilir/yazabilir
- Yeni kullanıcı kaydı sadece kendi UID'si ile oluşturulabilir

## 📝 Kullanım Senaryoları

### Senaryo 1: Kullanıcı Kaydı

```javascript
// AuthService.signUpWithEmail() çağrıldığında otomatik oluşturulur
{
  "email": "user@example.com",
  "name": "Ahmet Yılmaz",
  "createdAt": FieldValue.serverTimestamp(),
  "devices": []
}
```

### Senaryo 2: Cihaz Ekleme (Satın Alma Sonrası)

```javascript
// AuthService.addDevice(dahiosId) çağrıldığında
users/{userId}.devices array'ine dahiosId eklenir
```

### Senaryo 3: Cihazları Görüntüleme

```javascript
// AuthService.getUserDevices() çağrıldığında
1. users/{userId}.devices array'i okunur
2. Her device ID için dahios_tags/{dahiosId} okunur
3. Birleştirilmiş veri döndürülür
```

## 🛒 Satın Alma Entegrasyonu

Mağazadan satın alma sonrası cihaz ekleme:

```dart
// Satın alma başarılı olduğunda
await authService.addDevice(dahiosId);
```

**Not:** Satın alma işlemi mağaza tarafında yapılır, Flutter uygulaması sadece cihaz ekleme işlemini yapar.

## 📊 Örnek Veri

```
Collection: users
Document ID: abc123xyz (Firebase Auth UID)

Fields:
- email: "ahmet@example.com"
- name: "Ahmet Yılmaz"
- createdAt: Timestamp(2024-01-01 00:00:00)
- devices: ["dahios-550e8400-e29b-41d4-a716-446655440000", "dahios-660e8400-e29b-41d4-a716-446655440001"]
```

## 🔄 Veri Akışı

1. **Kayıt**: `signUpWithEmail()` → `users/{uid}` oluşturulur
2. **Satın Alma**: Mağaza → `addDevice(dahiosId)` → `users/{uid}.devices` güncellenir
3. **Görüntüleme**: `getUserDevices()` → `users/{uid}.devices` + `dahios_tags/{id}` birleştirilir

