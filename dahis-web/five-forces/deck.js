/**
 * DAHIS: Five Forces
 * deck.js – Card definitions and deck management
 *
 * Card names are resolved lazily via t() so they always reflect the
 * active language. The `nameKey` property stores the i18n key and
 * `name` is a getter that calls t() at access time.
 */
'use strict';

var CARD_TYPES = {
  SCORE: 'score',
  RISK: 'risk',
  ACTION: 'action',
  CHAOS: 'chaos'
};

function buildDeck() {
  var cards = [];
  var id = 0;

  function add(count, tpl) {
    for (var i = 0; i < count; i++) {
      var card = Object.assign({}, tpl, { id: 'c' + (++id) });
      // Make name a lazy getter so language switches are reflected instantly
      var key = tpl.nameKey;
      Object.defineProperty(card, 'name', {
        get: function() { return t(key); },
        enumerable: true,
        configurable: true
      });
      // typeLabel getter
      var typeKey = 'type.' + tpl.type;
      Object.defineProperty(card, 'typeLabel', {
        get: function() { return t(typeKey); },
        enumerable: true,
        configurable: true
      });
      cards.push(card);
    }
  }

  // ── Score Cards (16) ──────────────────────────────
  add(6, { type: CARD_TYPES.SCORE,  nameKey: 'card.10',  value: 10,  color: '#43e97b', emoji: '✨' });
  add(5, { type: CARD_TYPES.SCORE,  nameKey: 'card.20',  value: 20,  color: '#4facfe', emoji: '⚡' });
  add(3, { type: CARD_TYPES.SCORE,  nameKey: 'card.30',  value: 30,  color: '#667eea', emoji: '💎' });
  add(2, { type: CARD_TYPES.SCORE,  nameKey: 'card.40',  value: 40,  color: '#fa709a', emoji: '🏆' });

  // ── Risk Cards (8) ────────────────────────────────
  add(2, { type: CARD_TYPES.RISK,   nameKey: 'card.double',      effect: 'double',       color: '#fee140', emoji: '×2' });
  add(2, { type: CARD_TYPES.RISK,   nameKey: 'card.lose20',      effect: 'lose20',        color: '#f5576c', emoji: '💀' });
  add(1, { type: CARD_TYPES.RISK,   nameKey: 'card.reset',       effect: 'reset',         color: '#ff4444', emoji: '🔄' });
  add(1, { type: CARD_TYPES.RISK,   nameKey: 'card.halve',       effect: 'halve',         color: '#f093fb', emoji: '½'  });
  add(2, { type: CARD_TYPES.RISK,   nameKey: 'card.allLose10',   effect: 'allLose10',     color: '#764ba2', emoji: '☠️' });

  // ── Action Cards (10) ────────────────────────────
  add(2, { type: CARD_TYPES.ACTION, nameKey: 'card.steal',       effect: 'steal',         target: 'player', color: '#f5576c', emoji: '🎴' });
  add(1, { type: CARD_TYPES.ACTION, nameKey: 'card.swapHands',   effect: 'swapHands',     target: 'player', color: '#f093fb', emoji: '🔀' });
  add(2, { type: CARD_TYPES.ACTION, nameKey: 'card.swapOne',     effect: 'swapOne',       target: 'player', color: '#fa709a', emoji: '↔️'  });
  add(2, { type: CARD_TYPES.ACTION, nameKey: 'card.skip',        effect: 'skip',          target: 'player', color: '#764ba2', emoji: '⏭️' });
  add(1, { type: CARD_TYPES.ACTION, nameKey: 'card.reverse',     effect: 'reverse',       target: 'all',    color: '#667eea', emoji: '⏪' });
  add(2, { type: CARD_TYPES.ACTION, nameKey: 'card.blockAbility',effect: 'blockAbility',  target: 'player', color: '#4facfe', emoji: '🛡️' });

  // ── Chaos Cards (6) ──────────────────────────────
  add(1, { type: CARD_TYPES.CHAOS,  nameKey: 'card.passLeft',    effect: 'passLeft',      color: '#f9d423', emoji: '👈' });
  add(1, { type: CARD_TYPES.CHAOS,  nameKey: 'card.randomDiscard', effect: 'randomDiscard', color: '#f83600', emoji: '🗑️' });
  add(1, { type: CARD_TYPES.CHAOS,  nameKey: 'card.shuffleScores', effect: 'shuffleScores', color: '#43e97b', emoji: '🔀' });
  add(1, { type: CARD_TYPES.CHAOS,  nameKey: 'card.mirrorScore', effect: 'mirrorScore',   color: '#00f2fe', emoji: '🪞' });
  add(1, { type: CARD_TYPES.CHAOS,  nameKey: 'card.forcedDraw2', effect: 'forcedDraw2',   color: '#fee140', emoji: '🃏' });
  add(1, { type: CARD_TYPES.CHAOS,  nameKey: 'card.scoreLock',   effect: 'scoreLock',     color: '#b0b0b8', emoji: '🔒' });

  return cards; // 40 total
}

function shuffleDeck(deck) {
  var arr = deck.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function dealCards(deck, playerCount, handSize) {
  handSize = handSize || 5;
  var hands = [];
  for (var p = 0; p < playerCount; p++) hands.push([]);
  for (var c = 0; c < handSize; c++) {
    for (var pp = 0; pp < playerCount; pp++) {
      if (deck.length) hands[pp].push(deck.shift());
    }
  }
  return hands;
}

/**
 * Apply a card effect to the game state.
 * Returns { log: string }
 */
function applyCardEffect(card, game, actingPlayer, targetPlayerId) {
  var log = '';
  var scoreLocked = game.scoreLocked;

  switch (card.type) {
    // ── Score ─────────────────────────────────────────
    case CARD_TYPES.SCORE:
      if (scoreLocked) { log = t('effect.scoreLocked'); break; }
      var bonus = 0;
      if (actingPlayer.lumoBonus) { bonus = 10; actingPlayer.lumoBonus = false; }
      actingPlayer.score += card.value + bonus;
      log = t('effect.scored', { name: actingPlayer.name, v: card.value + bonus, total: actingPlayer.score });
      break;

    // ── Risk ──────────────────────────────────────────
    case CARD_TYPES.RISK:
      if (scoreLocked && card.effect !== 'allLose10') { log = t('effect.effectBlocked'); break; }
      switch (card.effect) {
        case 'double':
          actingPlayer.score *= 2;
          log = t('effect.double', { name: actingPlayer.name, v: actingPlayer.score });
          break;
        case 'lose20':
          actingPlayer.score -= 20;
          log = t('effect.lose20', { name: actingPlayer.name, v: actingPlayer.score });
          break;
        case 'reset':
          actingPlayer.score = 0;
          log = t('effect.reset', { name: actingPlayer.name });
          break;
        case 'halve':
          actingPlayer.score = Math.floor(actingPlayer.score / 2);
          log = t('effect.halve', { name: actingPlayer.name, v: actingPlayer.score });
          break;
        case 'allLose10':
          game.players.forEach(function(p){ p.score -= 10; });
          log = t('effect.allLose10');
          break;
      }
      break;

    // ── Action ────────────────────────────────────────
    case CARD_TYPES.ACTION: {
      var tgt = targetPlayerId ? game.players.find(function(p){ return p.id === targetPlayerId; }) : null;

      switch (card.effect) {
        case 'steal':
          if (!tgt || tgt.hand.length === 0) { log = t('effect.stealFail'); break; }
          var si = Math.floor(Math.random() * tgt.hand.length);
          var stolen = tgt.hand.splice(si, 1)[0];
          actingPlayer.hand.push(stolen);
          log = t('effect.steal', { name: actingPlayer.name, target: tgt.name });
          break;
        case 'swapHands':
          if (!tgt) { log = t('effect.swapHandsFail'); break; }
          var tmp2 = actingPlayer.hand; actingPlayer.hand = tgt.hand; tgt.hand = tmp2;
          log = t('effect.swapHands', { name: actingPlayer.name, target: tgt.name });
          break;
        case 'swapOne':
          if (!tgt || tgt.hand.length === 0 || actingPlayer.hand.length === 0) { log = t('effect.swapOneFail'); break; }
          var myI = Math.floor(Math.random() * actingPlayer.hand.length);
          var theirI = Math.floor(Math.random() * tgt.hand.length);
          var mc = actingPlayer.hand[myI]; actingPlayer.hand[myI] = tgt.hand[theirI]; tgt.hand[theirI] = mc;
          log = t('effect.swapOne', { name: actingPlayer.name, target: tgt.name });
          break;
        case 'skip':
          if (!tgt) { log = t('effect.skipFail'); break; }
          tgt.skipNext = true;
          log = t('effect.skip', { target: tgt.name });
          break;
        case 'reverse':
          game.turnDirection *= -1;
          log = t('effect.reverse');
          break;
        case 'blockAbility':
          if (!tgt) { log = t('effect.blockFail'); break; }
          tgt.abilityBlocked = true;
          log = t('effect.blockAbility', { target: tgt.name });
          break;
      }
      break;
    }

    // ── Chaos ─────────────────────────────────────────
    case CARD_TYPES.CHAOS:
      switch (card.effect) {
        case 'passLeft': {
          var n = game.players.length;
          var first = game.players[0].hand.slice();
          for (var ci = 0; ci < n - 1; ci++) {
            game.players[ci].hand = game.players[ci + 1].hand.slice();
          }
          game.players[n - 1].hand = first;
          log = t('effect.passLeft');
          break;
        }
        case 'randomDiscard': {
          game.players.forEach(function(p) {
            if (p.hand.length) {
              var ri = Math.floor(Math.random() * p.hand.length);
              game.discardPile.push(p.hand.splice(ri, 1)[0]);
            }
          });
          log = t('effect.randomDiscard');
          break;
        }
        case 'shuffleScores': {
          var scores = game.players.map(function(p){ return p.score; });
          scores = shuffleDeck(scores);
          game.players.forEach(function(p, i){ p.score = scores[i]; });
          log = t('effect.shuffleScores');
          break;
        }
        case 'mirrorScore': {
          var max = Math.max.apply(null, game.players.map(function(p){ return p.score; }));
          var half = Math.floor(max / 2);
          actingPlayer.score += half;
          log = t('effect.mirrorScore', { name: actingPlayer.name, v: half });
          break;
        }
        case 'forcedDraw2':
          game.players.forEach(function(p) {
            for (var fd = 0; fd < 2; fd++) {
              if (game.deck.length) p.hand.push(game.deck.shift());
            }
          });
          log = t('effect.forcedDraw2');
          break;
        case 'scoreLock':
          game.scoreLocked = true;
          game.scoreLockTurns = 1;
          log = t('effect.scoreLockOn');
          break;
      }
      break;
  }

  return { log: log };
}
