# Build Instructions

## Verileri Koruma ve Minify Etme

### 1. Dependencies Yükleme
```bash
npm install
```

### 2. Build (Minify)
```bash
npm run build
```

Bu komut:
- JavaScript dosyalarını minify eder (data.js, script.js, season-script.js)
- CSS'i minify eder
- Tüm dosyaları `dist/` klasörüne kopyalar
- HTML dosyalarını günceller

### 3. Obfuscation (İsteğe Bağlı - Daha Fazla Koruma)
```bash
npm run obfuscate
```

Bu komut JavaScript dosyalarını obfuscate eder (daha zor okunur hale getirir).

### 4. Deployment
`dist/` klasöründeki dosyaları sunucuya yükleyin.

## Notlar

- **Minification**: Kodları küçültür ve okunmasını zorlaştırır
- **Obfuscation**: Daha fazla koruma sağlar ama dosya boyutunu artırır
- **Backend API**: En güvenli yöntem (verileri backend'de saklamak)

## Alternatif: Backend API Kullanımı

Eğer daha güvenli bir çözüm istiyorsanız:
1. Verileri backend'de saklayın (database veya API)
2. Frontend'den API çağrıları yapın
3. Authentication ekleyin

