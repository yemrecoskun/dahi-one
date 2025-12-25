#!/bin/bash

# GitHub Repository Push Script
# Kullanım: ./PUSH-TO-GITHUB.sh

echo "🚀 GitHub'a push etmek için hazırlık..."

# GitHub repo URL'ini sor
read -p "GitHub repository URL'inizi girin (örn: https://github.com/kullanici/dahi-one.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "❌ Repository URL gerekli!"
  exit 1
fi

# Remote ekle (eğer yoksa)
if git remote get-url origin >/dev/null 2>&1; then
  echo "⚠️  Origin remote zaten var. Güncelleniyor..."
  git remote set-url origin "$REPO_URL"
else
  echo "➕ Origin remote ekleniyor..."
  git remote add origin "$REPO_URL"
fi

# Branch'i main olarak ayarla
git branch -M main

# Push et
echo "📤 GitHub'a push ediliyor..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo "✅ Başarıyla push edildi!"
  echo "🌐 Repository: $REPO_URL"
else
  echo "❌ Push başarısız oldu. Lütfen kontrol edin."
  exit 1
fi

