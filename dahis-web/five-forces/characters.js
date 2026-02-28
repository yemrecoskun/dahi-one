/**
 * DAHIS: Five Forces
 * characters.js – Character definitions and ability logic
 */
'use strict';

var CHARACTERS = {
  aura: {
    id: 'aura',
    name: 'Aura',
    title: 'The Analyst',
    color: '#4facfe',
    gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)',
    emoji: '🔵',
    ability: {
      name: 'Foresight',
      desc: 'Look at the top 3 cards of the deck and choose one. Return the others.',
      once: true
    }
  },
  lumo: {
    id: 'lumo',
    name: 'Lumo',
    title: 'The Amplifier',
    color: '#fee140',
    gradient: 'linear-gradient(135deg,#f9d423,#f83600)',
    emoji: '🟡',
    ability: {
      name: 'Amplify',
      desc: 'Add +10 bonus to any score card played this turn.',
      once: true
    }
  },
  zest: {
    id: 'zest',
    name: 'Zest',
    title: 'The Chaotic',
    color: '#fa709a',
    gradient: 'linear-gradient(135deg,#fa709a,#fee140)',
    emoji: '🟠',
    ability: {
      name: 'Chaos Shift',
      desc: 'When playing an action card, apply its effect to an additional target.',
      once: true
    }
  },
  puls: {
    id: 'puls',
    name: 'Puls',
    title: 'The Strategist',
    color: '#ff4444',
    gradient: 'linear-gradient(135deg,#ff4444,#ff9944)',
    emoji: '🔴',
    ability: {
      name: 'Precision Swap',
      desc: 'Secretly swap one card in your hand with another player\'s card.',
      once: true
    }
  },
  vigo: {
    id: 'vigo',
    name: 'Vigo',
    title: 'The Silent',
    color: '#43e97b',
    gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    emoji: '🟢',
    ability: {
      name: 'Silent Theft',
      desc: 'Steal a random card from another player.',
      once: true
    }
  }
};

/**
 * Execute a character ability.
 * Returns { success, message, pendingAction }
 *   pendingAction: object describing UI interaction needed (if any)
 */
function executeAbility(character, game, actingPlayer) {
  var cid = character.id;
  var result = { success: false, message: '', pendingAction: null };

  if (actingPlayer.abilityUsed) {
    result.message = 'Ability already used this game.';
    return result;
  }

  switch (cid) {
    case 'aura':
      // Show top 3 cards, player picks one
      var top3 = game.deck.slice(0, 3);
      if (top3.length === 0) {
        result.message = 'Deck is empty.';
        return result;
      }
      result.success = true;
      result.pendingAction = { type: 'foresight', cards: top3 };
      result.message = 'Foresight: choose one of the top 3 cards.';
      break;

    case 'lumo':
      // Bonus is applied at score-card play time (flag on player)
      actingPlayer.lumoBonus = true;
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = 'Amplify active: next score card +10.';
      break;

    case 'zest':
      // Flag: next action card also targets a second target
      actingPlayer.zestDoubleTarget = true;
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = 'Chaos Shift active: next action card hits two targets.';
      break;

    case 'puls':
      // Need to pick a card from own hand and a target player hand slot
      var others = game.players.filter(function(p){ return p.id !== actingPlayer.id; });
      if (others.length === 0 || actingPlayer.hand.length === 0) {
        result.message = 'No valid swap targets.';
        return result;
      }
      result.success = true;
      result.pendingAction = { type: 'precisionSwap', others: others.map(function(p){ return p.id; }) };
      result.message = 'Precision Swap: choose your card and a target player.';
      break;

    case 'vigo':
      // Steal random card from chosen opponent
      var targets = game.players.filter(function(p){ return p.id !== actingPlayer.id && p.hand.length > 0; });
      if (targets.length === 0) {
        result.message = 'No players have cards to steal.';
        return result;
      }
      result.success = true;
      result.pendingAction = { type: 'silentTheft', targets: targets.map(function(p){ return p.id; }) };
      result.message = 'Silent Theft: choose a player to steal from.';
      break;

    default:
      result.message = 'Unknown character ability.';
  }
  return result;
}

/**
 * Resolve a pending ability action after player makes a UI choice.
 */
function resolveAbilityChoice(character, game, actingPlayer, choice) {
  var cid = character.id;
  var result = { success: false, message: '' };

  switch (cid) {
    case 'aura':
      // choice = { cardIndex } (index in top3)
      var chosen = game.deck.splice(choice.cardIndex, 1)[0];
      // Return others stays in deck (already untouched beyond index)
      actingPlayer.hand.push(chosen);
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = 'Foresight: you took ' + chosen.name + '.';
      break;

    case 'puls':
      // choice = { myCardIndex, targetPlayerId, theirCardIndex }
      var target = game.players.find(function(p){ return p.id === choice.targetPlayerId; });
      if (!target) { result.message = 'Target not found.'; return result; }
      var myCard = actingPlayer.hand.splice(choice.myCardIndex, 1)[0];
      var theirCard = target.hand.splice(choice.theirCardIndex, 1)[0];
      actingPlayer.hand.push(theirCard);
      target.hand.push(myCard);
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = 'Precision Swap: swapped secretly with ' + target.name + '.';
      break;

    case 'vigo':
      // choice = { targetPlayerId }
      var victim = game.players.find(function(p){ return p.id === choice.targetPlayerId; });
      if (!victim || victim.hand.length === 0) { result.message = 'Target has no cards.'; return result; }
      var randIdx = Math.floor(Math.random() * victim.hand.length);
      var stolenCard = victim.hand.splice(randIdx, 1)[0];
      actingPlayer.hand.push(stolenCard);
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = 'Silent Theft: stole a card from ' + victim.name + '.';
      break;

    default:
      result.message = 'Nothing to resolve.';
  }
  return result;
}
