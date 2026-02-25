# GitHub Repository Kurulumu

## 1. GitHub'da Repository Oluştur

1. https://github.com/new adresine gidin
2. Repository adı: `dahi-one` (veya istediğiniz isim)
3. Description: "dahi's One - Harmonya'nın Ritmini Koruyan Kahramanlar"
4. Private veya Public seçin
5. **Initialize this repository with a README** seçeneğini **işaretlemeyin** (zaten README var)
6. "Create repository" tıklayın

## 2. Local Repository'yi GitHub'a Bağla

GitHub'da repo oluşturduktan sonra, aşağıdaki komutları çalıştırın:

```bash
cd /Users/yunusemrecoskun/dahi-one

# GitHub repo URL (kullanıcı: yemrecoskun)
git remote add origin https://github.com/yemrecoskun/dahi-one.git

# Branch'i main olarak ayarla (eğer master ise)
git branch -M main

# GitHub'a push et
git push -u origin main
```

## 3. Alternatif: GitHub CLI ile (Eğer yüklüyse)

```bash
# GitHub CLI yükle (macOS)
brew install gh

# GitHub'a login
gh auth login

# Repo oluştur ve push et
gh repo create dahi-one --private --source=. --remote=origin --push
```

## 4. Manuel Push Komutları

Eğer GitHub CLI yoksa:

```bash
# 1. GitHub'da repo oluşturun (yukarıdaki adımlar)

# 2. Remote ekleyin
git remote add origin https://github.com/yemrecoskun/dahi-one.git

# 3. Push edin
git push -u origin main
```

## ⚠️ Önemli Notlar

- `.firebaserc` dosyası `.gitignore`'da olduğu için commit edilmeyecek (güvenlik için)
- `node_modules/` klasörleri commit edilmeyecek
- Firebase credentials'ları GitHub'a yüklenmeyecek

## 🔐 Güvenlik

Sensitive bilgileri (API keys, credentials) asla commit etmeyin. Eğer yanlışlıkla commit ettiyseniz:

```bash
# Son commit'i düzenle
git commit --amend

# Veya dosyayı .gitignore'a ekleyip:
git rm --cached dosya-adi
git commit -m "Remove sensitive file"
```

