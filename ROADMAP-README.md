---

### 8. Digital Scoring System – `score-game.*`

**Goal**: Web‑only, character‑based scoring system that increases engagement. No physical product dependency.

- **Pages & files**
  - New page: `/score-game` → `score-game.html`
  - Assets: `score-game.css`, `score-game.js`
  - Update global nav (`includes/nav.html`) to add **Score Games** linking to `/score-game`.

- **Quiz‑based scoring**
  - 10‑question personality quiz (bağımsız veya mevcut quiz’e paralel).
  - Her cevap bir veya birden fazla karaktere puan yazar (Puls, Zest, Lumo, Vigo, Aura, gelecekteki karakterler).
  - Sonuçta her karakter için toplam puanı hesapla ve 0–100 aralığına normalleştir.
  - Sonuç metni:
    - **“You are [Character Name] – [Character Title]”**
    - Ayrıntılı skorlar: `Puls 87/100, Zest 65/100…`.

- **Leaderboard (local)**
  - Skorları tamamen client‑side `localStorage`’da tut (`dahisScoreLeaderboard`).
  - Veri modeli: nickname, mainCharacter, totalScore, date.
  - **Top 10** tablosu: rank, nickname, character, score.
  - Skor kaydetmeden önce kullanıcıdan takma ad (nickname) iste.

- **Daily challenge**
  - Günlük mini quiz / senaryo (1–3 soru).
  - Günlük skorlar o günkü koşu için karakter puanlarına eklenir.
  - Her gün için `localStorage`’da tarih bazlı anahtar kullan (`dahisDailyLeaderboard_YYYY-MM-DD`).
  - UI: “Daily Challenge” sekmesi + küçük günlük leaderboard.

- **Progress tracker**
  - Her kullanıcının geçmiş denemelerini `localStorage`’da sakla (`dahisScoreHistory`).
  - Her kayıt: timestamp + karakter skorları.
  - Görselleştirme:
    - karakter başına bar / kart (son skor)
    - isteğe bağlı “best ever” işareti.
  - Basit zaman çizelgesi / sonuç listesi göster.

- **Shareable results**
  - Karakter adı, title ve skorları gösteren bir sonuç kartı UI’si oluştur.
  - **Share** butonu:
    - Varsa `navigator.share` ile native paylaşım.
    - Yoksa X/Twitter, Facebook, WhatsApp için hazır linkler; `/score-game` URL’sini paylaş.

- **Design**
  - Ayrı CSS (`score-game.css`) ile:
    - koyu, minimal, retro‑dijital görünüm (Dahis evreni ile uyumlu),
    - mobil öncelikli responsive layout (kartlar / sekmeler),
    - semantik HTML (quiz, leaderboard, daily challenge, progress için ayrı `<section>`’lar).
  - Mevcut font ve tema öğelerini (Poppins, gradient arka plan) yeniden kullan.

- **Opsiyonel reward sistemi**
  - Basit, client‑side rozet sistemi:
    - Ör. “Strategist Badge” (Puls skoru > 85),
    - “Consistency Badge” (5+ günlük challenge tamamlama).
  - Rozetleri `localStorage`’da sakla ve `score-game.html` içinde “Badges” panelinde göster.

***
