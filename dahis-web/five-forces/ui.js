/**
 * DAHIS: Five Forces
 * ui.js – Render game state to DOM, handle player interaction
 */
'use strict';

var UI = (function () {

  var humanPlayerId = null;
  var pendingCardPlay = null;   // { cardId } waiting for target selection
  var pendingAbilityResolve = null; // { type }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────

  function boot(sessionData) {
    /**
     * sessionData: { players: [{name, characterId, isAI}], humanIdx }
     */
    var gs = Game.init(sessionData.players);
    humanPlayerId = gs.players[sessionData.humanIdx].id;
    render(gs);
  }

  // ─── Master render ───────────────────────────────────────────────────────────

  function refresh(gs) {
    render(gs);
  }

  function render(gs) {
    if (!gs) return;
    renderScoreboard(gs);
    renderDeck(gs);
    renderHand(gs);
    renderLog(gs);
    renderActions(gs);
    renderStatus(gs);
    if (gs.over) showGameOver(gs);
  }

  // ─── Scoreboard ──────────────────────────────────────────────────────────────

  function renderScoreboard(gs) {
    var el = document.getElementById('scoreboard');
    if (!el) return;
    el.innerHTML = gs.players.map(function (p) {
      var chr = CHARACTERS[p.characterId];
      var active = p.id === gs.currentPlayerId ? ' active' : '';
      var you = p.id === humanPlayerId ? ' you' : '';
      return '<div class="score-entry' + active + you + '">' +
        '<span class="score-avatar" style="background:' + chr.gradient + '">' + chr.emoji + '</span>' +
        '<div class="score-info">' +
          '<span class="score-name">' + escHtml(p.name) + (p.id === humanPlayerId ? ' <em>(you)</em>' : '') + (p.isAI ? ' 🤖' : '') + '</span>' +
          '<span class="score-char">' + chr.name + ' · ' + chr.ability.name + '</span>' +
        '</div>' +
        '<div class="score-right">' +
          '<span class="score-val">' + p.score + '</span>' +
          (p.betrayalToken ? '<span class="btray-token" title="Betrayal Token">⚔️</span>' : '') +
          (p.abilityUsed ? '<span class="ability-tag used">used</span>' : '<span class="ability-tag avail">ability</span>') +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ─── Deck area ───────────────────────────────────────────────────────────────

  function renderDeck(gs) {
    var el = document.getElementById('deck-area');
    if (!el) return;
    el.innerHTML =
      '<div class="deck-pile" id="deck-pile">' +
        '<div class="deck-back">' +
          '<span class="deck-count">' + gs.deckCount + '</span>' +
          '<span class="deck-label">cards</span>' +
        '</div>' +
      '</div>' +
      '<div class="discard-pile">' +
        (gs.discardTop
          ? '<div class="card-mini" style="' + cardStyle(gs.discardTop) + '">' +
              '<span class="card-emoji">' + gs.discardTop.emoji + '</span>' +
              '<span class="card-name">' + escHtml(gs.discardTop.name) + '</span>' +
            '</div>'
          : '<div class="card-mini empty">discard</div>'
        ) +
      '</div>';

    var info = document.getElementById('round-info');
    if (info) {
      var cur = gs.players[gs.currentTurnIdx];
      info.textContent = 'Round ' + gs.round + '/12  ·  ' + cur.name + '\'s turn' + (gs.scoreLocked ? '  🔒 Score Lock' : '');
    }
  }

  // ─── Hand ────────────────────────────────────────────────────────────────────

  function renderHand(gs) {
    var el = document.getElementById('hand-area');
    if (!el) return;
    var me = gs.players.find(function (p) { return p.id === humanPlayerId; });
    if (!me) return;

    var isMyTurn = gs.currentPlayerId === humanPlayerId;
    var canPlay = isMyTurn && (gs.phase === 'play') && !pendingAbilityResolve;

    el.innerHTML = me.hand.map(function (card) {
      var cls = 'card' + (canPlay ? ' playable' : '');
      return '<div class="' + cls + '" data-card-id="' + card.id + '" style="' + cardStyle(card) + '">' +
        '<span class="card-emoji">' + card.emoji + '</span>' +
        '<span class="card-name">' + escHtml(card.name) + '</span>' +
        '<span class="card-type">' + card.type + '</span>' +
        (card.value ? '<span class="card-value">+' + card.value + '</span>' : '') +
      '</div>';
    }).join('') || '<p class="empty-hand">No cards in hand.</p>';

    // Attach click handlers
    el.querySelectorAll('.card.playable').forEach(function (cardEl) {
      cardEl.addEventListener('click', function () {
        handleCardClick(cardEl.dataset.cardId, gs);
      });
    });
  }

  // ─── Log ─────────────────────────────────────────────────────────────────────

  function renderLog(gs) {
    var el = document.getElementById('game-log');
    if (!el) return;
    el.innerHTML = gs.log.map(function (msg) {
      return '<p>' + escHtml(msg) + '</p>';
    }).join('');
  }

  // ─── Action buttons ──────────────────────────────────────────────────────────

  function renderActions(gs) {
    var el = document.getElementById('action-btns');
    if (!el) return;
    var isMyTurn = gs.currentPlayerId === humanPlayerId;
    var me = gs.players.find(function (p) { return p.id === humanPlayerId; });
    if (!me) return;

    var html = '';

    // Draw
    if (isMyTurn && gs.phase === 'draw') {
      html += '<button class="btn-action btn-draw" id="btn-draw">Draw Card</button>';
    }

    // Ability
    if (isMyTurn && gs.phase === 'ability' && !me.abilityUsed && !me.abilityBlocked) {
      html += '<button class="btn-action btn-ability" id="btn-ability">Use Ability: ' + CHARACTERS[me.characterId].ability.name + '</button>';
    }

    // End turn
    if (isMyTurn && (gs.phase === 'ability' || gs.phase === 'play')) {
      html += '<button class="btn-action btn-end" id="btn-end">End Turn</button>';
    }

    // Betrayal token
    if (!isMyTurn && me.betrayalToken && gs.phase === 'play') {
      html += '<button class="btn-action btn-betray" id="btn-betray">⚔️ Betray</button>';
    }

    el.innerHTML = html;

    var drawBtn = document.getElementById('btn-draw');
    if (drawBtn) drawBtn.addEventListener('click', function () {
      var res = Game.drawCard(humanPlayerId);
      handleResult(res);
    });

    var abilityBtn = document.getElementById('btn-ability');
    if (abilityBtn) abilityBtn.addEventListener('click', function () {
      var res = Game.useAbility(humanPlayerId);
      if (res.pending) {
        pendingAbilityResolve = res.pendingAction;
        showAbilityModal(res.pendingAction, res.state);
      }
      handleResult(res);
    });

    var endBtn = document.getElementById('btn-end');
    if (endBtn) endBtn.addEventListener('click', function () {
      var res = Game.endTurn(humanPlayerId);
      handleResult(res);
    });

    var betrayBtn = document.getElementById('btn-betray');
    if (betrayBtn) betrayBtn.addEventListener('click', function () {
      var res = Game.useBetrayal(humanPlayerId);
      handleResult(res);
    });
  }

  // ─── Status banner ───────────────────────────────────────────────────────────

  function renderStatus(gs) {
    var el = document.getElementById('status-bar');
    if (!el) return;
    var isMyTurn = gs.currentPlayerId === humanPlayerId;
    if (gs.over) { el.textContent = ''; return; }

    var phases = { draw: 'Draw a card', play: 'Play a card from your hand', ability: 'Use ability or end turn' };
    if (isMyTurn) {
      el.textContent = '▶ Your turn — ' + (phases[gs.phase] || '');
      el.className = 'status-bar my-turn';
    } else {
      var cur = gs.players[gs.currentTurnIdx];
      el.textContent = '⏳ Waiting for ' + cur.name + '…';
      el.className = 'status-bar waiting';
    }
  }

  // ─── Card click → play flow ───────────────────────────────────────────────

  function handleCardClick(cardId, gs) {
    var me = gs.players.find(function (p) { return p.id === humanPlayerId; });
    var card = me.hand.find(function (c) { return c.id === cardId; });
    if (!card) return;

    // Cards that target a player
    var needsTarget = (card.type === CARD_TYPES.ACTION && card.target === 'player') ||
                      (card.type === CARD_TYPES.RISK && card.effect === 'allLose10') === false &&
                      (card.type === CARD_TYPES.ACTION);

    if (card.type === CARD_TYPES.ACTION && card.target === 'player') {
      pendingCardPlay = { cardId: cardId };
      showTargetModal(gs, cardId);
    } else {
      var res = Game.playCard(humanPlayerId, cardId, null);
      handleResult(res);
    }
  }

  // ─── Target player modal ─────────────────────────────────────────────────────

  function showTargetModal(gs, cardId) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    var others = gs.players.filter(function (p) { return p.id !== humanPlayerId; });
    modal.innerHTML =
      '<div class="modal-box">' +
        '<h3>Choose a target</h3>' +
        '<div class="modal-targets">' +
          others.map(function (p) {
            var chr = CHARACTERS[p.characterId];
            return '<button class="btn-target" data-pid="' + p.id + '" style="border-color:' + chr.color + '">' +
              chr.emoji + ' ' + escHtml(p.name) +
            '</button>';
          }).join('') +
        '</div>' +
        '<button class="btn-cancel" id="modal-cancel">Cancel</button>' +
      '</div>';
    modal.style.display = 'flex';

    modal.querySelectorAll('.btn-target').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.dataset.pid;
        closeModal();
        var res = Game.playCard(humanPlayerId, cardId, targetId);
        pendingCardPlay = null;
        handleResult(res);
      });
    });

    document.getElementById('modal-cancel').addEventListener('click', function () {
      pendingCardPlay = null;
      closeModal();
    });
  }

  // ─── Ability modal ───────────────────────────────────────────────────────────

  function showAbilityModal(action, gs) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    var html = '<div class="modal-box">';

    if (action.type === 'foresight') {
      html += '<h3>Foresight – Choose a card</h3><div class="modal-cards">';
      action.cards.forEach(function (card, i) {
        html += '<div class="card card-choice" data-idx="' + i + '" style="' + cardStyle(card) + '">' +
          '<span class="card-emoji">' + card.emoji + '</span>' +
          '<span class="card-name">' + escHtml(card.name) + '</span>' +
          (card.value ? '<span class="card-value">+' + card.value + '</span>' : '') +
        '</div>';
      });
      html += '</div>';
    } else if (action.type === 'precisionSwap') {
      html += '<h3>Precision Swap – Choose a target player</h3><div class="modal-targets">';
      var me = gs ? gs.players.find(function (p) { return p.id === humanPlayerId; }) : null;
      action.others.forEach(function (pid) {
        var tp = gs ? gs.players.find(function (p) { return p.id === pid; }) : { name: pid, characterId: 'aura' };
        var chr = CHARACTERS[tp.characterId];
        html += '<button class="btn-target" data-pid="' + pid + '" style="border-color:' + chr.color + '">' +
          chr.emoji + ' ' + escHtml(tp.name) +
        '</button>';
      });
      html += '</div>';
    } else if (action.type === 'silentTheft') {
      html += '<h3>Silent Theft – Choose a victim</h3><div class="modal-targets">';
      action.targets.forEach(function (pid) {
        var tp = gs ? gs.players.find(function (p) { return p.id === pid; }) : { name: pid, characterId: 'aura' };
        var chr = CHARACTERS[tp.characterId];
        html += '<button class="btn-target" data-pid="' + pid + '" style="border-color:' + chr.color + '">' +
          chr.emoji + ' ' + escHtml(tp.name) +
        '</button>';
      });
      html += '</div>';
    }

    html += '<button class="btn-cancel" id="modal-cancel">Cancel</button></div>';
    modal.innerHTML = html;
    modal.style.display = 'flex';

    // Foresight
    modal.querySelectorAll('.card-choice').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(el.dataset.idx, 10);
        closeModal();
        var res = Game.resolveAbility(humanPlayerId, { cardIndex: idx });
        pendingAbilityResolve = null;
        handleResult(res);
      });
    });

    // Target-based abilities
    modal.querySelectorAll('.btn-target').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.dataset.pid;
        closeModal();
        var me2 = Game.getState().players.find(function (p) { return p.id === humanPlayerId; });
        var choice = { targetPlayerId: targetId };
        if (action.type === 'precisionSwap') {
          // Pick random card from own hand and their hand (simplified)
          choice.myCardIndex = 0;
          choice.theirCardIndex = 0;
        }
        var res = Game.resolveAbility(humanPlayerId, choice);
        pendingAbilityResolve = null;
        handleResult(res);
      });
    });

    document.getElementById('modal-cancel').addEventListener('click', function () {
      pendingAbilityResolve = null;
      closeModal();
      handleResult({ ok: true, over: false, state: Game.getState() });
    });
  }

  function closeModal() {
    var modal = document.getElementById('modal');
    if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
  }

  // ─── Game over overlay ───────────────────────────────────────────────────────

  function showGameOver(gs) {
    var el = document.getElementById('game-over');
    if (!el) return;
    var winner = gs.players.find(function (p) { return p.id === gs.winner; });
    var chr = CHARACTERS[winner.characterId];
    var sorted = gs.players.slice().sort(function (a, b) { return b.score - a.score; });

    el.innerHTML =
      '<div class="game-over-box">' +
        '<div class="winner-avatar" style="background:' + chr.gradient + '">' + chr.emoji + '</div>' +
        '<h2>Game Over</h2>' +
        '<p class="winner-name">' + escHtml(winner.name) + ' wins!</p>' +
        '<p class="winner-score">' + winner.score + ' points</p>' +
        '<div class="final-scores">' +
          sorted.map(function (p, i) {
            return '<div class="final-row">' +
              '<span>' + (i + 1) + '. ' + escHtml(p.name) + '</span>' +
              '<span>' + p.score + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<button class="btn-action" onclick="window.location.href=\'/five-forces\'">Play Again</button>' +
      '</div>';
    el.style.display = 'flex';
  }

  // ─── Result handler ──────────────────────────────────────────────────────────

  function handleResult(res) {
    if (!res) return;
    if (res.error) {
      showToast(res.error);
    }
    if (res.state) render(res.state);
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('visible'); }, 2800);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function cardStyle(card) {
    return 'border-color:' + card.color + ';box-shadow:0 0 14px ' + card.color + '44;';
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { boot: boot, refresh: refresh };
})();
