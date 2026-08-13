/**
 * eglence_menu_items koleksiyonunu doldurur/günceller.
 * cd dahis-be && node scripts/push-eglence-menu-to-firestore.js
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('✅ serviceAccountKey.json');
    initialized = true;
  } catch (e) {
    console.error('⚠️', e.message);
  }
}
if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
    console.log('✅ FIREBASE_SERVICE_ACCOUNT');
    initialized = true;
  } catch (e) {
    console.error('⚠️', e.message);
  }
}
if (!initialized) {
  try {
    if (admin.apps.length === 0) admin.initializeApp();
    initialized = true;
  } catch (e) {
    console.error('❌ Firebase Admin yok. dahis-be/serviceAccountKey.json ekleyin.\n');
    process.exit(1);
  }
}

const db = admin.firestore();
function pathToDocId(p) {
  const s = String(p).trim().replace(/^\/+/, '');
  return s.replace(/\//g, '_') || 'item';
}

const ROWS = [
  { sectionKey: 'entertainment', sectionOrder: 0, itemOrder: 0, title: 'Hangi One sensin?', subtitle: 'Soru-cevap ile seni yansıtan One karakterini keşfet.', path: '/quiz', icon: '🎯', enabled: true },
  { sectionKey: 'entertainment', sectionOrder: 0, itemOrder: 1, title: 'Onelar Arası Uyum', subtitle: 'Hangi One hangisiyle eş, arkadaş, anlaşır veya anlaşamaz?', path: '/uyum', icon: '💕', enabled: true },
  { sectionKey: 'entertainment', sectionOrder: 0, itemOrder: 2, title: "One'ının bugünkü sözü", subtitle: 'Rastgele bir One senin için bir cümle seçer.', path: '/soz', icon: '💬', enabled: true },
  { sectionKey: 'card_multi', sectionOrder: 1, itemOrder: 0, title: 'DAHIS: Five Forces', subtitle: '3–5 oyunculu stratejik kart oyunu.', path: '/five-forces', icon: '⚡', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 0, title: 'One Eşleştirme', subtitle: 'Aynı One çiftini bul. Kartları çevir, eşleştir!', path: '/memory', icon: '🃏', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 1, title: 'Noktaları Birleştir', subtitle: 'Noktaları sırayla birleştir, tüm hücreleri doldur.', path: '/number-link', icon: '🔗', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 2, title: 'Dahis Sudoku', subtitle: '4×4 sudoku. Her satır, sütun ve bölgede dört karakter bir kez.', path: '/character-sudoku', icon: '🔢', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 3, title: 'Dahis Takuzu', subtitle: 'İki karakterle doldur. = aynı, X karşıt.', path: '/takuzu', icon: '◐', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 4, title: 'Taç Yerleştir', subtitle: 'Her satır, sütun ve bölgede bir taç.', path: '/crown-puzzle', icon: '♔', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 5, title: 'Dahis Yapboz', subtitle: 'Karakter resmini parçalara böl, kaydırarak tamamla.', path: '/yapboz', icon: '🧩', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 6, title: 'Tek Hat', subtitle: 'Tüm hücrelerden tek çizgide geç.', path: '/one-line', icon: '〰', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 7, title: 'Crystal Merge', subtitle: "Kristalleri birleştir, Dahi's One'a ulaş.", path: '/crystal-merge', icon: '◇', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 8, title: 'Glitch Minesweeper', subtitle: 'Virüslü hücreleri işaretle.', path: '/glitch-sweeper', icon: '⚠', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 9, title: 'Dahis Path', subtitle: 'Blokları kaydırarak karakteri portaline ulaştır.', path: '/dahis-path', icon: '⚡', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 10, title: 'Zamanlanmış Karakter', subtitle: 'Aktif karakteri süre dolmadan doğru hedefe yerleştir.', path: '/zamanlama', icon: '⏰', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 11, title: 'Patches', subtitle: 'Sayılı ipuçlarıyla tabloyu dikdörtgenlere böl.', path: '/patches', icon: '▦', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 12, title: 'One Renk Sıralama', subtitle: 'Renkleri tek renkli tüplerde topla.', path: '/color-sort', icon: '🧪', enabled: true },
  { sectionKey: 'games', sectionOrder: 2, itemOrder: 13, title: 'Renk Kodlama', subtitle: 'Gizli renk sırasını ipuçlarıyla çöz.', path: '/renk-kodlama', icon: '🎨', enabled: true },
];

async function main() {
  const col = db.collection('eglence_menu_items');
  const batch = db.batch();
  for (const row of ROWS) {
    batch.set(col.doc(pathToDocId(row.path)), row, { merge: true });
  }
  await batch.commit();
  console.log(`✅ eglence_menu_items: ${ROWS.length} belge (merge).`);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
