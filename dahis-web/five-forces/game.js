/**
 * DAHIS: Five Forces
 * game.js – Core game state and turn logic
 */
'use strict';

var Game = (function () {

  var MAX_ROUNDS = 12;
  var HAND_LIMIT = 7;

  var state = null;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function nextTurnIndex(state) {
    var n = state.players.length;
    var next = (state.currentTurnIdx + state.turnDirection + n) % n;
    return next;
  }

  function createPlayer(id, name, characterId, isAI) {
    return {
      id: id,
      name: name,
      characterId: characterId,
      character: CHARACTERS[characterId],
      isAI: !!isAI,
      hand: [],
      score: 0,
      betrayalToken: true,
      abilityUsed: false,
      abilityBlocked: false,
      skipNext: false,
      lumoBonus: false,
      zestDoubleTarget: false
    };
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init(playerConfigs) {
    // playerConfigs: [{name, characterId, isAI}]
    var deck = shuffleDeck(buildDeck());
    var hands = dealCards(deck, playerConfigs.length, 5);

    var players = playerConfigs.map(function (cfg, i) {
      var p = createPlayer('p' + i, cfg.name, cfg.characterId, cfg.isAI);
      p.hand = hands[i];
      return p;
    });

    state = {
      players: players,
      deck: deck,
      discardPile: [],
      currentTurnIdx: 0,
      turnDirection: 1,
      round: 1,
      phase: 'draw',   // draw → play → ability → end
      scoreLocked: false,
      scoreLockTurns: 0,
      pendingAbility: null,  // { playerId, action }
      pendingCard: null,     // { card, needsTarget, targetType }
      log: [],
      over: false,
      winner: null
    };

    addLog('Game started! ' + players.length + ' players, ' + deck.length + ' cards remaining.');
    return getPublicState();
  }

  // ─── Logging ────────────────────────────────────────────────────────────────

  function addLog(msg) {
    state.log.unshift(msg);
    if (state.log.length > 50) state.log.pop();
  }

  // ─── Turn flow ──────────────────────────────────────────────────────────────

  function currentPlayer() {
    return state.players[state.currentTurnIdx];
  }

  /** Phase 1: draw a card */
  function drawCard(playerId) {
    if (!state || state.over) return err('Game over.');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err('Player not found.');
    if (state.players[state.currentTurnIdx].id !== playerId) return err('Not your turn.');
    if (state.phase !== 'draw') return err('Not draw phase.');

    if (state.deck.length === 0) {
      return endGame();
    }

    var card = state.deck.shift();
    if (p.hand.length < HAND_LIMIT) {
      p.hand.push(card);
      addLog(p.name + ' drew a card. (' + state.deck.length + ' left)');
    } else {
      // Hand full: discard drawn card
      state.discardPile.push(card);
      addLog(p.name + '\'s hand is full – drawn card discarded.');
    }

    state.phase = 'play';
    return ok();
  }

  /** Phase 2: play a card from hand */
  function playCard(playerId, cardId, targetPlayerId) {
    if (!state || state.over) return err('Game over.');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err('Player not found.');
    if (state.players[state.currentTurnIdx].id !== playerId) return err('Not your turn.');
    if (state.phase !== 'play') return err('Not play phase.');

    var cardIdx = p.hand.findIndex(function (c) { return c.id === cardId; });
    if (cardIdx === -1) return err('Card not in hand.');

    var card = p.hand.splice(cardIdx, 1)[0];
    state.discardPile.push(card);

    // Action/chaos cards may need a target player
    var targetId = targetPlayerId || null;

    // Zest double-target: store pending for second resolve
    var zestSecond = null;
    if (p.zestDoubleTarget && (card.type === CARD_TYPES.ACTION)) {
      p.zestDoubleTarget = false;
      zestSecond = targetPlayerId; // will be applied twice below
    }

    var res = applyCardEffect(card, state, p, targetId);
    addLog(p.name + ' plays ' + card.name + '. ' + res.log);

    // Zest second target hit
    if (zestSecond) {
      var res2 = applyCardEffect(card, state, p, zestSecond);
      addLog('Chaos Shift: ' + res2.log);
    }

    // Tick score lock
    if (state.scoreLocked) {
      state.scoreLockTurns--;
      if (state.scoreLockTurns <= 0) { state.scoreLocked = false; }
    }

    state.phase = 'ability';
    return ok();
  }

  /** Phase 3 (optional): use character ability */
  function useAbility(playerId) {
    if (!state || state.over) return err('Game over.');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err('Player not found.');
    if (state.players[state.currentTurnIdx].id !== playerId) return err('Not your turn.');
    if (state.phase !== 'ability') return err('Not ability phase.');
    if (p.abilityBlocked) {
      p.abilityBlocked = false;
      return err('Your ability is blocked this turn!');
    }

    var res = executeAbility(p.character, state, p);
    if (!res.success) return err(res.message);

    addLog(p.name + ' uses ' + p.character.ability.name + '. ' + res.message);

    if (res.pendingAction) {
      state.pendingAbility = { playerId: playerId, action: res.pendingAction };
      return { ok: true, pending: true, pendingAction: res.pendingAction, state: getPublicState() };
    }
    return ok();
  }

  /** Resolve pending ability choice */
  function resolveAbility(playerId, choice) {
    if (!state.pendingAbility || state.pendingAbility.playerId !== playerId) {
      return err('No pending ability for this player.');
    }
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    var res = resolveAbilityChoice(p.character, state, p, choice);
    state.pendingAbility = null;
    addLog(res.message);
    return ok();
  }

  /** Use Betrayal Token to cancel an opponent's card (called on opponent's turn) */
  function useBetrayal(playerId) {
    if (!state || state.over) return err('Game over.');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err('Player not found.');
    if (!p.betrayalToken) return err('Betrayal Token already used.');
    var cur = currentPlayer();
    if (cur.id === playerId) return err('Cannot betray on your own turn.');
    if (state.phase !== 'play') return err('Can only betray during play phase.');

    p.betrayalToken = false;
    // Mark current player's play as cancelled → they skip playing a card
    cur.skipCardThisTurn = true;
    addLog(p.name + ' uses Betrayal Token! ' + cur.name + '\'s card is cancelled!');
    return ok();
  }

  /** Phase 4: end turn */
  function endTurn(playerId) {
    if (!state || state.over) return err('Game over.');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err('Player not found.');
    if (state.players[state.currentTurnIdx].id !== playerId) return err('Not your turn.');

    // Advance
    var n = state.players.length;
    var nextIdx = nextTurnIndex(state);

    // Check skip
    if (state.players[nextIdx].skipNext) {
      addLog(state.players[nextIdx].name + '\'s turn is skipped!');
      state.players[nextIdx].skipNext = false;
      state.currentTurnIdx = nextIdx;
      nextIdx = nextTurnIndex(state);
    }

    state.currentTurnIdx = nextIdx;

    // Track rounds
    if (state.currentTurnIdx === 0) {
      state.round++;
      addLog('=== Round ' + state.round + ' ===');
    }

    // End conditions
    if (state.deck.length === 0) {
      return endGame();
    }
    if (state.round > MAX_ROUNDS) {
      return endGame();
    }

    state.phase = 'draw';

    // If next player is AI, trigger AI turn
    if (state.players[state.currentTurnIdx].isAI) {
      setTimeout(aiTurn, 800);
    }

    return ok();
  }

  // ─── AI ──────────────────────────────────────────────────────────────────────

  function aiTurn() {
    if (!state || state.over) return;
    var p = currentPlayer();
    if (!p.isAI) return;

    // Draw
    drawCard(p.id);
    // Play best score card or random
    var best = null;
    p.hand.forEach(function (c) {
      if (c.type === CARD_TYPES.SCORE) {
        if (!best || c.value > best.value) best = c;
      }
    });
    if (!best) best = p.hand[0];
    if (best) {
      // Target: random opponent for action cards
      var opponent = state.players.find(function (pl) { return !pl.isAI || pl.id !== p.id; });
      playCard(p.id, best.id, opponent ? opponent.id : null);
    }
    // Skip ability (simple AI)
    state.phase = 'ability';
    endTurn(p.id);
    // Notify UI
    if (window.UI && window.UI.refresh) window.UI.refresh(getPublicState());
  }

  // ─── End ─────────────────────────────────────────────────────────────────────

  function endGame() {
    state.over = true;
    var winner = state.players.reduce(function (a, b) { return a.score >= b.score ? a : b; });
    state.winner = winner.id;
    addLog('🏆 Game over! Winner: ' + winner.name + ' with ' + winner.score + ' points!');
    return { ok: true, over: true, state: getPublicState() };
  }

  // ─── Public state (safe copy) ─────────────────────────────────────────────

  function getPublicState() {
    if (!state) return null;
    return {
      players: state.players.map(function (p) {
        return {
          id: p.id,
          name: p.name,
          characterId: p.characterId,
          isAI: p.isAI,
          hand: p.hand.slice(),
          handCount: p.hand.length,
          score: p.score,
          betrayalToken: p.betrayalToken,
          abilityUsed: p.abilityUsed,
          abilityBlocked: p.abilityBlocked,
          skipNext: p.skipNext,
          lumoBonus: p.lumoBonus,
          zestDoubleTarget: p.zestDoubleTarget
        };
      }),
      deckCount: state.deck.length,
      discardTop: state.discardPile[state.discardPile.length - 1] || null,
      currentTurnIdx: state.currentTurnIdx,
      currentPlayerId: state.players[state.currentTurnIdx].id,
      round: state.round,
      phase: state.phase,
      scoreLocked: state.scoreLocked,
      pendingAbility: state.pendingAbility,
      log: state.log.slice(0, 12),
      over: state.over,
      winner: state.winner,
      turnDirection: state.turnDirection
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function ok() { return { ok: true, over: false, state: getPublicState() }; }
  function err(msg) { return { ok: false, error: msg, state: getPublicState() }; }

  // ─── Public API ───────────────────────────────────────────────────────────────

  return {
    init: init,
    drawCard: drawCard,
    playCard: playCard,
    useAbility: useAbility,
    resolveAbility: resolveAbility,
    useBetrayal: useBetrayal,
    endTurn: endTurn,
    getState: getPublicState
  };
})();
