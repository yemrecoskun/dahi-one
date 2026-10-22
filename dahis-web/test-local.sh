#!/bin/bash

# Local Test Server Script
# Web uygulamasını local'de test etmek için

echo "🚀 dahi's One - Local Test Server"
echo "=================================="
echo ""
echo "📁 Klasör: dahis-web"
echo "🌐 URL: http://localhost:8000"
echo ""
echo "Test URL'leri:"
echo "  - Ana sayfa: http://localhost:8000"
echo "  - Puls: http://localhost:8000/?character=puls"
echo "  - Zest: http://localhost:8000/?character=zest"
echo "  - Lumo: http://localhost:8000/?character=lumo"
echo "  - Vigo: http://localhost:8000/?character=vigo"
echo "  - Aura: http://localhost:8000/?character=aura"
echo "  - Nox: http://localhost:8000/?character=nox"
echo ""
echo "Durdurmak için: Ctrl+C"
echo ""

cd "$(dirname "$0")"

# Python kontrolü
if command -v python3 &> /dev/null; then
    echo "✅ Python3 bulundu, server başlatılıyor..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python bulundu, server başlatılıyor..."
    python -m http.server 8000
else
    echo "❌ Python bulunamadı!"
    echo ""
    echo "Alternatif: Node.js http-server kullanın:"
    echo "  npx http-server -p 8000"
    exit 1
fi

