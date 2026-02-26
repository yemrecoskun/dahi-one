const createCard = (type, name, effect, value = 0) => ({
    id: `${type}_${name}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    name,
    effect,
    value
});

export const createDeck = () => {
    const deck = [];

    for (let i = 0; i < 6; i += 1) deck.push(createCard("score", "+10", "add", 10));
    for (let i = 0; i < 5; i += 1) deck.push(createCard("score", "+20", "add", 20));
    for (let i = 0; i < 3; i += 1) deck.push(createCard("score", "+30", "add", 30));
    for (let i = 0; i < 2; i += 1) deck.push(createCard("score", "+40", "add", 40));

    deck.push(createCard("risk", "Double Score", "double"));
    deck.push(createCard("risk", "Double Score", "double"));
    deck.push(createCard("risk", "Lose 20", "lose", 20));
    deck.push(createCard("risk", "Lose 20", "lose", 20));
    deck.push(createCard("risk", "Reset Score", "reset"));
    deck.push(createCard("risk", "Halve Score", "halve"));
    deck.push(createCard("risk", "All Lose 10", "allLose", 10));
    deck.push(createCard("risk", "All Lose 10", "allLose", 10));

    deck.push(createCard("action", "Steal Card", "steal"));
    deck.push(createCard("action", "Steal Card", "steal"));
    deck.push(createCard("action", "Swap Hands", "swapHands"));
    deck.push(createCard("action", "Swap One Card", "swapOne"));
    deck.push(createCard("action", "Swap One Card", "swapOne"));
    deck.push(createCard("action", "Skip Turn", "skip"));
    deck.push(createCard("action", "Skip Turn", "skip"));
    deck.push(createCard("action", "Reverse Turn", "reverse"));
    deck.push(createCard("action", "Block Ability", "blockAbility"));
    deck.push(createCard("action", "Block Ability", "blockAbility"));

    deck.push(createCard("chaos", "Pass Left", "passLeft"));
    deck.push(createCard("chaos", "Random Discard", "randomDiscard"));
    deck.push(createCard("chaos", "Shuffle Scores", "shuffleScores"));
    deck.push(createCard("chaos", "Mirror Score", "mirrorScore"));
    deck.push(createCard("chaos", "Forced Draw x2", "forcedDraw"));
    deck.push(createCard("chaos", "Score Lock", "scoreLock"));

    return deck;
};

export const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};
