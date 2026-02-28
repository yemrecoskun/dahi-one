/**
 * DAHIS: Five Forces
 * ui.js – Render game state to DOM, handle player interaction
 */
'use strict';

var UI = (function () {

  var humanPlayerIds = [];
  var pendingCardPlay = null;
  var pendingAbilityResolve = null;
  var handoffPending = false;  // "Turu bitir" tıklandı, kartlar gizli; "Sıradaki oyuncuya geç" bekleniyor

  function currentPlayer(gs) {
    return gs && gs.players[gs.currentTurnIdx];
  }

  function currentPlayerIsHuman(gs) {
    var cur = currentPlayer(gs);
    return cur && !cur.isAI;
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────

  function boot(sessionData) {
    var gs;
    if (sessionData.gameState && sessionData.roomId && Game.restoreState) {
      Game.restoreState(sessionData.gameState);
      gs = Game.getState();
      var idx = typeof sessionData.humanIdx === 'number' ? sessionData.humanIdx : 0;
      humanPlayerIds = gs.players[idx] ? [gs.players[idx].id] : [];
    } else {
      gs = Game.init(sessionData.players);
      humanPlayerIds = gs.players.filter(function (p) { return !p.isAI; }).map(function (p) { return p.id; });
    }
    render(gs);
    document.addEventListener('langchange', function () { render(Game.getState()); });
  }

  // ─── Master render ───────────────────────────────────────────────────────────

  function refresh(gs) { render(gs); }

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
    var curHuman = currentPlayerIsHuman(gs) ? gs.currentPlayerId : null;
    el.innerHTML = gs.players.map(function (p) {
      var chr = CHARACTERS[p.characterId];
      var active = p.id === gs.currentPlayerId ? ' active' : '';
      var you = p.id === curHuman ? ' you' : '';
      var avatarHtml = chr.image
        ? '<span class="score-avatar"><img src="' + chr.image + '" alt=""></span>'
        : '<span class="score-avatar" style="background:' + chr.gradient + '">' + chr.emoji + '</span>';
      return '<div class="score-entry' + active + you + '">' +
        avatarHtml +
        '<div class="score-info">' +
          '<span class="score-name">' + escHtml(p.name) +
            (p.id === curHuman ? ' <em>(' + t('game.you') + ')</em>' : '') +
            (p.isAI ? ' 🤖' : '') +
          '</span>' +
          '<span class="score-char">' + chr.name + ' · ' + chr.ability.name + '</span>' +
        '</div>' +
        '<div class="score-right">' +
          '<span class="score-val">' + p.score + '</span>' +
          (p.betrayalToken ? '<span class="btray-token" title="Betrayal Token">⚔️</span>' : '') +
          (p.abilityUsed
            ? '<span class="ability-tag used">' + t('game.score.used') + '</span>'
            : '<span class="ability-tag avail">' + t('game.score.avail') + '</span>') +
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
          '<span class="deck-label">' + t('game.deck.label') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="discard-pile">' +
        (gs.discardTop
          ? '<div class="card-mini" style="' + cardStyle(gs.discardTop) + '">' +
              '<span class="card-emoji">' + gs.discardTop.emoji + '</span>' +
              '<span class="card-name">' + escHtml(gs.discardTop.name) + '</span>' +
            '</div>'
          : '<div class="card-mini empty">' + t('game.discard.empty') + '</div>'
        ) +
      '</div>';

    var info = document.getElementById('round-info');
    if (info) {
      var cur = gs.players[gs.currentTurnIdx];
      info.textContent = t('game.round', { r: gs.round, name: cur.name }) +
                         (gs.scoreLocked ? t('game.round.lock') : '');
    }
  }

  // ─── Hand ────────────────────────────────────────────────────────────────────

  function renderHand(gs) {
    var el = document.getElementById('hand-area');
    if (!el) return;
    var titleEl = document.querySelector('.hand-title');
    if (titleEl) titleEl.textContent = t('game.hand.title');

    // Cihaz devri bekleniyorsa kartları gösterme
    if (handoffPending) {
      el.innerHTML = '<p class="empty-hand handoff-msg">' + t('game.passDevice') + '</p>';
      return;
    }

    var cur = currentPlayer(gs);
    if (!cur) return;
    if (cur.isAI) {
      el.innerHTML = '<p class="empty-hand">' + cur.name + ' …</p>';
      return;
    }

    var me = cur;
    var canPlay = (gs.phase === 'play') && !pendingAbilityResolve;

    el.innerHTML = me.hand.map(function (card) {
      var cls = 'card' + (canPlay ? ' playable' : '');
      return '<div class="' + cls + '" data-card-id="' + card.id + '" style="' + cardStyle(card) + '">' +
        '<span class="card-emoji">' + card.emoji + '</span>' +
        '<span class="card-name">' + escHtml(card.name) + '</span>' +
        '<span class="card-type">' + (card.typeLabel || card.type) + '</span>' +
        (card.value ? '<span class="card-value">+' + card.value + '</span>' : '') +
      '</div>';
    }).join('') || '<p class="empty-hand">' + t('game.hand.empty') + '</p>';

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
    var cur = currentPlayer(gs);
    var isCurrentHuman = cur && !cur.isAI;
    var currentId = cur ? cur.id : null;

    var html = '';

    // Cihaz devri: sadece "Sıradaki oyuncuya geç" butonu
    if (handoffPending) {
      var n = gs.players.length;
      var nextIdx = (gs.currentTurnIdx + (gs.turnDirection || 1) + n) % n;
      var nextPl = gs.players[nextIdx];
      var nextName = nextPl ? nextPl.name : '';
      html += '<button class="btn-action btn-pass-device" id="btn-pass-device">' +
        t('game.passDeviceBtn', { name: nextName }) + '</button>';
      el.innerHTML = html;
      document.getElementById('btn-pass-device').addEventListener('click', function () {
        handoffPending = false;
        handleResult(Game.endTurn(gs.currentPlayerId));
      });
      return;
    }

    if (isCurrentHuman && gs.phase === 'draw') {
      html += '<button class="btn-action btn-draw" id="btn-draw">' + t('game.btn.draw') + '</button>';
    }

    if (isCurrentHuman && gs.phase === 'ability' && !cur.abilityUsed && !cur.abilityBlocked) {
      html += '<button class="btn-action btn-ability" id="btn-ability">' +
        t('game.btn.ability', { name: CHARACTERS[cur.characterId].ability.name }) +
      '</button>';
    }

    if (isCurrentHuman && (gs.phase === 'ability' || gs.phase === 'play')) {
      html += '<button class="btn-action btn-end" id="btn-end">' + t('game.btn.end') + '</button>';
    }

    if (cur && cur.isAI && gs.phase === 'play') {
      var betrayer = gs.players.find(function (p) { return humanPlayerIds.indexOf(p.id) !== -1 && p.betrayalToken; });
      if (betrayer) {
        html += '<button class="btn-action btn-betray" id="btn-betray" data-pid="' + betrayer.id + '">' + t('game.btn.betray') + '</button>';
      }
    }

    el.innerHTML = html;

    var drawBtn = document.getElementById('btn-draw');
    if (drawBtn) drawBtn.addEventListener('click', function () {
      handleResult(Game.drawCard(currentId));
    });

    var abilityBtn = document.getElementById('btn-ability');
    if (abilityBtn) abilityBtn.addEventListener('click', function () {
      var res = Game.useAbility(currentId);
      if (res.pending) {
        pendingAbilityResolve = res.pendingAction;
        showAbilityModal(res.pendingAction, res.state);
      }
      handleResult(res);
    });

    var endBtn = document.getElementById('btn-end');
    if (endBtn) endBtn.addEventListener('click', function () {
      handoffPending = true;
      render(Game.getState());
    });

    var betrayBtn = document.getElementById('btn-betray');
    if (betrayBtn) betrayBtn.addEventListener('click', function () {
      var pid = betrayBtn.getAttribute('data-pid');
      handleResult(Game.useBetrayal(pid));
    });
  }

  // ─── Status banner ───────────────────────────────────────────────────────────

  function renderStatus(gs) {
    var el = document.getElementById('status-bar');
    if (!el) return;
    if (gs.over) { el.textContent = ''; return; }

    if (handoffPending) {
      el.textContent = t('game.passDevice');
      el.className = 'status-bar waiting';
      return;
    }

    var isCurrentHuman = currentPlayerIsHuman(gs);
    var phaseMap = {
      draw: t('game.phase.draw'),
      play: t('game.phase.play'),
      ability: t('game.phase.ability')
    };

    if (isCurrentHuman) {
      el.textContent = t('game.status.myturn', { phase: phaseMap[gs.phase] || '' });
      el.className = 'status-bar my-turn';
    } else {
      var cur = currentPlayer(gs);
      el.textContent = t('game.status.waiting', { name: cur ? cur.name : '' });
      el.className = 'status-bar waiting';
    }
  }

  // ─── Card click → play flow ───────────────────────────────────────────────

  function handleCardClick(cardId, gs) {
    var cur = currentPlayer(gs);
    if (!cur || cur.isAI) return;
    var card = cur.hand.find(function (c) { return c.id === cardId; });
    if (!card) return;

    if (card.type === CARD_TYPES.ACTION && card.target === 'player') {
      pendingCardPlay = { cardId: cardId };
      showTargetModal(gs, cardId);
    } else {
      handleResult(Game.playCard(cur.id, cardId, null));
    }
  }

  // ─── Target player modal ─────────────────────────────────────────────────────

  function showTargetModal(gs, cardId) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    var currentId = gs.currentPlayerId;
    var others = gs.players.filter(function (p) { return p.id !== currentId; });
    modal.innerHTML =
      '<div class="modal-box">' +
        '<h3>' + t('game.modal.target') + '</h3>' +
        '<div class="modal-targets">' +
          others.map(function (p) {
            var chr = CHARACTERS[p.characterId];
            return '<button class="btn-target" data-pid="' + p.id + '" style="border-color:' + chr.color + '">' +
              chr.emoji + ' ' + escHtml(p.name) +
            '</button>';
          }).join('') +
        '</div>' +
        '<button class="btn-cancel" id="modal-cancel">' + t('game.modal.cancel') + '</button>' +
      '</div>';
    modal.style.display = 'flex';

    modal.querySelectorAll('.btn-target').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.dataset.pid;
        closeModal();
        handleResult(Game.playCard(currentId, cardId, targetId));
        pendingCardPlay = null;
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
      html += '<h3>' + t('game.modal.foresight') + '</h3><div class="modal-cards">';
      action.cards.forEach(function (card, i) {
        html += '<div class="card card-choice" data-idx="' + i + '" style="' + cardStyle(card) + '">' +
          '<span class="card-emoji">' + card.emoji + '</span>' +
          '<span class="card-name">' + escHtml(card.name) + '</span>' +
          (card.value ? '<span class="card-value">+' + card.value + '</span>' : '') +
        '</div>';
      });
      html += '</div>';
    } else if (action.type === 'precisionSwap') {
      html += '<h3>' + t('game.modal.precSwap') + '</h3><div class="modal-targets">';
      action.others.forEach(function (pid) {
        var tp = gs ? gs.players.find(function (p) { return p.id === pid; }) : { name: pid, characterId: 'aura' };
        var chr = CHARACTERS[tp.characterId];
        html += '<button class="btn-target" data-pid="' + pid + '" style="border-color:' + chr.color + '">' +
          chr.emoji + ' ' + escHtml(tp.name) +
        '</button>';
      });
      html += '</div>';
    } else if (action.type === 'silentTheft') {
      html += '<h3>' + t('game.modal.theft') + '</h3><div class="modal-targets">';
      action.targets.forEach(function (pid) {
        var tp = gs ? gs.players.find(function (p) { return p.id === pid; }) : { name: pid, characterId: 'aura' };
        var chr = CHARACTERS[tp.characterId];
        html += '<button class="btn-target" data-pid="' + pid + '" style="border-color:' + chr.color + '">' +
          chr.emoji + ' ' + escHtml(tp.name) +
        '</button>';
      });
      html += '</div>';
    }

    html += '<button class="btn-cancel" id="modal-cancel">' + t('game.modal.cancel') + '</button></div>';
    modal.innerHTML = html;
    modal.style.display = 'flex';

    var currentId = gs ? gs.currentPlayerId : (Game.getState() && Game.getState().currentPlayerId);
    modal.querySelectorAll('.card-choice').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(el.dataset.idx, 10);
        closeModal();
        handleResult(Game.resolveAbility(currentId, { cardIndex: idx }));
        pendingAbilityResolve = null;
      });
    });

    modal.querySelectorAll('.btn-target').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.dataset.pid;
        closeModal();
        var choice = { targetPlayerId: targetId };
        if (action.type === 'precisionSwap') {
          choice.myCardIndex = 0;
          choice.theirCardIndex = 0;
        }
        handleResult(Game.resolveAbility(currentId, choice));
        pendingAbilityResolve = null;
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

    var winnerAvatar = chr.image
      ? '<div class="winner-avatar"><img src="' + chr.image + '" alt=""></div>'
      : '<div class="winner-avatar" style="background:' + chr.gradient + '">' + chr.emoji + '</div>';
    el.innerHTML =
      '<div class="game-over-box">' +
        winnerAvatar +
        '<h2>' + t('game.over.title') + '</h2>' +
        '<p class="winner-name">' + t('game.over.wins', { name: escHtml(winner.name) }) + '</p>' +
        '<p class="winner-score">' + t('game.over.points', { n: winner.score }) + '</p>' +
        '<div class="final-scores">' +
          sorted.map(function (p, i) {
            return '<div class="final-row">' +
              '<span>' + (i + 1) + '. ' + escHtml(p.name) + '</span>' +
              '<span>' + p.score + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<button class="btn-action" onclick="window.location.href=\'/five-forces\'">' +
          t('game.over.again') +
        '</button>' +
      '</div>';
    el.style.display = 'flex';
  }

  // ─── Result handler ──────────────────────────────────────────────────────────

  function handleResult(res) {
    if (!res) return;
    if (res.error) showToast(res.error);
    if (res.state) render(res.state);
    if (res.ok && window.ffIsOnline && window.ffOnlineRoomId && window.FFRooms && window.FFRooms.updateGameState && Game.getFullState) {
      window.FFRooms.updateGameState(window.ffOnlineRoomId, Game.getFullState()).catch(function () {});
    }
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────

  function showToast(msg) {
    var t2 = document.getElementById('toast');
    if (!t2) return;
    t2.textContent = msg;
    t2.classList.add('visible');
    clearTimeout(t2._timer);
    t2._timer = setTimeout(function () { t2.classList.remove('visible'); }, 2800);
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
