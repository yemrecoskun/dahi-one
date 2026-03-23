(function () {
  'use strict';

  var COLORS = [
    '#7cb87c', '#d4a84b', '#6eb8d4', '#e8945f', '#4a9e9e',
    '#9b8bc9', '#c97b9b', '#8bc9a8', '#d4c56a', '#6a8fd4'
  ];

  function makeEmpty(rows, cols) {
    var g = [];
    for (var r = 0; r < rows; r++) {
      g[r] = [];
      for (var c = 0; c < cols; c++) g[r][c] = 0;
    }
    return g;
  }

  /** Bulmaca tanımları: clues[r][c] = sayı veya 0, solution: {r,c,w,h,num} */
  var LEVELS = [
    {
      name: '4x4',
      rows: 4,
      cols: 4,
      clues: (function () {
        var g = makeEmpty(4, 4);
        g[0][0] = 4; g[0][2] = 4; g[2][0] = 4; g[2][2] = 4;
        return g;
      })(),
      solution: [
        { r: 0, c: 0, w: 2, h: 2, num: 4 },
        { r: 0, c: 2, w: 2, h: 2, num: 4 },
        { r: 2, c: 0, w: 2, h: 2, num: 4 },
        { r: 2, c: 2, w: 2, h: 2, num: 4 }
      ]
    },
    {
      name: '5x5',
      rows: 5,
      cols: 5,
      clues: (function () {
        var g = makeEmpty(5, 5);
        for (var r = 0; r < 5; r++) g[r][0] = 5;
        return g;
      })(),
      solution: (function () {
        var s = [];
        for (var r = 0; r < 5; r++) s.push({ r: r, c: 0, w: 5, h: 1, num: 5 });
        return s;
      })()
    },
    {
      name: '6x6',
      rows: 6,
      cols: 6,
      clues: (function () {
        var g = makeEmpty(6, 6);
        for (var br = 0; br < 3; br++)
          for (var bc = 0; bc < 3; bc++)
            g[br * 2][bc * 2] = 4;
        return g;
      })(),
      solution: (function () {
        var s = [];
        for (var br = 0; br < 3; br++)
          for (var bc = 0; bc < 3; bc++)
            s.push({ r: br * 2, c: bc * 2, w: 2, h: 2, num: 4 });
        return s;
      })()
    }
  ];

  var levelIndex = 0;
  var rows, cols, clues, solution;
  var region = [];
  var nextRegionId = 1;
  var history = [];
  var dragStart = null;
  var dragCur = null;

  var gridEl, btnUndo, btnHint, btnCheck;
  var msgEl = null;

  function initLevel() {
    var L = LEVELS[levelIndex];
    rows = L.rows;
    cols = L.cols;
    clues = L.clues.map(function (row) { return row.slice(); });
    solution = L.solution;
    region = makeEmpty(rows, cols);
    nextRegionId = 1;
    history = [];
    render();
  }

  function snapshot() {
    return region.map(function (row) { return row.slice(); });
  }

  function pushHistory() {
    history.push(snapshot());
    if (history.length > 50) history.shift();
  }

  function rectCells(r0, c0, r1, c1) {
    var a = [];
    var rmin = Math.min(r0, r1), rmax = Math.max(r0, r1);
    var cmin = Math.min(c0, c1), cmax = Math.max(c0, c1);
    for (var r = rmin; r <= rmax; r++)
      for (var c = cmin; c <= cmax; c++)
        a.push([r, c]);
    return a;
  }

  function countCluesInRect(r0, c0, r1, c1) {
    var list = [];
    var rmin = Math.min(r0, r1), rmax = Math.max(r0, r1);
    var cmin = Math.min(c0, c1), cmax = Math.max(c0, c1);
    for (var r = rmin; r <= rmax; r++)
      for (var c = cmin; c <= cmax; c++)
        if (clues[r][c] > 0) list.push(clues[r][c]);
    return list;
  }

  function tryPlaceRect(r0, c0, r1, c1) {
    var rmin = Math.min(r0, r1), rmax = Math.max(r0, r1);
    var cmin = Math.min(c0, c1), cmax = Math.max(c0, c1);
    var w = cmax - cmin + 1;
    var h = rmax - rmin + 1;
    var area = w * h;
    var nums = countCluesInRect(r0, c0, r1, c1);
    if (nums.length !== 1) return { ok: false, reason: 'clue' };
    if (nums[0] !== area) return { ok: false, reason: 'area' };
    var cells = rectCells(r0, c0, r1, c1);
    for (var i = 0; i < cells.length; i++) {
      var rr = cells[i][0], cc = cells[i][1];
      if (region[rr][cc] !== 0) return { ok: false, reason: 'overlap' };
    }
    pushHistory();
    var id = nextRegionId++;
    for (var j = 0; j < cells.length; j++) {
      region[cells[j][0]][cells[j][1]] = id;
    }
    return { ok: true };
  }

  function clearRegionAt(r, c) {
    var id = region[r][c];
    if (!id) return;
    pushHistory();
    for (var rr = 0; rr < rows; rr++)
      for (var cc = 0; cc < cols; cc++)
        if (region[rr][cc] === id) region[rr][cc] = 0;
    render();
  }

  function hint() {
    for (var i = 0; i < solution.length; i++) {
      var s = solution[i];
      var ok = true;
      for (var r = s.r; r < s.r + s.h && ok; r++)
        for (var c = s.c; c < s.c + s.w && ok; c++)
          if (region[r][c] === 0) ok = false;
      if (ok) continue;
      pushHistory();
      var id = nextRegionId++;
      for (var rr2 = s.r; rr2 < s.r + s.h; rr2++)
        for (var cc2 = s.c; cc2 < s.c + s.w; cc2++)
          region[rr2][cc2] = id;
      render();
      showMsg('hint', true);
      return;
    }
  }

  function isSolved() {
    var i, r, c, rr, cc;
    for (r = 0; r < rows; r++)
      for (c = 0; c < cols; c++)
        if (region[r][c] === 0) return false;
    for (i = 0; i < solution.length; i++) {
      var s = solution[i];
      var id = region[s.r][s.c];
      if (!id) return false;
      for (rr = s.r; rr < s.r + s.h; rr++)
        for (cc = s.c; cc < s.c + s.w; cc++)
          if (region[rr][cc] !== id) return false;
      for (rr = 0; rr < rows; rr++)
        for (cc = 0; cc < cols; cc++)
          if (region[rr][cc] === id && (rr < s.r || rr >= s.r + s.h || cc < s.c || cc >= s.c + s.w))
            return false;
    }
    return true;
  }

  function showMsg(key, ok) {
    if (!msgEl) {
      msgEl = document.createElement('p');
      msgEl.className = 'patches-msg';
      gridEl.parentNode.appendChild(msgEl);
    }
    msgEl.className = 'patches-msg ' + (ok ? 'ok' : 'err');
    var texts = {
      hint: 'İpucu uygulandı.',
      ok: 'Şekil yerleştirildi.',
      overlap: 'Bu alan başka bir şekille çakışıyor.',
      area: 'Alan (genişlik × yükseklik), sayıya eşit olmalı.',
      clue: 'Dikdörtgen içinde tam bir sayı olmalı.',
      incomplete: 'Henüz tüm hücreler doğru bölünmedi.'
    };
    msgEl.textContent = ok ? (texts[key] || texts.ok) : (texts[key] || texts.clue);
  }

  function showWin() {
    var w = document.createElement('div');
    w.className = 'patches-win';
    w.innerHTML = '<div class="patches-win-box"><h2 data-i18n="patches.win_title">Harika!</h2><p data-i18n="patches.win_msg">Tüm şekiller doğru.</p><button type="button" id="patchesAgain" data-i18n="patches.play_again">Sonraki / Tekrar</button></div>';
    document.body.appendChild(w);
    setTimeout(function () { w.classList.add('is-visible'); }, 50);
    w.querySelector('#patchesAgain').onclick = function () {
      w.remove();
      levelIndex = (levelIndex + 1) % LEVELS.length;
      initLevel();
    };
  }

  function render() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    gridEl.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    var idToColor = {};
    var colorIdx = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement('div');
        cell.className = 'patches-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        var rid = region[r][c];
        if (rid) {
          if (!idToColor[rid]) idToColor[rid] = COLORS[colorIdx++ % COLORS.length];
          cell.style.background = idToColor[rid];
          cell.classList.add('has-region');
        }
        if (clues[r][c] > 0) {
          var sp = document.createElement('span');
          sp.className = 'patches-clue';
          sp.textContent = clues[r][c];
          cell.appendChild(sp);
        }
        gridEl.appendChild(cell);
      }
    }
    if (btnUndo) btnUndo.disabled = history.length === 0;
  }

  function getCellFromEvent(ev) {
    var x = ev.clientX, y = ev.clientY;
    if (ev.touches && ev.touches[0]) { x = ev.touches[0].clientX; y = ev.touches[0].clientY; }
    else if (ev.changedTouches && ev.changedTouches[0]) { x = ev.changedTouches[0].clientX; y = ev.changedTouches[0].clientY; }
    var el = document.elementFromPoint(x, y);
    if (!el || !el.classList.contains('patches-cell')) return null;
    return [parseInt(el.dataset.r, 10), parseInt(el.dataset.c, 10)];
  }

  function onDown(ev) {
    if (ev.button === 2) {
      ev.preventDefault();
      var rc = getCellFromEvent(ev);
      if (rc) clearRegionAt(rc[0], rc[1]);
      return;
    }
    var rc = getCellFromEvent(ev);
    if (!rc) return;
    dragStart = { r: rc[0], c: rc[1] };
    dragCur = { r: rc[0], c: rc[1] };
    document.addEventListener('mousemove', onMoveDoc);
    document.addEventListener('mouseup', onUpDoc);
    document.addEventListener('touchmove', onMoveDoc, { passive: false });
    document.addEventListener('touchend', onUpDoc);
    ev.preventDefault();
  }

  function onMoveDoc(ev) {
    if (!dragStart) return;
    var rc = getCellFromEvent(ev);
    if (!rc) return;
    dragCur = { r: rc[0], c: rc[1] };
    previewDrag();
    ev.preventDefault();
  }

  function previewDrag() {
    var cells = gridEl.querySelectorAll('.patches-cell');
    cells.forEach(function (el) { el.classList.remove('drag-preview'); });
    if (!dragStart || !dragCur) return;
    var list = rectCells(dragStart.r, dragStart.c, dragCur.r, dragCur.c);
    list.forEach(function (p) {
      var el = gridEl.querySelector('.patches-cell[data-r="' + p[0] + '"][data-c="' + p[1] + '"]');
      if (el) el.classList.add('drag-preview');
    });
  }

  function onUpDoc(ev) {
    document.removeEventListener('mousemove', onMoveDoc);
    document.removeEventListener('mouseup', onUpDoc);
    document.removeEventListener('touchmove', onMoveDoc);
    document.removeEventListener('touchend', onUpDoc);
    if (!dragStart || !dragCur) { dragStart = null; dragCur = null; return; }
    var res = tryPlaceRect(dragStart.r, dragStart.c, dragCur.r, dragCur.c);
    dragStart = null;
    dragCur = null;
    var cells = gridEl.querySelectorAll('.patches-cell');
    cells.forEach(function (el) { el.classList.remove('drag-preview'); });
    if (res.ok) {
      render();
      showMsg('ok', true);
      if (msgEl) setTimeout(function () { msgEl.textContent = ''; msgEl.className = 'patches-msg'; }, 1200);
    } else {
      render();
      showMsg(res.reason, false);
    }
    ev.preventDefault();
  }

  function onCheck() {
    if (isSolved()) {
      showWin();
    } else {
      showMsg('incomplete', false);
    }
  }

  function undo() {
    if (history.length === 0) return;
    region = history.pop();
    render();
  }

  function run() {
    gridEl = document.getElementById('patchesGrid');
    btnUndo = document.getElementById('btnUndo');
    btnHint = document.getElementById('btnHint');
    btnCheck = document.getElementById('btnCheck');
    if (!gridEl) return;
    gridEl.addEventListener('mousedown', onDown);
    gridEl.addEventListener('touchstart', onDown, { passive: false });
    gridEl.addEventListener('contextmenu', function (e) { e.preventDefault(); var rc = getCellFromEvent(e); if (rc) clearRegionAt(rc[0], rc[1]); });
    if (btnUndo) btnUndo.addEventListener('click', undo);
    if (btnHint) btnHint.addEventListener('click', hint);
    if (btnCheck) btnCheck.addEventListener('click', onCheck);
    initLevel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
