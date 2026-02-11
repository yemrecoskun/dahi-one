/**
 * Onelar arası uyum – Eş, arkadaş, anlaşır, anlaşamaz ilişkileri
 */

var UYUM_CHARACTERS = {
  puls: { id: 'puls', name: 'Puls', color: '#ff4444', image: 'kirmizi.png' },
  zest: { id: 'zest', name: 'Zest', color: '#ff8844', image: 'turuncu.png' },
  lumo: { id: 'lumo', name: 'Lumo', color: '#ffdd44', image: 'sari.png' },
  vigo: { id: 'vigo', name: 'Vigo', color: '#44dd88', image: 'yesil.png' },
  aura: { id: 'aura', name: 'Aura', color: '#4488ff', image: 'mavi.png' },
};

// Sıralı çiftler (a < b), ilişki tipi ve açıklama (seçilen karakterin diğeriyle uyumu anlatılırken kullanılır)
var UYUM_PAIRS = [
  { a: 'puls', b: 'zest', type: 'arkadas', label: 'Arkadaş',
    aciklama: 'Puls ile Zest ikisi de enerji ve hareket dolu; birlikte maceraya atılır, takımda birbirini motive eder. Liderlik ve heves bir araya gelince sıkı arkadaş olurlar.' },
  { a: 'puls', b: 'lumo', type: 'anlasir', label: 'Anlaşır',
    aciklama: 'Puls karar verir, Lumo fikir üretir; ikisi birbirini tamamlar. Bazen Puls çok hızlı, Lumo çok renkli kalabilir ama ortak hedefte anlaşırlar.' },
  { a: 'puls', b: 'vigo', type: 'es', label: 'Eş uyumu',
    aciklama: 'Puls\'un tutkusu ve Vigo\'nun huzuru birbirini dengeleyen güçlü bir uyum yaratır. Biri hareket, biri sakinlik; birlikte hem ilerleyip hem dinlenebilirler.' },
  { a: 'puls', b: 'aura', type: 'anlasamaz', label: 'Anlaşamaz',
    aciklama: 'Puls anında harekete geçmek ister, Aura önce plan ve strateji arar. Liderlik ve kontrol konusunda çatışabilirler; iletişim ve ödün gerekir.' },
  { a: 'zest', b: 'lumo', type: 'arkadas', label: 'Arkadaş',
    aciklama: 'Zest ile Lumo enerji ve yaratıcılıkta aynı dalga boyunda. Birlikte eğlenir, fikir üretir, projeleri eğlenceye çevirirler; doğal arkadaşlardır.' },
  { a: 'zest', b: 'vigo', type: 'anlasir', label: 'Anlaşır',
    aciklama: 'Zest hareket ister, Vigo sakinliği sever. Farklı tempoda olsalar da birbirine saygı duyarlar; Vigo Zest\'i yavaşlatır, Zest Vigo\'ya hareket katar.' },
  { a: 'zest', b: 'aura', type: 'anlasir', label: 'Anlaşır',
    aciklama: 'Zest spontan ve sosyal, Aura planlı ve sakin. Bazen Zest Aura\'yı sıkabilir veya Aura Zest\'i frenleyebilir ama takımda denge oluştururlar.' },
  { a: 'lumo', b: 'vigo', type: 'arkadas', label: 'Arkadaş',
    aciklama: 'Lumo\'nun yaratıcılığı ve Vigo\'nun doğa sevgisi bir araya gelince güzel projeler çıkar. İkisi de meraklı ve pozitif; güvenli arkadaşlık kurarlar.' },
  { a: 'lumo', b: 'aura', type: 'es', label: 'Eş uyumu',
    aciklama: 'Lumo fikir üretir, Aura strateji kurar; yaratıcılık ve mantık birbirini tamamlar. Birlikte hem hayal kurup hem işi kotarırlar.' },
  { a: 'vigo', b: 'aura', type: 'es', label: 'Eş uyumu',
    aciklama: 'Vigo ile Aura ikisi de sakin ve odaklı. Huzur ve düzen isteği aynı; az konuşup çok anlaşır, derin bir uyum yaşarlar.' },
];

var UYUM_TYPES = {
  es:        { label: 'Eş uyumu',   short: 'Eş',   color: '#e91e63', icon: '💕' },
  arkadas:   { label: 'Arkadaş',    short: 'Ark.', color: '#4caf50', icon: '🤝' },
  anlasir:   { label: 'Anlaşır',    short: 'Anl.', color: '#2196f3', icon: '👍' },
  anlasamaz: { label: 'Anlaşamaz',  short: 'X',    color: '#f44336', icon: '⚡' },
};

function getUyumCharacters() { return UYUM_CHARACTERS; }
function getUyumPairs() { return UYUM_PAIRS; }
function getUyumTypes() { return UYUM_TYPES; }

/** Seçilen karakterin diğer dört karakterle ilişkilerini döndürür (other, type, label, aciklama). */
function getRelationsForCharacter(charId) {
  var list = [];
  UYUM_PAIRS.forEach(function (p) {
    var other = null;
    if (p.a === charId) other = p.b;
    else if (p.b === charId) other = p.a;
    if (other)
      list.push({ other: other, type: p.type, label: p.label, aciklama: p.aciklama || '' });
  });
  return list;
}
