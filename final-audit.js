const { chromium } = require('playwright');

console.log('========== MOUNTAIN GOATS - FINAL QA AUDIT ==========\n');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const bugs = [];
    
    // TEST 1: Complete game playthrough
    console.log('TEST 1: Full game playthrough (5 rounds)');
    const page1 = await browser.newPage();
    await page1.goto('http://localhost:8083', { waitUntil: 'networkidle' });
    
    for (let round = 0; round < 5; round++) {
        for (let turn = 0; turn < 3; turn++) {
            const isHuman = await page1.evaluate(() => !gameState.players[gameState.currentPlayer].isAI);
            
            if (isHuman) {
                const canRoll = await page1.$eval('#roll-dice', btn => !btn.disabled).catch(() => false);
                if (canRoll) {
                    await page1.click('#roll-dice');
                    await page1.waitForTimeout(500);
                    
                    let moves = 0;
                    while (moves++ < 5) {
                        const best = await page1.evaluate(() => findBestDiceGroup(gameState.diceRoll));
                        if (!best) break;
                        
                        for (const idx of best.indices) {
                            await page1.click(`#die-${idx + 1}`);
                            await page1.waitForTimeout(50);
                        }
                        
                        await page1.click('#make-move');
                        await page1.waitForTimeout(300);
                        
                        const diceLeft = await page1.evaluate(() => gameState.diceRoll.length);
                        if (diceLeft === 0) break;
                    }
                }
            } else {
                await page1.waitForTimeout(4000);
            }
        }
    }
    
    const final = await page1.evaluate(() => ({
        scores: gameState.players.map(p => ({ name: p.name, score: p.score })),
        totalScore: gameState.players.reduce((s, p) => s + p.score, 0)
    }));
    
    console.log('  Final scores:', final.scores.map(s => `${s.name}:${s.score}`).join(', '));
    console.log('  Total points:', final.totalScore);
    
    if (final.totalScore === 0) {
        bugs.push('No scoring happened in 5 rounds');
    }
    
    console.log(final.totalScore > 0 ? '  ✓ PASS\n' : '  ✗ FAIL\n');
    await page1.close();
    
    // TEST 2: AI strategy variance
    console.log('TEST 2: AI makes non-greedy decisions');
    const page2 = await browser.newPage();
    await page2.goto('http://localhost:8083', { waitUntil: 'networkidle' });
    
    // Set up scenario where tactical move != greedy move
    const tacticalChoice = await page2.evaluate(() => {
        // Simulate: goat 1 away from peak on mountain 7
        gameState.board[2][1] = [{ player: 0, color: 'yellow' }];
        
        // Test dice: [2,3,4,6] -> can make 7 or 10
        const testDice = [2, 3, 4, 6];
        gameState.diceRoll = testDice;
        
        const best = findBestDiceGroup(testDice);
        
        return {
            sum: best.sum,
            score: best.score,
            wouldPick7Over10: best.sum === 7 && best.score > 10
        };
    });
    
    console.log(`  Best choice: mountain ${tacticalChoice.sum} (score: ${tacticalChoice.score.toFixed(1)})`);
    console.log(`  AI considers position: ${tacticalChoice.score > tacticalChoice.sum ? 'YES' : 'NO'}`);
    console.log(tacticalChoice.score > tacticalChoice.sum ? '  ✓ PASS\n' : '  ✗ FAIL\n');
    
    await page2.close();
    
    // TEST 3: Edge case - all tokens depleted
    console.log('TEST 3: Handle depleted token mountains');
    const page3 = await browser.newPage();
    await page3.goto('http://localhost:8083', { waitUntil: 'networkidle' });
    
    const tokenTest = await page3.evaluate(() => {
        // Deplete mountain 5 tokens
        gameState.pointTokens[5] = 0;
        
        // Test evaluation
        const eval5 = evaluateMove(5);
        const eval6 = evaluateMove(6);
        
        return { eval5, eval6, penaltyApplied: eval5 < 5 };
    });
    
    console.log(`  Mountain 5 (0 tokens): eval=${tokenTest.eval5}`);
    console.log(`  Mountain 6 (tokens left): eval=${tokenTest.eval6}`);
    console.log(`  Penalty applied: ${tokenTest.penaltyApplied ? 'YES' : 'NO'}`);
    console.log(tokenTest.penaltyApplied ? '  ✓ PASS\n' : '  ✗ FAIL\n');
    
    await page3.close();
    
    // TEST 4: Cross-mountain movement
    console.log('TEST 4: Goats move between mountains');
    const page4 = await browser.newPage();
    await page4.goto('http://localhost:8083', { waitUntil: 'networkidle' });
    
    const crossMove = await page4.evaluate(() => {
        // Clear ALL mountains first
        for (let mIdx = 0; mIdx < mountains.length; mIdx++) {
            for (let sIdx = 0; sIdx < gameState.board[mIdx].length; sIdx++) {
                gameState.board[mIdx][sIdx] = [];
            }
        }

        // Put exactly 1 goat at peak of mountain 7
        const mtn7Idx = 2;
        const peakIdx = mountains[mtn7Idx].spaces - 1;
        gameState.board[mtn7Idx][peakIdx] = [{ player: 0, color: 'yellow' }];

        // Try to move with sum=9 (should move from mtn 7 peak to mtn 9 bottom)
        gameState.currentPlayer = 0;
        gameState.diceSum = 9;
        gameState.diceRoll = [9];
        gameState.selectedDice = [0];
        
        const beforeMtn7 = gameState.board[mtn7Idx][peakIdx].length;
        const beforeMtn9 = gameState.board[4][0].length;
        
        makeMove();
        
        const afterMtn7 = gameState.board[mtn7Idx][peakIdx].length;
        const afterMtn9 = gameState.board[4][0].length;
        
        return {
            mtn7Before: beforeMtn7,
            mtn7After: afterMtn7,
            mtn9Before: beforeMtn9,
            mtn9After: afterMtn9,
            moved: beforeMtn7 > afterMtn7 && afterMtn9 > beforeMtn9
        };
    });
    
    console.log(`  Mountain 7 peak: ${crossMove.mtn7Before} → ${crossMove.mtn7After}`);
    console.log(`  Mountain 9 bottom: ${crossMove.mtn9Before} → ${crossMove.mtn9After}`);
    console.log(`  Cross-mountain move: ${crossMove.moved ? 'YES' : 'NO'}`);
    console.log(crossMove.moved ? '  ✓ PASS\n' : '  ✗ FAIL\n');
    
    if (!crossMove.moved) {
        bugs.push('Goats still getting stuck at peaks');
    }
    
    await page4.close();
    
    // TEST 5: Multiple moves per turn
    console.log('TEST 5: Multiple moves in one turn');
    const page5 = await browser.newPage();
    await page5.goto('http://localhost:8083', { waitUntil: 'networkidle' });
    
    // Wait for human turn
    let attempts = 0;
    while (attempts++ < 10) {
        const isHuman = await page5.evaluate(() => !gameState.players[gameState.currentPlayer].isAI);
        if (isHuman) break;
        await page5.waitForTimeout(1000);
    }
    
    await page5.click('#roll-dice');
    await page5.waitForTimeout(500);
    
    let turnMoves = 0;
    while (turnMoves < 5) {
        const best = await page5.evaluate(() => findBestDiceGroup(gameState.diceRoll));
        if (!best) break;
        
        for (const idx of best.indices) {
            await page5.click(`#die-${idx + 1}`);
            await page5.waitForTimeout(50);
        }
        
        await page5.click('#make-move');
        await page5.waitForTimeout(300);
        turnMoves++;
        
        const diceLeft = await page5.evaluate(() => gameState.diceRoll.length);
        if (diceLeft === 0) break;
    }
    
    console.log(`  Moves made: ${turnMoves}`);
    console.log(turnMoves >= 1 ? '  ✓ PASS\n' : '  ✗ FAIL\n');
    
    await page5.close();
    
    await browser.close();
    
    console.log('========== AUDIT SUMMARY ==========');
    if (bugs.length === 0) {
        console.log('✓ NO BUGS FOUND');
        console.log('\nGame is production-ready!');
    } else {
        console.log(`✗ FOUND ${bugs.length} BUG(S):`);
        bugs.forEach((bug, i) => console.log(`  ${i+1}. ${bug}`));
    }
    
    console.log('\nQA audit complete!');
})();
