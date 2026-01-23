#!/bin/bash
# Release keystore için SHA-1 ve SHA-256 parmak izlerini almak için script

KEYSTORE_FILE="app/upload-keystore.jks"
KEY_ALIAS="upload"

# key.properties dosyasından şifreleri oku
if [ -f "key.properties" ]; then
    STORE_PASSWORD=$(grep "storePassword=" key.properties | cut -d'=' -f2)
    KEY_PASSWORD=$(grep "keyPassword=" key.properties | cut -d'=' -f2)
    
    if [ -z "$STORE_PASSWORD" ] || [ -z "$KEY_PASSWORD" ]; then
        echo "❌ key.properties dosyasında storePassword veya keyPassword bulunamadı."
        echo "Lütfen key.properties dosyasını kontrol edin."
        exit 1
    fi
    
    echo "🔑 Release keystore parmak izleri alınıyor..."
    echo ""
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$STORE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep -E "(SHA1|SHA256)"
    
    if [ $? -ne 0 ]; then
        echo "❌ Hata: Keystore dosyası bulunamadı veya şifreler yanlış."
        echo "Lütfen key.properties dosyasındaki şifrelerin doğru olduğundan emin olun."
        exit 1
    fi
else
    echo "❌ key.properties dosyası bulunamadı."
    exit 1
fi
