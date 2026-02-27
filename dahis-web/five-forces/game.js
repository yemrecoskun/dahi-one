import { Deck } from './deck.js';
import { CHARACTERS } from './characters.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.ui = new UI();
        this.deck = new Deck();
        this.players = [];
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.gameOver = false;
        this.turnTimeout = null;
        
        // Settings
        this.maxRounds = 15; 
        this.handSize = 5;

        this.init();
    }

    init() {
        // Event Listeners
        this.ui.elements.lobby.startBtn.addEventListener('click', () => this.handleStartGame());
        
        this.ui.elements.charSelect.confirmBtn.addEventListener('click', () => {
             const selected = document.querySelector('.char-card.selected');
             if(selected) {
                 this.finalizeSetup(selected.dataset.id);
             }
        });

        // Game Screen Interactions
        this.ui.elements.game.abilityBtn.addEventListener('click', () => this.handleAbility());
        this.ui.elements.game.endTurnBtn.addEventListener('click', () => this.endTurn());

        // Initial Screen
        this.ui.showScreen('lobby');
    }

    handleStartGame() {
        const playerName = this.ui.elements.lobby.playerName.value || 'Player';
        const aiCount = parseInt(this.ui.elements.lobby.aiCount.value);
        
        // Create Human Player
        this.players = [{
            id: 0,
            name: playerName,
            isHuman: true,
            score: 0,
            hand: [],
            character: null,
            abilityUsed: false,
            betrayalTokenUsed: false,
            modifiers: { shield: false, doubleScore: false }
        }];

        // Create AI Players
        for (let i = 1; i <= aiCount; i++) {
            this.players.push({
                id: i,
                name: `Bot ${i}`,
                isHuman: false,
                score: 0,
                hand: [],
                character: null, // Assigned later
                abilityUsed: false,
                betrayalTokenUsed: false,
                modifiers: { shield: false, doubleScore: false }
            });
        }

        this.renderCharacterSelection();
        this.ui.showScreen('charSelect');
    }

    renderCharacterSelection() {
        const grid = this.ui.elements.charSelect.grid;
        grid.innerHTML = '';
        
        CHARACTERS.forEach(char => {
            const el = document.createElement('div');
            el.className = 'char-card';
            el.dataset.id = char.id;
            el.innerHTML = `
                <div class="char-avatar" style="background-color:${char.color}">${char.avatar}</div>
                <h3>${char.name}</h3>
                <p>${char.ability}</p>
            `;
            
            el.onclick = () => {
                document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
                el.classList.add('selected');
                this.ui.elements.charSelect.confirmBtn.disabled = false;
            };
            
            grid.appendChild(el);
        });
    }

    finalizeSetup(playerCharId) {
        // Assign Human Character
        this.players[0].character = CHARACTERS.find(c => c.id === playerCharId);
        
        // Assign AI Characters (Unique)
        const takenIds = [playerCharId];
        this.players.forEach(p => {
            if (!p.isHuman) {
                let available = CHARACTERS.filter(c => !takenIds.includes(c.id));
                const randomChar = available[Math.floor(Math.random() * available.length)];
                p.character = randomChar;
                takenIds.push(randomChar.id);
            }
        });

        this.startGameLoop();
    }

    startGameLoop() {
        this.deck.initialize();
        this.deck.shuffle();
        this.round = 1;
        this.gameOver = false;
        
        // Deal Initial Hands
        this.players.forEach(p => {
            p.hand = this.deck.draw(this.handSize);
        });

        this.ui.showScreen('game');
        this.updateGameState();
        this.startTurn();
    }

    startTurn() {
        if (this.gameOver) return;
        
        const player = this.players[this.currentPlayerIndex];
        this.ui.log(`--- ${player.name}'s Turn ---`);
        
        // Draw card at start of turn (if deck not empty)
        if (this.deck.cards.length > 0) {
            const drawn = this.deck.draw(1)[0];
            if(drawn) {
                player.hand.push(drawn);
                // this.ui.log(`${player.name} drew a card.`);
            }
        } else {
             this.endGame("Deck Empty");
             return;
        }

        this.updateGameState();

        if (player.isHuman) {
            this.handleHumanTurn();
        } else {
            this.handleAITurn();
        }
    }

    handleHumanTurn() {
        this.ui.elements.game.turnOverlay.classList.remove('hidden');
        this.ui.elements.game.overlayMsg.textContent = "Your Turn";
        
        // Enable interaction
        this.ui.renderHand(this.players[0].hand, (card, index) => {
            this.playCard(this.players[0], card, index);
        });
    }

    handleAITurn() {
        this.ui.elements.game.turnOverlay.classList.add('hidden');
        
        // Simulate thinking time
        setTimeout(() => {
            const ai = this.players[this.currentPlayerIndex];
            // Simple AI: Pick random playable card
            // Priority: Force > Strategy > Betrayal
            
            // 1. Check if can win or mess up player
            // ... (Simple AI just plays highest value Force card or random Strategy)

            // Make sure hand isn't empty (shouldn't be)
            if(ai.hand.length > 0) {
                const cardIndex = Math.floor(Math.random() * ai.hand.length);
                const card = ai.hand[cardIndex];
                
                // AI Logic for Targets
                let target = null;
                if (['Attack', 'Sabotage', 'Theft'].includes(card.subtype)) {
                     // Target random other player
                     const potentialTargets = this.players.filter(p => p.id !== ai.id);
                     target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                }
                
                this.executeCardAction(ai, card, target);
                ai.hand.splice(cardIndex, 1);
            }
            
            this.endTurn();

        }, 1500);
    }

    playCard(player, card, index) {
        // Human logic to select targets if needed
        if (this.needsTarget(card)) {
            // Show target modal
            const targets = this.players.filter(p => p.id !== player.id);
            // Temporary, use simple prompt or reuse UI modal
            // Ideally UI.showTargetModal
            // For now, let's assume auto-target random for simplicity or implement UI later.
            // Let's implement alert-based or simple target logic for MVP
            
            // For MVP: Target highest scoring opponent automatically?
            // Or use confirm("Target whom? p1, p2...?") -> Too ugly.
            // Let's implement a quick target selector usage if UI supports it.
            
            // Fallback: Auto-target leader
            const opponents = this.players.filter(p => p.id !== player.id);
            const target = opponents.sort((a,b) => b.score - a.score)[0];
            
            this.executeCardAction(player, card, target);
        } else {
            this.executeCardAction(player, card, null);
        }
        
        // Remove from hand
        player.hand.splice(index, 1);
        this.updateGameState();
        this.endTurn();
    }

    needsTarget(card) {
        return ['Attack', 'Sabotage', 'Theft'].includes(card.subtype);
    }

    executeCardAction(player, card, target) {
        this.ui.log(`${player.name} plays ${card.name} (${card.type})`);
        
        switch(card.type) {
            case 'Force':
                this.applyScore(player, card.value);
                break;
            case 'Strategy':
                this.handleStrategyCard(player, card, target);
                break;
            case 'Betrayal':
                this.handleBetrayalCard(player, card, target);
                break;
            case 'Luck':
                this.handleLuckCard(player, card);
                break;
            case 'Dahi':
                this.handleDahiCard(player, card); // Joker/Wild
                break;
        }
        
        this.deck.discard(card);
    }

    applyScore(player, amount) {
        if (player.modifiers.doubleScore) {
            amount *= 2;
            player.modifiers.doubleScore = false; // Consume
            this.ui.log(`${player.name} doubles their points!`);
        }
        
        // Check target shields if negative effect? 
        // Force cards are usually self-buffs or direct attacks?
        // In this game, Force is points.
        
        player.score += amount;
        this.ui.log(`${player.name} gains ${amount} points. Total: ${player.score}`);
    }

    handleStrategyCard(player, card, target) {
        if (card.subtype === 'defense') {
             player.modifiers.shield = true;
             this.ui.log(`${player.name} is shielded for next turn.`);
        } else if (card.subtype === 'intel') {
            // Peek at next cards? For MVP just draw extras?
            // "Peek" implementation requires complex UI. 
            // Let's say Intel = "Draw 2 cards, discard 1"
            const newCards = this.deck.draw(2);
            newCards.forEach(c => player.hand.push(c));
            this.ui.log(`${player.name} draws extra Intel.`);
        }
    }

    handleBetrayalCard(player, card, target) {
        // Usually negative points to others
        if (target) {
            if (target.modifiers.shield) {
                this.ui.log(`${target.name}'s shield blocked the betrayal!`);
                target.modifiers.shield = false; // Shield breaks
            } else {
                target.score -= 5; // Fixed value for MVP
                player.score += 2; // Steal points?
                this.ui.log(`${player.name} betrayed ${target.name}! -5 to target.`);
            }
        }
    }
    
    handleLuckCard(player, card) {
        // Random effect
        const roll = Math.random();
        if(roll > 0.5) {
            this.applyScore(player, 10);
            this.ui.log("Luck strikes! +10 Points.");
        } else {
            this.applyScore(player, -5);
            this.ui.log("Bad Luck! -5 Points.");
        }
    }

    handleDahiCard(player, card) {
        // Ultimate card
        this.applyScore(player, 15);
        // Draw another
        const extra = this.deck.draw(1)[0];
        if(extra) player.hand.push(extra);
    }

    handleAbility() {
        const p = this.players[0];
        if(p.abilityUsed){
            alert("Ability already used!");
            return;
        }
        
        // Character specific logic
        this.ui.log(`${p.name} uses ${p.character.name}'s ability!`);
        
        switch(p.character.id) {
            case 'aura': { // Foresight: Look at top 3, pick 1
                const top3 = this.deck.draw(3);
                this.ui.showCardSelectModal(top3, 'Pick 1 to keep (others discarded)', (selected) => {
                    p.hand.push(selected);
                    // Discard others
                    const others = top3.filter(c => c !== selected);
                    others.forEach(c => this.deck.discard(c));
                    this.ui.log(`${p.name} uses Foresight to finding a card.`);
                    this.updateGameState();
                });
                break;
            }
            case 'lumo': { // Amplify: +10 bonus
                p.score += 10; 
                this.ui.log(`${p.name} amplifies their score by 10.`);
                break;
            }
            case 'zest': { // Chaos Shift: Draw 2
                const cards = this.deck.draw(2);
                cards.forEach(c => p.hand.push(c));
                this.ui.log(`${p.name} draws 2 cards from chaos.`);
                break;
            }
            case 'puls': { // Precision Swap
                const opps = this.players.filter(x => !x.isHuman);
                if(opps.length > 0) {
                     const target = opps[Math.floor(Math.random() * opps.length)];
                     if(target.hand.length > 0 && p.hand.length > 0) {
                         const myCardIdx = Math.floor(Math.random() * p.hand.length);
                         const theirCardIdx = Math.floor(Math.random() * target.hand.length);
                         
                         const myCard = p.hand[myCardIdx];
                         const theirCard = target.hand[theirCardIdx];
                         
                         p.hand[myCardIdx] = theirCard;
                         target.hand[theirCardIdx] = myCard;
                         this.ui.log(`${p.name} swapped a card with ${target.name}.`);
                     }
                }
                break;
            }
            case 'vigo': { // Silent Theft
                 const victims = this.players.filter(x => !x.isHuman && x.hand.length > 0);
                 if(victims.length > 0) {
                      const target = victims[Math.floor(Math.random() * victims.length)];
                      // Random card from victim
                      const stealIdx = Math.floor(Math.random() * target.hand.length);
                      const stolen = target.hand.splice(stealIdx, 1)[0];
                      p.hand.push(stolen);
                      this.ui.log(`${p.name} stole a card from ${target.name}.`);
                 }
                break;
            }
            default:
                p.score += 5;
        }
        
        p.abilityUsed = true;
        this.updateGameState();
    }

    endTurn() {
        // Check end game conditions (like score limit)
        if(this.players.some(p => p.score >= 100)) {
            this.endGame("Score Limit Reached");
            return;
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) {
            this.round++;
        }
        
        if(this.deck.cards.length === 0) {
             this.endGame("Deck Empty");
             return;
        }

        this.startTurn();
    }

    updateGameState() {
        this.ui.updateGameInfo(this.round, this.deck.cards.length);
        this.ui.updatePlayerInfo(this.players[0]); // Only show Human info
        this.ui.renderOpponents(this.players, this.currentPlayerIndex);
        
        const topDiscard = this.deck.discardPile[this.deck.discardPile.length - 1];
        this.ui.updateDiscardPile(topDiscard);
    }

    endGame(reason) {
        this.gameOver = true;
        this.ui.log(`GAME OVER: ${reason}`);
        
        // Determine Winner
        const winner = this.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
        this.ui.showGameOver(winner, this.players);
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
