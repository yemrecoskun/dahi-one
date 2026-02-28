/**
 * DAHIS: Five Forces
 * characters.js – Character definitions and ability logic
 *
 * Localized display strings (title, ability.name, ability.desc) are resolved
 * lazily via t() so they always reflect the current language.
 */
'use strict';

var CHARACTERS = {
  aura: {
    id: 'aura',
    name: 'Aura',
    get title()          { return t('char.aura.title'); },
    color: '#4facfe',
    gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)',
    emoji: '🔵',
    ability: {
      get name() { return t('char.aura.ability'); },
      get desc() { return t('char.aura.desc'); },
      once: true
    }
  },
  lumo: {
    id: 'lumo',
    name: 'Lumo',
    get title()          { return t('char.lumo.title'); },
    color: '#fee140',
    gradient: 'linear-gradient(135deg,#f9d423,#f83600)',
    emoji: '🟡',
    ability: {
      get name() { return t('char.lumo.ability'); },
      get desc() { return t('char.lumo.desc'); },
      once: true
    }
  },
  zest: {
    id: 'zest',
    name: 'Zest',
    get title()          { return t('char.zest.title'); },
    color: '#fa709a',
    gradient: 'linear-gradient(135deg,#fa709a,#fee140)',
    emoji: '🟠',
    ability: {
      get name() { return t('char.zest.ability'); },
      get desc() { return t('char.zest.desc'); },
      once: true
    }
  },
  puls: {
    id: 'puls',
    name: 'Puls',
    get title()          { return t('char.puls.title'); },
    color: '#ff4444',
    gradient: 'linear-gradient(135deg,#ff4444,#ff9944)',
    emoji: '🔴',
    ability: {
      get name() { return t('char.puls.ability'); },
      get desc() { return t('char.puls.desc'); },
      once: true
    }
  },
  vigo: {
    id: 'vigo',
    name: 'Vigo',
    get title()          { return t('char.vigo.title'); },
    color: '#43e97b',
    gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    emoji: '🟢',
    ability: {
      get name() { return t('char.vigo.ability'); },
      get desc() { return t('char.vigo.desc'); },
      once: true
    }
  }
};

/**
 * Execute a character ability.
 * Returns { success, message, pendingAction }
 */
function executeAbility(character, game, actingPlayer) {
  var cid = character.id;
  var result = { success: false, message: '', pendingAction: null };

  if (actingPlayer.abilityUsed) {
    result.message = t('ability.alreadyUsed');
    return result;
  }

  switch (cid) {
    case 'aura':
      var top3 = game.deck.slice(0, 3);
      if (top3.length === 0) {
        result.message = t('ability.deckEmpty');
        return result;
      }
      result.success = true;
      result.pendingAction = { type: 'foresight', cards: top3 };
      result.message = t('ability.aura.prompt');
      break;

    case 'lumo':
      actingPlayer.lumoBonus = true;
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = t('ability.lumo');
      break;

    case 'zest':
      actingPlayer.zestDoubleTarget = true;
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = t('ability.zest');
      break;

    case 'puls':
      var others = game.players.filter(function(p){ return p.id !== actingPlayer.id; });
      if (others.length === 0 || actingPlayer.hand.length === 0) {
        result.message = t('ability.noTarget');
        return result;
      }
      result.success = true;
      result.pendingAction = { type: 'precisionSwap', others: others.map(function(p){ return p.id; }) };
      result.message = t('ability.puls.prompt');
      break;

    case 'vigo':
      var targets = game.players.filter(function(p){ return p.id !== actingPlayer.id && p.hand.length > 0; });
      if (targets.length === 0) {
        result.message = t('ability.noSteal');
        return result;
      }
      result.success = true;
      result.pendingAction = { type: 'silentTheft', targets: targets.map(function(p){ return p.id; }) };
      result.message = t('ability.vigo.prompt');
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
      var chosen = game.deck.splice(choice.cardIndex, 1)[0];
      actingPlayer.hand.push(chosen);
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = t('ability.aura.took', { card: chosen.name });
      break;

    case 'puls':
      var target = game.players.find(function(p){ return p.id === choice.targetPlayerId; });
      if (!target) { result.message = t('ability.noTarget2'); return result; }
      var myCard = actingPlayer.hand.splice(choice.myCardIndex, 1)[0];
      var theirCard = target.hand.splice(choice.theirCardIndex, 1)[0];
      actingPlayer.hand.push(theirCard);
      target.hand.push(myCard);
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = t('ability.puls.done', { name: target.name });
      break;

    case 'vigo':
      var victim = game.players.find(function(p){ return p.id === choice.targetPlayerId; });
      if (!victim || victim.hand.length === 0) { result.message = t('ability.noCards'); return result; }
      var randIdx = Math.floor(Math.random() * victim.hand.length);
      var stolenCard = victim.hand.splice(randIdx, 1)[0];
      actingPlayer.hand.push(stolenCard);
      actingPlayer.abilityUsed = true;
      result.success = true;
      result.message = t('ability.vigo.done', { name: victim.name });
      break;

    default:
      result.message = 'Nothing to resolve.';
  }
  return result;
}
