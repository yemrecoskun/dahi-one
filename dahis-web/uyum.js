/**
 * Onelar arası uyum – Eş, arkadaş, anlaşır, anlaşamaz ilişkileri
 */

var UYUM_CHARACTERS = {
  puls: { id: 'puls', name: 'Puls', color: '#ff4444', image: 'kirmizi.png' },
  zest: { id: 'zest', name: 'Zest', color: '#ff8844', image: 'turuncu.png' },
  lumo: { id: 'lumo', name: 'Lumo', color: '#ffdd44', image: 'sari.png' },
  vigo: { id: 'vigo', name: 'Vigo', color: '#44dd88', image: 'yesil.png' },
  aura: { id: 'aura', name: 'Aura', color: '#4488ff', image: 'mavi.png' },
  nox: { id: 'nox', name: 'Nox', color: '#7c8496', image: 'siyah.png' },
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
    aciklama: 'Vigo ile Aura ikisi de sakin ve odaklı. Huzur ve düzen isteği aynı; az konuşup çok anlaşır, derin bir uyum yaşarlar.' },  { a: 'puls', b: 'nox', type: 'anlasamaz', label: 'Anlaşamaz',
    aciklama: 'Puls her şeyi açıkta ve hemen çözmek ister, Nox gölgede kalıp sessizce izlemeyi seçer. Puls kolay güvenmez, Nox da kendini açıklamaz; ama birbirlerinin kalbini duyduklarında aynı şeyi korumaya çalıştıklarını fark ederler.' },
  { a: 'zest', b: 'nox', type: 'anlasir', label: 'Anlaşır',
    aciklama: 'Zest hiç durmaz, Nox durmanın gücünü bilir. Zest\'in hızı ile Nox\'un bir anlık "es"i birleşince en tehlikeli anlarda bile doğru zamanlamayı bulurlar.' },
  { a: 'lumo', b: 'nox', type: 'arkadas', label: 'Arkadaş',
    aciklama: 'Lumo ışık, Nox karanlık; ama ikisi de herkesin göremediğini görür. Nox\'un onu düşen tabeladan kurtardığı geceden beri Lumo, Nox\'un sessizliğine renk katan en yakın dostudur.' },
  { a: 'vigo', b: 'nox', type: 'es', label: 'Eş uyumu',
    aciklama: 'Vigo doğanın sesini, Nox sessizliğin sesini dinler. İkisi de acele etmez, az konuşur ve sabrın değerini bilir; yan yana sessizce oturmaları bile bir sohbet gibidir.' },
  { a: 'aura', b: 'nox', type: 'arkadas', label: 'Arkadaş',
    aciklama: 'Aura, Nox\'un frekansının beş saatin toplamı olduğunu ilk fark eden kişidir. İkisi de sakin, odaklı ve gözlemci; Aura analiz eder, Nox hisseder ve birlikte kusursuz bir gözcü ikilisi olurlar.' },
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

/** Seçilen karakterin diğer karakterlerle ilişkilerini döndürür (other, type, label, aciklama). */
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
