/**
 * One'ının bugünkü sözü – Karakter bazlı motivasyon / bilgelik / espri cümleleri
 */

var SOZ_CHARACTERS = {
  puls: { id: 'puls', name: 'Puls', color: '#ff4444', image: 'kirmizi.png' },
  zest: { id: 'zest', name: 'Zest', color: '#ff8844', image: 'turuncu.png' },
  lumo: { id: 'lumo', name: 'Lumo', color: '#ffdd44', image: 'sari.png' },
  vigo: { id: 'vigo', name: 'Vigo', color: '#44dd88', image: 'yesil.png' },
  aura: { id: 'aura', name: 'Aura', color: '#4488ff', image: 'mavi.png' },
};

var SOZ_QUOTES = {
  puls: [
    'Bugün karar ver, yarın koş.',
    'Liderlik cesaret ister; cesaret harekete geçmektir.',
    'Durabilirsin ama geri adım atma.',
    'Tutku olmadan zafer yarım kalır.',
    'İlk adımı atan kazanır.',
    'Ekip seninle güçlü; sen ekiple güçlüsün.',
  ],
  zest: [
    'Hayat bir macera; evde oturma, çık!',
    'Enerji bulaşıcıdır; etrafa yay.',
    'En iyi plan, anında yapılan plandır.',
    'Sıkılma, hareket et!',
    'Arkadaşlarınla bir arada olmak en iyi şarj.',
    'Hız bazen en iyi stratejidir.',
  ],
  lumo: [
    'Fikirler ışık gibi; paylaştıkça çoğalır.',
    'Renkler olmadan dünya soluk kalır.',
    'Yaratıcılık kuralları bazen bozar.',
    'Problem varsa, çözüm de vardır; bul onu.',
    'Neşe en iyi ilaç.',
    'Her gün yeni bir fikir doğar.',
  ],
  vigo: [
    'Doğayı dinle; o her şeyi bilir.',
    'Sabır, en güçlü stratejidir.',
    'Huzur içinde olan, her yere yetişir.',
    'Araştır, öğren, paylaş.',
    'Denge olmadan ilerleme yıkılır.',
    'Bazen durup soluklanmak da ilerlemektir.',
  ],
  aura: [
    'Önce planla, sonra uygula.',
    'Mantık duyguları yönetmeli, silmemeli.',
    'Odaklanan kazanır.',
    'Strateji, tesadüften güçlüdür.',
    'Adım adım her hedefe ulaşılır.',
    'Sakin kafayla en zor bulmaca çözülür.',
  ],
};

function getSozCharacters() { return SOZ_CHARACTERS; }
function getSozQuotes() { return SOZ_QUOTES; }

function getRandomSoz() {
  var ids = Object.keys(SOZ_CHARACTERS);
  var charId = ids[Math.floor(Math.random() * ids.length)];
  var char = SOZ_CHARACTERS[charId];
  var list = SOZ_QUOTES[charId] || [];
  var text = list[Math.floor(Math.random() * list.length)] || '';
  return { character: char, quote: text };
}
