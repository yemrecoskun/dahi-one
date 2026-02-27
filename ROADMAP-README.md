## Dahis.io Website Roadmap

This roadmap focuses on four goals: **SEO**, **content depth**, **interactivity**, and **expanding the character universe**. The site remains a **static HTML website**.

---

### 1. Characters Hub – `/characters`

- **Goal**: Make `/characters` the main entry point for all Ones.
- **Tasks**:
  - Ensure all characters are listed as cards with:
    - image (with descriptive `alt`)
    - short description
    - link to `/character/[id]`
  - Use semantic HTML:
    - `<h1>` for page title (e.g. “dahi’s One Characters”)
    - `<h2>` for character card titles.
  - Add internal links from this page to:
    - Quiz (`/which-dahis-character-are-you`)
    - List pages (`/top-dahis-characters`, etc.).

---

### 2. Character Page Template – `/character/[id]`

- **Goal**: Each character feels like a mini landing page.
- **Per-character checklist**:
  - **Structure**:
    - `<h1>`: `[Character Name] – [Character Title]`
    - 400–600 word **story** (origin, personality, conflicts, goals).
  - **Personality traits with scores**:
    - Example traits: Leadership, Creativity, Logic, Emotion, Risk-taking.
    - Render as a list or bars (0–100) for quick scanning.
  - **Strengths / Weaknesses**:
    - 3–5 bullet points under each `<h2>` section.
  - **“You might be this character if…”**:
    - 4–6 bullets with relatable situations (humorous, concrete).
  - **Related characters**:
    - At least **3 links** to other character pages (e.g. “If you like Puls, you might also like Zest and Aura”).
  - **SEO**:
    - Unique `<title>` and `<meta name="description">` containing:
      - character name
      - “Dahis character”, “personality”, “traits”.
    - Keep existing JSON-LD `Person` schema, and replicate for all characters.

---

### 3. Personality Quiz – `/which-dahis-character-are-you`

- **Goal**: 10‑question quiz that maps to characters and drives traffic.
- **Tasks**:
  - Keep / refine 10-question flow; ensure:
    - Result maps to `[Character ID]`.
    - Output text: **“You are [Name] – [Title]”** in a prominent `<h2>`.
  - Add **links**:
    - Button: “View your character page” → `/character/[id]`.
    - Link back to `/characters`.
  - Add **share buttons**:
    - Simple static links for X/Twitter, Facebook, WhatsApp using the result URL.
    - Optionally: `navigator.share` if supported (wrapped in feature detection).
  - SEO:
    - `<title>` like “Which Dahis character are you? | Personality Quiz”.
    - `<meta description>` referencing Puls, Zest, Lumo, Vigo, Aura + “personality test”.

---

### 4. SEO List Pages

Pages:
- `/top-dahis-characters`
- `/smartest-dahis-characters`
- `/most-dangerous-dahis-characters`

**Tasks**:
- For each page:
  - `<h1>` describing the list (e.g. “Top 5 dahi’s One characters”).
  - Intro paragraph that:
    - explains the criteria
    - links to `/characters` and relevant `/character/[id]` pages.
  - Each list item:
    - character image + short blurb
    - link to that character’s page.
  - SEO meta:
    - `<title>` and `<meta description>` targeting “top Dahis characters”, “smartest Dahis characters”, etc.

---

### 5. Global Navigation

- **Goal**: Consistent nav across all pages.
- **Menu items** (in `includes/nav.html`):
  - Home → `/`
  - Characters → `/characters`
  - Quiz → `/which-dahis-character-are-you`
  - Top Characters → `/top-dahis-characters`
  - About → `/about.html`
  - Contact → `/contact.html`
- Ensure all HTML pages include the same nav include.

---

### 6. SEO & Semantic HTML

- **Meta titles and descriptions**:
  - Every page should have a unique `<title>` and `<meta name="description">`.
  - Include “dahi’s One”, “Dahis characters”, and page-specific keywords.
- **Headings**:
  - Exactly one `<h1>` per page.
  - Logical `<h2>`, `<h3>` hierarchy for sections (story, traits, lists, etc.).
- **Schema.org**:
  - Character pages: `Person` schema with `name`, `description`, `image`, `url`.
  - Optionally add `BreadcrumbList` for character and list pages.

---

### 7. Internal Linking Strategy

- Character pages:
  - At least 3 links to other characters in each page (story body or “Other characters” section).
  - Links to quiz page: “Not sure if you’re [Character]? Try the quiz.”
- List pages:
  - Link to `/characters` and individual character pages.
- Quiz and home:
  - Link back to `/characters` and to top list pages.

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
