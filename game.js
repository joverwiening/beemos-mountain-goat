// Game State
const gameState = {
    currentPlayer: 0,
    phase: 'roll', // 'roll', 'group', 'move'
    diceRoll: [],
    selectedDice: [],
    diceSum: 0,
    players: [
        { name: 'Player 1', color: 'yellow', score: 0 },
        { name: 'Player 2', color: 'red', score: 0 }
    ],
    board: {}, // key: mountain index -> array of space arrays (bottom to top)
    pointTokens: { 5: 12, 6: 11, 7: 10, 8: 9, 9: 8, 10: 7 },
    gameOver: false
};

// Mountain structure
const mountains = [
    { number: 5, spaces: 4 },
    { number: 6, spaces: 4 },
    { number: 7, spaces: 3 },
    { number: 8, spaces: 3 },
    { number: 9, spaces: 2 },
    { number: 10, spaces: 2 }
];

// Initialize board
mountains.forEach((m, idx) => {
    gameState.board[idx] = Array(m.spaces).fill(null).map(() => []);
});

// Place starting goats - all players start with one goat at bottom of each mountain
mountains.forEach((m, idx) => {
    gameState.players.forEach((player, pIdx) => {
        gameState.board[idx][0].push({ player: pIdx, color: player.color });
    });
});

function rollDice() {
    gameState.diceRoll = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
    ];

    const ones = gameState.diceRoll.filter(d => d === 1).length;
    if (ones > 1) {
        updateStatus(`Multiple 1s! Changed ${ones-1} to 6`);
        let changed = 0;
        gameState.diceRoll = gameState.diceRoll.map(d => {
            if (d === 1 && changed < ones - 1) {
                changed++;
                return 6;
            }
            return d;
        });
    }

    gameState.phase = 'group';
    gameState.selectedDice = [];
    renderDice();
    updateStatus(`Select dice (sum 5-10)`);
    document.getElementById('roll-dice').disabled = true;
}

function renderDice() {
    gameState.diceRoll.forEach((value, idx) => {
        const die = document.getElementById(`die-${idx + 1}`);
        die.textContent = value;
        die.className = 'die';
        if (gameState.selectedDice.includes(idx)) die.classList.add('selected');
        die.onclick = () => toggleDieSelection(idx);
    });
}

function toggleDieSelection(idx) {
    if (gameState.phase !== 'group') return;
    const dieIdx = gameState.selectedDice.indexOf(idx);
    if (dieIdx > -1) {
        gameState.selectedDice.splice(dieIdx, 1);
    } else {
        gameState.selectedDice.push(idx);
    }

    gameState.diceSum = gameState.selectedDice.reduce((sum, i) => sum + gameState.diceRoll[i], 0);
    renderDice();
    document.getElementById('selected-dice').textContent =
        gameState.selectedDice.length > 0 ? `Sum: ${gameState.diceSum}` : '';
    document.getElementById('make-move').disabled = !(gameState.diceSum >= 5 && gameState.diceSum <= 10);
}

function makeMove() {
    if (gameState.diceSum < 5 || gameState.diceSum > 10) return;

    const targetMountainNum = gameState.diceSum;
    const mountainIdx = mountains.findIndex(m => m.number === targetMountainNum);

    // Find player's goat on this mountain (lowest position)
    let goatFound = false;
    let fromSpaceIdx = -1;
    for (let sIdx = 0; sIdx < gameState.board[mountainIdx].length; sIdx++) {
        const goats = gameState.board[mountainIdx][sIdx];
        const idx = goats.findIndex(g => g.player === gameState.currentPlayer);
        if (idx > -1) {
            const goat = goats.splice(idx, 1)[0];
            fromSpaceIdx = sIdx;
            const destSpaceIdx = sIdx + 1;

            if (destSpaceIdx >= mountains[mountainIdx].spaces) {
                updateStatus(`Already at peak of mountain ${targetMountainNum}!`);
                goats.splice(idx, 0, goat);
                return;
            }

            moveGoatToSpace(goat, mountainIdx, destSpaceIdx);
            goatFound = true;
            break;
        }
    }

    if (!goatFound) {
        updateStatus(`Your goat is not on mountain ${targetMountainNum}!`);
    }
}

function moveGoatToSpace(goat, mountainIdx, spaceIdx) {
    const mountain = mountains[mountainIdx];
    const destGoats = gameState.board[mountainIdx][spaceIdx];
    const isPeak = spaceIdx === mountain.spaces - 1;

    // Peak: kick others off back to bottom of THIS mountain
    if (isPeak && destGoats.length > 0) {
        destGoats.forEach(g => {
            gameState.board[mountainIdx][0].push(g);
        });
        destGoats.length = 0;
    }

    destGoats.push(goat);

    // Score on peak
    if (isPeak && gameState.pointTokens[mountain.number] > 0) {
        gameState.pointTokens[mountain.number]--;
        gameState.players[goat.player].score += mountain.number;
        document.getElementById(`tokens-${mountain.number}`).textContent = gameState.pointTokens[mountain.number];
    }

    // Remove used dice
    gameState.selectedDice.sort((a, b) => b - a).forEach(idx => gameState.diceRoll.splice(idx, 1));
    gameState.selectedDice = [];

    renderBoard();
    renderPlayers();

    if (gameState.diceRoll.length === 0) {
        endTurn();
    } else {
        gameState.phase = 'group';
        renderDice();
        updateStatus('Group more dice or end turn');
    }
}

function renderBoard() {
    mountains.forEach((mountain, mIdx) => {
        const spaces = document.querySelectorAll(`.mountain-${mountain.number} .space`);
        for (let sIdx = 0; sIdx < mountain.spaces; sIdx++) {
            const space = spaces[sIdx];
            if (!space) continue;
            space.querySelectorAll('.goat').forEach(g => g.remove());
            const goats = gameState.board[mIdx][sIdx];
            goats.forEach((goat, gIdx) => {
                const goatEl = document.createElement('div');
                goatEl.className = `goat goat-${goat.color}`;
                goatEl.textContent = '🐐';
                if (goats.length > 1) goatEl.style.marginLeft = `${gIdx * 10}px`;
                space.appendChild(goatEl);
            });
        }
    });
}

function renderPlayers() {
    gameState.players.forEach((player, idx) => {
        const el = document.getElementById(`player-${idx + 1}`);
        el.className = 'player' + (idx === gameState.currentPlayer ? ' active' : '');
        el.querySelector('.player-score span').textContent = player.score;
    });
}

function endTurn() {
    gameState.currentPlayer = 1 - gameState.currentPlayer;
    gameState.phase = 'roll';
    gameState.diceRoll = [];
    document.getElementById('roll-dice').disabled = false;
    document.querySelectorAll('.space').forEach(s => s.classList.remove('valid'));
    renderPlayers();
    updateStatus(`${gameState.players[gameState.currentPlayer].name}: Roll dice`);
}

function updateStatus(msg) {
    document.getElementById('status-message').textContent = msg;
}

document.getElementById('roll-dice').onclick = rollDice;
document.getElementById('make-move').onclick = makeMove;
renderBoard();
renderPlayers();
