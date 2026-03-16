(function () {
  'use strict';

  var SIZE = 4;
  var BOX_R = 2;
  var BOX_C = 2;

  // 4 karakter (4x4 sudoku)
  var CHARS = [
    { name: 'Puls', image: '/kirmizi.png', color: '#ff4444', gradient: 'linear-gradient(135deg,#ff4444,#ff9944)' },
    { name: 'Zest', image: '/turuncu.png', color: '#ff8844', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
    { name: 'Lumo', image: '/sari.png', color: '#ffdd44', gradient: 'linear-gradient(135deg,#f9d423,#f83600)' },
    { name: 'Vigo', image: '/yesil.png', color: '#44dd88', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' }
  ];
  var CHAR_NAMES = CHARS.map(function (c) { return c.name; });

  function boxIndex(r, c) {
    return Math.floor(r / BOX_R) * (SIZE / BOX_C) + Math.floor(c / BOX_C);
  }

  // 4x4 sudoku: 2x2 bloklar, daha kolay
  function createPuzzle() {
    var solution = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ];
    var mask = [
      [1, 0, 0, 1],
      [0, 1, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0]
    ];
    var grid = [];
    var fixed = [];
    for (var r = 0; r < SIZE; r++) {
      grid[r] = [];
      fixed[r] = [];
      for (var c = 0; c < SIZE; c++) {
        grid[r][c] = mask[r][c] ? solution[r][c] : 0;
        fixed[r][c] = !!mask[r][c];
      }
    }
    return { grid: grid, fixed: fixed, solution: solution };
  }

  var state = createPuzzle();
  var grid = state.grid;
  var fixed = state.fixed;
  var solution = state.solution;
  var notes = []; // notes[r][c] = [1,2,6] gibi
  for (var r = 0; r < SIZE; r++) {
    notes[r] = [];
    for (var c = 0; c < SIZE; c++) notes[r][c] = [];
  }
  var notesMode = false;
  var selected = null;
  var history = [];
  var hintUsed = false;

  var gridEl = document.getElementById('csGrid');
  var numKeysEl = document.getElementById('numKeys');
  var btnHint = document.getElementById('btnHint');
  var btnNotes = document.getElementById('btnNotes');
  var notesLabel = document.getElementById('notesLabel');
  var btnDelete = document.getElementById('btnDelete');
  var btnUndo = document.getElementById('btnUndo');

  function pushHistory() {
    var copy = [];
    for (var r = 0; r < SIZE; r++) {
      copy[r] = grid[r].slice();
    }
    history.push(copy);
  }

  function setCell(r, c, val) {
    if (fixed[r][c]) return;
    pushHistory();
    grid[r][c] = val;
    notes[r][c] = [];
    render();
    checkWin();
  }

  function addNote(r, c, val) {
    if (fixed[r][c] || grid[r][c] !== 0) return;
    var n = notes[r][c].indexOf(val);
    if (n >= 0) notes[r][c].splice(n, 1);
    else notes[r][c].push(val);
    notes[r][c].sort();
    render();
  }

  function clearCell(r, c) {
    if (fixed[r][c]) return;
    pushHistory();
    grid[r][c] = 0;
    notes[r][c] = [];
    render();
  }

  function undo() {
    if (history.length === 0) return;
    var prev = history.pop();
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (!fixed[r][c]) grid[r][c] = prev[r][c];
    render();
  }

  function getRow(r) {
    var row = [];
    for (var c = 0; c < SIZE; c++) row.push(grid[r][c]);
    return row;
  }
  function getCol(c) {
    var col = [];
    for (var r = 0; r < SIZE; r++) col.push(grid[r][c]);
    return col;
  }
  function getBox(r, c) {
    var bi = boxIndex(r, c);
    var box = [];
    var br = Math.floor(bi / (SIZE / BOX_C)) * BOX_R;
    var bc = (bi % (SIZE / BOX_C)) * BOX_C;
    for (var rr = br; rr < br + BOX_R; rr++)
      for (var cc = bc; cc < bc + BOX_C; cc++)
        box.push(grid[rr][cc]);
    return box;
  }

  function isValid(r, c, val) {
    if (val === 0) return true;
    var row = getRow(r); row[c] = 0;
    if (row.indexOf(val) >= 0) return false;
    var col = getCol(c); col[r] = 0;
    if (col.indexOf(val) >= 0) return false;
    var box = getBox(r, c);
    var idx = (r % BOX_R) * BOX_C + (c % BOX_C);
    box[idx] = 0;
    if (box.indexOf(val) >= 0) return false;
    return true;
  }

  function hasError(r, c) {
    var val = grid[r][c];
    if (val === 0) return false;
    return !isValid(r, c, val);
  }

  function findEmpty() {
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) return { r: r, c: c };
    return null;
  }

  function hint() {
    var cell = findEmpty();
    if (!cell) return;
    var val = solution[cell.r][cell.c];
    setCell(cell.r, cell.c, val);
    hintUsed = true;
    var el = gridEl.querySelector('[data-row="' + cell.r + '"][data-col="' + cell.c + '"]');
    if (el) {
      el.classList.add('cs-cell-hint');
      setTimeout(function () { el.classList.remove('cs-cell-hint'); }, 600);
    }
  }

  function checkWin() {
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (grid[r][c] === 0 || hasError(r, c)) return;
    showWin();
  }

  var winEl = null;
  function showWin() {
    if (winEl) return;
    winEl = document.createElement('div');
    winEl.className = 'cs-win';
    winEl.innerHTML = '<div class="cs-win-box">' +
      '<h2 class="cs-win-title" data-i18n="cs.win_title">Tebrikler!</h2>' +
      '<p class="cs-win-msg" data-i18n="cs.win_msg">Sudokuyu tamamladın.</p>' +
      '<button type="button" class="cs-win-btn" id="csWinAgain" data-i18n="cs.play_again">Tekrar Oyna</button>' +
      '</div>';
    document.body.appendChild(winEl);
    setTimeout(function () { winEl.classList.add('is-visible'); }, 100);
    winEl.querySelector('#csWinAgain').addEventListener('click', function () {
      winEl.classList.remove('is-visible');
      setTimeout(function () {
        state = createPuzzle();
        grid = state.grid;
        fixed = state.fixed;
        solution = state.solution;
        notes = [];
        for (var r = 0; r < SIZE; r++) {
          notes[r] = [];
          for (var c = 0; c < SIZE; c++) notes[r][c] = [];
        }
        history = [];
        selected = null;
        hintUsed = false;
        render();
        if (winEl.parentNode) winEl.parentNode.removeChild(winEl);
        winEl = null;
      }, 300);
    });
  }

  function render() {
    gridEl.innerHTML = '';
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = document.createElement('div');
        cell.className = 'cs-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'gridcell');
        if (fixed[r][c]) cell.classList.add('fixed');
        if (selected && selected.r === r && selected.c === c) cell.classList.add('selected');
        if (hasError(r, c)) cell.classList.add('error');

        if (grid[r][c] !== 0) {
          var charIdx = grid[r][c] - 1;
          var ch = CHARS[charIdx];
          var wrap = document.createElement('div');
          wrap.className = 'cs-char cs-char-glow';
          wrap.title = ch.name;
          wrap.style.setProperty('--cs-char-color', ch.color);
          if (ch.image) {
            var img = document.createElement('img');
            img.src = ch.image;
            img.alt = ch.name;
            img.className = 'cs-char-img';
            wrap.appendChild(img);
          } else {
            wrap.style.background = ch.gradient;
            wrap.classList.add('cs-char-emoji');
            wrap.textContent = '✦';
          }
          cell.appendChild(wrap);
        } else if (notes[r][c] && notes[r][c].length > 0) {
          var notesDiv = document.createElement('div');
          notesDiv.className = 'cs-notes';
          for (var i = 1; i <= SIZE; i++) {
            var n = document.createElement('span');
            n.className = 'cs-note-dot';
            n.style.backgroundColor = CHARS[i - 1].color;
            if (notes[r][c].indexOf(i) >= 0) n.classList.add('visible');
            notesDiv.appendChild(n);
          }
          cell.appendChild(notesDiv);
        }

        cell.addEventListener('click', function () {
          var row = parseInt(this.dataset.row, 10);
          var col = parseInt(this.dataset.col, 10);
          selected = { r: row, c: col };
          render();
        });
        gridEl.appendChild(cell);
      }
    }

    btnUndo.disabled = history.length === 0;
  }

  function onKeypad(val) {
    if (!selected) return;
    var r = selected.r, c = selected.c;
    if (fixed[r][c]) return;
    if (notesMode) {
      addNote(r, c, val);
      return;
    }
    setCell(r, c, val);
  }

  function initKeypad() {
    numKeysEl.innerHTML = '';
    for (var i = 1; i <= SIZE; i++) {
      var ch = CHARS[i - 1];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cs-key cs-key-char';
      btn.title = ch.name;
      btn.style.setProperty('--cs-char-color', ch.color);
      if (ch.image) {
        var img = document.createElement('img');
        img.src = ch.image;
        img.alt = ch.name;
        img.className = 'cs-key-img';
        btn.appendChild(img);
      } else {
        var grad = document.createElement('span');
        grad.className = 'cs-key-grad';
        grad.style.background = ch.gradient;
        grad.textContent = '✦';
        btn.appendChild(grad);
      }
      (function (v) {
        btn.addEventListener('click', function () { onKeypad(v); });
      })(i);
      numKeysEl.appendChild(btn);
    }
  }

  btnHint.addEventListener('click', hint);

  function updateNotesLabel() {
    if (!notesLabel) return;
    notesLabel.textContent = (typeof window.t === 'function')
      ? (notesMode ? (window.t('cs.notes_on') || 'Notlar AÇIK') : (window.t('cs.notes_off') || 'Notlar KAPALI'))
      : (notesMode ? 'Notlar AÇIK' : 'Notlar KAPALI');
  }
  btnNotes.addEventListener('click', function () {
    notesMode = !notesMode;
    btnNotes.classList.toggle('active', notesMode);
    updateNotesLabel();
  });

  btnDelete.addEventListener('click', function () {
    if (selected && !fixed[selected.r][selected.c]) clearCell(selected.r, selected.c);
  });

  btnUndo.addEventListener('click', undo);

  initKeypad();
  render();
  if (notesLabel && typeof window.t === 'function') notesLabel.textContent = window.t('cs.notes_off') || 'Notlar KAPALI';
})();
