/**
 * DAHIS: Five Forces
 * i18n.js – TR / EN localization
 *
 * Usage:
 *   t('key')           → translated string
 *   t('key', {n: 5})   → string with {n} replaced
 *   I18n.setLang('tr') → switch language
 *   I18n.getLang()     → current language code
 */
'use strict';

var I18n = (function () {

  var STORAGE_KEY = 'ff_lang';
  var _lang = localStorage.getItem(STORAGE_KEY) ||
              (navigator.language || '').startsWith('tr') ? 'tr' : 'en';

  var STRINGS = {
    en: {
      // ── Lobby ────────────────────────────────────────────────
      'lobby.subtitle':       'Strategic · Turn-based · Card Game',
      'lobby.back':           '← dahis.io',
      'lobby.step1.title':    'How many players?',
      'lobby.step1.note':     'Non-human slots filled by AI.',
      'lobby.step1.how':      'Play on one device. Human players take turns on the same screen; AI plays automatically when it\'s their turn.',
      'lobby.step2.title':    'Name your players',
      'lobby.step3.title':    'Choose characters',
      'lobby.step3.pick':     '{name}, choose your character:',
      'lobby.step4.title':    'Ready to play?',
      'lobby.btn.next':       'Next →',
      'lobby.btn.start':      'Start Game →',
      'lobby.player.label':   'Player {n}',
      'lobby.player.placeholder': 'Enter name…',
      'lobby.taken':          'Taken',
      'lobby.deck.title':     'The 40-Card Deck',
      'lobby.rules.title':    'How to Play',
      'lobby.rules.1':        '<strong>Draw</strong> a card from the deck.',
      'lobby.rules.2':        '<strong>Play</strong> one card from your hand.',
      'lobby.rules.3':        'Optionally <strong>use your character ability</strong> (once per turn).',
      'lobby.rules.4':        '<strong>End your turn.</strong> Hand limit: 7 cards.',
      'lobby.rules.note1':    'Game ends when the deck is empty or 12 rounds pass. Highest score wins.',
      'lobby.rules.note2':    '<strong>⚔️ Betrayal Token</strong> – cancel an opponent\'s card instantly (once per game; you skip playing that turn).',
      'lobby.legend.score':   'Score Cards',
      'lobby.legend.risk':    'Risk Cards',
      'lobby.legend.action':  'Action Cards',
      'lobby.legend.chaos':   'Chaos Cards',
      'lobby.mode.title':     'How do you want to play?',
      'lobby.mode.local':     'Local',
      'lobby.mode.local_desc': 'Same device',
      'lobby.mode.online':    'Online',
      'lobby.mode.online_desc': 'Create or join a room',
      'lobby.mode.online_config': 'Configure Firebase in ff-config.js to play online.',
      'lobby.online.create':  'Create room',
      'lobby.online.join':    'Join with code',
      'lobby.online.your_name': 'Your name',
      'lobby.online.room_code': 'Room code (6 characters)',
      'lobby.online.do_create': 'Create room',
      'lobby.online.do_join':  'Join room',
      'lobby.online.share':   'Share link',
      'lobby.online.copy':    'Copy',
      'lobby.online.players': 'Players in room',
      'lobby.online.waiting': 'Waiting for host to start…',
      'lobby.online.redirecting': 'Game started! Redirecting…',
      'lobby.online.leave':   'Leave room',
      'lobby.online.min_players': 'At least 2 players to start.',
      'lobby.online.invalid_code': 'Enter 6-character code',
      'lobby.online.room_not_found': 'Room not found',
      'lobby.online.available_rooms': 'Available rooms',
      'lobby.online.refresh': 'Refresh',
      'lobby.online.no_rooms': 'No rooms yet. Create one!',
      'lobby.online.or_enter_code': 'Or enter room code',
      'lobby.online.room_password_optional': 'Room password (optional)',
      'lobby.online.room_password_placeholder': 'Leave empty for no password',
      'lobby.online.room_password_required': 'Room password',
      'lobby.online.continue': 'Continue',
      'lobby.online.room_has_password': 'Password protected',
      'lobby.online.new_room': 'New room',
      'lobby.online.search_code': 'Search by code',
      'lobby.online.back': '← Back',

      // ── Game UI ──────────────────────────────────────────────
      'game.back':            '← Lobby',
      'game.panel.score':     'Scoreboard',
      'game.panel.log':       'Event Log',
      'game.pick_character':  'Pick your character',
      'game.hand.title':      'Your Hand',
      'game.hand.empty':      'No cards in hand.',
      'game.deck.label':      'cards',
      'game.discard.empty':   'discard',
      'game.round':           'Round {r}/12  ·  {name}\'s turn',
      'game.round.lock':      '  🔒 Score Lock',
      'game.status.myturn':   '▶ Your turn — {phase}',
      'game.status.waiting':  '⏳ Waiting for {name}…',
      'game.status.waitingCharacters': 'Waiting for everyone to pick a character…',
      'game.phase.draw':      'Draw a card',
      'game.phase.play':      'Play a card from your hand',
      'game.phase.ability':   'Use ability or end turn',
      'game.btn.draw':        'Draw Card',
      'game.btn.ability':     'Use Ability: {name}',
      'game.btn.end':         'End Turn',
      'game.btn.betray':      '⚔️ Betray',
      'game.passDevice':      'Pass the device to the next player.',
      'game.passDeviceBtn':   'Next: {name} →',
      'game.you':             '(you)',
      'game.modal.target':    'Choose a target',
      'game.modal.cancel':    'Cancel',
      'game.modal.foresight': 'Foresight – Choose a card',
      'game.modal.precSwap':  'Precision Swap – Choose a target player',
      'game.modal.theft':     'Silent Theft – Choose a victim',
      'game.over.title':      'Game Over',
      'game.over.wins':       '{name} wins!',
      'game.over.points':     '{n} points',
      'game.over.again':      'Play Again',
      'game.score.used':      'used',
      'game.score.avail':     'ability',

      // ── Card names ───────────────────────────────────────────
      'card.10':              '+10',
      'card.20':              '+20',
      'card.30':              '+30',
      'card.40':              '+40',
      'card.double':          'Double Score',
      'card.lose20':          'Lose 20',
      'card.reset':           'Reset Score',
      'card.halve':           'Halve Score',
      'card.allLose10':       'All Lose 10',
      'card.steal':           'Steal Card',
      'card.swapHands':       'Swap Hands',
      'card.swapOne':         'Swap One',
      'card.skip':            'Skip Turn',
      'card.reverse':         'Reverse',
      'card.blockAbility':    'Block Ability',
      'card.passLeft':        'Pass Left',
      'card.randomDiscard':   'Random Discard',
      'card.shuffleScores':   'Shuffle Scores',
      'card.mirrorScore':     'Mirror Score',
      'card.forcedDraw2':     'Forced Draw ×2',
      'card.scoreLock':       'Score Lock',

      // ── Card types (display labels) ──────────────────────────
      'type.score':           'score',
      'type.risk':            'risk',
      'type.action':          'action',
      'type.chaos':           'chaos',

      // ── Character titles ─────────────────────────────────────
      'char.aura.title':       'The Analyst',
      'char.lumo.title':       'The Amplifier',
      'char.zest.title':       'The Chaotic',
      'char.puls.title':       'The Strategist',
      'char.vigo.title':       'The Silent',

      // ── Character ability names ──────────────────────────────
      'char.aura.ability':     'Foresight',
      'char.lumo.ability':     'Amplify',
      'char.zest.ability':     'Chaos Shift',
      'char.puls.ability':     'Precision Swap',
      'char.vigo.ability':     'Silent Theft',

      // ── Character ability descriptions ───────────────────────
      'char.aura.desc':        'Look at the top 3 cards of the deck and choose one. Return the others.',
      'char.lumo.desc':        'Add +10 bonus to any score card played this turn.',
      'char.zest.desc':        'When playing an action card, apply its effect to an additional target.',
      'char.puls.desc':        'Secretly swap one card in your hand with another player\'s card.',
      'char.vigo.desc':        'Steal a random card from another player.',

      // ── Game log messages ────────────────────────────────────
      'log.start':             'Game started! {n} players, {deck} cards remaining.',
      'log.waitingCharacters': 'Waiting for everyone to pick a character…',
      'log.drew':              '{name} drew a card. ({deck} left)',
      'log.handFull':          '{name}\'s hand is full – drawn card discarded.',
      'log.round':             '=== Round {n} ===',
      'log.plays':             '{name} plays {card}. {effect}',
      'log.zestShift':         'Chaos Shift: {effect}',
      'log.betray':            '{who} uses Betrayal Token! {target}\'s card is cancelled!',
      'log.skip':              '{name}\'s turn is skipped!',
      'log.over':              '🏆 Game over! Winner: {name} with {score} points!',
      'log.abilityUsed':       '{name} uses {ability}. {msg}',

      // ── Ability messages ─────────────────────────────────────
      'ability.aura.prompt':   'Foresight: choose one of the top 3 cards.',
      'ability.aura.took':     'Foresight: you took {card}.',
      'ability.lumo':          'Amplify active: next score card +10.',
      'ability.zest':          'Chaos Shift active: next action card hits two targets.',
      'ability.puls.prompt':   'Precision Swap: choose your card and a target player.',
      'ability.puls.done':     'Precision Swap: swapped secretly with {name}.',
      'ability.vigo.prompt':   'Silent Theft: choose a player to steal from.',
      'ability.vigo.done':     'Silent Theft: stole a card from {name}.',
      'ability.blocked':       'Your ability is blocked this turn!',
      'ability.alreadyUsed':   'Ability already used this game.',
      'ability.noTarget':      'No valid swap targets.',
      'ability.noSteal':       'No players have cards to steal.',
      'ability.deckEmpty':     'Deck is empty.',
      'ability.noTarget2':     'Target not found.',
      'ability.noCards':       'Target has no cards.',

      // ── Effect messages ──────────────────────────────────────
      'effect.scored':         '{name} scored {v}! (Total: {total})',
      'effect.scoreLocked':    'Score Lock active – no score change!',
      'effect.effectBlocked':  'Score Lock active – effect blocked!',
      'effect.double':         '{name}\'s score doubled! ({v})',
      'effect.lose20':         '{name} loses 20! ({v})',
      'effect.reset':          '{name}\'s score reset to 0!',
      'effect.halve':          '{name}\'s score halved! ({v})',
      'effect.allLose10':      'All players lose 10!',
      'effect.steal':          '{name} stole a card from {target}!',
      'effect.stealFail':      'Steal failed: no target or empty hand.',
      'effect.swapHands':      '{name} swapped hands with {target}!',
      'effect.swapHandsFail':  'Swap Hands failed: no target.',
      'effect.swapOne':        '{name} swapped a card with {target}!',
      'effect.swapOneFail':    'Swap One failed.',
      'effect.skip':           '{target}\'s next turn will be skipped!',
      'effect.skipFail':       'Skip failed: no target.',
      'effect.reverse':        'Turn order reversed!',
      'effect.blockAbility':   '{target}\'s ability is blocked next turn!',
      'effect.blockFail':      'Block failed: no target.',
      'effect.passLeft':       'Everyone passed one card to the left!',
      'effect.randomDiscard':  'Random Discard: everyone lost a card!',
      'effect.shuffleScores':  'Shuffle Scores: all scores randomized!',
      'effect.mirrorScore':    '{name} mirrors half the highest score (+{v})!',
      'effect.forcedDraw2':    'Forced Draw ×2: everyone draws 2 cards!',
      'effect.scoreLockOn':    'Score Lock: no score changes this round!',

      // ── Errors ───────────────────────────────────────────────
      'err.gameOver':          'Game over.',
      'err.notFound':          'Player not found.',
      'err.notYourTurn':       'Not your turn.',
      'err.notDrawPhase':      'Not draw phase.',
      'err.notPlayPhase':      'Not play phase.',
      'err.notAbilityPhase':   'Not ability phase.',
      'err.noCard':            'Card not in hand.',
      'err.noBetrayal':        'Betrayal Token already used.',
      'err.selfBetray':        'Cannot betray on your own turn.',
      'err.betrayPhase':       'Can only betray during play phase.',
      'err.noPending':         'No pending ability for this player.'
    },

    tr: {
      // ── Lobi ─────────────────────────────────────────────────
      'lobby.subtitle':       'Stratejik · Sıra tabanlı · Kart Oyunu',
      'lobby.back':           '← dahis.io',
      'lobby.step1.title':    'Kaç oyuncu?',
      'lobby.step1.note':     'Boş slotlar yapay zeka ile doldurulur.',
      'lobby.step1.how':      'Oyun tek cihazda oynanır. Gerçek oyuncular sırayla aynı ekrandan oynar; yapay zeka kendi sırasında otomatik oynar.',
      'lobby.step2.title':    'Oyuncu isimlerini girin',
      'lobby.step3.title':    'Karakter seçin',
      'lobby.step3.pick':     '{name}, karakterini seç:',
      'lobby.step4.title':    'Oynamaya hazır mısın?',
      'lobby.btn.next':       'Devam →',
      'lobby.btn.start':      'Oyunu Başlat →',
      'lobby.player.label':   'Oyuncu {n}',
      'lobby.player.placeholder': 'İsim girin…',
      'lobby.taken':          'Seçildi',
      'lobby.deck.title':     '40 Kartlık Deste',
      'lobby.rules.title':    'Nasıl Oynanır?',
      'lobby.rules.1':        'Desteden bir kart <strong>çek</strong>.',
      'lobby.rules.2':        'Elindeki bir kartı <strong>oyna</strong>.',
      'lobby.rules.3':        'İsteğe bağlı olarak <strong>karakter yeteneğini kullan</strong> (her turda bir kez).',
      'lobby.rules.4':        '<strong>Turunu sonlandır.</strong> El limiti: 7 kart.',
      'lobby.rules.note1':    'Deste bittiğinde veya 12 tur geçtiğinde oyun sona erer. En yüksek puana sahip oyuncu kazanır.',
      'lobby.rules.note2':    '<strong>⚔️ İhanet Jetonu</strong> – rakibinin kart etkisini anında iptal et (oyun başına bir kez; o turda kart oynayamazsın).',
      'lobby.legend.score':   'Puan Kartları',
      'lobby.legend.risk':    'Risk Kartları',
      'lobby.legend.action':  'Aksiyon Kartları',
      'lobby.legend.chaos':   'Kaos Kartları',
      'lobby.mode.title':     'Nasıl oynamak istersin?',
      'lobby.mode.local':     'Yerel',
      'lobby.mode.local_desc': 'Aynı cihaz',
      'lobby.mode.online':    'Çevrimiçi',
      'lobby.mode.online_desc': 'Oda oluştur veya koda katıl',
      'lobby.mode.online_config': 'Çevrimiçi oynamak için ff-config.js içinde Firebase yapılandırın.',
      'lobby.online.create':  'Oda oluştur',
      'lobby.online.join':    'Kodla katıl',
      'lobby.online.your_name': 'Adın',
      'lobby.online.room_code': 'Oda kodu (6 karakter)',
      'lobby.online.do_create': 'Oda oluştur',
      'lobby.online.do_join':  'Odaya katıl',
      'lobby.online.share':   'Linki paylaş',
      'lobby.online.copy':    'Kopyala',
      'lobby.online.players': 'Odadaki oyuncular',
      'lobby.online.waiting': 'Oyun başlaması bekleniyor…',
      'lobby.online.redirecting': 'Oyun başladı! Yönlendiriliyorsunuz…',
      'lobby.online.leave':   'Odadan ayrıl',
      'lobby.online.min_players': 'Başlamak için en az 2 oyuncu gerekli.',
      'lobby.online.invalid_code': '6 karakterlik kodu girin',
      'lobby.online.room_not_found': 'Oda bulunamadı',
      'lobby.online.available_rooms': 'Mevcut odalar',
      'lobby.online.refresh': 'Yenile',
      'lobby.online.no_rooms': 'Henüz oda yok. Bir tane oluştur!',
      'lobby.online.or_enter_code': 'Veya oda kodunu gir',
      'lobby.online.room_password_optional': 'Oda şifresi (isteğe bağlı)',
      'lobby.online.room_password_placeholder': 'Şifresiz bırakmak için boş bırak',
      'lobby.online.room_password_required': 'Oda şifresi',
      'lobby.online.continue': 'Devam',
      'lobby.online.room_has_password': 'Şifre korumalı',
      'lobby.online.new_room': 'Yeni oda oluştur',
      'lobby.online.search_code': 'Oda kodu arat',
      'lobby.online.back': '← Geri',

      // ── Oyun arayüzü ─────────────────────────────────────────
      'game.back':            '← Lobi',
      'game.panel.score':     'Skor Tablosu',
      'game.panel.log':       'Olay Günlüğü',
      'game.pick_character':  'Karakterini seç',
      'game.hand.title':      'Elindeki Kartlar',
      'game.hand.empty':      'Elde kart yok.',
      'game.deck.label':      'kart',
      'game.discard.empty':   'atık',
      'game.round':           'Tur {r}/12  ·  {name} oynuyor',
      'game.round.lock':      '  🔒 Puan Kilidi',
      'game.status.myturn':   '▶ Senin turun — {phase}',
      'game.status.waiting':  '⏳ {name} bekleniyor…',
      'game.status.waitingCharacters': 'Herkesin karakter seçmesi bekleniyor…',
      'game.phase.draw':      'Desteden kart çek',
      'game.phase.play':      'Elindeki bir kartı oyna',
      'game.phase.ability':   'Yetenek kullan ya da turu bitir',
      'game.btn.draw':        'Kart Çek',
      'game.btn.ability':     'Yetenek Kullan: {name}',
      'game.btn.end':         'Turu Bitir',
      'game.btn.betray':      '⚔️ İhanet Et',
      'game.passDevice':      'Cihazı sıradaki oyuncuya verin.',
      'game.passDeviceBtn':   'Sıradaki oyuncuya geç: {name} →',
      'game.you':             '(sen)',
      'game.modal.target':    'Hedef seçin',
      'game.modal.cancel':    'İptal',
      'game.modal.foresight': 'Öngörü – Bir kart seçin',
      'game.modal.precSwap':  'Hassas Takas – Hedef oyuncu seç',
      'game.modal.theft':     'Sessiz Hırsızlık – Kurban seç',
      'game.over.title':      'Oyun Bitti',
      'game.over.wins':       '{name} kazandı!',
      'game.over.points':     '{n} puan',
      'game.over.again':      'Tekrar Oyna',
      'game.score.used':      'kullanıldı',
      'game.score.avail':     'yetenek',

      // ── Kart isimleri ────────────────────────────────────────
      'card.10':              '+10',
      'card.20':              '+20',
      'card.30':              '+30',
      'card.40':              '+40',
      'card.double':          'Skoru İkile',
      'card.lose20':          '20 Puan Kaybet',
      'card.reset':           'Skor Sıfırla',
      'card.halve':           'Skoru Yarıla',
      'card.allLose10':       'Herkes 10 Kaybeder',
      'card.steal':           'Kart Çal',
      'card.swapHands':       'El Değiştir',
      'card.swapOne':         'Tek Kart Değiştir',
      'card.skip':            'Tur Atla',
      'card.reverse':         'Sıra Tersine',
      'card.blockAbility':    'Yetenek Engelle',
      'card.passLeft':        'Sola Geçir',
      'card.randomDiscard':   'Rastgele At',
      'card.shuffleScores':   'Skorları Karıştır',
      'card.mirrorScore':     'Skoru Yansıt',
      'card.forcedDraw2':     'Zorla 2 Kart Çek',
      'card.scoreLock':       'Puan Kilidi',

      // ── Kart tipleri ─────────────────────────────────────────
      'type.score':           'puan',
      'type.risk':            'risk',
      'type.action':          'aksiyon',
      'type.chaos':           'kaos',

      // ── Karakter başlıkları ──────────────────────────────────
      'char.aura.title':       'Analist',
      'char.lumo.title':       'Yükseltici',
      'char.zest.title':       'Kaotik',
      'char.puls.title':       'Stratejist',
      'char.vigo.title':       'Sessiz',

      // ── Karakter yetenek isimleri ────────────────────────────
      'char.aura.ability':     'Öngörü',
      'char.lumo.ability':     'Güçlendir',
      'char.zest.ability':     'Kaos Kayması',
      'char.puls.ability':     'Hassas Takas',
      'char.vigo.ability':     'Sessiz Hırsızlık',

      // ── Karakter yetenek açıklamaları ────────────────────────
      'char.aura.desc':        'Destenin üstündeki 3 kartı gör ve birini seç. Diğerlerini geri koy.',
      'char.lumo.desc':        'Bu turda oynadığın herhangi bir puan kartına +10 bonus ekle.',
      'char.zest.desc':        'Aksiyon kartı oynarken etkisini ek bir hedefe de uygula.',
      'char.puls.desc':        'Elindeki bir kartı gizlice başka bir oyuncunun kartıyla değiştir.',
      'char.vigo.desc':        'Başka bir oyuncudan rastgele bir kart çal.',

      // ── Oyun günlüğü mesajları ───────────────────────────────
      'log.start':             'Oyun başladı! {n} oyuncu, {deck} kart kaldı.',
      'log.waitingCharacters': 'Herkesin karakter seçmesi bekleniyor…',
      'log.drew':              '{name} kart çekti. ({deck} kaldı)',
      'log.handFull':          '{name}\'nin eli dolu – çekilen kart atıldı.',
      'log.round':             '=== Tur {n} ===',
      'log.plays':             '{name} {card} oynadı. {effect}',
      'log.zestShift':         'Kaos Kayması: {effect}',
      'log.betray':            '{who} İhanet Jetonu kullandı! {target}\'nin kartı iptal edildi!',
      'log.skip':              '{name}\'nin turu atlandı!',
      'log.over':              '🏆 Oyun bitti! Kazanan: {name}, {score} puan!',
      'log.abilityUsed':       '{name} {ability} kullandı. {msg}',

      // ── Yetenek mesajları ────────────────────────────────────
      'ability.aura.prompt':   'Öngörü: üstteki 3 karttan birini seç.',
      'ability.aura.took':     'Öngörü: {card} kartını aldın.',
      'ability.lumo':          'Güçlendir aktif: sıradaki puan kartı +10.',
      'ability.zest':          'Kaos Kayması aktif: sıradaki aksiyon kartı iki hedefe isabet eder.',
      'ability.puls.prompt':   'Hassas Takas: kartını ve hedef oyuncuyu seç.',
      'ability.puls.done':     'Hassas Takas: {name} ile gizlice takas edildi.',
      'ability.vigo.prompt':   'Sessiz Hırsızlık: kart çalmak istediğin oyuncuyu seç.',
      'ability.vigo.done':     'Sessiz Hırsızlık: {name}\'den kart çalındı.',
      'ability.blocked':       'Bu turda yeteneğin engellendi!',
      'ability.alreadyUsed':   'Yetenek bu oyunda zaten kullanıldı.',
      'ability.noTarget':      'Geçerli takas hedefi bulunamadı.',
      'ability.noSteal':       'Çalınacak kartı olan oyuncu yok.',
      'ability.deckEmpty':     'Deste boş.',
      'ability.noTarget2':     'Hedef bulunamadı.',
      'ability.noCards':       'Hedefin elinde kart yok.',

      // ── Etki mesajları ───────────────────────────────────────
      'effect.scored':         '{name} {v} puan kazandı! (Toplam: {total})',
      'effect.scoreLocked':    'Puan Kilidi aktif – puan değişmedi!',
      'effect.effectBlocked':  'Puan Kilidi aktif – etki engellendi!',
      'effect.double':         '{name}\'nin puanı ikiye katlandı! ({v})',
      'effect.lose20':         '{name} 20 puan kaybetti! ({v})',
      'effect.reset':          '{name}\'nin puanı 0\'a sıfırlandı!',
      'effect.halve':          '{name}\'nin puanı yarıya indi! ({v})',
      'effect.allLose10':      'Tüm oyuncular 10 puan kaybetti!',
      'effect.steal':          '{name}, {target}\'den kart çaldı!',
      'effect.stealFail':      'Çalma başarısız: hedef yok veya eli boş.',
      'effect.swapHands':      '{name}, {target} ile ellerini değiştirdi!',
      'effect.swapHandsFail':  'El Değiştir başarısız: hedef yok.',
      'effect.swapOne':        '{name}, {target} ile bir kart değiştirdi!',
      'effect.swapOneFail':    'Tek Kart Değiştir başarısız.',
      'effect.skip':           '{target}\'nin sıradaki turu atlanacak!',
      'effect.skipFail':       'Tur Atla başarısız: hedef yok.',
      'effect.reverse':        'Tur sırası tersine çevrildi!',
      'effect.blockAbility':   '{target}\'nin yeteneği bir sonraki turda engellendi!',
      'effect.blockFail':      'Engelleme başarısız: hedef yok.',
      'effect.passLeft':       'Herkes bir kartı sola geçirdi!',
      'effect.randomDiscard':  'Rastgele At: herkes bir kart kaybetti!',
      'effect.shuffleScores':  'Skorları Karıştır: tüm skorlar rastgele dağıtıldı!',
      'effect.mirrorScore':    '{name} en yüksek skorun yarısını yansıttı (+{v})!',
      'effect.forcedDraw2':    'Zorla 2 Kart Çek: herkes 2 kart çekti!',
      'effect.scoreLockOn':    'Puan Kilidi: bu turda puan değişmez!',

      // ── Hatalar ──────────────────────────────────────────────
      'err.gameOver':          'Oyun bitti.',
      'err.notFound':          'Oyuncu bulunamadı.',
      'err.notYourTurn':       'Senin turun değil.',
      'err.notDrawPhase':      'Kart çekme aşaması değil.',
      'err.notPlayPhase':      'Kart oynama aşaması değil.',
      'err.notAbilityPhase':   'Yetenek aşaması değil.',
      'err.noCard':            'Kart elde bulunamadı.',
      'err.noBetrayal':        'İhanet Jetonu zaten kullanıldı.',
      'err.selfBetray':        'Kendi turunda ihanet edemezsin.',
      'err.betrayPhase':       'İhanet yalnızca kart oynama aşamasında kullanılabilir.',
      'err.noPending':         'Bu oyuncu için bekleyen yetenek yok.'
    }
  };

  // ── Core translate function ──────────────────────────────────────────────────

  function t(key, vars) {
    var lang = _lang in STRINGS ? _lang : 'en';
    var str = (STRINGS[lang] && STRINGS[lang][key]) ||
              (STRINGS['en'] && STRINGS['en'][key]) ||
              key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  // ── Apply data-i18n attributes on page ──────────────────────────────────────

  function applyDOM() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var raw = el.getAttribute('data-i18n-html');
      if (raw === 'true') {
        el.innerHTML = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // Update html lang attribute
    document.documentElement.lang = _lang;
    // Persist button active state
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === _lang);
    });
  }

  // ── Language switcher ────────────────────────────────────────────────────────

  function setLang(lang) {
    if (!(lang in STRINGS)) return;
    _lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyDOM();
    // Dispatch event so dynamic JS renderers can re-render
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function getLang() { return _lang; }

  // ── Auto-init ────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    applyDOM();
    if (window.applyNavFooterI18n) window.applyNavFooterI18n();
    // Wire up any .lang-btn buttons already in the DOM
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setLang(btn.dataset.lang); });
    });
  });

  return { t: t, setLang: setLang, getLang: getLang, applyDOM: applyDOM };
})();

// Global shorthand
function t(key, vars) { return I18n.t(key, vars); }
