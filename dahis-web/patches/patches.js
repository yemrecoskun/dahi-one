(function () {
  'use strict';

  var COLORS = [
    '#7cb87c', '#d4a84b', '#6eb8d4', '#e8945f', '#4a9e9e',
    '#9b8bc9', '#c97b9b', '#8bc9a8', '#d4c56a', '#6a8fd4',
    '#e07a9a', '#5cb8a8', '#b8a85c', '#8a7cb8'
  ];

  function makeEmpty(rows, cols) {
    var g = [];
    for (var r = 0; r < rows; r++) {
      g[r] = [];
      for (var c = 0; c < cols; c++) g[r][c] = 0;
    }
    return g;
  }

  function cluesFromSolution(rows, cols, solution) {
    var g = makeEmpty(rows, cols);
    for (var i = 0; i < solution.length; i++) {
      var s = solution[i];
      g[s.r][s.c] = s.num;
    }
    return g;
  }

  /**
   * w = sütun sayısı, h = satır sayısı (yükseklik)
   * Her bulmaca: { id, name, difficulty, rows, cols, solution: [{r,c,w,h,num}] }
   */
  var PUZZLES = [];

  (function buildPuzzles() {
    PUZZLES.push({
      id: 'e1',
      name: 'Başlangıç 4×4',
      difficulty: 'easy',
      rows: 4,
      cols: 4,
      solution: [
        { r: 0, c: 0, w: 2, h: 2, num: 4 },
        { r: 0, c: 2, w: 2, h: 2, num: 4 },
        { r: 2, c: 0, w: 2, h: 2, num: 4 },
        { r: 2, c: 2, w: 2, h: 2, num: 4 }
      ]
    });

    var s5 = [];
    for (var r = 0; r < 5; r++) s5.push({ r: r, c: 0, w: 5, h: 1, num: 5 });
    PUZZLES.push({ id: 'e2', name: 'Şeritler 5×5', difficulty: 'easy', rows: 5, cols: 5, solution: s5 });

    var s6 = [];
    for (var br = 0; br < 3; br++)
      for (var bc = 0; bc < 3; bc++)
        s6.push({ r: br * 2, c: bc * 2, w: 2, h: 2, num: 4 });
    PUZZLES.push({ id: 'e3', name: 'Dokuz kare 6×6', difficulty: 'easy', rows: 6, cols: 6, solution: s6 });

    PUZZLES.push({
      id: 'm1',
      name: 'Harmonya 6×6',
      difficulty: 'medium',
      rows: 6,
      cols: 6,
      solution: [
        { r: 0, c: 0, w: 3, h: 2, num: 6 },
        { r: 0, c: 3, w: 3, h: 1, num: 3 },
        { r: 1, c: 3, w: 3, h: 2, num: 6 },
        { r: 2, c: 0, w: 3, h: 2, num: 6 },
        { r: 3, c: 3, w: 3, h: 3, num: 9 },
        { r: 4, c: 0, w: 3, h: 2, num: 6 }
      ]
    });

    PUZZLES.push({
      id: 'm2',
      name: 'Karma 6×6 II',
      difficulty: 'medium',
      rows: 6,
      cols: 6,
      solution: [
        { r: 0, c: 0, w: 2, h: 3, num: 6 },
        { r: 0, c: 2, w: 2, h: 3, num: 6 },
        { r: 0, c: 4, w: 2, h: 3, num: 6 },
        { r: 3, c: 0, w: 3, h: 2, num: 6 },
        { r: 3, c: 3, w: 3, h: 2, num: 6 },
        { r: 5, c: 0, w: 6, h: 1, num: 6 }
      ]
    });

    var s7 = [];
    for (var r7 = 0; r7 < 7; r7++) s7.push({ r: r7, c: 0, w: 7, h: 1, num: 7 });
    PUZZLES.push({ id: 'm3', name: 'Yedi şerit 7×7', difficulty: 'medium', rows: 7, cols: 7, solution: s7 });

    var h1cols = [];
    for (var c7 = 0; c7 < 7; c7++) h1cols.push({ r: 0, c: c7, w: 1, h: 7, num: 7 });
    PUZZLES.push({ id: 'h1', name: 'Yedi sütun 7×7', difficulty: 'hard', rows: 7, cols: 7, solution: h1cols });

    var s8rows = [];
    for (var r8 = 0; r8 < 8; r8++) s8rows.push({ r: r8, c: 0, w: 8, h: 1, num: 8 });
    PUZZLES.push({ id: 'h2', name: 'Sekiz şerit 8×8', difficulty: 'hard', rows: 8, cols: 8, solution: s8rows });

    var s8b = [];
    for (var br = 0; br < 4; br++)
      for (var bc = 0; bc < 4; bc++)
        s8b.push({ r: br * 2, c: bc * 2, w: 2, h: 2, num: 4 });
    PUZZLES.push({ id: 'h3', name: 'On altı blok 8×8', difficulty: 'hard', rows: 8, cols: 8, solution: s8b });

    PUZZLES.push({
      id: 'h4',
      name: 'Dört bölge 8×8',
      difficulty: 'hard',
      rows: 8,
      cols: 8,
      solution: [
        { r: 0, c: 0, w: 4, h: 4, num: 16 },
        { r: 0, c: 4, w: 4, h: 4, num: 16 },
        { r: 4, c: 0, w: 4, h: 4, num: 16 },
        { r: 4, c: 4, w: 4, h: 4, num: 16 }
      ]
    });
  })();

  function verifyPartition(solution, rows, cols) {
    var seen = makeEmpty(rows, cols);
    var total = 0;
    for (var i = 0; i < solution.length; i++) {
      var s = solution[i];
      for (var rr = s.r; rr < s.r + s.h; rr++)
        for (var cc = s.c; cc < s.c + s.w; cc++) {
          if (rr >= rows || cc >= cols || seen[rr][cc]) return false;
          seen[rr][cc] = 1;
          total++;
        }
      if (s.w * s.h !== s.num) return false;
    }
    return total === rows * cols;
  }

  for (var vi = 0; vi < PUZZLES.length; vi++) {
    if (!verifyPartition(PUZZLES[vi].solution, PUZZLES[vi].rows, PUZZLES[vi].cols)) {
      console.warn('Patches: bulmaca doğrulanamadı', PUZZLES[vi].id);
    }
  }

  var puzzleIndex = 0;
  var currentDifficulty = 'easy';
  var rows, cols, clues, solution;
  var region = [];
  var nextRegionId = 1;
  var history = [];
  var dragStart = null;
  var dragCur = null;
  var moveCount = 0;
  var hintCount = 0;

  var gridEl, btnUndo, btnHint, btnCheck;
  var selDifficulty, elPuzzleMeta, elMoves, elHints;
  var msgEl = null;

  function getPuzzlesForDifficulty(diff) {
    return PUZZLES.filter(function (p) { return p.difficulty === diff; });
  }

  function getCurrentPuzzle() {
    var list = getPuzzlesForDifficulty(currentDifficulty);
    if (list.length === 0) return PUZZLES[0];
    var idx = puzzleIndex % list.length;
    return list[idx];
  }

  function initLevel() {
    var P = getCurrentPuzzle();
    rows = P.rows;
    cols = P.cols;
    solution = P.solution;
    clues = cluesFromSolution(rows, cols, solution);
    region = makeEmpty(rows, cols);
    nextRegionId = 1;
    history = [];
    moveCount = 0;
    hintCount = 0;
    updateMeta();
    render();
  }

  function updateMeta() {
    var P = getCurrentPuzzle();
    var list = getPuzzlesForDifficulty(currentDifficulty);
    var idx = puzzleIndex % list.length;
    if (elPuzzleMeta) {
      elPuzzleMeta.textContent = P.name + ' · ' + (idx + 1) + '/' + list.length;
    }
    if (elMoves) elMoves.textContent = String(moveCount);
    if (elHints) elHints.textContent = String(hintCount);
  }

  function snapshot() {
    return region.map(function (row) { return row.slice(); });
  }

  function pushHistory() {
    history.push(snapshot());
    if (history.length > 80) history.shift();
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

  function validateRect(r0, c0, r1, c1) {
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
      if (region[cells[i][0]][cells[i][1]] !== 0) return { ok: false, reason: 'overlap' };
    }
    return { ok: true };
  }

  function tryPlaceRect(r0, c0, r1, c1) {
    var res = validateRect(r0, c0, r1, c1);
    if (!res.ok) return res;
    var cells = rectCells(r0, c0, r1, c1);
    pushHistory();
    var id = nextRegionId++;
    for (var j = 0; j < cells.length; j++) {
      region[cells[j][0]][cells[j][1]] = id;
    }
    moveCount++;
    return { ok: true };
  }

  function clearRegionAt(r, c) {
    var id = region[r][c];
    if (!id) return;
    pushHistory();
    for (var rr = 0; rr < rows; rr++)
      for (var cc = 0; cc < cols; cc++)
        if (region[rr][cc] === id) region[rr][cc] = 0;
    moveCount++;
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
      hintCount++;
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
    var g = typeof window.getI18n === 'function' ? window.getI18n : function (k) { return k; };
    var texts = {
      hint: g('patches.msg_hint'),
      ok: g('patches.msg_ok'),
      overlap: g('patches.msg_overlap'),
      area: g('patches.msg_area'),
      clue: g('patches.msg_clue'),
      incomplete: g('patches.msg_incomplete')
    };
    msgEl.textContent = ok ? (texts[key] || texts.ok) : (texts[key] || texts.clue);
  }

  function showWin() {
    var P = getCurrentPuzzle();
    var w = document.createElement('div');
    w.className = 'patches-win';
    w.innerHTML = '<div class="patches-win-box"><h2 data-i18n="patches.win_title">Harika!</h2><p>' +
      P.name + ' · ' + moveCount + ' hamle · ' + hintCount + ' ipucu</p>' +
      '<button type="button" id="patchesAgain" data-i18n="patches.next_puzzle">Sonraki bulmaca</button></div>';
    document.body.appendChild(w);
    if (typeof window.applyI18n === 'function') window.applyI18n();
    setTimeout(function () { w.classList.add('is-visible'); }, 50);
    w.querySelector('#patchesAgain').onclick = function () {
      w.remove();
      puzzleIndex++;
      var list = getPuzzlesForDifficulty(currentDifficulty);
      if (puzzleIndex >= list.length) puzzleIndex = 0;
      initLevel();
    };
  }

  function render() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    gridEl.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    var maxDim = Math.max(rows, cols);
    gridEl.classList.toggle('patches-grid--large', maxDim >= 8);
    gridEl.classList.toggle('patches-grid--medium', maxDim === 7);
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
    updateMeta();
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
    cells.forEach(function (el) {
      el.classList.remove('drag-preview', 'drag-preview-valid', 'drag-preview-invalid');
    });
    if (!dragStart || !dragCur) return;
    var list = rectCells(dragStart.r, dragStart.c, dragCur.r, dragCur.c);
    var v = validateRect(dragStart.r, dragStart.c, dragCur.r, dragCur.c);
    list.forEach(function (p) {
      var el = gridEl.querySelector('.patches-cell[data-r="' + p[0] + '"][data-c="' + p[1] + '"]');
      if (el) {
        el.classList.add('drag-preview');
        el.classList.add(v.ok ? 'drag-preview-valid' : 'drag-preview-invalid');
      }
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
    cells.forEach(function (el) {
      el.classList.remove('drag-preview', 'drag-preview-valid', 'drag-preview-invalid');
    });
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
    moveCount = Math.max(0, moveCount - 1);
    render();
  }

  function onDifficultyChange() {
    if (!selDifficulty) return;
    currentDifficulty = selDifficulty.value;
    puzzleIndex = 0;
    initLevel();
  }

  function onPrevPuzzle() {
    var list = getPuzzlesForDifficulty(currentDifficulty);
    puzzleIndex = (puzzleIndex - 1 + list.length) % list.length;
    initLevel();
  }

  function onNextPuzzle() {
    var list = getPuzzlesForDifficulty(currentDifficulty);
    puzzleIndex = (puzzleIndex + 1) % list.length;
    initLevel();
  }

  function run() {
    gridEl = document.getElementById('patchesGrid');
    btnUndo = document.getElementById('btnUndo');
    btnHint = document.getElementById('btnHint');
    btnCheck = document.getElementById('btnCheck');
    selDifficulty = document.getElementById('patchesDifficulty');
    elPuzzleMeta = document.getElementById('patchesPuzzleMeta');
    elMoves = document.getElementById('patchesMoves');
    elHints = document.getElementById('patchesHints');
    if (!gridEl) return;
    gridEl.addEventListener('mousedown', onDown);
    gridEl.addEventListener('touchstart', onDown, { passive: false });
    gridEl.addEventListener('contextmenu', function (e) { e.preventDefault(); var rc = getCellFromEvent(e); if (rc) clearRegionAt(rc[0], rc[1]); });
    if (btnUndo) btnUndo.addEventListener('click', undo);
    if (btnHint) btnHint.addEventListener('click', hint);
    if (btnCheck) btnCheck.addEventListener('click', onCheck);
    if (selDifficulty) selDifficulty.addEventListener('change', onDifficultyChange);
    var btnPrev = document.getElementById('btnPuzzlePrev');
    var btnNext = document.getElementById('btnPuzzleNext');
    if (btnPrev) btnPrev.addEventListener('click', onPrevPuzzle);
    if (btnNext) btnNext.addEventListener('click', onNextPuzzle);
    initLevel();
    if (typeof window.applyI18n === 'function') window.applyI18n();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
