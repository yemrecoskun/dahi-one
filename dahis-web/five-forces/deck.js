/**
 * DAHIS: Five Forces
 * deck.js – Card definitions and deck management
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
      cards.push(Object.assign({}, tpl, { id: 'c' + (++id) }));
    }
  }

  // ── Score Cards (16) ──────────────────────────────
  add(6, { type: CARD_TYPES.SCORE, name: '+10',  value: 10,  color: '#43e97b', emoji: '✨' });
  add(5, { type: CARD_TYPES.SCORE, name: '+20',  value: 20,  color: '#4facfe', emoji: '⚡' });
  add(3, { type: CARD_TYPES.SCORE, name: '+30',  value: 30,  color: '#667eea', emoji: '💎' });
  add(2, { type: CARD_TYPES.SCORE, name: '+40',  value: 40,  color: '#fa709a', emoji: '🏆' });

  // ── Risk Cards (8) ────────────────────────────────
  add(2, { type: CARD_TYPES.RISK, name: 'Double Score',      effect: 'double',          color: '#fee140', emoji: '×2' });
  add(2, { type: CARD_TYPES.RISK, name: 'Lose 20',           effect: 'lose20',           color: '#f5576c', emoji: '💀' });
  add(1, { type: CARD_TYPES.RISK, name: 'Reset Score',        effect: 'reset',            color: '#ff4444', emoji: '🔄' });
  add(1, { type: CARD_TYPES.RISK, name: 'Halve Score',        effect: 'halve',            color: '#f093fb', emoji: '½'  });
  add(2, { type: CARD_TYPES.RISK, name: 'All Lose 10',        effect: 'allLose10',        color: '#764ba2', emoji: '☠️' });

  // ── Action Cards (10) ────────────────────────────
  add(2, { type: CARD_TYPES.ACTION, name: 'Steal Card',  effect: 'steal',       target: 'player', color: '#f5576c', emoji: '🎴' });
  add(1, { type: CARD_TYPES.ACTION, name: 'Swap Hands',  effect: 'swapHands',   target: 'player', color: '#f093fb', emoji: '🔀' });
  add(2, { type: CARD_TYPES.ACTION, name: 'Swap One',    effect: 'swapOne',     target: 'player', color: '#fa709a', emoji: '↔️'  });
  add(2, { type: CARD_TYPES.ACTION, name: 'Skip Turn',   effect: 'skip',        target: 'player', color: '#764ba2', emoji: '⏭️' });
  add(1, { type: CARD_TYPES.ACTION, name: 'Reverse',     effect: 'reverse',     target: 'all',    color: '#667eea', emoji: '⏪' });
  add(2, { type: CARD_TYPES.ACTION, name: 'Block Ability', effect: 'blockAbility', target: 'player', color: '#4facfe', emoji: '🛡️' });

  // ── Chaos Cards (6) ──────────────────────────────
  add(1, { type: CARD_TYPES.CHAOS, name: 'Pass Left',     effect: 'passLeft',    color: '#f9d423', emoji: '👈' });
  add(1, { type: CARD_TYPES.CHAOS, name: 'Random Discard', effect: 'randomDiscard', color: '#f83600', emoji: '🗑️' });
  add(1, { type: CARD_TYPES.CHAOS, name: 'Shuffle Scores', effect: 'shuffleScores', color: '#43e97b', emoji: '🔀' });
  add(1, { type: CARD_TYPES.CHAOS, name: 'Mirror Score',  effect: 'mirrorScore', color: '#00f2fe', emoji: '🪞' });
  add(1, { type: CARD_TYPES.CHAOS, name: 'Forced Draw ×2', effect: 'forcedDraw2', color: '#fee140', emoji: '🃏' });
  add(1, { type: CARD_TYPES.CHAOS, name: 'Score Lock',    effect: 'scoreLock',   color: '#b0b0b8', emoji: '🔒' });

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
 * Apply a card's effect to the game state.
 * Returns { log: string, needsTarget: bool, targetType: string }
 */
function applyCardEffect(card, game, actingPlayer, targetPlayerId) {
  var log = '';
  var scoreLocked = game.scoreLocked;

  switch (card.type) {
    // ── Score ─────────────────────────────────────────
    case CARD_TYPES.SCORE:
      if (scoreLocked) { log = 'Score Lock active – no score change!'; break; }
      var bonus = 0;
      if (actingPlayer.lumoBonus) { bonus = 10; actingPlayer.lumoBonus = false; }
      actingPlayer.score += card.value + bonus;
      log = actingPlayer.name + ' scored ' + (card.value + bonus) + '! (Total: ' + actingPlayer.score + ')';
      break;

    // ── Risk ──────────────────────────────────────────
    case CARD_TYPES.RISK:
      if (scoreLocked && card.effect !== 'allLose10') { log = 'Score Lock active – effect blocked!'; break; }
      switch (card.effect) {
        case 'double':
          actingPlayer.score *= 2;
          log = actingPlayer.name + '\'s score doubled! (' + actingPlayer.score + ')';
          break;
        case 'lose20':
          actingPlayer.score -= 20;
          log = actingPlayer.name + ' loses 20! (' + actingPlayer.score + ')';
          break;
        case 'reset':
          actingPlayer.score = 0;
          log = actingPlayer.name + '\'s score reset to 0!';
          break;
        case 'halve':
          actingPlayer.score = Math.floor(actingPlayer.score / 2);
          log = actingPlayer.name + '\'s score halved! (' + actingPlayer.score + ')';
          break;
        case 'allLose10':
          game.players.forEach(function(p){ p.score -= 10; });
          log = 'All players lose 10!';
          break;
      }
      break;

    // ── Action ────────────────────────────────────────
    case CARD_TYPES.ACTION: {
      var tgt = targetPlayerId ? game.players.find(function(p){ return p.id === targetPlayerId; }) : null;
      if ((card.effect === 'reverse' || card.effect === 'allLose10') && !tgt) tgt = null;

      switch (card.effect) {
        case 'steal':
          if (!tgt || tgt.hand.length === 0) { log = 'Steal failed: no target or empty hand.'; break; }
          var si = Math.floor(Math.random() * tgt.hand.length);
          var stolen = tgt.hand.splice(si, 1)[0];
          actingPlayer.hand.push(stolen);
          log = actingPlayer.name + ' stole a card from ' + tgt.name + '!';
          break;
        case 'swapHands':
          if (!tgt) { log = 'Swap Hands failed: no target.'; break; }
          var tmp2 = actingPlayer.hand; actingPlayer.hand = tgt.hand; tgt.hand = tmp2;
          log = actingPlayer.name + ' swapped hands with ' + tgt.name + '!';
          break;
        case 'swapOne':
          if (!tgt || tgt.hand.length === 0 || actingPlayer.hand.length === 0) { log = 'Swap One failed.'; break; }
          var myI = Math.floor(Math.random() * actingPlayer.hand.length);
          var theirI = Math.floor(Math.random() * tgt.hand.length);
          var mc = actingPlayer.hand[myI]; actingPlayer.hand[myI] = tgt.hand[theirI]; tgt.hand[theirI] = mc;
          log = actingPlayer.name + ' swapped a card with ' + tgt.name + '!';
          break;
        case 'skip':
          if (!tgt) { log = 'Skip failed: no target.'; break; }
          tgt.skipNext = true;
          log = tgt.name + '\'s next turn will be skipped!';
          break;
        case 'reverse':
          game.turnDirection *= -1;
          log = 'Turn order reversed!';
          break;
        case 'blockAbility':
          if (!tgt) { log = 'Block failed: no target.'; break; }
          tgt.abilityBlocked = true;
          log = tgt.name + '\'s ability is blocked next turn!';
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
          log = 'Everyone passed one card to the left!';
          break;
        }
        case 'randomDiscard': {
          game.players.forEach(function(p) {
            if (p.hand.length) {
              var ri = Math.floor(Math.random() * p.hand.length);
              game.discardPile.push(p.hand.splice(ri, 1)[0]);
            }
          });
          log = 'Random Discard: everyone lost a card!';
          break;
        }
        case 'shuffleScores': {
          var scores = game.players.map(function(p){ return p.score; });
          scores = shuffleDeck(scores);
          game.players.forEach(function(p, i){ p.score = scores[i]; });
          log = 'Shuffle Scores: all scores randomized!';
          break;
        }
        case 'mirrorScore': {
          var max = Math.max.apply(null, game.players.map(function(p){ return p.score; }));
          actingPlayer.score += Math.floor(max / 2);
          log = actingPlayer.name + ' mirrors half the highest score (+' + Math.floor(max / 2) + ')!';
          break;
        }
        case 'forcedDraw2':
          game.players.forEach(function(p) {
            for (var fd = 0; fd < 2; fd++) {
              if (game.deck.length) p.hand.push(game.deck.shift());
            }
          });
          log = 'Forced Draw ×2: everyone draws 2 cards!';
          break;
        case 'scoreLock':
          game.scoreLocked = true;
          game.scoreLockTurns = 1;
          log = 'Score Lock: no score changes this round!';
          break;
      }
      break;
  }

  return { log: log };
}
