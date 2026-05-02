// CORRECTED: Movement now moves UP one step on the target mountain
function makeMove() {
    if (gameState.diceSum < 5 || gameState.diceSum > 10) return;
    
    const targetMountainNum = gameState.diceSum;
    const mountainIdx = mountains.findIndex(m => m.number === targetMountainNum);
    
    if (mountainIdx === -1) {
        updateStatus(`Invalid mountain number: ${targetMountainNum}`);
        return;
    }
    
    // Find a goat of current player to move up on this mountain
    let goatToMove = null;
    let fromSpaceIdx = -1;
    
    // Check if player has goat on this mountain (start from bottom)
    for (let sIdx = 0; sIdx < gameState.board[mountainIdx].length; sIdx++) {
        const goats = gameState.board[mountainIdx][sIdx];
        const idx = goats.findIndex(g => g.player === gameState.currentPlayer);
        if (idx > -1) {
            goatToMove = goats.splice(idx, 1)[0];
            fromSpaceIdx = sIdx;
            break;
        }
    }
    
    // If no goat on this mountain, place new one from hand at bottom
    if (!goatToMove && gameState.players[gameState.currentPlayer].goatsInHand > 0) {
        goatToMove = {
            player: gameState.currentPlayer,
            color: gameState.players[gameState.currentPlayer].color
        };
        gameState.players[gameState.currentPlayer].goatsInHand--;
        fromSpaceIdx = -1; // placing new
    }
    
    if (!goatToMove) {
        updateStatus(`No goat available to move on mountain ${targetMountainNum}!`);
        return;
    }
    
    // Determine destination: up one step from current position
    const destSpaceIdx = fromSpaceIdx + 1;
    
    if (destSpaceIdx >= mountains[mountainIdx].spaces) {
        updateStatus(`Goat already at peak of mountain ${targetMountainNum}!`);
        // Return goat to board
        if (fromSpaceIdx >= 0) {
            gameState.board[mountainIdx][fromSpaceIdx].push(goatToMove);
        } else {
            gameState.players[gameState.currentPlayer].goatsInHand++;
        }
        return;
    }
    
    const destGoats = gameState.board[mountainIdx][destSpaceIdx];
    const isPeak = destSpaceIdx === mountains[mountainIdx].spaces - 1;
    
    // Peak rule: only one goat allowed, kick others off
    if (isPeak && destGoats.length > 0) {
        destGoats.forEach(g => {
            gameState.players[g.player].goatsInHand++;
        });
        destGoats.length = 0;
    }
    
    // Place goat
    destGoats.push(goatToMove);
    
    // Score if on peak
    if (isPeak && gameState.pointTokens[targetMountainNum] > 0) {
        gameState.pointTokens[targetMountainNum]--;
        gameState.players[goatToMove.player].score += targetMountainNum;
        document.getElementById(`tokens-${targetMountainNum}`).textContent =
            gameState.pointTokens[targetMountainNum];
    }
    
    // Remove used dice
    gameState.selectedDice.sort((a, b) => b - a).forEach(idx => {
        gameState.diceRoll.splice(idx, 1);
    });
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
