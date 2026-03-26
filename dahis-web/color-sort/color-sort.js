(function () {
  'use strict';

  var CAPACITY = 5;
  var NUM_COLORS = 5;
  var EMPTY_TUBES = 2;

  var CHARS = [
    { id: 0, key: 'puls', name: 'Puls' },
    { id: 1, key: 'zest', name: 'Zest' },
    { id: 2, key: 'lumo', name: 'Lumo' },
    { id: 3, key: 'vigo', name: 'Vigo' },
    { id: 4, key: 'aura', name: 'Aura' }
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

  /** Ball-sort’ta her tüp daima tek renk (veya boş); “karışıklık” renklerin yanlış tüpte olmasıdır. */
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

  /** Hedef tüp indexinde olmayan blok sayısı (0 = kazanılmış düzen). */
  function blocksNotAtHome(state) {
    var bad = 0;
    var ti, t, j, c;
    for (ti = 0; ti < state.length; ti++) {
      t = state[ti];
      for (j = 0; j < t.length; j++) {
        c = t[j];
        if (ti < NUM_COLORS) {
          if (c !== ti) bad++;
        } else {
          bad++;
        }
      }
    }
    return bad;
  }

  /** Kazanç: renk i yalnızca tüp i'de (sıra 0..4), son iki tüp boş — karışık düzen bu hedefe ulaşınca biter */
  function isWon(state) {
    var ti;
    for (ti = 0; ti < NUM_COLORS; ti++) {
      var t = state[ti];
      if (t.length !== CAPACITY) return false;
      for (var j = 0; j < t.length; j++) {
        if (t[j] !== ti) return false;
      }
    }
    for (ti = NUM_COLORS; ti < state.length; ti++) {
      if (state[ti].length !== 0) return false;
    }
    return true;
  }

  function newGame() {
    var tries = 0;
    var minAway = 15;
    do {
      tubes = shuffleFromSolved(220 + Math.floor(Math.random() * 150));
      tries++;
    } while ((isWon(tubes) || blocksNotAtHome(tubes) < minAway) && tries < 50);
    tries = 0;
    while ((isWon(tubes) || blocksNotAtHome(tubes) < minAway) && tries < 12) {
      tubes = shuffleFromSolved(380 + Math.floor(Math.random() * 120));
      tries++;
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
          var blk = document.createElement('div');
          blk.className = 'colorsort-block colorsort-block--' + CHARS[tube[i]].key;
          blk.setAttribute('aria-hidden', 'true');
          slot.appendChild(blk);
          inner.appendChild(slot);
        }
        wrap.appendChild(inner);
        if (idx < NUM_COLORS) {
          var targetStrip = document.createElement('div');
          targetStrip.className = 'colorsort-tube-target colorsort-block--' + CHARS[idx].key;
          targetStrip.setAttribute('aria-hidden', 'true');
          targetStrip.title = CHARS[idx].name;
          wrap.appendChild(targetStrip);
        }
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
