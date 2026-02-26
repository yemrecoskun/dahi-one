import {
    state,
    initGame,
    getCurrentPlayer,
    startTurn,
    drawCard,
    queuePlayCard,
    resolvePendingEffect,
    useAbility,
    resolveAbility,
    endTurn,
    isGameOver,
    getWinner,
    logMessage
} from "./game.js";
import { CHARACTERS } from "./characters.js";

const scoreboard = document.getElementById("scoreboard");
const deckCount = document.getElementById("deckCount");
const discardTop = document.getElementById("discardTop");
const hand = document.getElementById("hand");
const gameLog = document.getElementById("gameLog");
const roundInfo = document.getElementById("roundInfo");
const drawBtn = document.getElementById("drawBtn");
const abilityBtn = document.getElementById("abilityBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const betrayalBtn = document.getElementById("betrayalBtn");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");
const endModal = document.getElementById("endModal");
const winnerTitle = document.getElementById("winnerTitle");
const winnerScore = document.getElementById("winnerScore");
const backToLobby = document.getElementById("backToLobby");

const settings = JSON.parse(localStorage.getItem("ff_settings") || "null");
if (!settings) {
    window.location.href = "index.html";
}

initGame(settings);
startTurn();

const renderScoreboard = () => {
    scoreboard.innerHTML = "";
    state.players.forEach((player, index) => {
        const card = document.createElement("div");
        card.className = `ff-score-card${index === state.turnIndex ? " active" : ""}`;
        card.innerHTML = `
            <strong>${player.name}</strong>
            <span>${player.character.name} · ${player.character.ability}</span>
            <small>Score: ${player.score}</small>
            <small>Hand: ${player.hand.length} · Betrayal: ${player.betrayalToken ? "✓" : "×"}</small>
        `;
        scoreboard.appendChild(card);
    });
};

const renderDeck = () => {
    deckCount.textContent = `Deck ${state.deck.length}`;
    discardTop.textContent = state.discard.length ? state.discard[state.discard.length - 1].name : "Discard";
};

const renderHand = () => {
    const player = getCurrentPlayer();
    hand.innerHTML = "";
    player.hand.forEach((card, index) => {
        const cardEl = document.createElement("button");
        cardEl.className = "ff-card";
        cardEl.innerHTML = `<strong>${card.name}</strong><small>${card.type}</small>`;
        cardEl.addEventListener("click", () => handleCardPlay(card, index));
        hand.appendChild(cardEl);
    });
};

const renderLog = () => {
    gameLog.innerHTML = state.log.slice(0, 8).map((entry) => `<div>${entry.message}</div>`).join("");
};

const updateRound = () => {
    roundInfo.textContent = `Round ${state.round} / ${state.maxRounds}`;
};

const openModal = (title, contentNodes) => {
    modalTitle.textContent = title;
    modalContent.innerHTML = "";
    contentNodes.forEach((node) => modalContent.appendChild(node));
    modal.classList.remove("ff-hidden");
};

const closeModal = () => {
    modal.classList.add("ff-hidden");
};

const renderAll = () => {
    renderScoreboard();
    renderDeck();
    renderHand();
    renderLog();
    updateRound();
    drawBtn.disabled = state.currentTurn.drawn;
    if (isGameOver()) {
        const winner = getWinner();
        winnerTitle.textContent = `${winner.name} kazandı!`;
        winnerScore.textContent = `Skor: ${winner.score}`;
        endModal.classList.remove("ff-hidden");
    }
};

const selectTarget = (targets, onSelect, title = "Hedef seç") => {
    const list = document.createElement("div");
    list.className = "ff-modal-list";
    targets.forEach((player) => {
        const btn = document.createElement("button");
        btn.className = "ff-btn ghost";
        btn.textContent = player.name;
        btn.addEventListener("click", () => {
            onSelect(player);
            closeModal();
        });
        list.appendChild(btn);
    });
    openModal(title, [list]);
};

const handleBetrayalPrompt = (pending) => {
    const available = state.players.filter((p) => p.id !== pending.playerId && p.betrayalToken);
    if (!available.length) {
        resolvePendingEffect();
        return;
    }

    const list = document.createElement("div");
    list.className = "ff-modal-list";
    const info = document.createElement("p");
    info.textContent = "Betrayal Token ile kartı iptal etmek isteyen oyuncu var mı?";
    list.appendChild(info);

    available.forEach((player) => {
        const btn = document.createElement("button");
        btn.className = "ff-btn ghost";
        btn.textContent = `${player.name} iptal et`;
        btn.addEventListener("click", () => {
            resolvePendingEffect(player.id);
            closeModal();
            renderAll();
        });
        list.appendChild(btn);
    });

    const skipBtn = document.createElement("button");
    skipBtn.className = "ff-btn primary";
    skipBtn.textContent = "İptal Yok";
    skipBtn.addEventListener("click", () => {
        resolvePendingEffect();
        closeModal();
        renderAll();
    });
    list.appendChild(skipBtn);

    openModal("Betrayal Token", [list]);

    available.filter((player) => player.isAI).forEach((player) => {
        if (Math.random() < 0.15) {
            resolvePendingEffect(player.id);
            closeModal();
            renderAll();
        }
    });
};

const handleCardPlay = (card, index) => {
    const player = getCurrentPlayer();
    if (player.isAI) return;
    if (!state.currentTurn.drawn) {
        logMessage("Önce kart çekmelisin.");
        renderAll();
        return;
    }
    if (player.skipPlayNextTurn) {
        logMessage("Bu tur kart oynayamazsın.");
        renderAll();
        return;
    }
    if (state.currentTurn.played) return;

    const cardFromHand = player.hand.splice(index, 1)[0];

    const requiresTarget = ["steal", "swapHands", "swapOne", "skip", "blockAbility"].includes(card.effect);
    const needsSecondTarget = state.currentTurn.extraTarget && card.type === "action";

    if (requiresTarget) {
        const targets = state.players.filter((p) => p.id !== player.id);
        selectTarget(targets, (primary) => {
            if (needsSecondTarget) {
                const secondTargets = targets.filter((p) => p.id !== primary.id);
                selectTarget(secondTargets, (secondary) => {
                    queuePlayCard(player, cardFromHand, [primary.id, secondary.id]);
                    handleBetrayalPrompt(state.currentTurn.pendingEffect);
                }, "Ek hedef seç");
            } else {
                queuePlayCard(player, cardFromHand, [primary.id]);
                handleBetrayalPrompt(state.currentTurn.pendingEffect);
            }
        });
        return;
    }

    queuePlayCard(player, cardFromHand, []);
    handleBetrayalPrompt(state.currentTurn.pendingEffect);
};

const handleAbilityUse = () => {
    const player = getCurrentPlayer();
    if (player.isAI) return;
    if (!state.currentTurn.drawn) {
        logMessage("Önce kart çekmelisin.");
        renderAll();
        return;
    }
    if (player.abilityBlockedTurns > 0) {
        logMessage("Yeteneğin bloke edildi.");
        renderAll();
        return;
    }
    const result = useAbility(player);
    if (result?.error === "used") return;
    if (result?.error === "blocked") {
        logMessage("Yeteneğin bloke edildi.");
        renderAll();
        return;
    }

    if (result?.needsTarget) {
        const targets = state.players.filter((p) => p.id !== player.id);
        if (result.type === "puls") {
            const list = document.createElement("div");
            list.className = "ff-modal-list";
            player.hand.forEach((handCard, cardIndex) => {
                const btn = document.createElement("button");
                btn.className = "ff-btn ghost";
                btn.textContent = handCard.name;
                btn.addEventListener("click", () => {
                    closeModal();
                    selectTarget(targets, (target) => {
                        resolveAbility(player, {
                            type: "puls",
                            targetId: target.id,
                            cardIndex
                        });
                        renderAll();
                    }, "Kart değişimi hedefi");
                });
                list.appendChild(btn);
            });
            openModal("Puls: Elinden kart seç", [list]);
            return;
        }
        selectTarget(targets, (target) => {
            resolveAbility(player, { type: result.type, targetId: target.id });
            renderAll();
        }, "Yetenek hedefi");
        return;
    }

    if (result?.needsChoice) {
        const list = document.createElement("div");
        list.className = "ff-modal-list";
        result.cards.forEach((card, idx) => {
            const btn = document.createElement("button");
            btn.className = "ff-btn ghost";
            btn.textContent = card.name;
            btn.addEventListener("click", () => {
                resolveAbility(player, { type: "aura", cardIndex: idx });
                closeModal();
                renderAll();
            });
            list.appendChild(btn);
        });
        openModal("Foresight: Kart seç", [list]);
        return;
    }

    renderAll();
};

const handleDraw = () => {
    const player = getCurrentPlayer();
    if (player.isAI) return;
    if (state.currentTurn.drawn) return;
    drawCard(player, 1);
    state.currentTurn.drawn = true;
    renderAll();
};

const handleEndTurn = () => {
    endTurn();
    renderAll();
    handleAiTurns();
};

const handleBetrayal = () => {
    const player = getCurrentPlayer();
    if (!player.betrayalToken) return;
    logMessage("Betrayal token sadece rakip kartına tepki olarak kullanılabilir.");
    renderAll();
};

const handleAiTurns = () => {
    const player = getCurrentPlayer();
    if (!player.isAI || isGameOver()) return;

    const ai = player;
    if (!state.currentTurn.drawn) {
        drawCard(ai, 1);
        state.currentTurn.drawn = true;
    }
    if (ai.skipPlayNextTurn) {
        ai.skipPlayNextTurn = false;
        endTurn();
        renderAll();
        handleAiTurns();
        return;
    }

    const abilityChance = Math.random();
    if (!state.currentTurn.abilityUsed && ai.abilityBlockedTurns === 0 && abilityChance > 0.6) {
        const result = useAbility(ai);
        if (result?.needsTarget) {
            const targets = state.players.filter((p) => p.id !== ai.id);
            const target = targets[Math.floor(Math.random() * targets.length)];
            resolveAbility(ai, { type: result.type, targetId: target.id });
        }
        if (result?.needsChoice) {
            resolveAbility(ai, { type: "aura", cardIndex: 0 });
        }
    }

    if (ai.hand.length) {
        const card = ai.hand.splice(Math.floor(Math.random() * ai.hand.length), 1)[0];
        const requiresTarget = ["steal", "swapHands", "swapOne", "skip", "blockAbility"].includes(card.effect);
        const targets = state.players.filter((p) => p.id !== ai.id);
        if (requiresTarget && targets.length) {
            const primary = targets[Math.floor(Math.random() * targets.length)];
            const useSecond = state.currentTurn.extraTarget && card.type === "action" && targets.length > 1;
            if (useSecond) {
                const secondary = targets.filter((p) => p.id !== primary.id)[0];
                queuePlayCard(ai, card, [primary.id, secondary.id]);
            } else {
                queuePlayCard(ai, card, [primary.id]);
            }
        } else {
            queuePlayCard(ai, card, []);
        }
        resolvePendingEffect();
    }

    endTurn();
    renderAll();
    handleAiTurns();
};

modalClose.addEventListener("click", closeModal);
backToLobby.addEventListener("click", () => {
    window.location.href = "index.html";
});

drawBtn.addEventListener("click", handleDraw);
abilityBtn.addEventListener("click", handleAbilityUse);
endTurnBtn.addEventListener("click", handleEndTurn);
betrayalBtn.addEventListener("click", handleBetrayal);

renderAll();
handleAiTurns();
