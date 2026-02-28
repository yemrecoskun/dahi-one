/**
 * Five Forces – Firebase config for online rooms.
 * Aynı Firebase projesini (dahis-be ile) kullanıyorsanız Console > Project settings > Your apps > Web app config değerlerini buraya yapıştırın.
 * Boş bırakırsanız sadece yerel (local) oyun çalışır.
 * Firestore kurallarında ff_rooms koleksiyonu için read, write izni gerekir (dahis-be/firestore.rules içinde örnek var).
 */
window.FF_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD4t459f5vh0KgQkMDrTUl0Y4sbavK9Etg",
  authDomain: "dahisio.firebaseapp.com",
  projectId: "dahisio",
  storageBucket: "dahisio.firebasestorage.app",
  messagingSenderId: "412418089622",
  appId: "1:412418089622:web:f45e7901183a2ef78458b7",
  measurementId: "G-6C5VRM32Z9"
};