export class UI {
    constructor() {
        this.elements = {
            screens: {
                lobby: document.getElementById('lobby-screen'),
                charSelect: document.getElementById('char-select-screen'),
                game: document.getElementById('game-screen'),
                gameOver: document.getElementById('game-over-screen')
            },
            lobby: {
                startBtn: document.getElementById('start-game-btn'),
                playerName: document.getElementById('player-name'),
                aiCount: document.getElementById('ai-count'),
                rulesBtn: document.getElementById('rules-btn')
            },
            charSelect: {
                grid: document.getElementById('character-grid'),
                confirmBtn: document.getElementById('confirm-char-btn')
            },
            game: {
                roundNum: document.getElementById('round-num'),
                deckCount: document.getElementById('deck-count'),
                opponentsArea: document.getElementById('opponents-area'),
                drawPile: document.getElementById('draw-pile'),
                discardPile: document.getElementById('discard-pile'),
                actionLog: document.getElementById('action-log'),
                playerHand: document.getElementById('player-hand'),
                myScore: document.getElementById('my-score'),
                myName: document.getElementById('my-name'),
                myAvatar: document.getElementById('my-avatar'),
                abilityBtn: document.getElementById('ability-btn'),
                betrayalToken: document.getElementById('betrayal-token'),
                turnOverlay: document.getElementById('turn-overlay'),
                overlayMsg: document.getElementById('overlay-msg'),
                endTurnBtn: document.getElementById('end-turn-btn')
            },
            modals: {
                rules: document.getElementById('rules-modal'),
                closeRules: document.getElementById('close-rules-btn'),
                target: document.getElementById('target-modal'),
                targetPrompt: document.getElementById('target-prompt'),
                targetOptions: document.getElementById('target-options'),
                cancelTarget: document.getElementById('cancel-target-btn'),
                cardSelect: document.getElementById('card-select-modal'),
                cardSelectPrompt: document.getElementById('card-select-prompt'),
                cardSelectOptions: document.getElementById('card-select-options')
            },
            gameOver: {
                winnerName: document.getElementById('winner-name'),
                winnerScore: document.getElementById('winner-score'),
                finalScoreboard: document.getElementById('final-scoreboard'),
                restartBtn: document.getElementById('restart-game-btn')
            }
        };
    }

    showScreen(screenName) {
        Object.values(this.elements.screens).forEach(s => s.classList.remove('active'));
        this.elements.screens[screenName].classList.add('active');
    }

    log(message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        this.elements.game.actionLog.prepend(entry);
        
        // Keep log clean
        if (this.elements.game.actionLog.children.length > 20) {
            this.elements.game.actionLog.lastChild.remove();
        }
    }

    renderHand(cards, onPlay) {
        const container = this.elements.game.playerHand;
        container.innerHTML = '';
        cards.forEach((card, index) => {
            const el = this.createCardElement(card);
            el.onclick = () => onPlay(card, index);
            container.appendChild(el);
        });
    }

    createCardElement(card) {
        const el = document.createElement('div');
        el.className = `card ${card.type.toLowerCase()}`;
        
        const header = document.createElement('div');
        header.className = 'card-header';
        header.textContent = card.type;
        
        const content = document.createElement('div');
        content.className = 'card-content';
        content.textContent = card.name;
        
        const footer = document.createElement('div');
        footer.className = 'card-footer';
        footer.textContent = card.value ? (card.value > 0 ? `+${card.value}` : card.value) : '';
        
        el.appendChild(header);
        el.appendChild(content);
        el.appendChild(footer);
        
        return el;
    }

    renderOpponents(opponents, currentTurnIndex) {
        const container = this.elements.game.opponentsArea;
        container.innerHTML = '';
        
        opponents.forEach((opp, index) => {
            if (opp.isHuman) return; // Skip self

            const el = document.createElement('div');
            el.className = 'opponent-card';
            if (index === currentTurnIndex) el.classList.add('active-turn');
            
            el.innerHTML = `
                <div class="opponent-avatar" style="background-color: ${opp.character.color}">${opp.character.avatar}</div>
                <span class="opponent-name">${opp.name}</span>
                <div class="opponent-stats">
                    <span class="score-badge">Score: ${opp.score}</span>
                    <span class="opponent-hand-count">${opp.hand.length}</span>
                </div>
            `;
            container.appendChild(el);
        });
    }

    updatePlayerInfo(player) {
        this.elements.game.myScore.textContent = player.score;
        this.elements.game.myName.textContent = `${player.name} (${player.character.name})`;
        this.elements.game.myAvatar.textContent = player.character.avatar;
        this.elements.game.myAvatar.style.backgroundColor = player.character.color;
        
        if (player.betrayalTokenUsed) {
            this.elements.game.betrayalToken.classList.add('used');
            this.elements.game.betrayalToken.title = 'Used';
        }

        // Ability button state
        this.elements.game.abilityBtn.disabled = player.abilityUsed;
        if (!player.abilityUsed) {
            this.elements.game.abilityBtn.textContent = `Use ${player.character.ability}`;
        } else {
            this.elements.game.abilityBtn.textContent = 'Ability Used';
        }
    }

    updateGameInfo(round, deckCount) {
        this.elements.game.roundNum.textContent = round;
        this.elements.game.deckCount.textContent = deckCount;
    }
    
    updateDiscardPile(card) {
        const pile = this.elements.game.discardPile;
        pile.innerHTML = '';
        if (card) {
            pile.appendChild(this.createCardElement(card));
        } else {
            pile.textContent = 'Discard';
        }
    }

    showTargetModal(targets, onSelect) {
        const modal = this.elements.modals.target;
        const container = this.elements.modals.targetOptions;
        container.innerHTML = '';
        
        targets.forEach(target => {
            const btn = document.createElement('button');
            btn.className = 'btn secondary';
            btn.innerHTML = `
                <span style="color:${target.character.color}">${target.character.avatar}</span> 
                ${target.name} (Score: ${target.score})
            `;
            btn.onclick = () => {
                modal.classList.add('hidden');
                onSelect(target);
            };
            container.appendChild(btn);
        });
        
        modal.classList.remove('hidden');
        
        this.elements.modals.cancelTarget.onclick = () => {
             modal.classList.add('hidden');
             onSelect(null);
        };
    }
    
    showCardSelectModal(cards, prompt, onSelect) {
        const modal = this.elements.modals.cardSelect;
        const container = this.elements.modals.cardSelectOptions;
        const promptEl = this.elements.modals.cardSelectPrompt;
        
        promptEl.textContent = prompt;
        container.innerHTML = '';
        
        cards.forEach(card => {
            const el = this.createCardElement(card);
            el.onclick = () => {
                modal.classList.add('hidden');
                onSelect(card);
            };
            container.appendChild(el);
        });
        
        modal.classList.remove('hidden');
    }
    
    showTurnOverlay(isMyTurn, message = null) {
        const overlay = this.elements.game.turnOverlay;
        const msgEl = this.elements.game.overlayMsg;
        const actions = this.elements.game.overlayActions;
        
        if (isMyTurn) {
            overlay.classList.remove('hidden');
            msgEl.textContent = message || "It's Your Turn";
            actions.style.display = 'block';
        } else {
            overlay.classList.add('hidden');
        }
    }
    
    hideTurnOverlay() {
        this.elements.game.turnOverlay.classList.add('hidden');
    }

    showGameOver(winner, players) {
        this.showScreen('gameOver');
        this.elements.gameOver.winnerName.textContent = winner.name;
        this.elements.gameOver.winnerScore.textContent = winner.score;
        
        const sorted = [...players].sort((a,b) => b.score - a.score);
        this.elements.gameOver.finalScoreboard.innerHTML = sorted.map((p, i) => `
            <div class="scoreboard-row" style="display:flex; justify-content:space-between; padding: 10px; background: rgba(255,255,255,0.05); margin-bottom: 5px; border-radius: 4px;">
                <span>#${i+1} ${p.name}</span>
                <span>${p.score}</span>
            </div>
        `).join('');
    }
}
