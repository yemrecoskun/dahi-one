(function () {
  'use strict';
  var ROWS = 5, COLS = 5;
  // Engel: sadece merkez (çözülebilir tek hat için 24 hücre)
  var BLOCKED = [[2, 2]];
  function isBlocked(r, c) {
    return r < 0 || r >= ROWS || c < 0 || c >= COLS || BLOCKED.some(function (b) { return b[0] === r && b[1] === c; });
  }
  function totalCells() {
    var n = 0;
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (!isBlocked(r, c)) n++;
    return n;
  }
  var CHARS = [
    { name: 'Puls', color: '#ff4444' },
    { name: 'Zest', color: '#ff8844' },
    { name: 'Lumo', color: '#ffdd44' },
    { name: 'Vigo', color: '#44dd88' },
    { name: 'Aura', color: '#4488ff' }
  ];
  var path = [], history = [], selectedCharIndex = 0;
  var gridEl = document.getElementById('grid');
  var charBtns = document.getElementById('charBtns');
  var btnUndo = document.getElementById('btnUndo');
  var btnClear = document.getElementById('btnClear');

  function isAdjacent(r1, c1, r2, c2) { return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1; }
  function indexInPath(r, c) { for (var i = 0; i < path.length; i++) if (path[i][0] === r && path[i][1] === c) return i; return -1; }
  function getPathEnd() { return path.length ? path[path.length - 1] : null; }

  function pushHistory() { history.push(path.map(function (p) { return p.slice(); })); }
  function undo() {
    if (history.length === 0) return;
    path = history.pop();
    render();
  }
  function clearPath() { path = []; history = []; render(); }

  function tryAdd(r, c) {
    if (isBlocked(r, c)) return;
    var end = getPathEnd();
    if (path.length === 0) { pushHistory(); path.push([r, c]); render(); checkWin(); return; }
    if (indexInPath(r, c) >= 0) return;
    if (!isAdjacent(end[0], end[1], r, c)) return;
    pushHistory();
    path.push([r, c]);
    render();
    checkWin();
  }

  function checkWin() { if (path.length === totalCells()) showWin(); }
  var winEl = null;
  function showWin() {
    if (winEl) return;
    winEl = document.createElement('div');
    winEl.className = 'oneline-win';
    winEl.innerHTML = '<div class="oneline-win-box"><h2 class="oneline-win-title" data-i18n="oneline.win_title">Tebrikler!</h2><p class="oneline-win-msg" data-i18n="oneline.win_msg">Tüm hücreleri tek çizgide geçtin.</p><button type="button" class="oneline-win-btn" id="onelineWinAgain" data-i18n="oneline.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(winEl);
    setTimeout(function () { winEl.classList.add('is-visible'); }, 100);
    winEl.querySelector('#onelineWinAgain').onclick = function () {
      winEl.classList.remove('is-visible');
      setTimeout(function () { path = []; history = []; render(); if (winEl.parentNode) winEl.parentNode.removeChild(winEl); winEl = null; }, 300);
    };
  }

  function render() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
    gridEl.style.gridTemplateRows = 'repeat(' + ROWS + ', 1fr)';
    var neon = CHARS[selectedCharIndex].color;
    gridEl.style.setProperty('--neon-color', neon);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'oneline-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        if (isBlocked(r, c)) {
          cell.classList.add('oneline-blocked');
          cell.style.pointerEvents = 'none';
        } else {
          if (indexInPath(r, c) >= 0) cell.classList.add('filled');
          if (path.length && path[0][0] === r && path[0][1] === c) cell.classList.add('start');
        }
        cell.style.setProperty('--neon-color', neon);
        gridEl.appendChild(cell);
      }
    }
    btnUndo.disabled = history.length === 0;
  }

  function cellAt(r, c) { return gridEl.querySelector('.oneline-cell[data-r="' + r + '"][data-c="' + c + '"]'); }
  function getCellCoords(el) { if (!el || !el.classList.contains('oneline-cell')) return null; return [parseInt(el.dataset.r, 10), parseInt(el.dataset.c, 10)]; }

  function onPointerDown(e) { e.preventDefault(); var rc = getCellCoords(e.target); if (rc) tryAdd(rc[0], rc[1]); }
  function onPointerMove(e) { e.preventDefault(); var rc = getCellCoords(e.target); if (rc) tryAdd(rc[0], rc[1]); }
  function onPointerUp(e) { e.preventDefault(); }

  gridEl.addEventListener('mousedown', onPointerDown);
  gridEl.addEventListener('mousemove', function (e) { if (e.buttons === 1) onPointerMove(e); });
  gridEl.addEventListener('mouseup', onPointerUp);
  gridEl.addEventListener('mouseleave', onPointerUp);
  gridEl.addEventListener('touchstart', function (e) { onPointerDown(e.changedTouches[0]); }, { passive: false });
  gridEl.addEventListener('touchmove', function (e) {
    var t = e.changedTouches[0];
    var el = document.elementFromPoint(t.clientX, t.clientY);
    var rc = getCellCoords(el);
    if (rc) tryAdd(rc[0], rc[1]);
    e.preventDefault();
  }, { passive: false });
  gridEl.addEventListener('touchend', onPointerUp, { passive: false });

  CHARS.forEach(function (ch, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'oneline-char-btn' + (i === selectedCharIndex ? ' active' : '');
    btn.style.backgroundColor = ch.color;
    btn.title = ch.name;
    btn.onclick = function () { selectedCharIndex = i; document.querySelectorAll('.oneline-char-btn').forEach(function (b, j) { b.classList.toggle('active', j === i); }); render(); };
    charBtns.appendChild(btn);
  });
  btnUndo.addEventListener('click', undo);
  btnClear.addEventListener('click', clearPath);
  render();
})();
