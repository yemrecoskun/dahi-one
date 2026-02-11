# Eğlence Fikirleri – Derin Araştırma Özeti

dahi's One için mevcut eğlenceler: **Hangi One sensin?** (quiz) ve **Onelar Arası Uyum** (karakter seç → ilişkiler). Aşağıda eklenebilecek yeni eğlence türleri, neden işe yaradıkları ve nasıl uyarlanabilecekleri özetlendi.

---

## 1. Quiz / Test türü

| Fikir | Açıklama | Neden işe yarar | Teknik |
|-------|----------|------------------|--------|
| **One bilgi yarışması (Trivia)** | Sezon 1, Harmonya, karakterler, Ritmin Kristali hakkında çoktan seçmeli sorular. Skor + doğru/yanlış feedback. | Trivia oyunları marka bilgisini pekiştirir; "ne kadar biliyorsun?" hissi paylaşımı artırır. | Soru listesi + cevap kontrolü, basit puan. |
| **"Hangi One senin en iyi arkadaşın olurdu?"** | Farklı soru setiyle (arkadaşlık odaklı) yine 5 karakterden birine yönlendirme. | Mevcut quiz’in alternatif versiyonu; tekrar oynanabilir. | Mevcut quiz altyapısı, yeni soru seti. |
| **"Harmonya’da hangi rol senin?"** | Lider, maceracı, stratejist, bilge, yaratıcı gibi roller – sonuç yine One karakterleriyle eşleştirilebilir. | Rol/kişilik odaklı quiz; "Hangi One sensin?" ile çeşitlilik sağlar. | Quiz mantığı aynı, soru ve etiketler farklı. |

**Kaynak:** Fan engagement araştırmaları; interaktif quiz’ler ortalama %40 daha fazla etkileşim ve ~%57 daha uzun sitede kalma süresi sağlıyor.

---

## 2. Üreteç (Generator) türü

| Fikir | Açıklama | Neden işe yarar | Teknik |
|-------|----------|------------------|--------|
| **"One’ının bugünkü sözü"** | Rastgele bir One seçilir + o karakterin tarzında kısa bir cümle (motivasyon, espri, bilgelik). Örn: "Puls: Bugün karar ver, yarın koş." | Paylaşılabilir; her gün/her tıklamada farklı içerik. | Karakter başına cümle listesi veya kısa şablonlar, rastgele seçim. |
| **"Senin One ismin"** | Kullanıcı adı/doğum günü vb. (veya rastgele) ile eğlenceli bir "One tarzı" takma isim üretme. Örn: "Puls-Max", "Zest Işık". | Kişiselleştirilmiş, sosyal paylaşım için uygun. | Basit string birleştirme + karakter teması. |
| **"One ile kartvizit cümlesi"** | Kullanıcı seçtiği One’a göre kısa bir tanıtım cümlesi görür (dahiOS / NFC paylaşımına uygun). | dahiOS kullanımını teşvik eder; "ben Puls’um, kartvizitim bu" hikayesi. | Karakter bazlı şablon cümleler. |

**Kaynak:** "What would X say?", karakter quote generator’lar; marka karakteriyle kişiselleştirilmiş çıktı paylaşımı yüksek etkileşim getiriyor.

---

## 3. Mini oyun türü

| Fikir | Açıklama | Neden işe yarar | Teknik |
|-------|----------|------------------|--------|
| **Ritim kristali (tap game)** | Ekranda beliren ritim noktalarına zamanında tıklama; Harmonya’nın ritmini geri getirme hikayesi. Basit beat + görsel feedback. | Markanın ritim/müzik temasıyla doğrudan uyumlu; "Ritmin Kristali" hikayesiyle bağ kurar. | Basit zamanlama + CSS/JS animasyon; isteğe bağlı ses. |
| **One hafıza kartları (Memory)** | Kapalı kartları aç, aynı One çiftini bul (Puls–Puls, Zest–Zest vb.). Karakter görselleri kullanılır. | Tüm yaş gruplarına uygun; karakterleri görsel olarak pekiştirir. | Klasik memory game: grid, flip, eşleştirme. |
| **"Doğru One’ı seç"** | Bir cümle veya özellik gösterilir (örn. "Hemen harekete geçer"); hangi One’ın söyleyeceği/yaşayacağı seçilir. Süre sınırı olabilir. | Karakter özelliklerini öğretir; bilgi + eğlence. | Çoktan seçmeli tek ekran, doğru/yanlış + skor. |

**Kaynak:** Markalı mini oyun kütüphaneleri (ör. puzzle, memory, tap); tarayıcıda çalışan ritim oyunları (Beats, Magic Tiles tarzı basit versiyonlar).

---

## 4. Paylaşım odaklı

| Fikir | Açıklama | Neden işe yarar | Teknik |
|-------|----------|------------------|--------|
| **Quiz sonucu görseli** | "Ben Puls’um" kartı: karakter görseli + isim + kısa tanım; indirilebilir veya sosyal medya paylaşım linki. | Arkadaşa gönderme ("Sen hangisisin?") ile organik yayılım. | Canvas veya server-side basit görsel; Open Graph meta ile link önizlemesi. |
| **"Ben [One], sen hangisisin?"** | Quiz sonucundan sonra "Arkadaşını davet et" butonu: quiz linki + "Ben Puls çıktım, sen de dene" metni. | Sosyal davranış; mevcut quiz’e eklenebilecek tek buton/link. | Paylaşım URL’i + hazır metin (Web Share API veya kopyala). |

**Kaynak:** Quiz ve karakter testlerinde sonuç paylaşımı dönüşümü ve ulaşımı artırıyor.

---

## 5. İçerik / Keşif (hafif eğlence)

| Fikir | Açıklama | Neden işe yarar | Teknik |
|-------|----------|------------------|--------|
| **"Bu bölümde hangi One?"** | Sezon/bölüm seçimi → o bölümde öne çıkan One + kısa özet. | Sezonlar sayfasıyla entegre; izleme/okuma isteği artar. | Mevcut sezon verisi; tek sayfa veya sezon sayfasına blok. |
| **One’ların bir günü** | Her karakter için "Harmonya’da tipik bir gün" metni (kahvaltı, görev, dinlenme). | Evreni hissettirir; karakterlere duygusal bağ. | Statik kısa metinler; karakter sayfası veya ayrı sayfa. |

---

## Öncelik önerisi (hızlı uygulanabilir)

1. **One’ının bugünkü sözü** – Tek sayfa, rastgele karakter + cümle listesi; paylaşım metni eklenebilir.  
2. **One hafıza kartları** – Tek sayfa, mevcut karakter görselleriyle memory game.  
3. **One bilgi yarışması (Trivia)** – Sezon 1 ve karakterlere dair 10–15 soru; skor + sonuç mesajı.  
4. **Quiz sonucu paylaşımı** – Mevcut quiz’e "Sonucu paylaş" butonu + hazır metin/link.

---

## Teknik not

- Tüm fikirler statik site (dahis-web) ile uyumlu: HTML, CSS, JS; gerekirse `data.js` veya yeni `*.js` dosyaları.  
- Paylaşım görseli için isteğe bağlı: basit canvas export veya backend’de görsel üretimi.  
- Ritim oyunu için ses opsiyonel; önce görsel beat + tap yeterli.

Bu dosya, yeni eğlence eklerken referans olarak kullanılabilir.
