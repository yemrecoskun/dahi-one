import { createDeck, shuffleDeck } from "./deck.js";
import { getCharacterById, CHARACTERS } from "./characters.js";

export const state = {
    players: [],
    deck: [],
    discard: [],
    turnIndex: 0,
    direction: 1,
    round: 1,
    maxRounds: 12,
    currentTurn: {
        drawn: false,
        played: false,
        abilityUsed: false,
        scoreLock: false,
        lumoBonus: false,
        extraTarget: false,
        pendingEffect: null
    },
    log: []
};

const resetTurn = () => {
    state.currentTurn = {
        drawn: false,
        played: false,
        abilityUsed: false,
        scoreLock: false,
        lumoBonus: false,
        extraTarget: false,
        pendingEffect: null
    };
};

export const initGame = (settings) => {
    const deck = shuffleDeck(createDeck());
    state.deck = deck;
    state.discard = [];
    state.turnIndex = 0;
    state.direction = 1;
    state.round = 1;
    state.log = [];

    state.players = Array.from({ length: settings.totalPlayers }).map((_, index) => {
        const isHuman = index < settings.humanPlayers;
        const selection = settings.selections.find((sel) => sel.playerIndex === index);
        const characterId = selection ? selection.characterId : CHARACTERS[index % CHARACTERS.length].id;
        const character = getCharacterById(characterId);
        return {
            id: index,
            name: isHuman ? `Player ${index + 1}` : `AI ${index + 1}`,
            isAI: !isHuman,
            character,
            score: 0,
            hand: [],
            betrayalToken: true,
            skipNextTurn: false,
            skipPlayNextTurn: false,
            abilityBlockedTurns: 0
        };
    });

    state.players.forEach((player) => {
        drawCard(player, 5);
    });
    resetTurn();
    logMessage("Game started. First turn: " + getCurrentPlayer().name);
};

export const getCurrentPlayer = () => state.players[state.turnIndex];

export const logMessage = (message) => {
    state.log.unshift({ message, id: Date.now() + Math.random() });
};

const enforceHandLimit = (player) => {
    while (player.hand.length > 7) {
        const removed = player.hand.splice(Math.floor(Math.random() * player.hand.length), 1)[0];
        state.discard.push(removed);
        logMessage(`${player.name} el limitini aştı, rastgele kart attı.`);
    }
};

export const drawCard = (player, count = 1) => {
    for (let i = 0; i < count; i += 1) {
        if (state.deck.length === 0) return;
        player.hand.push(state.deck.shift());
    }
    enforceHandLimit(player);
};

export const startTurn = () => {
    const player = getCurrentPlayer();
    resetTurn();
    if (player.skipNextTurn) {
        player.skipNextTurn = false;
        logMessage(`${player.name} bu turu atladı.`);
        endTurn();
        return;
    }
    if (player.skipPlayNextTurn) {
        logMessage(`${player.name} Betrayal nedeniyle kart oynayamaz.`);
    }
};

export const queuePlayCard = (player, card, targets = []) => {
    state.currentTurn.played = true;
    const pending = {
        playerId: player.id,
        card,
        targets
    };
    state.currentTurn.pendingEffect = pending;
    return pending;
};

export const resolvePendingEffect = (cancelledById = null) => {
    const pending = state.currentTurn.pendingEffect;
    if (!pending) return;

    const player = state.players[pending.playerId];
    const card = pending.card;

    state.discard.push(card);

    if (cancelledById !== null) {
        const canceller = state.players[cancelledById];
        if (canceller && canceller.betrayalToken) {
            canceller.betrayalToken = false;
            canceller.skipPlayNextTurn = true;
            logMessage(`${canceller.name} Betrayal kullandı. ${player.name} kartı iptal edildi.`);
        }
        state.currentTurn.pendingEffect = null;
        return;
    }

    applyCardEffect(player, card, pending.targets);
    state.currentTurn.pendingEffect = null;
};

const addScore = (player, amount) => {
    if (state.currentTurn.scoreLock) return;
    player.score = Math.max(0, player.score + amount);
};

const applyCardEffect = (player, card, targets) => {
    const targetPlayers = targets.map((id) => state.players[id]).filter(Boolean);

    switch (card.type) {
        case "score": {
            let bonus = 0;
            if (state.currentTurn.lumoBonus) bonus += 10;
            addScore(player, card.value + bonus);
            logMessage(`${player.name} ${card.name} oynadı.`);
            break;
        }
        case "risk": {
            if (card.effect === "double") {
                if (!state.currentTurn.scoreLock) player.score *= 2;
                logMessage(`${player.name} skorunu ikiye katladı.`);
            }
            if (card.effect === "lose") {
                addScore(player, -card.value);
                logMessage(`${player.name} ${card.value} puan kaybetti.`);
            }
            if (card.effect === "reset") {
                if (!state.currentTurn.scoreLock) player.score = 0;
                logMessage(`${player.name} skoru sıfırlandı.`);
            }
            if (card.effect === "halve") {
                if (!state.currentTurn.scoreLock) player.score = Math.floor(player.score / 2);
                logMessage(`${player.name} skoru yarıya indi.`);
            }
            if (card.effect === "allLose") {
                if (!state.currentTurn.scoreLock) {
                    state.players.forEach((p) => {
                        p.score = Math.max(0, p.score - card.value);
                    });
                }
                logMessage(`Herkes ${card.value} puan kaybetti.`);
            }
            break;
        }
        case "action": {
            const primary = targetPlayers[0];
            const secondary = targetPlayers[1];
            if (card.effect === "steal" && primary) {
                const stolen = primary.hand.splice(Math.floor(Math.random() * primary.hand.length), 1)[0];
                if (stolen) player.hand.push(stolen);
                enforceHandLimit(player);
                logMessage(`${player.name}, ${primary.name} oyuncusundan kart çaldı.`);
            }
            if (card.effect === "swapHands" && primary) {
                [player.hand, primary.hand] = [primary.hand, player.hand];
                enforceHandLimit(player);
                enforceHandLimit(primary);
                logMessage(`${player.name} ve ${primary.name} ellerini değiştirdi.`);
            }
            if (card.effect === "swapOne" && primary) {
                const cardA = player.hand.splice(Math.floor(Math.random() * player.hand.length), 1)[0];
                const cardB = primary.hand.splice(Math.floor(Math.random() * primary.hand.length), 1)[0];
                if (cardA) primary.hand.push(cardA);
                if (cardB) player.hand.push(cardB);
                enforceHandLimit(player);
                enforceHandLimit(primary);
                logMessage(`${player.name} ve ${primary.name} kart değişimi yaptı.`);
            }
            if (card.effect === "skip" && primary) {
                primary.skipNextTurn = true;
                logMessage(`${primary.name} sonraki turu atlayacak.`);
            }
            if (card.effect === "reverse") {
                state.direction *= -1;
                logMessage(`Oyun yönü değişti.`);
            }
            if (card.effect === "blockAbility" && primary) {
                primary.abilityBlockedTurns = 1;
                logMessage(`${primary.name} yeteneği bloke edildi.`);
            }
            if (secondary && card.effect !== "reverse") {
                if (card.effect === "steal") {
                    const stolen = secondary.hand.splice(Math.floor(Math.random() * secondary.hand.length), 1)[0];
                    if (stolen) player.hand.push(stolen);
                    enforceHandLimit(player);
                }
                if (card.effect === "swapOne") {
                    const cardA = player.hand.splice(Math.floor(Math.random() * player.hand.length), 1)[0];
                    const cardB = secondary.hand.splice(Math.floor(Math.random() * secondary.hand.length), 1)[0];
                    if (cardA) secondary.hand.push(cardA);
                    if (cardB) player.hand.push(cardB);
                    enforceHandLimit(player);
                    enforceHandLimit(secondary);
                }
                if (card.effect === "skip") {
                    secondary.skipNextTurn = true;
                }
                if (card.effect === "blockAbility") {
                    secondary.abilityBlockedTurns = 1;
                }
            }
            break;
        }
        case "chaos": {
            if (card.effect === "passLeft") {
                const order = state.direction === 1 ? state.players : [...state.players].reverse();
                const passed = order.map((playerRef) => playerRef.hand.pop()).filter(Boolean);
                order.forEach((playerRef, index) => {
                    const incoming = passed[(index + passed.length - 1) % passed.length];
                    if (incoming) playerRef.hand.push(incoming);
                });
                logMessage(`Herkes sola bir kart verdi.`);
            }
            if (card.effect === "randomDiscard") {
                state.players.forEach((playerRef) => {
                    if (playerRef.hand.length) {
                        const removed = playerRef.hand.splice(Math.floor(Math.random() * playerRef.hand.length), 1)[0];
                        state.discard.push(removed);
                    }
                });
                logMessage(`Herkes rastgele bir kart attı.`);
            }
            if (card.effect === "shuffleScores") {
                const scores = state.players.map((playerRef) => playerRef.score);
                shuffleDeck(scores);
                state.players.forEach((playerRef, idx) => {
                    playerRef.score = scores[idx];
                });
                logMessage(`Skorlar karıştırıldı.`);
            }
            if (card.effect === "mirrorScore") {
                const highest = Math.max(...state.players.map((p) => p.score));
                if (!state.currentTurn.scoreLock) player.score = Math.floor(highest / 2);
                logMessage(`${player.name} en yüksek skorun yarısını aldı.`);
            }
            if (card.effect === "forcedDraw") {
                drawCard(player, 2);
                logMessage(`${player.name} 2 kart çekti.`);
            }
            if (card.effect === "scoreLock") {
                state.currentTurn.scoreLock = true;
                logMessage(`Bu tur skor kilitlendi.`);
            }
            break;
        }
        default:
            break;
    }
};

export const useAbility = (player, payload = {}) => {
    if (state.currentTurn.abilityUsed) return { error: "used" };
    if (player.abilityBlockedTurns > 0) return { error: "blocked" };

    const character = player.character;
    state.currentTurn.abilityUsed = true;

    if (character.id === "lumo") {
        state.currentTurn.lumoBonus = true;
        logMessage(`${player.name} Amplify kullandı.`);
        return { done: true };
    }

    if (character.id === "zest") {
        state.currentTurn.extraTarget = true;
        logMessage(`${player.name} Chaos Shift hazırladı.`);
        return { done: true };
    }

    if (character.id === "vigo") {
        return { needsTarget: true, type: "vigo" };
    }

    if (character.id === "puls") {
        return { needsTarget: true, type: "puls" };
    }

    if (character.id === "aura") {
        const peek = state.deck.slice(0, 3);
        return { needsChoice: true, type: "aura", cards: peek };
    }

    return { done: true };
};

export const resolveAbility = (player, payload) => {
    if (!payload) return;
    if (payload.type === "vigo") {
        const target = state.players[payload.targetId];
        if (target && target.hand.length) {
            const stolen = target.hand.splice(Math.floor(Math.random() * target.hand.length), 1)[0];
            if (stolen) player.hand.push(stolen);
            enforceHandLimit(player);
            logMessage(`${player.name} ${target.name} oyuncusundan kart çaldı.`);
        }
    }
    if (payload.type === "puls") {
        const target = state.players[payload.targetId];
        if (target && target.hand.length && player.hand.length) {
            const cardA = player.hand.splice(payload.cardIndex ?? 0, 1)[0];
            const cardB = target.hand.splice(Math.floor(Math.random() * target.hand.length), 1)[0];
            if (cardB) player.hand.push(cardB);
            if (cardA) target.hand.push(cardA);
            enforceHandLimit(player);
            enforceHandLimit(target);
            logMessage(`${player.name} ${target.name} ile gizli kart değişimi yaptı.`);
        }
    }
    if (payload.type === "aura") {
        const picked = state.deck.splice(payload.cardIndex, 1)[0];
        if (picked) player.hand.push(picked);
        enforceHandLimit(player);
        logMessage(`${player.name} Foresight ile kart seçti.`);
    }
};

export const endTurn = () => {
    const current = getCurrentPlayer();
    if (current.abilityBlockedTurns > 0) current.abilityBlockedTurns -= 1;

    if (isGameOver()) return;

    const totalPlayers = state.players.length;
    state.turnIndex = (state.turnIndex + state.direction + totalPlayers) % totalPlayers;

    if (state.turnIndex === 0) {
        state.round += 1;
    }

    if (state.round > state.maxRounds || state.deck.length === 0) {
        return;
    }

    startTurn();
};

export const isGameOver = () => {
    return state.round > state.maxRounds || state.deck.length === 0;
};

export const getWinner = () => {
    return state.players.reduce((best, player) => (player.score > best.score ? player : best), state.players[0]);
};
