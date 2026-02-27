// deck.js
const CARD_DEFINITIONS = [
    // FORCE (Points)
    { type: 'Force', name: 'Raw Power', value: 5, count: 10 },
    { type: 'Force', name: 'Concentrated Force', value: 10, count: 6 },
    { type: 'Force', name: 'Overwhelming Might', value: 20, count: 3 },
    
    // STRATEGY (Utility/Defense)
    { type: 'Strategy', subtype: 'defense', name: 'Energy Shield', count: 4, description: 'Block next negative effect' },
    { type: 'Strategy', subtype: 'intel', name: 'Reconnaissance', count: 3, description: 'Draw 2 cards' },
    { type: 'Strategy', subtype: 'boost', name: 'Amplifier', count: 2, description: 'Double next score gain' },

    // BETRAYAL (Attack/Sabotage)
    { type: 'Betrayal', subtype: 'sabotage', name: 'System Crash', count: 3, description: '-5 Points to target' },
    { type: 'Betrayal', subtype: 'theft', name: 'Data Leech', count: 2, description: 'Steal 5 Points' },
    { type: 'Betrayal', subtype: 'attack', name: 'Firewall Breach', count: 2, description: 'Destroy opponent shield' },

    // LUCK (Random)
    { type: 'Luck', name: 'Coin Toss', count: 4, description: '50% Chance: +10 or -5' },
    
    // DAHI (Ultimate)
    { type: 'Dahi', name: 'Master Plan', value: 15, count: 1, description: '+15 Points & Draw 1' },
    { type: 'Dahi', name: 'Total Chaos', count: 1, description: 'Everyone discards hand & redraws' } 
];

export class Deck {
    constructor() {
        this.cards = [];
        this.discardPile = [];
    }

    initialize() {
        this.cards = [];
        this.discardPile = [];
        
        CARD_DEFINITIONS.forEach(def => {
            for (let i = 0; i < def.count; i++) {
                this.cards.push({
                    id: Math.random().toString(36).substr(2, 9),
                    ...def
                });
            }
        });
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw(count) {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (this.cards.length === 0) {
                if (this.discardPile.length > 0) {
                    // Reshuffle discard into deck if deck is empty
                    // For this game mode, we might want to just stop drawing or reshuffle
                    // Let's implement reshuffle for endless play potential
                    this.cards = [...this.discardPile];
                    this.discardPile = [];
                    this.shuffle();
                } else {
                    break; // No cards left anywhere
                }
            }
            drawn.push(this.cards.pop());
        }
        return drawn;
    }

    discard(card) {
        this.discardPile.push(card);
    }
}
