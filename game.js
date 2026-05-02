// Game State
const gameState = {
    currentPlayer: 0,
    phase: 'roll', // 'roll', 'group', 'move'
    diceRoll: [],
    selectedDice: [],
    diceSum: 0,
    players: [
        { name: 'You', color: 'yellow', score: 0, isAI: false, inHand: 12 },
        { name: 'AI 1', color: 'red', score: 0, isAI: true, inHand: 12 },
        { name: 'AI 2', color: 'cyan', score: 0, isAI: true, inHand: 12 }
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

// Initialize board - all spaces start empty
mountains.forEach((m, idx) => {
    gameState.board[idx] = Array(m.spaces).fill(null).map(() => []);
});

// Players start with all goats in hand (tracked in player.inHand)

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

    // Enable end turn button if dice remain
    document.getElementById('end-turn').disabled = gameState.phase !== 'group' || gameState.diceRoll.length === 0;

    // Check if no valid moves possible - auto end turn
    if (gameState.phase === 'group' && gameState.diceRoll.length > 0) {
        const canMakeValidSum = checkValidSumsPossible();
        if (!canMakeValidSum) {
            setTimeout(() => endTurn(), 500);
        }
    }
}

function checkValidSumsPossible() {
    const n = gameState.diceRoll.length;
    for (let mask = 1; mask < (1 << n); mask++) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) sum += gameState.diceRoll[i];
        }
        if (sum >= 5 && sum <= 10) return true;
    }
    return false;
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
    if (gameState.phase !== 'group') return; // Prevent multiple clicks

    // Temporarily disable button to prevent double-clicks
    document.getElementById('make-move').disabled = true;

    const targetMountainNum = gameState.diceSum;
    const targetMountainIdx = mountains.findIndex(m => m.number === targetMountainNum);
    const currentPlayer = gameState.players[gameState.currentPlayer];

    // Find ALL goats owned by current player (on board)
    const allGoats = [];

    for (let mIdx = 0; mIdx < mountains.length; mIdx++) {
        for (let sIdx = 0; sIdx < gameState.board[mIdx].length; sIdx++) {
            const goats = gameState.board[mIdx][sIdx];
            const goatIdx = goats.findIndex(g => g.player === gameState.currentPlayer);

            if (goatIdx > -1) {
                allGoats.push({
                    fromMountain: mIdx,
                    fromSpace: sIdx,
                    goatIdx: goatIdx,
                    fromHand: false
                });
            }
        }
    }

    // If no goats on board but have goats in hand, place from hand
    if (allGoats.length === 0 && currentPlayer.inHand > 0) {
        allGoats.push({
            fromHand: true
        });
    }

    if (allGoats.length === 0) {
        updateStatus(`No goats available to move!`);
        return;
    }

    // Evaluate each possible move
    let bestMove = null;
    let bestPriority = -1;

    for (const goat of allGoats) {
        if (goat.fromHand) {
            // Place from hand to bottom of target mountain
            const priority = 5; // Medium priority
            if (priority > bestPriority) {
                bestPriority = priority;
                bestMove = {
                    fromHand: true,
                    toMountain: targetMountainIdx,
                    toSpace: 0
                };
            }
        } else {
            const isOnTargetMountain = goat.fromMountain === targetMountainIdx;
            const canMoveUp = isOnTargetMountain && goat.fromSpace + 1 < mountains[targetMountainIdx].spaces;

            if (canMoveUp) {
                // Priority 1: Move up on target mountain
                const priority = 10;
                if (priority > bestPriority) {
                    bestPriority = priority;
                    bestMove = {
                        ...goat,
                        toMountain: targetMountainIdx,
                        toSpace: goat.fromSpace + 1
                    };
                }
            } else {
                // Priority 0: Move any goat to bottom of target mountain (cross-mountain move)
                const priority = 0;
                if (priority > bestPriority) {
                    bestPriority = priority;
                    bestMove = {
                        ...goat,
                        toMountain: targetMountainIdx,
                        toSpace: 0
                    };
                }
            }
        }
    }

    if (!bestMove) {
        updateStatus(`No valid moves available!`);
        return;
    }

    // Execute the move
    let goat;
    if (bestMove.fromHand) {
        // Place from hand
        currentPlayer.inHand--;
        goat = { player: gameState.currentPlayer, color: currentPlayer.color };
    } else {
        // Move from board
        const goats = gameState.board[bestMove.fromMountain][bestMove.fromSpace];
        goat = goats.splice(bestMove.goatIdx, 1)[0];
    }

    moveGoatToSpace(goat, bestMove.toMountain, bestMove.toSpace);
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

    // Add delay for animation/readability
    setTimeout(() => {
        renderBoard();
        renderPlayers();

        if (gameState.diceRoll.length === 0) {
            setTimeout(() => endTurn(), 500);
        } else {
            gameState.phase = 'group';
            renderDice();
            updateStatus('Group more dice or end turn');
            document.getElementById('make-move').disabled = false;
        }
    }, 400); // 400ms delay to see the move
}

function renderBoard() {
    mountains.forEach((mountain, mIdx) => {
        const mountainElement = document.querySelectorAll(`.mountain-${mountain.number}`)[0];
        const spaces = document.querySelectorAll(`.mountain-${mountain.number} .space`);

        // Clear existing goats
        mountainElement.querySelectorAll('.goat, .goat-at-base').forEach(g => g.remove());

        // Render goats on the board (in spaces)
        for (let sIdx = 0; sIdx < mountain.spaces; sIdx++) {
            // HTML: spaces[0]=peak, spaces[last]=bottom
            // State: board[mIdx][0]=bottom, board[mIdx][last]=peak
            // So: HTML spaces[i] = board[mIdx][spaces-1-i]
            const spaceElement = spaces[sIdx];
            const stateIdx = mountain.spaces - 1 - sIdx;

            if (!spaceElement) continue;

            const goats = gameState.board[mIdx][stateIdx];

            // All goats on the board render inside their spaces
            goats.forEach((goat, gIdx) => {
                const goatEl = document.createElement('div');
                goatEl.className = `goat goat-${goat.color}`;
                goatEl.textContent = '🐐';
                // Random positioning within the space
                const randomX = 20 + Math.random() * 60;
                const randomY = 20 + Math.random() * 60;
                goatEl.style.left = `${randomX}%`;
                goatEl.style.top = `${randomY}%`;
                goatEl.style.transform = 'translate(-50%, -50%)';
                spaceElement.appendChild(goatEl);
            });
        }

        // Render goats in hand (reserve goats) BELOW the mountain
        gameState.players.forEach((player, pIdx) => {
            const goatsInHand = player.inHand || 0;
            // Show up to 3 goats visually per mountain (spread across mountains)
            const goatsToShow = Math.min(3, goatsInHand);
            for (let i = 0; i < goatsToShow; i++) {
                const goatEl = document.createElement('div');
                goatEl.className = `goat-at-base goat-${player.color}`;
                goatEl.textContent = '🐐';
                // Random horizontal AND vertical positioning
                const randomX = (Math.random() - 0.5) * 50 + (pIdx - 1) * 20; // spread by player
                const randomY = Math.random() * 20; // 0-20px vertical spread
                goatEl.style.left = `calc(50% + ${randomX}px)`;
                goatEl.style.bottom = `${-35 - randomY}px`;
                goatEl.style.transform = 'translateX(-50%)';
                mountainElement.appendChild(goatEl);
            }
        });
    });
}

function renderPlayers() {
    gameState.players.forEach((player, idx) => {
        const el = document.getElementById(`player-${idx + 1}`);
        el.className = 'player' + (idx === gameState.currentPlayer ? ' active' : '');
        el.querySelector('.player-score > span').textContent = player.score;
        el.querySelector('.in-hand').textContent = player.inHand || 0;
    });
}

function endTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    gameState.phase = 'roll';
    gameState.diceRoll = [];
    document.getElementById('roll-dice').disabled = false;
    document.querySelectorAll('.space').forEach(s => s.classList.remove('valid'));
    renderPlayers();

    const currentPlayer = gameState.players[gameState.currentPlayer];
    updateStatus(`${currentPlayer.name}: Roll dice`);

    if (currentPlayer.isAI) {
        playAITurn();
    }
}

function updateStatus(msg) {
    document.getElementById('status-message').textContent = msg;
}

// AI Logic
function evaluateMove(sum) {
    const targetMountainIdx = mountains.findIndex(m => m.number === sum);
    const currentPlayer = gameState.currentPlayer;

    let score = sum; // Base score: mountain value

    // Check if we have a goat on target mountain that can move up
    let canMoveUp = false;
    let nearPeak = false;

    for (let sIdx = 0; sIdx < gameState.board[targetMountainIdx].length; sIdx++) {
        const goats = gameState.board[targetMountainIdx][sIdx];
        if (goats.some(g => g.player === currentPlayer)) {
            if (sIdx + 1 < mountains[targetMountainIdx].spaces) {
                canMoveUp = true;
                const distanceToPeak = mountains[targetMountainIdx].spaces - 1 - sIdx;
                if (distanceToPeak === 1) {
                    // One move from peak - prioritize heavily
                    score += 15;
                    nearPeak = true;
                } else if (distanceToPeak === 2) {
                    score += 5;
                }
            }
            break;
        }
    }

    // Bonus for being able to move up (efficient progress)
    if (canMoveUp && !nearPeak) {
        score += 3;
    }

    // Check if peak is available or has opponent
    const peakIdx = mountains[targetMountainIdx].spaces - 1;
    const peakGoats = gameState.board[targetMountainIdx][peakIdx];
    if (peakGoats.length > 0 && !peakGoats.some(g => g.player === currentPlayer)) {
        // Opponent on peak - kicking them off is valuable
        score += 5;
    }

    // Check remaining tokens
    if (gameState.pointTokens[sum] === 0) {
        // No tokens left, mountain is less valuable
        score -= 20;
    } else if (gameState.pointTokens[sum] <= 2) {
        // Few tokens left - rush it
        score += 8;
    }

    return score;
}

function findBestDiceGroup(diceRoll) {
    // Find all valid groupings (sum 5-10)
    const validGroups = [];
    const n = diceRoll.length;

    // Try all subsets
    for (let mask = 1; mask < (1 << n); mask++) {
        const group = [];
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) group.push(i);
        }
        const sum = group.reduce((s, i) => s + diceRoll[i], 0);
        if (sum >= 5 && sum <= 10) {
            validGroups.push({
                indices: group,
                sum,
                score: evaluateMove(sum)
            });
        }
    }

    // Sort by evaluated score (strategic, not just greedy)
    validGroups.sort((a, b) => b.score - a.score);
    return validGroups[0] || null;
}

function playAITurn() {
    const player = gameState.players[gameState.currentPlayer];
    if (!player.isAI) return;

    setTimeout(() => {
        // Roll dice
        rollDice();

        setTimeout(() => {
            // Find best grouping and make move
            const bestGroup = findBestDiceGroup(gameState.diceRoll);
            if (bestGroup) {
                gameState.selectedDice = bestGroup.indices;
                gameState.diceSum = bestGroup.sum;
                makeMove();

                // If more dice remain, play again
                if (gameState.diceRoll.length > 0 && gameState.currentPlayer === player && player.isAI) {
                    playAITurn();
                }
            } else {
                endTurn();
            }
        }, 800);
    }, 1000);
}

// endTurn function is defined above (line 266)

// Randomize turn order
function shufflePlayers() {
    for (let i = gameState.players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.players[i], gameState.players[j]] = [gameState.players[j], gameState.players[i]];
    }

    // Find human player index
    const humanIdx = gameState.players.findIndex(p => !p.isAI);
    gameState.currentPlayer = humanIdx; // Start with human

    updateStatus(`${gameState.players[gameState.currentPlayer].name}: Roll dice`);
}

document.getElementById('roll-dice').onclick = rollDice;
document.getElementById('make-move').onclick = makeMove;
document.getElementById('end-turn').onclick = () => {
    if (gameState.phase === 'group' && gameState.diceRoll.length > 0) {
        endTurn();
    }
};

shufflePlayers();
renderBoard();
renderPlayers();

// Check if AI goes first
if (gameState.players[gameState.currentPlayer].isAI) {
    playAITurn();
}
