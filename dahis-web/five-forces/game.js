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
    return (state.currentTurnIdx + state.turnDirection + n) % n;
  }

  function createPlayer(id, name, characterId, isAI) {
    return {
      id: id,
      name: name,
      characterId: characterId,
      character: characterId != null && CHARACTERS[characterId] ? CHARACTERS[characterId] : null,
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

  /** Normal init (yerel oyun): kartlar dağıtılır, phase 'draw'. */
  function init(playerConfigs) {
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
      phase: 'draw',
      scoreLocked: false,
      scoreLockTurns: 0,
      pendingAbility: null,
      pendingCard: null,
      log: [],
      over: false,
      winner: null
    };

    addLog(t('log.start', { n: players.length, deck: deck.length }));
    return getPublicState();
  }

  /** Online: sadece oyuncular, phase 'picking_characters', kart dağıtılmaz. Karakterler seçildikten sonra dealCardsAndStart() çağrılır. */
  function initPreGame(playerConfigs) {
    var players = playerConfigs.map(function (cfg, i) {
      return createPlayer('p' + i, cfg.name, cfg.characterId || null, cfg.isAI);
    });
    state = {
      players: players,
      deck: [],
      discardPile: [],
      currentTurnIdx: 0,
      turnDirection: 1,
      round: 1,
      phase: 'picking_characters',
      scoreLocked: false,
      scoreLockTurns: 0,
      pendingAbility: null,
      pendingCard: null,
      log: [],
      over: false,
      winner: null
    };
    addLog(t('log.waitingCharacters') || 'Waiting for everyone to pick a character…');
    return getPublicState();
  }

  /** Online: tüm oyuncular karakter seçtiyse kartları dağıt ve phase'i 'draw' yap. Sadece host çağırmalı. */
  function dealCardsAndStart() {
    if (!state || state.phase !== 'picking_characters') return false;
    for (var i = 0; i < state.players.length; i++) {
      if (state.players[i].characterId == null) return false;
    }
    var deck = shuffleDeck(buildDeck());
    var hands = dealCards(deck, state.players.length, 5);
    for (var j = 0; j < state.players.length; j++) state.players[j].hand = hands[j];
    state.deck = deck;
    state.discardPile = [];
    state.phase = 'draw';
    state.log = [];
    addLog(t('log.start', { n: state.players.length, deck: deck.length }));
    return true;
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
    if (!state || state.over) return err(t('err.gameOver'));
    if (state.phase === 'picking_characters') return err(t('err.pickCharacter') || 'Pick your character first');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err(t('err.notFound'));
    if (state.players[state.currentTurnIdx].id !== playerId) return err(t('err.notYourTurn'));
    if (state.phase !== 'draw') return err(t('err.notDrawPhase'));

    if (state.deck.length === 0) return endGame();

    var card = state.deck.shift();
    if (p.hand.length < HAND_LIMIT) {
      p.hand.push(card);
      addLog(t('log.drew', { name: p.name, deck: state.deck.length }));
    } else {
      state.discardPile.push(card);
      addLog(t('log.handFull', { name: p.name }));
    }

    state.phase = 'play';
    return ok();
  }

  /** Phase 2: play a card from hand */
  function playCard(playerId, cardId, targetPlayerId) {
    if (!state || state.over) return err(t('err.gameOver'));
    if (state.phase === 'picking_characters') return err(t('err.pickCharacter') || 'Pick your character first');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err(t('err.notFound'));
    if (state.players[state.currentTurnIdx].id !== playerId) return err(t('err.notYourTurn'));
    if (state.phase !== 'play') return err(t('err.notPlayPhase'));

    var cardIdx = p.hand.findIndex(function (c) { return c.id === cardId; });
    if (cardIdx === -1) return err(t('err.noCard'));

    var card = p.hand.splice(cardIdx, 1)[0];
    state.discardPile.push(card);

    var targetId = targetPlayerId || null;

    var zestSecond = null;
    if (p.zestDoubleTarget && (card.type === CARD_TYPES.ACTION)) {
      p.zestDoubleTarget = false;
      zestSecond = targetPlayerId;
    }

    var res = applyCardEffect(card, state, p, targetId);
    addLog(t('log.plays', { name: p.name, card: card.name, effect: res.log }));

    if (zestSecond) {
      var res2 = applyCardEffect(card, state, p, zestSecond);
      addLog(t('log.zestShift', { effect: res2.log }));
    }

    if (state.scoreLocked) {
      state.scoreLockTurns--;
      if (state.scoreLockTurns <= 0) state.scoreLocked = false;
    }

    state.phase = 'ability';
    return ok();
  }

  /** Phase 3 (optional): use character ability */
  function useAbility(playerId) {
    if (!state || state.over) return err(t('err.gameOver'));
    if (state.phase === 'picking_characters') return err(t('err.pickCharacter') || 'Pick your character first');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err(t('err.notFound'));
    if (state.players[state.currentTurnIdx].id !== playerId) return err(t('err.notYourTurn'));
    if (state.phase !== 'ability') return err(t('err.notAbilityPhase'));
    if (!p.character) return err(t('err.pickCharacter') || 'Pick your character first');
    if (p.abilityBlocked) {
      p.abilityBlocked = false;
      return err(t('ability.blocked'));
    }

    var res = executeAbility(p.character, state, p);
    if (!res.success) return err(res.message);

    addLog(t('log.abilityUsed', { name: p.name, ability: p.character.ability.name, msg: res.message }));

    if (res.pendingAction) {
      state.pendingAbility = { playerId: playerId, action: res.pendingAction };
      return { ok: true, pending: true, pendingAction: res.pendingAction, state: getPublicState() };
    }
    return ok();
  }

  /** Resolve pending ability choice */
  function resolveAbility(playerId, choice) {
    if (!state.pendingAbility || state.pendingAbility.playerId !== playerId) {
      return err(t('err.noPending'));
    }
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p || !p.character) return err(t('err.pickCharacter') || 'Pick your character first');
    var res = resolveAbilityChoice(p.character, state, p, choice);
    state.pendingAbility = null;
    addLog(res.message);
    return ok();
  }

  /** Use Betrayal Token to cancel an opponent's card */
  function useBetrayal(playerId) {
    if (!state || state.over) return err(t('err.gameOver'));
    if (state.phase === 'picking_characters') return err(t('err.pickCharacter') || 'Pick your character first');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err(t('err.notFound'));
    if (!p.betrayalToken) return err(t('err.noBetrayal'));
    var cur = currentPlayer();
    if (cur.id === playerId) return err(t('err.selfBetray'));
    if (state.phase !== 'play') return err(t('err.betrayPhase'));

    p.betrayalToken = false;
    cur.skipCardThisTurn = true;
    addLog(t('log.betray', { who: p.name, target: cur.name }));
    return ok();
  }

  /** Phase 4: end turn */
  function endTurn(playerId) {
    if (!state || state.over) return err(t('err.gameOver'));
    if (state.phase === 'picking_characters') return err(t('err.pickCharacter') || 'Pick your character first');
    var p = state.players.find(function (pl) { return pl.id === playerId; });
    if (!p) return err(t('err.notFound'));
    if (state.players[state.currentTurnIdx].id !== playerId) return err(t('err.notYourTurn'));

    var nextIdx = nextTurnIndex(state);

    if (state.players[nextIdx].skipNext) {
      addLog(t('log.skip', { name: state.players[nextIdx].name }));
      state.players[nextIdx].skipNext = false;
      state.currentTurnIdx = nextIdx;
      nextIdx = nextTurnIndex(state);
    }

    state.currentTurnIdx = nextIdx;

    if (state.currentTurnIdx === 0) {
      state.round++;
      addLog(t('log.round', { n: state.round }));
    }

    if (state.deck.length === 0) return endGame();
    if (state.round > MAX_ROUNDS) return endGame();

    state.phase = 'draw';

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

    drawCard(p.id);
    var best = null;
    p.hand.forEach(function (c) {
      if (c.type === CARD_TYPES.SCORE) {
        if (!best || c.value > best.value) best = c;
      }
    });
    if (!best) best = p.hand[0];
    if (best) {
      var opponent = state.players.find(function (pl) { return !pl.isAI || pl.id !== p.id; });
      playCard(p.id, best.id, opponent ? opponent.id : null);
    }
    state.phase = 'ability';
    endTurn(p.id);
    if (window.UI && window.UI.refresh) window.UI.refresh(getPublicState());
  }

  // ─── End ─────────────────────────────────────────────────────────────────────

  function endGame() {
    state.over = true;
    var winner = state.players.reduce(function (a, b) { return a.score >= b.score ? a : b; });
    state.winner = winner.id;
    addLog(t('log.over', { name: winner.name, score: winner.score }));
    return { ok: true, over: true, state: getPublicState() };
  }

  // ─── Public state snapshot ────────────────────────────────────────────────

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

  /** Full state for online sync (includes deck + discardPile). */
  function getFullState() {
    if (!state) return null;
    return {
      players: state.players.map(function (p) {
        return {
          id: p.id,
          name: p.name,
          characterId: p.characterId,
          isAI: p.isAI,
          hand: p.hand.slice(),
          score: p.score,
          betrayalToken: p.betrayalToken,
          abilityUsed: p.abilityUsed,
          abilityBlocked: p.abilityBlocked,
          skipNext: p.skipNext,
          lumoBonus: p.lumoBonus,
          zestDoubleTarget: p.zestDoubleTarget
        };
      }),
      deck: state.deck.slice(),
      discardPile: state.discardPile.slice(),
      currentTurnIdx: state.currentTurnIdx,
      turnDirection: state.turnDirection,
      round: state.round,
      phase: state.phase,
      scoreLocked: state.scoreLocked,
      scoreLockTurns: state.scoreLockTurns,
      pendingAbility: state.pendingAbility ? { playerId: state.pendingAbility.playerId, action: state.pendingAbility.action } : null,
      pendingCard: state.pendingCard,
      log: state.log.slice(),
      over: state.over,
      winner: state.winner
    };
  }

  /** Restore state from getFullState() (e.g. after receiving from server). */
  function restoreState(full) {
    if (!full || !full.players) return false;
    var deck = full.deck && full.deck.length ? full.deck.slice() : [];
    var discardPile = full.discardPile && full.discardPile.length ? full.discardPile.slice() : [];
    state = {
      players: full.players.map(function (p) {
        var charId = p.characterId;
        return {
          id: p.id,
          name: p.name,
          characterId: charId,
          character: charId != null && CHARACTERS[charId] ? CHARACTERS[charId] : null,
          isAI: !!p.isAI,
          hand: (p.hand || []).slice(),
          score: p.score || 0,
          betrayalToken: p.betrayalToken !== false,
          abilityUsed: !!p.abilityUsed,
          abilityBlocked: !!p.abilityBlocked,
          skipNext: !!p.skipNext,
          lumoBonus: !!p.lumoBonus,
          zestDoubleTarget: !!p.zestDoubleTarget
        };
      }),
      deck: deck,
      discardPile: discardPile,
      currentTurnIdx: full.currentTurnIdx || 0,
      turnDirection: full.turnDirection !== undefined ? full.turnDirection : 1,
      round: full.round || 1,
      phase: full.phase || 'draw',
      scoreLocked: !!full.scoreLocked,
      scoreLockTurns: full.scoreLockTurns || 0,
      pendingAbility: full.pendingAbility || null,
      pendingCard: full.pendingCard || null,
      log: (full.log || []).slice(),
      over: !!full.over,
      winner: full.winner || null
    };
    return true;
  }

  function ok()    { return { ok: true,  over: false, state: getPublicState() }; }
  function err(msg){ return { ok: false, error: msg,  state: getPublicState() }; }

  /** Online: set one player's character (oyunda karakter seçimi). */
  function setPlayerCharacter(playerIndex, characterId) {
    if (!state || !state.players[playerIndex]) return false;
    state.players[playerIndex].characterId = characterId;
    state.players[playerIndex].character = characterId != null && CHARACTERS[characterId] ? CHARACTERS[characterId] : null;
    return true;
  }

  return {
    init: init,
    initPreGame: initPreGame,
    dealCardsAndStart: dealCardsAndStart,
    drawCard: drawCard,
    playCard: playCard,
    useAbility: useAbility,
    resolveAbility: resolveAbility,
    useBetrayal: useBetrayal,
    endTurn: endTurn,
    getState: getPublicState,
    getFullState: getFullState,
    restoreState: restoreState,
    setPlayerCharacter: setPlayerCharacter
  };
})();
