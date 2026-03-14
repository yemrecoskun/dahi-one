# dahi's One – Oyunlar ve Eğlence

Eğlence sayfasındaki tüm oyunlar, quizler ve interaktif içeriklerin kısa açıklaması. Hepsi `/eglence` üzerinden erişilir.

---

## 🎯 Quiz & Keşif

| Sayfa | Açıklama |
|-------|----------|
| **Hangi One sensin?** (`/quiz`) | Soru-cevap ile seni yansıtan One karakterini keşfet. |
| **Onelar Arası Uyum** (`/uyum`) | Hangi One hangisiyle eş, arkadaş, anlaşır veya anlaşamaz? İkilileri keşfet. |
| **One'ının bugünkü sözü** (`/soz`) | Rastgele bir One cümlesi. Yenile, paylaş. |

---

## 🃏 Kart & Hafıza

| Sayfa | Açıklama |
|-------|----------|
| **One hafıza kartları** (`/memory`) | Aynı One çiftini bul. Kartları çevir, eşleştir. |
| **DAHIS: Five Forces** (`/five-forces`) | 3–5 oyunculu stratejik kart oyunu. Karakter seç, puanını yükselt, kazan. Çevrimiçi oda açma, link ile katılma, oda adı desteklenir. |

---

## 🔗 Bulmacalar (Puzzle)

### Noktaları Birleştir (`/number-link`)
- **Izgara:** 5×5, merkezde haç engel.
- **Amaç:** 1’den 12’ye numaralı noktaları sırayla tek bir yolla birleştir; tüm boş hücreleri doldur.
- **Kontroller:** Tıklayarak yol çiz, **Geri Al**, **İpucu**.
- **Dosyalar:** `number-link/index.html`, `number-link.css`, `number-link.js`.

---

### Dahis Sudoku (`/character-sudoku`)
- **Izgara:** 6×6, 2×3 bloklar.
- **Semboller:** Puls, Zest, Lumo, Vigo, Aura, Dahi — logolar veya renkli ışıklı gösterim (site kökündeki PNG’ler).
- **Kural:** Her satır, sütun ve bölgede her karakter tam bir kez.
- **Kontroller:** Hücre seç, tuş takımından karakter seç; **Notlar** (kalem), **İpucu**, **Sil**, **Geri al**.
- **Dosyalar:** `character-sudoku/index.html`, `character-sudoku.css`, `character-sudoku.js`.

---

### Dahis Takuzu (`/takuzu`)
- **Izgara:** 6×6, iki sembol: ● (turuncu daire) ve ☽ (mavi ay).
- **Kurallar:** Her satır/sütunda 3’er adet; en fazla 2 aynı sembol yan yana; **=** aynı, **X** karşıt.
- **Kontroller:** Hücre seç, sembol butonuna bas; **Geri Al**, **İpucu**.
- **Dosyalar:** `takuzu/index.html`, `takuzu.css`, `takuzu.js`.

---

### Taç Yerleştir (`/crown-puzzle`)
- **Izgara:** 8×8, 8 renkli bölge (2×4’lük bloklar).
- **Amaç:** Her satır, sütun ve bölgede tam bir taç (♔); iki taç yan yana veya çapraz temas etmesin.
- **Kontroller:** Bir tık = X (taç yok), iki tık = Taç, üçüncü tık = boş; **Geri al**, **İpucu**.
- **Dosyalar:** `crown-puzzle/index.html`, `crown-puzzle.css`, `crown-puzzle.js`.

---

### Karakter Yapbozu (`/yapboz`)
- **Tür:** Sürgülü yapboz (slide puzzle), 3×3.
- **İçerik:** Karakter görseli (Puls, Zest, Lumo, Vigo, Aura) 9 parçaya bölünür; boş kareye bitişik parçaya tıklayarak kaydırırsın.
- **Amaç:** Parçaları sıraya getirerek resmi tamamla.
- **Kontroller:** Parçaya tıkla (boşa bitişikse kayar), **Geri al**, **Karıştır**. Her oyunda rastgele bir karakter seçilir.
- **Dosyalar:** `yapboz/index.html`, `yapboz.css`, `yapboz.js`.

---

### Tek Hat – One-Line Link (`/one-line`)
- **Izgara:** 5×5.
- **Amaç:** Bir noktadan başla, elini kaldırmadan tüm hücrelerden tek çizgide geç; hiçbir hücreyi boş bırakma ve üzerinden ikinci kez geçme.
- **Görsel:** Seçtiğin karakter renginde (Puls, Zest, Lumo, Vigo, Aura) neon iz.
- **Kontroller:** Tıklayarak veya sürükleyerek yol çiz, **Geri al**, **Temizle**. Başta karakter rengi seç.
- **Dosyalar:** `one-line/index.html`, `one-line.css`, `one-line.js`.

---

### Crystal Merge: 2048 Dahis Edition (`/crystal-merge`)
- **Mekanik:** 2048 tarzı 4×4; sayılar yerine Dahis kristalleri birleşir. Enerji → Lumo → Vigo → Zest → Puls → Aura → Dahi's One (patlama).
- **Kontroller:** Ok tuşları veya kaydırma. İki aynı seviye birleşince bir üst seviye olur; iki Aura → Dahi's One ve kazanma.
- **Dosyalar:** `crystal-merge/index.html`, `crystal-merge.css`, `crystal-merge.js`.

---

### Glitch Minesweeper (`/glitch-sweeper`)
- **Konsept:** Kristal Şehir veri tabanındaki virüslü (glitch) hücreleri tespit et. Klasik mayın tarlası.
- **Mekanik:** Sol tık = hücreyi aç (sayı etraftaki virüs sayısı). Virüse basarsan glitch efekti ve oyun biter. Sağ tık = bayrak (Dahis logosu). Tüm temiz hücreleri açınca kazanırsın; saatin ekranı parlar.
- **Dosyalar:** `glitch-sweeper/index.html`, `glitch-sweeper.css`, `glitch-sweeper.js`.

---

### Dahis Path: Harmonya Labirenti (`/dahis-path`)
- **Tür:** Kaydırmalı bulmaca (sliding puzzle), 4×4.
- **Amaç:** Tek boşluğa bitişik blokları kaydırarak karakteri (⚡) sağ alt köşedeki enerji portaline (◎) ulaştır.
- **Kontroller:** Boşluğa bitişik kareye tıkla (kayar), **Geri al**.
- **Dosyalar:** `dahis-path/index.html`, `dahis-path.css`, `dahis-path.js`.

---

## 📁 Klasör Yapısı

```
dahis-web/
├── eglence.html          # Eğlence ana sayfası (tüm kartlar)
├── OYUNLAR.md            # Bu dosya
├── quiz.html
├── uyum.html
├── soz.html
├── memory.html
├── five-forces/          # Five Forces kart oyunu + çevrimiçi
├── number-link/          # Noktaları birleştir
├── character-sudoku/     # Karakter sudokusu (6x6, logolar)
├── takuzu/               # Karakter takuzu (2 sembol, =/X)
├── crown-puzzle/         # Taç yerleştir (8x8, bölgeler)
├── yapboz/               # Karakter yapbozu (sürgülü 3x3)
├── one-line/             # Tek Hat (neon iz, tüm hücrelerden geç)
├── crystal-merge/        # Crystal Merge (2048 Dahis)
├── glitch-sweeper/       # Glitch Minesweeper (virüs mayın tarlası)
└── dahis-path/           # Dahis Path (kaydırmalı labirent)
```

Çeviriler (TR/EN) `js/translations.js` içinde `eglence.*`, `nl.*`, `cs.*`, `tkz.*`, `crown.*`, `yapboz.*`, `oneline.*`, `crystal.*`, `glitch.*`, `dahispath.*` anahtarlarıyla yönetilir.

---

## 💡 İleride eklenebilecek oyun fikirleri

- **Kelime arama:** Izgara içinde One isimleri / özellikleri gizli; yatay, dikey, çapraz bul.
- **Adam asmaca:** Karakter veya terim tahmin et; harf seç, yanlışta adım adım çizim.
- **Trivia / bilgi yarışması:** One’lar ve Harmonya hakkında çoktan seçmeli sorular, skor.
- **4’e bağla / Tic-tac-toe:** İki kişi; karakter ikonlarıyla tahta üzerinde sırayı tamamla.
- **Basit bir “runner” veya tıklama oyunu:** Karakteri yönlendir, engellerden kaçın veya puan topla (mobil uyumlu, tek tuş).
- **Eşleştirme / hafıza genişletmesi:** Memory’deki gibi ama 3×4 veya 4×4, daha fazla kart; süre veya hamle sayısı hedefi.
