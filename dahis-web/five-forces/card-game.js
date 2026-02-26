const CARD_EFFECTS = [
    { label: "+10", value: 10 },
    { label: "+20", value: 20 },
    { label: "+40", value: 40 },
    { label: "-20", value: -20 },
    { label: "RESET", value: "reset" }
];

const STORAGE_KEY = "dahisRiskCardLeaderboard";

const startBtn = document.getElementById("startBtn");
const drawBtn = document.getElementById("drawBtn");
const stopBtn = document.getElementById("stopBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const saveFeedback = document.getElementById("saveFeedback");
const scoreValue = document.getElementById("scoreValue");
const lastCard = document.getElementById("lastCard");
const finalTitle = document.getElementById("finalTitle");
const finalScore = document.getElementById("finalScore");
const nicknameInput = document.getElementById("nicknameInput");
const leaderboardTable = document.getElementById("leaderboardTable");
const cardStart = document.getElementById("cardStart");
const cardPlay = document.getElementById("cardPlay");
const cardResult = document.getElementById("cardResult");

let score = 0;
let gameActive = false;

const showScreen = (screen) => {
    [cardStart, cardPlay, cardResult].forEach((section) => section.classList.add("card-hidden"));
    screen.classList.remove("card-hidden");
};

const resetGame = () => {
    score = 0;
    gameActive = true;
    scoreValue.textContent = score;
    lastCard.textContent = "-";
};

const applyEffect = (effect) => {
    if (effect.value === "reset") {
        score = 0;
    } else {
        score += effect.value;
        if (score < 0) score = 0;
    }
    scoreValue.textContent = score;
    lastCard.textContent = effect.label;
};

const drawCard = () => {
    if (!gameActive) return;
    const effect = CARD_EFFECTS[Math.floor(Math.random() * CARD_EFFECTS.length)];
    applyEffect(effect);
};

const stopGame = () => {
    gameActive = false;
    finalTitle.textContent = "Skorun";
    finalScore.textContent = `${score} puan`;
    showScreen(cardResult);
};

const renderLeaderboard = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    if (!entries.length) {
        leaderboardTable.innerHTML = "<p>Henüz skor yok.</p>";
        return;
    }
    leaderboardTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nickname</th>
                    <th>Skor</th>
                    <th>Tarih</th>
                </tr>
            </thead>
            <tbody>
                ${entries
                    .map(
                        (entry, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${entry.nickname}</td>
                        <td>${entry.score}</td>
                        <td>${new Date(entry.date).toLocaleDateString("tr-TR")}</td>
                    </tr>`
                    )
                    .join("")}
            </tbody>
        </table>
    `;
};

const saveLeaderboard = () => {
    saveFeedback.textContent = "";
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        saveFeedback.textContent = "Nickname gerekli.";
        return;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    entries.push({ nickname, score, date: new Date().toISOString() });
    entries.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 10)));
    renderLeaderboard();
    saveFeedback.textContent = "Kaydedildi.";
};

startBtn.addEventListener("click", () => {
    resetGame();
    showScreen(cardPlay);
});

restartBtn.addEventListener("click", () => {
    resetGame();
});

playAgainBtn.addEventListener("click", () => {
    resetGame();
    showScreen(cardPlay);
});

drawBtn.addEventListener("click", drawCard);
stopBtn.addEventListener("click", stopGame);
saveScoreBtn.addEventListener("click", saveLeaderboard);

renderLeaderboard();
