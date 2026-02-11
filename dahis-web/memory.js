/**
 * One hafıza kartları – Karakter eşleştirme oyunu
 */

var MEMORY_CHARS = [
  { id: 'puls', name: 'Puls', image: 'kirmizi.png', color: '#ff4444' },
  { id: 'zest', name: 'Zest', image: 'turuncu.png', color: '#ff8844' },
  { id: 'lumo', name: 'Lumo', image: 'sari.png', color: '#ffdd44' },
  { id: 'vigo', name: 'Vigo', image: 'yesil.png', color: '#44dd88' },
  { id: 'aura', name: 'Aura', image: 'mavi.png', color: '#4488ff' },
];

function getMemoryPairs() {
  var pairs = [];
  MEMORY_CHARS.forEach(function (c) {
    pairs.push({ id: c.id, name: c.name, image: c.image, color: c.color });
    pairs.push({ id: c.id, name: c.name, image: c.image, color: c.color });
  });
  return pairs;
}

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}
