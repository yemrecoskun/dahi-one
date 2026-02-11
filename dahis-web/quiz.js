/**
 * Hangi One sensin? – Soru-cevap ile kişiye uygun One karakterini belirleme
 */

const QUIZ_CHARACTERS = {
  puls: {
    id: 'puls',
    name: 'Puls',
    color: '#ff4444',
    image: 'kirmizi.png',
    description: 'Cesur, hızlı karar veren ve liderlik ruhuna sahip tutkulu deha. Kararlı ve motive edici.',
    traits: ['Lider', 'Cesur', 'Tutkulu'],
  },
  zest: {
    id: 'zest',
    name: 'Zest',
    color: '#ff8844',
    image: 'turuncu.png',
    description: 'Hiperaktif, sosyal ve macera peşinde koşan enerji küpü. Maceracı ve hevesli.',
    traits: ['Enerjik', 'Maceracı', 'Sosyal'],
  },
  lumo: {
    id: 'lumo',
    name: 'Lumo',
    color: '#ffdd44',
    image: 'sari.png',
    description: 'Fikirleri ışık saçan, her zaman neşeli ve yaratıcı zeka. Enerjik ve problem çözücü.',
    traits: ['Yaratıcı', 'Neşeli', 'Fikir üretici'],
  },
  vigo: {
    id: 'vigo',
    name: 'Vigo',
    color: '#44dd88',
    image: 'yesil.png',
    description: 'Doğayı seven, huzurlu ve sürdürülebilir enerji dehası. Bilge ve araştırmacı.',
    traits: ['Bilge', 'Huzurlu', 'Araştırmacı'],
  },
  aura: {
    id: 'aura',
    name: 'Aura',
    color: '#4488ff',
    image: 'mavi.png',
    description: 'Odaklanmış, sakin ve stratejik düşünen teknoloji uzmanı. Mantıklı ve planlayıcı.',
    traits: ['Stratejik', 'Sakin', 'Planlayıcı'],
  },
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: 'Hafta sonu planın ne olsun?',
    options: [
      { text: 'Liderlik atölyesi veya bir yarışmaya katılmak', character: 'puls' },
      { text: 'Arkadaşlarla macera, spor veya parti', character: 'zest' },
      { text: 'Sanat, müzik veya yaratıcı bir proje', character: 'lumo' },
      { text: 'Doğa yürüyüşü, kitap veya sessiz bir ortam', character: 'vigo' },
      { text: 'Evde bir proje veya teknik bir işe odaklanmak', character: 'aura' },
    ],
  },
  {
    id: 2,
    text: 'Bir sorun çıkınca ilk tepkin ne olur?',
    options: [
      { text: 'Hemen karar verip harekete geçerim', character: 'puls' },
      { text: 'Deneyerek, deneyimleyerek öğrenirim', character: 'zest' },
      { text: 'Farklı fikirler ve çözümler üretirim', character: 'lumo' },
      { text: 'Araştırır, analiz ederim', character: 'vigo' },
      { text: 'Plan yapıp adım adım çözerim', character: 'aura' },
    ],
  },
  {
    id: 3,
    text: 'Grup projesinde genelde hangi rolü üstlenirsin?',
    options: [
      { text: 'Lider – yön veren', character: 'puls' },
      { text: 'Enerji veren, motive eden', character: 'zest' },
      { text: 'Fikir üreten, yaratıcı beyin', character: 'lumo' },
      { text: 'Uzlaştıran, denge kuran', character: 'vigo' },
      { text: 'Organize eden, strateji kuran', character: 'aura' },
    ],
  },
  {
    id: 4,
    text: 'En çok nerede enerji toplarsın?',
    options: [
      { text: 'Mücadele ve başarı anlarında', character: 'puls' },
      { text: 'Parti, sosyal ortam ve kalabalıkta', character: 'zest' },
      { text: 'Yaratıcı iş yaparken', character: 'lumo' },
      { text: 'Doğada veya sessizlikte', character: 'vigo' },
      { text: 'Odaklanmış, tek bir işe gömülürken', character: 'aura' },
    ],
  },
  {
    id: 5,
    text: 'Seni en iyi hangisi tanımlar?',
    options: [
      { text: 'Cesur', character: 'puls' },
      { text: 'Eğlenceli', character: 'zest' },
      { text: 'Yaratıcı', character: 'lumo' },
      { text: 'Huzurlu', character: 'vigo' },
      { text: 'Mantıklı', character: 'aura' },
    ],
  },
  {
    id: 6,
    text: 'Harmonya\'da sen olsaydın ritim kristalini nasıl arardın?',
    options: [
      { text: 'Ekibi toplayıp planı ben yönetirdim', character: 'puls' },
      { text: 'Önce en tehlikeli yere atılır, keşfederdim', character: 'zest' },
      { text: 'Renkleri ve ipuçlarını birleştirip bulurdum', character: 'lumo' },
      { text: 'Doğayı dinleyip onun rehberliğinde ilerlerdim', character: 'vigo' },
      { text: 'Harita çıkarıp adım adım strateji uygulardım', character: 'aura' },
    ],
  },
  {
    id: 7,
    text: 'Toplantıda veya derste genelde nasıl davranırsın?',
    options: [
      { text: 'Söz alır, yön veririm', character: 'puls' },
      { text: 'Araya eğlenceli yorumlar sıkıştırırım', character: 'zest' },
      { text: 'Farklı, yaratıcı fikirler atarım', character: 'lumo' },
      { text: 'Dinler, sonra özetlerim', character: 'vigo' },
      { text: 'Not alır, madde madde takip ederim', character: 'aura' },
    ],
  },
  {
    id: 8,
    text: 'Tatil tercihin hangisine daha yakın?',
    options: [
      { text: 'Rekabetçi spor veya zorlu bir hedef', character: 'puls' },
      { text: 'Parti, adrenalin, kalabalık festivaller', character: 'zest' },
      { text: 'Sanat, müzik, atölye ve kültür turları', character: 'lumo' },
      { text: 'Doğa, kamp, sessiz bir köşe', character: 'vigo' },
      { text: 'Planlı şehir turu veya tek temalı bir gezi', character: 'aura' },
    ],
  },
  {
    id: 9,
    text: 'Bir hedefe ulaşırken nasıl ilerlersin?',
    options: [
      { text: 'Direkt harekete geçer, engelleri aşarım', character: 'puls' },
      { text: 'Eğlenerek, deneyerek ilerlerim', character: 'zest' },
      { text: 'Yaratıcı yollar ve alternatifler denerim', character: 'lumo' },
      { text: 'Sabırla, adım adım', character: 'vigo' },
      { text: 'Plan yapar, checklist\'e göre ilerlerim', character: 'aura' },
    ],
  },
  {
    id: 10,
    text: 'Arkadaşların seni en çok nasıl tarif eder?',
    options: [
      { text: 'Lider ruhlu, kararlı', character: 'puls' },
      { text: 'Eğlenceli, yerinde duramayan', character: 'zest' },
      { text: 'Yaratıcı, fikir dolu', character: 'lumo' },
      { text: 'Sakin, güvenilir', character: 'vigo' },
      { text: 'Mantıklı, düzenli', character: 'aura' },
    ],
  },
  {
    id: 11,
    text: 'Stres altında ne yaparsın?',
    options: [
      { text: 'Mücadeleye girer, sorunu çözmeye odaklanırım', character: 'puls' },
      { text: 'Hareket ederim, spor veya dışarı çıkarım', character: 'zest' },
      { text: 'Üretken olurum, bir şeyler üretir dağılırım', character: 'lumo' },
      { text: 'Doğaya veya sessiz bir yere çekilirim', character: 'vigo' },
      { text: 'Liste yapar, plana göre ilerlerim', character: 'aura' },
    ],
  },
  {
    id: 12,
    text: 'Yeni bir şey öğrenirken nasıl öğrenirsin?',
    options: [
      { text: 'Hemen uygulayarak, yaparak', character: 'puls' },
      { text: 'Deneyerek, yanılarak', character: 'zest' },
      { text: 'Görsel, renkli ve yaratıcı materyallerle', character: 'lumo' },
      { text: 'Araştırarak, derinlemesine', character: 'vigo' },
      { text: 'Mantık sırasına göre, adım adım', character: 'aura' },
    ],
  },
];

function getQuizCharacters() {
  return QUIZ_CHARACTERS;
}

function getQuizQuestions() {
  return QUIZ_QUESTIONS;
}

function computeQuizResult(answers) {
  const scores = { puls: 0, zest: 0, lumo: 0, vigo: 0, aura: 0 };
  answers.forEach(function (character) {
    if (scores.hasOwnProperty(character)) scores[character] += 1;
  });
  let maxScore = 0;
  let resultId = 'puls';
  Object.keys(scores).forEach(function (id) {
    if (scores[id] > maxScore) {
      maxScore = scores[id];
      resultId = id;
    }
  });
  return resultId;
}
