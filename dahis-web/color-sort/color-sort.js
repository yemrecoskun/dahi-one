(function () {
  'use strict';

  var CAPACITY = 5;
  var NUM_COLORS = 5;
  var EMPTY_TUBES = 2;

  var CHARS = [
    { id: 0, key: 'puls', name: 'Puls', img: '/kirmizi.png', color: '#e53935' },
    { id: 1, key: 'zest', name: 'Zest', img: '/turuncu.png', color: '#ff6f00' },
    { id: 2, key: 'lumo', name: 'Lumo', img: '/sari.png', color: '#ffc107' },
    { id: 3, key: 'vigo', name: 'Vigo', img: '/yesil.png', color: '#00c853' },
    { id: 4, key: 'aura', name: 'Aura', img: '/mavi.png', color: '#1e88e5' }
  ];

  var tubes = [];
  var selected = null;
  var moves = 0;
  var history = [];
  var gridEl, movesEl, msgEl, btnUndoEl;

  function cloneTubes() {
    return tubes.map(function (t) { return t.slice(); });
  }

  function solvedState() {
    var out = [];
    for (var c = 0; c < NUM_COLORS; c++) {
      var col = [];
      for (var k = 0; k < CAPACITY; k++) col.push(c);
      out.push(col);
    }
    for (var e = 0; e < EMPTY_TUBES; e++) out.push([]);
    return out;
  }

  function topRunLength(tube) {
    if (tube.length === 0) return 0;
    var top = tube[tube.length - 1];
    var n = 0;
    for (var i = tube.length - 1; i >= 0 && tube[i] === top; i--) n++;
    return n;
  }

  function canMove(from, to, state) {
    var src = state[from];
    var dst = state[to];
    if (!src || !dst || src.length === 0 || from === to) return false;
    var k = topRunLength(src);
    var color = src[src.length - 1];
    if (dst.length === 0) return k <= CAPACITY;
    if (dst[dst.length - 1] !== color) return false;
    return dst.length + k <= CAPACITY;
  }

  function applyMove(from, to, state) {
    var k = topRunLength(state[from]);
    for (var i = 0; i < k; i++) state[to].push(state[from].pop());
  }

  function allValidMoves(state) {
    var movesList = [];
    var n = state.length;
    for (var f = 0; f < n; f++) {
      for (var t = 0; t < n; t++) {
        if (canMove(f, t, state)) movesList.push([f, t]);
      }
    }
    return movesList;
  }

  function validateState(state) {
    var total = 0;
    var counts = [0, 0, 0, 0, 0];
    var ti, t, j, c;
    for (ti = 0; ti < state.length; ti++) {
      t = state[ti];
      if (t.length > CAPACITY) return false;
      total += t.length;
      for (j = 0; j < t.length; j++) {
        c = t[j];
        if (c < 0 || c >= NUM_COLORS) return false;
        counts[c]++;
      }
    }
    if (total !== NUM_COLORS * CAPACITY) return false;
    for (j = 0; j < NUM_COLORS; j++) {
      if (counts[j] !== CAPACITY) return false;
    }
    return true;
  }

  /** Önceden hedef düzene BFS ile doğrulanmış karışık başlangıçlar (tüp içi çok renkli). */
  var FALLBACK_MIXED = [
    '04301|20|41021|32|41213|03424|3',
    '34044|130|21|31304|020|22143|21',
    '41031|42|201|13042|430|20|33241',
    '02102|343|10124|34404|30|2112|3',
    '20410|0011|42|34323|2|3442|0113',
    '20213|131|2444|330|20203|4|0114',
    '00024|4202|021|11143|2|33|34314',
    '1240|33|410|22102|443|04301|321'
  ];

  function parseLevelEncoded(encoded) {
    var segs = encoded.split('|');
    if (segs.length !== NUM_COLORS + EMPTY_TUBES) return null;
    var out = [];
    var si, i, ch, d;
    for (si = 0; si < segs.length; si++) {
      var tube = [];
      for (i = 0; i < segs[si].length; i++) {
        ch = segs[si].charAt(i);
        d = parseInt(ch, 10);
        if (isNaN(d) || d < 0 || d >= NUM_COLORS) return null;
        tube.push(d);
      }
      out.push(tube);
    }
    return validateState(out) ? out : null;
  }

  function shuffleFromSolved(count) {
    var state = solvedState();
    var m, list, pick;
    for (m = 0; m < count; m++) {
      list = allValidMoves(state);
      if (list.length === 0) break;
      pick = list[Math.floor(Math.random() * list.length)];
      applyMove(pick[0], pick[1], state);
    }
    return state;
  }

  /**
   * Kazanç: tam 2 boş tüp; diğer 5 tüpün her biri dolu ve tek renk.
   * Hangi rengin hangi sütunda olduğu önemli değil (sabit hizaya zorunluluk yok).
   */
  function isWon(state) {
    var empty = 0;
    var fullMono = 0;
    var ti, t, j, c;
    for (ti = 0; ti < state.length; ti++) {
      t = state[ti];
      if (t.length === 0) {
        empty++;
        continue;
      }
      c = t[0];
      for (j = 1; j < t.length; j++) {
        if (t[j] !== c) return false;
      }
      if (t.length !== CAPACITY) return false;
      fullMono++;
    }
    return empty === EMPTY_TUBES && fullMono === NUM_COLORS;
  }

  function newGame() {
    var st = parseLevelEncoded(FALLBACK_MIXED[Math.floor(Math.random() * FALLBACK_MIXED.length)]);
    if (!st || isWon(st)) st = parseLevelEncoded(FALLBACK_MIXED[0]);
    if (!st || isWon(st)) {
      var guard = 0;
      do {
        tubes = shuffleFromSolved(280 + Math.floor(Math.random() * 140));
        guard++;
      } while (isWon(tubes) && guard < 25);
    } else {
      tubes = st;
    }

    selected = null;
    moves = 0;
    history = [];
    render();
    hideMsg();
  }

  function undo() {
    if (history.length === 0) return;
    tubes = history.pop();
    moves = Math.max(0, moves - 1);
    selected = null;
    render();
  }

  function onTubeClick(index) {
    if (selected === null) {
      if (tubes[index].length === 0) return;
      selected = index;
      render();
      return;
    }
    if (selected === index) {
      selected = null;
      render();
      return;
    }
    if (!canMove(selected, index, tubes)) {
      showMsg('bad', false);
      selected = null;
      render();
      return;
    }
    history.push(cloneTubes());
    if (history.length > 200) history.shift();
    applyMove(selected, index, tubes);
    moves++;
    selected = null;
    render();
    if (isWon(tubes)) showWin();
  }

  function hint() {
    var list = allValidMoves(tubes);
    if (list.length === 0) return;
    var pick = list[Math.floor(Math.random() * list.length)];
    history.push(cloneTubes());
    if (history.length > 200) history.shift();
    applyMove(pick[0], pick[1], tubes);
    moves++;
    selected = null;
    render();
    if (isWon(tubes)) showWin();
    else showMsg('hint', true);
  }

  function showMsg(key, ok) {
    if (!msgEl) return;
    var g = typeof window.getI18n === 'function' ? window.getI18n : function (k) { return k; };
    var map = {
      bad: g('colorsort.msg_bad'),
      hint: g('colorsort.msg_hint'),
      goal: g('colorsort.msg_goal')
    };
    msgEl.textContent = map[key] || '';
    msgEl.className = 'colorsort-msg' + (ok ? ' colorsort-msg--ok' : ' colorsort-msg--err');
    if (ok && key === 'hint') setTimeout(hideMsg, 1600);
  }

  function hideMsg() {
    if (!msgEl) return;
    msgEl.textContent = '';
    msgEl.className = 'colorsort-msg';
  }

  function showWin() {
    var w = document.createElement('div');
    w.className = 'colorsort-win';
    var g = typeof window.getI18n === 'function' ? window.getI18n : function (k) { return k; };
    var winMoves = g('colorsort.win_moves');
    if (winMoves.indexOf('{n}') >= 0) winMoves = winMoves.replace(/\{n\}/g, String(moves));
    w.innerHTML =
      '<div class="colorsort-win-box">' +
      '<h2 data-i18n="colorsort.win_title">' + g('colorsort.win_title') + '</h2>' +
      '<p>' + winMoves + '</p>' +
      '<button type="button" id="colorsortAgain" data-i18n="colorsort.play_again">' + g('colorsort.play_again') + '</button></div>';
    document.body.appendChild(w);
    if (typeof window.applyI18n === 'function') window.applyI18n();
    setTimeout(function () { w.classList.add('is-visible'); }, 30);
    w.querySelector('#colorsortAgain').onclick = function () {
      w.remove();
      newGame();
    };
  }

  function render() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    for (var ti = 0; ti < tubes.length; ti++) {
      (function (idx) {
        var tube = tubes[idx];
        var wrap = document.createElement('button');
        wrap.type = 'button';
        wrap.className = 'colorsort-tube';
        if (selected === idx) wrap.classList.add('colorsort-tube--selected');
        var tubeLbl = typeof window.getI18n === 'function' ? window.getI18n('colorsort.tube_label') : 'Tüp';
        if (tubeLbl === 'colorsort.tube_label') tubeLbl = 'Tüp';
        wrap.setAttribute('aria-label', tubeLbl + ' ' + (idx + 1));
        var inner = document.createElement('div');
        inner.className = 'colorsort-tube-inner';
        var ghostTop = CAPACITY - tube.length;
        for (var g = 0; g < ghostTop; g++) {
          var sl = document.createElement('div');
          sl.className = 'colorsort-slot colorsort-slot--ghost';
          inner.appendChild(sl);
        }
        for (var i = tube.length - 1; i >= 0; i--) {
          var slot = document.createElement('div');
          slot.className = 'colorsort-slot';
          var ch = CHARS[tube[i]];
          var blk = document.createElement('div');
          blk.className = 'colorsort-block';
          blk.setAttribute('data-character', ch.key);
          blk.style.backgroundColor = ch.color;
          var im = document.createElement('img');
          im.className = 'colorsort-block-img';
          im.src = ch.img;
          im.alt = ch.name;
          im.width = 24;
          im.height = 24;
          im.loading = 'lazy';
          im.decoding = 'async';
          blk.appendChild(im);
          slot.appendChild(blk);
          inner.appendChild(slot);
        }
        wrap.appendChild(inner);
        wrap.addEventListener('click', function () { onTubeClick(idx); });
        gridEl.appendChild(wrap);
      })(ti);
    }
    if (movesEl) movesEl.textContent = String(moves);
    if (btnUndoEl) btnUndoEl.disabled = history.length === 0;
  }

  function flashGoal() {
    showMsg('goal', true);
    setTimeout(hideMsg, 2200);
  }

  function run() {
    gridEl = document.getElementById('colorsortGrid');
    movesEl = document.getElementById('colorsortMoves');
    msgEl = document.getElementById('colorsortMsg');
    var btnNew = document.getElementById('btnColorsortNew');
    btnUndoEl = document.getElementById('btnColorsortUndo');
    var btnHint = document.getElementById('btnColorsortHint');
    var btnGoal = document.getElementById('btnColorsortGoal');
    if (!gridEl) return;
    if (btnNew) btnNew.addEventListener('click', newGame);
    if (btnUndoEl) btnUndoEl.addEventListener('click', undo);
    if (btnHint) btnHint.addEventListener('click', hint);
    if (btnGoal) btnGoal.addEventListener('click', flashGoal);
    newGame();
    if (typeof window.applyI18n === 'function') window.applyI18n();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
