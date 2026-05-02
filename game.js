// Game State
const gameState = {
    currentPlayer: 0,
    selectedDie: null,
    selectedGoat: null, // {mountain, space} or 'hand'
    players: [
        { name: 'Player 1', color: 'green', score: 0, goatsInHand: 12 },
        { name: 'Player 2', color: 'orange', score: 0, goatsInHand: 12 }
    ],
    board: {}, // key: [array of goats]
    dicePool: { 5: 10, 6: 9, 7: 8, 8: 7, 9: 6, 10: 5 },
    gameOver: false
};

// Mountain configurations - each mountain's top space matches its number
const mountains = [
    { number: 5, spaces: [5, 6, 7] },
    { number: 6, spaces: [5, 6, 7] },
    { number: 7, spaces: [5, 6, 7] },
    { number: 8, spaces: [5, 6, 8] },
    { number: 9, spaces: [5, 6, 9] },
    { number: 10, spaces: [5, 6, 10] }
];

// Initialize board state - each space can hold multiple goats (array)
mountains.forEach(m => {
    m.spaces.forEach(s => {
        gameState.board[`${m.number}-${s}`] = [];
    });
});

// Check if space is a peak (top of mountain)
function isPeak(mountain, space) {
    const m = mountains.find(mt => mt.number === mountain);
    return m && space === m.spaces[m.spaces.length - 1];
}

// Initialize Game
function initGame() {
    renderBoard();
    renderPlayers();
    renderDicePool();
    setupEventListeners();
    updateGameStatus();
}

// Render Game Board
function renderBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    mountains.forEach(mountain => {
        const mountainDiv = document.createElement('div');
        mountainDiv.className = `mountain mountain-${mountain.number}`;

        mountain.spaces.forEach(spaceValue => {
            const space = document.createElement('div');
            space.className = 'space';
            space.dataset.mountain = mountain.number;
            space.dataset.space = spaceValue;
            space.dataset.key = `${mountain.number}-${spaceValue}`;

            const spaceNumber = document.createElement('div');
            spaceNumber.className = 'space-number';
            spaceNumber.textContent = spaceValue;
            space.appendChild(spaceNumber);

            // Make spaces clickable for placement
            space.addEventListener('click', () => handleSpaceClick(mountain.number, spaceValue));

            mountainDiv.appendChild(space);
        });

        board.appendChild(mountainDiv);
    });

    // Render existing goats
    Object.keys(gameState.board).forEach(key => {
        const goats = gameState.board[key];
        if (goats && goats.length > 0) {
            const [mountain, space] = key.split('-').map(Number);
            goats.forEach((goat, index) => {
                renderGoat(mountain, space, goat.player, index, goats.length);
            });
        }
    });
}

// Render Player Panels
function renderPlayers() {
    const panels = document.getElementById('player-panels');
    panels.innerHTML = '';

    gameState.players.forEach((player, index) => {
        const panel = document.createElement('div');
        panel.className = `player-panel${index === gameState.currentPlayer ? ' active' : ''}`;
        panel.dataset.playerIndex = index;

        // Count goats on board
        let goatsOnBoard = 0;
        Object.values(gameState.board).forEach(goats => {
            goatsOnBoard += goats.filter(g => g.player === index).length;
        });

        panel.innerHTML = `
            <div class="player-header">
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.score}</div>
            </div>
            <div class="player-goats">
                <div style="margin-bottom: 10px; font-size: 14px;">
                    In hand: ${player.goatsInHand}<br>
                    On board: ${goatsOnBoard}
                </div>
            </div>
        `;

        // Add button to place from hand
        if (index === gameState.currentPlayer && player.goatsInHand > 0 && gameState.selectedDie) {
            const placeBtn = document.createElement('button');
            placeBtn.textContent = `Place new goat (${gameState.selectedDie})`;
            placeBtn.style.cssText = 'margin-top:10px; padding:8px; cursor:pointer; width:100%';
            placeBtn.addEventListener('click', () => selectGoatFromHand());
            panel.querySelector('.player-goats').appendChild(placeBtn);
        }

        panels.appendChild(panel);
    });
}

// Render Dice Pool
function renderDicePool() {
    Object.keys(gameState.dicePool).forEach(value => {
        const countSpan = document.getElementById(`dice-${value}-count`);
        if (countSpan) {
            countSpan.textContent = gameState.dicePool[value];
        }

        // Disable if count = 0
        const token = document.querySelector(`[data-value="${value}"]`);
        if (token) {
            if (gameState.dicePool[value] === 0) {
                token.style.opacity = '0.3';
                token.style.cursor = 'not-allowed';
            } else {
                token.style.opacity = '1';
                token.style.cursor = 'pointer';
            }
        }
    });
}

// Render Goat on Board
function renderGoat(mountain, space, playerIndex, stackIndex = 0, totalInStack = 1) {
    const key = `${mountain}-${space}`;
    const player = gameState.players[playerIndex];
    const spaceEl = document.querySelector(`[data-key="${key}"]`);

    if (!spaceEl) return;

    // Position goats in a stack if multiple
    const goat = document.createElement('div');
    goat.className = `goat goat-${player.color}`;
    goat.dataset.player = playerIndex;
    goat.dataset.mountain = mountain;
    goat.dataset.space = space;
    goat.dataset.stackIndex = stackIndex;

    // Stack positioning - offset slightly if multiple goats
    if (totalInStack > 1) {
        const offsetX = (stackIndex - (totalInStack - 1) / 2) * 15;
        const offsetY = stackIndex * -5;
        goat.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    goat.addEventListener('click', (e) => {
        e.stopPropagation();
        handleGoatClick(mountain, space, playerIndex);
    });

    spaceEl.appendChild(goat);
}

// Setup Event Listeners
function setupEventListeners() {
    // Dice selection
    document.querySelectorAll('.dice-token').forEach(token => {
        token.addEventListener('click', () => {
            const value = parseInt(token.dataset.value);
            if (gameState.dicePool[value] > 0) {
                selectDie(value);
            }
        });
    });
}

// Select Die
function selectDie(value) {
    gameState.selectedDie = value;
    gameState.selectedGoat = null;

    // Update UI
    document.querySelectorAll('.dice-token').forEach(token => {
        token.classList.remove('selected');
    });
    document.querySelector(`[data-value="${value}"]`).classList.add('selected');

    // Clear any highlighted goats
    document.querySelectorAll('.goat').forEach(goat => {
        goat.classList.remove('selectable');
    });

    updateGameStatus(`Die ${value} selected. Click a goat to move or place new goat from hand.`);
    renderPlayers(); // Re-render to show place button
}

// Select Goat From Hand
function selectGoatFromHand() {
    gameState.selectedGoat = 'hand';
    updateGameStatus(`Selected new goat. Click any bottom space (5) to place.`);

    // Highlight valid placement spaces (all bottom spaces with value 5)
    document.querySelectorAll('[data-space="5"]').forEach(space => {
        space.style.boxShadow = '0 0 15px rgba(255,255,255,0.8)';
    });
}

// Handle Goat Click
function handleGoatClick(mountain, space, playerIndex) {
    if (playerIndex !== gameState.currentPlayer) {
        updateGameStatus('Not your goat!');
        return;
    }

    if (!gameState.selectedDie) {
        updateGameStatus('Select a die first');
        return;
    }

    // Select this goat for moving
    gameState.selectedGoat = { mountain, space, player: playerIndex };

    // Highlight this player's goats at this location
    document.querySelectorAll('.goat').forEach(g => g.classList.remove('selectable'));
    document.querySelectorAll(`[data-mountain="${mountain}"][data-space="${space}"][data-player="${playerIndex}"].goat`).forEach(g => {
        g.classList.add('selectable');
    });

    // Highlight valid destination spaces
    highlightValidMoves(mountain, space);
    updateGameStatus(`Goat selected. Click destination space (${gameState.selectedDie}).`);
}

// Highlight Valid Moves
function highlightValidMoves(fromMountain, fromSpace) {
    // Clear previous highlights
    document.querySelectorAll('.space').forEach(s => {
        s.style.boxShadow = '';
    });

    const targetSpace = gameState.selectedDie;

    // Highlight all spaces matching the die value (except current position)
    mountains.forEach(m => {
        if (m.spaces.includes(targetSpace)) {
            const key = `${m.number}-${targetSpace}`;
            if (key !== `${fromMountain}-${fromSpace}`) {
                const spaceEl = document.querySelector(`[data-key="${key}"]`);
                if (spaceEl) {
                    spaceEl.style.boxShadow = '0 0 15px rgba(255,255,255,0.8)';
                }
            }
        }
    });
}

// Handle Space Click
function handleSpaceClick(mountain, space) {
    if (!gameState.selectedDie) {
        updateGameStatus('Select a die first');
        return;
    }

    if (!gameState.selectedGoat) {
        updateGameStatus('Select a goat to move or place new from hand');
        return;
    }

    // Check if this is valid destination
    if (space !== gameState.selectedDie) {
        updateGameStatus(`Can only move to space ${gameState.selectedDie}`);
        return;
    }

    // Placing from hand - must be bottom space (5)
    if (gameState.selectedGoat === 'hand') {
        if (space !== 5) {
            updateGameStatus('New goats must be placed on bottom spaces (5)');
            return;
        }
        placeNewGoat(mountain);
        return;
    }

    // Moving existing goat
    const { mountain: fromMountain, space: fromSpace } = gameState.selectedGoat;

    if (fromMountain === mountain && fromSpace === space) {
        updateGameStatus('Must move to a different space');
        return;
    }

    moveGoat(fromMountain, fromSpace, mountain, space);
}

// Place New Goat
function placeNewGoat(mountain) {
    const player = gameState.currentPlayer;
    const space = 5; // Always bottom space
    const key = `${mountain}-${space}`;

    // Bottom space is not a peak, can have multiple goats
    gameState.board[key].push({ player, color: gameState.players[player].color });
    gameState.players[player].goatsInHand--;

    renderBoard();
    endTurn();
}

// Move Goat
function moveGoat(fromMountain, fromSpace, toMountain, toSpace) {
    const player = gameState.currentPlayer;
    const fromKey = `${fromMountain}-${fromSpace}`;
    const toKey = `${toMountain}-${toSpace}`;

    // Remove goat from old position
    const fromGoats = gameState.board[fromKey];
    const goatIndex = fromGoats.findIndex(g => g.player === player);
    if (goatIndex !== -1) {
        fromGoats.splice(goatIndex, 1);
    }

    // Check if destination is a peak - if so, kick all goats off
    if (isPeak(toMountain, toSpace)) {
        gameState.board[toKey].forEach(goat => {
            gameState.players[goat.player].goatsInHand++;
        });
        gameState.board[toKey] = [];
    }

    // Place goat at new position
    gameState.board[toKey].push({ player, color: gameState.players[player].color });

    renderBoard();
    endTurn();
}

// End Turn
function endTurn() {
    // Remove die from pool
    gameState.dicePool[gameState.selectedDie]--;

    // Calculate score for current player
    calculateScore();

    // Check win condition
    if (gameState.players[gameState.currentPlayer].score >= 12) {
        gameOver();
        return;
    }

    // Clear selections
    gameState.selectedDie = null;
    gameState.selectedGoat = null;

    // Clear highlights
    document.querySelectorAll('.dice-token').forEach(token => {
        token.classList.remove('selected');
    });
    document.querySelectorAll('.space').forEach(s => {
        s.style.boxShadow = '';
    });
    document.querySelectorAll('.goat').forEach(goat => {
        goat.classList.remove('selectable');
    });

    // Next player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;

    // Re-render
    renderPlayers();
    renderDicePool();
    updateGameStatus();
}

// Calculate Score
function calculateScore() {
    const player = gameState.currentPlayer;
    let score = 0;

    // Check all peak spaces
    mountains.forEach(m => {
        const peakSpace = m.spaces[m.spaces.length - 1]; // Top space
        const key = `${m.number}-${peakSpace}`;
        const goats = gameState.board[key];

        // Count this player's goats on peaks
        score += goats.filter(g => g.player === player).length;
    });

    gameState.players[player].score = score;
}

// Game Over
function gameOver() {
    gameState.gameOver = true;
    const winner = gameState.players[gameState.currentPlayer];
    updateGameStatus(`🎉 ${winner.name} WINS with ${winner.score} points! 🎉`);

    // Disable all interactions
    document.querySelectorAll('.dice-token').forEach(token => {
        token.style.cursor = 'not-allowed';
        token.style.opacity = '0.5';
    });
}

// Update Game Status
function updateGameStatus(customMessage = null) {
    const currentPlayerName = gameState.players[gameState.currentPlayer].name;
    document.getElementById('current-player-name').textContent = currentPlayerName;

    if (customMessage) {
        document.getElementById('game-message').textContent = customMessage;
    } else {
        document.getElementById('game-message').textContent = 'Select a die to begin your turn';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);
