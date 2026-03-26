/* =============================================
   Renk Kodlama Zeka Oyunu – renk-kodlama.js
   Mastermind-style colour-code puzzle
   ============================================= */

(function () {
  'use strict';

  /* ---- Colour palette (6 base colours) ---- */
  var ALL_COLORS = [
    { id: 'red',    hex: '#ef4444', label: 'Kırmızı' },
    { id: 'orange', hex: '#fb923c', label: 'Turuncu' },
    { id: 'yellow', hex: '#facc15', label: 'Sarı'    },
    { id: 'green',  hex: '#22c55e', label: 'Yeşil'   },
    { id: 'blue',   hex: '#3b82f6', label: 'Mavi'    },
    { id: 'purple', hex: '#a855f7', label: 'Mor'     },
  ];

  /* ---- Difficulty levels ---- */
  //   level 1-2 → 4 slots, 5 colours
  //   level 3-4 → 4 slots, 6 colours
  //   level 5+  → 5 slots, 6 colours
  function getDifficulty(level) {
    if (level <= 2) return { slots: 4, colors: 5, maxTries: 6 };
    if (level <= 4) return { slots: 4, colors: 6, maxTries: 6 };
    return { slots: 5, colors: 6, maxTries: 6 };
  }

  /* ---- Scoring constants ----
     Bonus = max(BONUS_MIN, BONUS_BASE − (tries − 1) × BONUS_PER_GUESS) × level */
  var BONUS_BASE      = 50;  // maximum bonus points per win
  var BONUS_MIN       = 10;  // minimum bonus points
  var BONUS_PER_GUESS = 8;   // bonus reduction per extra guess used

  /* ---- Game State ---- */
  var state = {
    level:       1,
    score:       0,
    secret:      [],   // array of color ids
    guess:       [],   // current incomplete guess (sparse, some null)
    guesses:     [],   // committed rows [{pegs, feedback}]
    selectedSlot: 0,   // which slot is currently active
    selectedColor: null, // active color id from palette
    running:     false,
    config:      null,
  };

  /* ---- DOM ---- */
  var elBoard      = document.getElementById('rkBoard');
  var elCurrentRow = document.getElementById('rkCurrentRow');
  var elPalette    = document.getElementById('rkPalette');
  var elGuessBtn   = document.getElementById('rkGuessBtn');
  var elUndoBtn    = document.getElementById('rkUndoBtn');
  var elNewBtn     = document.getElementById('rkNewBtn');
  var elOverlay    = document.getElementById('rkOverlay');
  var elOverIcon   = document.getElementById('rkOverlayIcon');
  var elOverTitle  = document.getElementById('rkOverlayTitle');
  var elOverDesc   = document.getElementById('rkOverlayDesc');
  var elOverSecret = document.getElementById('rkOverlaySecret');
  var elStartBtn   = document.getElementById('rkStartBtn');
  var elAttempts   = document.getElementById('rkAttempts');
  var elLevel      = document.getElementById('rkLevel');
  var elScore      = document.getElementById('rkScore');

  /* ---- i18n helper ---- */
  function t(key, fallback) {
    if (window.__TRANSLATIONS__ && window.currentLang) {
      var tr = window.__TRANSLATIONS__[window.currentLang];
      if (tr && tr[key] !== undefined) return tr[key];
    }
    return fallback !== undefined ? fallback : key;
  }

  /* ---- Helpers ---- */
  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function generateSecret(config) {
    var pool = ALL_COLORS.slice(0, config.colors);
    var secret = [];
    for (var i = 0; i < config.slots; i++) {
      secret.push(pool[randInt(pool.length)].id);
    }
    return secret;
  }

  /* ---- Per-slot feedback: yeşil = exact, sarı = partial, boş = none (Mastermind eşlemesi) ---- */
  function computePerSlotFeedback(secret, guess) {
    var n = secret.length;
    var status = new Array(n);
    var secretUsed = new Array(n);
    var guessUsed = new Array(n);
    var i, gi, si;
    for (i = 0; i < n; i++) {
      secretUsed[i] = false;
      guessUsed[i] = false;
    }
    for (i = 0; i < n; i++) {
      if (secret[i] === guess[i]) {
        status[i] = 'exact';
        secretUsed[i] = true;
        guessUsed[i] = true;
      } else {
        status[i] = 'none';
      }
    }
    for (gi = 0; gi < n; gi++) {
      if (guessUsed[gi]) continue;
      for (si = 0; si < n; si++) {
        if (secretUsed[si]) continue;
        if (secret[si] === guess[gi]) {
          status[gi] = 'partial';
          secretUsed[si] = true;
          guessUsed[gi] = true;
          break;
        }
      }
    }
    return status;
  }

  function feedbackFromSlots(status) {
    var correct = 0;
    var misplaced = 0;
    for (var i = 0; i < status.length; i++) {
      if (status[i] === 'exact') correct++;
      else if (status[i] === 'partial') misplaced++;
    }
    return { correct: correct, misplaced: misplaced };
  }

  /* ---- Render helpers ---- */
  function colorHex(id) {
    for (var i = 0; i < ALL_COLORS.length; i++) {
      if (ALL_COLORS[i].id === id) return ALL_COLORS[i].hex;
    }
    return 'transparent';
  }

  function updateStats() {
    var cfg = state.config;
    elAttempts.textContent = state.guesses.length + ' / ' + cfg.maxTries;
    elLevel.textContent    = state.level;
    elScore.textContent    = state.score;
  }

  function buildPalette() {
    elPalette.innerHTML = '';
    var pool = ALL_COLORS.slice(0, state.config.colors);
    pool.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'rk-color-btn';
      btn.style.background = c.hex;
      btn.setAttribute('aria-label', c.label);
      btn.setAttribute('data-color', c.id);
      btn.addEventListener('click', function () {
        onColorSelect(c.id);
      });
      elPalette.appendChild(btn);
    });
  }

  function buildCurrentRow() {
    // Remove existing guess slots and rebuild for correct slot count
    var oldSlots = elCurrentRow.querySelectorAll('.rk-peg-slot--guess');
    oldSlots.forEach(function (s) { s.remove(); });

    var cfg = state.config;
    for (var i = 0; i < cfg.slots; i++) {
      (function (idx) {
        var slot = document.createElement('div');
        slot.className = 'rk-peg-slot rk-peg-slot--guess';
        slot.id = 'rkSlot' + idx;
        slot.setAttribute('data-slot', idx);
        slot.setAttribute('aria-label', 'Slot ' + (idx + 1));
        slot.addEventListener('click', function () {
          onSlotClick(idx);
        });
        elCurrentRow.insertBefore(slot, elGuessBtn);
      })(i);
    }
    refreshCurrentRow();
  }

  function refreshCurrentRow() {
    var cfg = state.config;
    for (var i = 0; i < cfg.slots; i++) {
      var slot = document.getElementById('rkSlot' + i);
      if (!slot) continue;
      var colorId = state.guess[i];
      if (colorId) {
        slot.style.background = colorHex(colorId);
        slot.style.borderColor = 'rgba(255,255,255,0.4)';
        slot.style.borderStyle = 'solid';
        slot.classList.add('filled');
      } else {
        slot.style.background = '';
        slot.style.borderColor = '';
        slot.style.borderStyle = '';
        slot.classList.remove('filled');
      }
      if (i === state.selectedSlot) {
        slot.classList.add('selected-slot');
      } else {
        slot.classList.remove('selected-slot');
      }
    }
    refreshPaletteActive();
    updateGuessBtn();
  }

  function refreshPaletteActive() {
    var btns = elPalette.querySelectorAll('.rk-color-btn');
    btns.forEach(function (btn) {
      if (btn.getAttribute('data-color') === state.selectedColor) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateGuessBtn() {
    var cfg = state.config;
    var full = true;
    for (var i = 0; i < cfg.slots; i++) {
      if (!state.guess[i]) { full = false; break; }
    }
    elGuessBtn.disabled = !full || !state.running;
  }

  function appendBoardRow(pegs, slotFeedback, cfg) {
    var row = document.createElement('div');
    row.className = 'rk-board-row';
    row.setAttribute('role', 'listitem');

    var pegWrap = document.createElement('div');
    pegWrap.className = 'rk-board-pegs';
    pegs.forEach(function (colorId, idx) {
      var dot = document.createElement('div');
      dot.className = 'rk-peg';
      if (slotFeedback[idx] === 'exact') dot.classList.add('rk-peg--exact');
      else if (slotFeedback[idx] === 'partial') dot.classList.add('rk-peg--partial');
      dot.style.background = colorHex(colorId);
      if (slotFeedback[idx] !== 'exact' && slotFeedback[idx] !== 'partial') {
        dot.style.borderColor = 'rgba(255,255,255,0.25)';
      }
      pegWrap.appendChild(dot);
    });

    row.appendChild(pegWrap);
    elBoard.appendChild(row);
  }

  function showSecret(secret) {
    elOverSecret.innerHTML = '';
    secret.forEach(function (colorId) {
      var dot = document.createElement('div');
      dot.className = 'rk-peg';
      dot.style.background = colorHex(colorId);
      dot.style.borderColor = 'rgba(255,255,255,0.3)';
      elOverSecret.appendChild(dot);
    });
  }

  /* ---- Game flow ---- */
  function startGame(resetLevel) {
    if (resetLevel) {
      state.level = 1;
      state.score = 0;
    }
    state.config  = getDifficulty(state.level);
    state.secret  = generateSecret(state.config);
    state.guess   = new Array(state.config.slots).fill(null);
    state.guesses = [];
    state.selectedSlot  = 0;
    state.selectedColor = null;
    state.running = true;

    elBoard.innerHTML = '';
    elOverlay.classList.add('hidden');

    buildPalette();
    buildCurrentRow();
    updateStats();
  }

  function onColorSelect(colorId) {
    if (!state.running) return;
    state.selectedColor = colorId;

    // Place colour into selected slot automatically
    if (state.selectedSlot < state.config.slots) {
      state.guess[state.selectedSlot] = colorId;
      // Advance to next empty slot
      var next = state.selectedSlot + 1;
      while (next < state.config.slots && state.guess[next]) next++;
      state.selectedSlot = next < state.config.slots ? next : state.config.slots - 1;
    }
    refreshCurrentRow();
  }

  function onSlotClick(idx) {
    if (!state.running) return;
    if (state.selectedColor) {
      // If a colour is already selected, paint this slot
      state.guess[idx] = state.selectedColor;
    }
    state.selectedSlot = idx;
    refreshCurrentRow();
  }

  function onGuess() {
    if (!state.running) return;
    var cfg    = state.config;
    var guess  = state.guess.slice();

    // Verify completeness
    for (var i = 0; i < cfg.slots; i++) {
      if (!guess[i]) return;
    }

    var slotFb = computePerSlotFeedback(state.secret, guess);
    var feedback = feedbackFromSlots(slotFb);
    state.guesses.push({ pegs: guess, feedback: feedback });
    appendBoardRow(guess, slotFb, cfg);
    updateStats();

    // Check win
    if (feedback.correct === cfg.slots) {
      var bonus = Math.max(BONUS_MIN, BONUS_BASE - (state.guesses.length - 1) * BONUS_PER_GUESS);
      state.score += bonus * state.level;
      endGame(true);
      return;
    }

    // Check loss
    if (state.guesses.length >= cfg.maxTries) {
      endGame(false);
      return;
    }

    // Next guess
    state.guess        = new Array(cfg.slots).fill(null);
    state.selectedSlot = 0;
    state.selectedColor = null;
    refreshCurrentRow();
  }

  function endGame(won) {
    state.running = false;
    elOverlay.classList.remove('hidden');

    if (won) {
      elOverIcon.textContent  = '🎉';
      elOverTitle.textContent = t('rk.win_title', 'Tebrikler!');
      elOverDesc.textContent  = t('rk.win_desc', 'Gizli kodu buldun!').replace('{tries}', state.guesses.length).replace('{score}', state.score);
      elOverSecret.innerHTML  = '';
      state.level++;
      elStartBtn.textContent  = t('rk.next_level', 'Sonraki Seviye →');
      elStartBtn.onclick      = function () { startGame(false); };
    } else {
      elOverIcon.textContent  = '😢';
      elOverTitle.textContent = t('rk.over_title', 'Oyun Bitti!');
      elOverDesc.textContent  = t('rk.over_desc', 'Gizli kod:');
      showSecret(state.secret);
      elStartBtn.textContent  = t('rk.play_again', 'Tekrar Oyna →');
      elStartBtn.onclick      = function () { startGame(true); };
    }
    updateStats();
  }

  function onUndo() {
    if (!state.running) return;
    // Clear rightmost filled slot
    for (var i = state.config.slots - 1; i >= 0; i--) {
      if (state.guess[i]) {
        state.guess[i]    = null;
        state.selectedSlot = i;
        break;
      }
    }
    refreshCurrentRow();
  }

  /* ---- Event bindings ---- */
  elGuessBtn.addEventListener('click', onGuess);
  elUndoBtn.addEventListener('click', onUndo);
  elNewBtn.addEventListener('click', function () {
    startGame(true);
  });
  elStartBtn.addEventListener('click', function () {
    startGame(true);
  });

  /* ---- Boot: show start overlay ---- */
  elOverlay.classList.remove('hidden');
  elOverIcon.textContent  = '🎨';
  elOverTitle.setAttribute('data-i18n', 'rk.start_title');
  elOverDesc.setAttribute('data-i18n', 'rk.start_desc');
  elStartBtn.setAttribute('data-i18n', 'rk.start_btn');
  elStartBtn.onclick = function () { startGame(true); };
  elGuessBtn.disabled = true;

})();
