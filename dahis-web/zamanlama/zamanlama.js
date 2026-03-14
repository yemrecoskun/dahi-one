/* =============================================
   Zamanlanmış Karakter Yerleştirme – zamanlama.js
   Timed Character Placement game logic
   ============================================= */

(function () {
  'use strict';

  /* ---- Character Data ---- */
  var CHARACTERS = [
    { id: 'puls',  symbol: '🔴', name: 'Puls',  color: '#ef4444' },
    { id: 'zest',  symbol: '🟡', name: 'Zest',  color: '#eab308' },
    { id: 'lumo',  symbol: '🟢', name: 'Lumo',  color: '#22c55e' },
    { id: 'vigo',  symbol: '🔵', name: 'Vigo',  color: '#3b82f6' },
    { id: 'aura',  symbol: '🟣', name: 'Aura',  color: '#a855f7' },
  ];

  /* ---- Game Constants ---- */
  var INITIAL_TIME    = 5;    // seconds per character at start
  var MIN_TIME        = 1.5;  // minimum seconds per character
  var TIME_DECREMENT  = 0.5;  // seconds removed per level
  var MIN_SLOTS       = 3;    // minimum number of target slots
  var MAX_SLOTS       = 5;    // maximum number of target slots
  var SLOT_LEVEL_OFFSET = 2;  // slots = clamp(level + SLOT_LEVEL_OFFSET, MIN, MAX)
  var LEVEL_THRESHOLD = 5;    // correct placements required to level up

  /* ---- Game State ---- */
  var state = {
    running:   false,
    score:     0,
    level:     1,
    lives:     3,
    streak:    0,           // correct placements in current level
    threshold: LEVEL_THRESHOLD,
    timeLeft:  0,
    maxTime:   INITIAL_TIME,
    activeChar: null,       // current character object
    tickerId:   null,
    slotOrder:  [],         // array of character ids for current slots
    dragChar:   null,
  };

  /* ---- DOM References ---- */
  var elScore      = document.getElementById('zkrScore');
  var elLevel      = document.getElementById('zkrLevel');
  var elLives      = document.getElementById('zkrLives');
  var elTimer      = document.getElementById('zkrTimer');
  var elClock      = document.getElementById('zkrClock');
  var elSecHand    = document.getElementById('zkrSecondHand');
  var elActiveChar = document.getElementById('zkrActiveChar');
  var elCharSymbol = document.getElementById('zkrCharSymbol');
  var elCharName   = document.getElementById('zkrCharName');
  var elSlots      = document.getElementById('zkrSlots');
  var elOverlay    = document.getElementById('zkrOverlay');
  var elOverIcon   = document.getElementById('zkrOverlayIcon');
  var elOverTitle  = document.getElementById('zkrOverlayTitle');
  var elOverDesc   = document.getElementById('zkrOverlayDesc');
  var elStartBtn   = document.getElementById('zkrStartBtn');

  /* ---- Helpers ---- */
  function t(key, fallback) {
    if (window.__TRANSLATIONS__ && window.currentLang) {
      var tr = window.__TRANSLATIONS__[window.currentLang];
      if (tr && tr[key] !== undefined) return tr[key];
    }
    return fallback || key;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function updateLivesDisplay() {
    var hearts = '';
    for (var i = 0; i < state.lives; i++)      hearts += '❤️';
    for (var j = state.lives; j < 3; j++)      hearts += '🖤';
    elLives.textContent = hearts;
  }

  /* ---- Score Popup ---- */
  function showScorePop(amount, x, y) {
    var el = document.createElement('div');
    el.className = 'zkr-score-pop ' + (amount > 0 ? 'positive' : 'negative');
    el.textContent = (amount > 0 ? '+' : '') + amount;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    setTimeout(function () { el.parentNode && el.parentNode.removeChild(el); }, 900);
  }

  /* ---- Level Up Banner ---- */
  function showLevelBanner(level) {
    var el = document.createElement('div');
    el.className = 'zkr-level-banner';
    el.textContent = t('zkr.level_up', 'Seviye ' + level + '! 🎉').replace('{level}', level);
    document.body.appendChild(el);
    setTimeout(function () { el.parentNode && el.parentNode.removeChild(el); }, 1700);
  }

  /* ---- Build Slot Grid ---- */
  function buildSlots() {
    elSlots.innerHTML = '';
    // Pick 3–5 slots depending on level
    var count = clamp(state.level + SLOT_LEVEL_OFFSET, MIN_SLOTS, MAX_SLOTS);
    var pool = shuffle(CHARACTERS).slice(0, count);
    state.slotOrder = pool.map(function (c) { return c.id; });

    pool.forEach(function (ch) {
      var slot = document.createElement('div');
      slot.className = 'zkr-slot';
      slot.dataset.charId = ch.id;

      var sym = document.createElement('span');
      sym.className = 'zkr-slot-symbol';
      sym.textContent = ch.symbol;

      var lbl = document.createElement('span');
      lbl.className = 'zkr-slot-label';
      lbl.textContent = ch.name;

      slot.appendChild(sym);
      slot.appendChild(lbl);

      // Click to place
      slot.addEventListener('click', function () {
        if (!state.running || !state.activeChar) return;
        handlePlacement(ch.id, slot);
      });

      // Drag-and-drop (desktop)
      slot.addEventListener('dragover', function (e) {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('drag-over');
        if (!state.running || !state.activeChar) return;
        handlePlacement(ch.id, slot);
      });

      elSlots.appendChild(slot);
    });
  }

  /* ---- Pick Random Active Character ---- */
  function pickActiveCharacter() {
    // Choose randomly from current slot characters for correct answer,
    // ensuring all characters rotate fairly
    var idx = Math.floor(Math.random() * state.slotOrder.length);
    var charId = state.slotOrder[idx];
    return CHARACTERS.find(function (c) { return c.id === charId; });
  }

  /* ---- Start a New Round ---- */
  function startRound() {
    if (!state.running) return;

    state.activeChar = pickActiveCharacter();
    var ch = state.activeChar;

    // Update active char display
    elCharSymbol.textContent = ch.symbol;
    elCharName.textContent = ch.name;
    elActiveChar.classList.remove('hidden');
    elActiveChar.classList.remove('entering');
    // Force reflow for animation restart
    void elActiveChar.offsetWidth;
    elActiveChar.classList.add('entering');

    // Reset timer
    state.timeLeft = state.maxTime;
    updateTimer();
    startTicker();
  }

  /* ---- Timer Tick ---- */
  function startTicker() {
    clearInterval(state.tickerId);
    state.tickerId = setInterval(function () {
      state.timeLeft -= 0.1;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        onTimeout();
      }
      updateTimer();
    }, 100);
  }

  function updateTimer() {
    var secs = Math.ceil(state.timeLeft);
    elTimer.textContent = secs;

    // Rotate second hand
    var frac = 1 - (state.timeLeft / state.maxTime);
    var deg  = frac * 360;
    elSecHand.style.transform = 'rotate(' + deg + 'deg)';

    // Urgent state: last 2 seconds
    if (state.timeLeft <= 2) {
      elClock.classList.add('urgent');
    } else {
      elClock.classList.remove('urgent');
    }
  }

  /* ---- Handle Timeout ---- */
  function onTimeout() {
    clearInterval(state.tickerId);
    state.streak = 0;

    state.lives--;
    updateLivesDisplay();

    // Flash the correct slot red briefly
    var correctSlot = elSlots.querySelector('[data-char-id="' + state.activeChar.id + '"]');
    if (correctSlot) {
      correctSlot.classList.add('wrong-flash');
      setTimeout(function () { correctSlot.classList.remove('wrong-flash'); }, 600);
    }

    showScorePop(-10, window.innerWidth / 2 - 20, window.innerHeight / 2);

    if (state.lives <= 0) {
      endGame();
      return;
    }

    // Brief pause then next round
    setTimeout(function () {
      if (state.running) {
        buildSlots();
        startRound();
      }
    }, 700);
  }

  /* ---- Handle Placement ---- */
  function handlePlacement(placedId, slotEl) {
    clearInterval(state.tickerId);

    var rect = slotEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    if (placedId === state.activeChar.id) {
      // Correct!
      var pts = Math.max(10, Math.round(10 + state.timeLeft * 4));
      state.score += pts;
      state.streak++;
      elScore.textContent = state.score;

      slotEl.classList.add('correct-flash');
      setTimeout(function () { slotEl.classList.remove('correct-flash'); }, 800);

      showScorePop(pts, cx, cy);

      // Level up check
      if (state.streak >= state.threshold) {
        state.level++;
        state.streak = 0;
        // Decrease time window to minimum
        state.maxTime = Math.max(MIN_TIME, INITIAL_TIME - (state.level - 1) * TIME_DECREMENT);
        elLevel.textContent = state.level;
        showLevelBanner(state.level);

        // Rebuild slots after short delay
        setTimeout(function () {
          if (state.running) { buildSlots(); startRound(); }
        }, 800);
        return;
      }
    } else {
      // Wrong!
      slotEl.classList.add('wrong-flash');
      setTimeout(function () { slotEl.classList.remove('wrong-flash'); }, 600);

      state.score = Math.max(0, state.score - 10);
      state.streak = 0;
      state.lives--;
      elScore.textContent = state.score;
      updateLivesDisplay();
      showScorePop(-10, cx, cy);

      if (state.lives <= 0) {
        setTimeout(endGame, 400);
        return;
      }
    }

    // Next round with short delay
    setTimeout(function () {
      if (state.running) startRound();
    }, 400);
  }

  /* ---- End Game ---- */
  function endGame() {
    state.running = false;
    clearInterval(state.tickerId);
    elClock.classList.remove('urgent');
    elActiveChar.classList.add('hidden');

    elOverIcon.textContent = '⏰';
    elOverTitle.textContent = t('zkr.over_title', 'Oyun Bitti!');
    elOverDesc.textContent  = t('zkr.over_desc', 'Skorun: {score} | Seviye: {level}')
      .replace('{score}', state.score)
      .replace('{level}', state.level);
    elStartBtn.textContent  = t('zkr.play_again', 'Tekrar Oyna →');
    elOverlay.classList.remove('hidden');
  }

  /* ---- Start / Restart ---- */
  function startGame() {
    state.running   = true;
    state.score     = 0;
    state.level     = 1;
    state.lives     = 3;
    state.streak    = 0;
    state.maxTime   = INITIAL_TIME;
    state.timeLeft  = INITIAL_TIME;
    state.activeChar = null;

    elScore.textContent = '0';
    elLevel.textContent = '1';
    updateLivesDisplay();
    elClock.classList.remove('urgent');
    elTimer.textContent = INITIAL_TIME;
    elSecHand.style.transform = 'rotate(0deg)';
    elOverlay.classList.add('hidden');

    buildSlots();
    startRound();
  }

  /* ---- Drag from Active Character (desktop) ---- */
  elActiveChar.addEventListener('dragstart', function () {
    state.dragChar = state.activeChar;
    elActiveChar.classList.add('dragging');
  });
  elActiveChar.addEventListener('dragend', function () {
    elActiveChar.classList.remove('dragging');
  });

  /* ---- Touch Support ---- */
  var touchClone = null;
  var touchOffsetX = 0;
  var touchOffsetY = 0;

  elActiveChar.addEventListener('touchstart', function (e) {
    if (!state.running || !state.activeChar) return;
    var touch = e.touches[0];
    var rect  = elActiveChar.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    // Create floating clone
    touchClone = elActiveChar.cloneNode(true);
    touchClone.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:999',
      'opacity:0.85',
      'left:' + (touch.clientX - touchOffsetX) + 'px',
      'top:'  + (touch.clientY - touchOffsetY) + 'px',
      'width:' + rect.width + 'px',
    ].join(';');
    document.body.appendChild(touchClone);
  }, { passive: true });

  elActiveChar.addEventListener('touchmove', function (e) {
    if (!touchClone) return;
    e.preventDefault();
    var touch = e.touches[0];
    touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
    touchClone.style.top  = (touch.clientY - touchOffsetY) + 'px';
  }, { passive: false });

  elActiveChar.addEventListener('touchend', function (e) {
    if (!touchClone) return;
    var touch = e.changedTouches[0];
    document.body.removeChild(touchClone);
    touchClone = null;

    // Find which slot is under the finger
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var slot = el && (el.classList.contains('zkr-slot') ? el : el.closest && el.closest('.zkr-slot'));
    if (slot && state.running && state.activeChar) {
      handlePlacement(slot.dataset.charId, slot);
    }
  }, { passive: true });

  /* ---- Start Button ---- */
  elStartBtn.addEventListener('click', startGame);

  /* ---- Keyboard Shortcuts (1-5 for slots) ---- */
  document.addEventListener('keydown', function (e) {
    if (!state.running || !state.activeChar) return;
    var num = parseInt(e.key, 10);
    if (num >= 1 && num <= 5) {
      var slots = elSlots.querySelectorAll('.zkr-slot');
      var slot = slots[num - 1];
      if (slot) handlePlacement(slot.dataset.charId, slot);
    }
  });

})();
