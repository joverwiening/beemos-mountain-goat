const playwright = require('playwright');

(async () => {
    console.log('DEBUG: Cross-mountain movement from peak\n');

    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8083', { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
        // Setup: Put 1 goat at peak of mountain 7
        const mtn7Idx = 2;
        const peakIdx = mountains[mtn7Idx].spaces - 1;

        // Clear ALL mountains first
        for (let mIdx = 0; mIdx < mountains.length; mIdx++) {
            for (let sIdx = 0; sIdx < gameState.board[mIdx].length; sIdx++) {
                gameState.board[mIdx][sIdx] = [];
            }
        }

        // Put exactly 1 yellow goat at mountain 7 peak
        gameState.board[mtn7Idx][peakIdx] = [{ player: 0, color: 'yellow' }];

        console.log('BEFORE MOVE:');
        console.log('Mountain 7 (target idx 2):');
        for (let i = 0; i < gameState.board[2].length; i++) {
            console.log(`  Space ${i}:`, gameState.board[2][i]);
        }
        console.log('Mountain 9 (target idx 4):');
        for (let i = 0; i < gameState.board[4].length; i++) {
            console.log(`  Space ${i}:`, gameState.board[4][i]);
        }

        // Set up to make move with sum=9
        gameState.currentPlayer = 0;
        gameState.phase = 'move';
        gameState.diceSum = 9;
        gameState.diceRoll = [9];
        gameState.selectedDice = [0];

        console.log('\nCALLING makeMove() with diceSum=9');

        // Call makeMove
        makeMove();

        console.log('\nAFTER MOVE:');
        console.log('Mountain 7:');
        for (let i = 0; i < gameState.board[2].length; i++) {
            console.log(`  Space ${i}:`, gameState.board[2][i]);
        }
        console.log('Mountain 9:');
        for (let i = 0; i < gameState.board[4].length; i++) {
            console.log(`  Space ${i}:`, gameState.board[4][i]);
        }

        return {
            mtn7Peak: gameState.board[2][peakIdx].length,
            mtn9Bottom: gameState.board[4][0].length
        };
    });

    console.log('\nRESULT:');
    console.log(`Mountain 7 peak goats: ${result.mtn7Peak}`);
    console.log(`Mountain 9 bottom goats: ${result.mtn9Bottom}`);
    console.log(`Expected: mtn7=0, mtn9=1`);
    console.log(`Success: ${result.mtn7Peak === 0 && result.mtn9Bottom === 1 ? 'YES' : 'NO'}`);

    await browser.close();
})();
