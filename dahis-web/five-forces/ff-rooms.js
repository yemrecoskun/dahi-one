/**
 * Five Forces – Online rooms (Firestore).
 * Odalar: oluştur, odaya katıl, dinle; oyun başlayınca gameState senkron.
 */
(function () {
  var COLLECTION = 'ff_rooms';
  var db = null;
  var unsubscribes = {};

  /** Çevrimiçi kullanılabilir mi? Config (apiKey + projectId) doluysa evet; db init() ile sonra set edilir. */
  function isAvailable() {
    var config = window.FF_FIREBASE_CONFIG;
    return !!(config && config.apiKey && config.projectId);
  }

  function randomCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  function clientId() {
    var key = 'ff_client_id';
    try {
      var id = localStorage.getItem(key);
      if (!id) {
        id = 'c_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now();
        localStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
  }

  function init() {
    if (db) return Promise.resolve();
    var config = window.FF_FIREBASE_CONFIG;
    if (!config || !config.apiKey || !config.projectId) return Promise.reject(new Error('Firebase not configured'));
    if (!window.firebase || !window.firebase.initializeApp) return Promise.reject(new Error('Firebase SDK not loaded'));
    try {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      db = window.firebase.firestore();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /** Create room; returns { roomId, code, hostId }. password optional. */
  function createRoom(hostName, hostCharacterId, password) {
    return init().then(function () {
      var code = randomCode();
      var hostId = clientId();
      var roomData = {
        code: code,
        hostId: hostId,
        players: [{ id: 'p0', name: hostName, characterId: hostCharacterId, clientId: hostId }],
        status: 'waiting',
        gameState: null,
        roomPassword: (password && String(password).trim()) || null,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };
      var ref = db.collection(COLLECTION).doc(code);
      return ref.set(roomData).then(function () {
        return { roomId: code, code: code, hostId: hostId };
      });
    });
  }

  /** List waiting rooms (status === 'waiting'). Returns [{ roomId, code, players, hostName, updatedAt }]. */
  function listRooms() {
    return init().then(function () {
      return db.collection(COLLECTION)
        .where('status', '==', 'waiting')
        .get()
        .then(function (snap) {
          var list = [];
          snap.forEach(function (doc) {
            var d = doc.data();
            var host = (d.players && d.players[0]) ? d.players[0] : null;
            list.push({
              roomId: doc.id,
              code: d.code || doc.id,
              players: d.players || [],
              hostName: host ? host.name : '',
              hasPassword: !!(d.roomPassword),
              updatedAt: d.updatedAt && d.updatedAt.toMillis ? d.updatedAt.toMillis() : 0
            });
          });
          list.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
          return list;
        });
    });
  }

  /** Get room by code (read-only). Returns room data or null. */
  function getRoom(code) {
    return init().then(function () {
      code = String(code).toUpperCase().replace(/\s/g, '');
      if (code.length !== 6) return Promise.resolve(null);
      return db.collection(COLLECTION).doc(code).get().then(function (snap) {
        if (!snap.exists) return null;
        var d = snap.data();
        if (d.status !== 'waiting') return null;
        return { roomId: code, players: d.players || [], hostId: d.hostId, hasPassword: !!(d.roomPassword) };
      });
    });
  }

  /** Join room by code. Returns { roomId, mySlotIndex } or rejects. password required if room has one. */
  function joinRoom(code, playerName, characterId, password) {
    return init().then(function () {
      code = String(code).toUpperCase().replace(/\s/g, '');
      if (code.length !== 6) return Promise.reject(new Error('Invalid code'));
      var ref = db.collection(COLLECTION).doc(code);
      return ref.get().then(function (snap) {
        if (!snap.exists) return Promise.reject(new Error('Room not found'));
        var data = snap.data();
        if (data.status !== 'waiting') return Promise.reject(new Error('Game already started'));
        if (data.roomPassword) {
          if (String(password || '').trim() !== String(data.roomPassword).trim()) {
            return Promise.reject(new Error('Wrong password'));
          }
        }
        var me = clientId();
        if (data.players.some(function (p) { return p.clientId === me; })) {
          var idx = data.players.findIndex(function (p) { return p.clientId === me; });
          return Promise.resolve({ roomId: code, mySlotIndex: idx });
        }
        if (data.players.length >= 5) return Promise.reject(new Error('Room full'));
        var slotIndex = data.players.length;
        var newPlayer = { id: 'p' + slotIndex, name: playerName, characterId: characterId, clientId: me };
        var updated = data.players.slice();
        updated.push(newPlayer);
        return ref.update({
          players: updated,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }).then(function () {
          return { roomId: code, mySlotIndex: slotIndex };
        });
      });
    });
  }

  /** Leave room (remove self from players). */
  function leaveRoom(roomId) {
    if (!db) return Promise.resolve();
    var ref = db.collection(COLLECTION).doc(roomId);
    var me = clientId();
    return ref.get().then(function (snap) {
      if (!snap.exists) return;
      var data = snap.data();
      if (data.status !== 'waiting') return;
      var updated = data.players.filter(function (p) { return p.clientId !== me; });
      if (updated.length === 0) return ref.delete();
      var newHostId = data.hostId === me ? (updated[0] && updated[0].clientId) : data.hostId;
      return ref.update({
        players: updated,
        hostId: newHostId,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  /** Subscribe to room changes. Callback(roomData). Returns unsubscribe function. */
  function subscribeRoom(roomId, callback) {
    if (unsubscribes[roomId]) unsubscribes[roomId]();
    return init().then(function () {
      var ref = db.collection(COLLECTION).doc(roomId);
      var unsub = ref.onSnapshot(function (snap) {
        if (!snap.exists) return callback(null);
        callback(snap.data());
      });
      unsubscribes[roomId] = unsub;
      return unsub;
    });
  }

  /** Host: start game. Writes gameState to room and sets status = 'playing'. */
  function startGame(roomId, fullGameState) {
    return init().then(function () {
      var ref = db.collection(COLLECTION).doc(roomId);
      return ref.update({
        status: 'playing',
        gameState: fullGameState,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  /** During game: update game state (current player writes after their move). */
  function updateGameState(roomId, fullGameState) {
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    var ref = db.collection(COLLECTION).doc(roomId);
    return ref.update({
      gameState: fullGameState,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  window.FFRooms = {
    isAvailable: isAvailable,
    init: init,
    clientId: clientId,
    listRooms: listRooms,
    getRoom: getRoom,
    createRoom: createRoom,
    joinRoom: joinRoom,
    leaveRoom: leaveRoom,
    subscribeRoom: subscribeRoom,
    startGame: startGame,
    updateGameState: updateGameState
  };
})();
