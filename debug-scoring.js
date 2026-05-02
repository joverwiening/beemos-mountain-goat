const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('[PAGE]', msg.text()));
    
    await page.goto('http://localhost:8083', { waitUntil: 'networkidle' });
    
    console.log('Simulating game until first score...\n');
    
    for (let round = 0; round < 5; round++) {
        console.log(`\n--- Round ${round + 1} ---`);
        
        for (let turn = 0; turn < 3; turn++) {
            const playerInfo = await page.evaluate(() => ({
                name: gameState.players[gameState.currentPlayer].name,
                isAI: gameState.players[gameState.currentPlayer].isAI
            }));
            
            console.log(`${playerInfo.name}'s turn`);
            
            if (playerInfo.isAI) {
                await page.waitForTimeout(4000);
            } else {
                const canRoll = await page.$eval('#roll-dice', btn => !btn.disabled).catch(() => false);
                if (!canRoll) {
                    await page.waitForTimeout(2000);
                    continue;
                }
                
                await page.click('#roll-dice');
                await page.waitForTimeout(500);
                
                // Make all possible moves
                let moves = 0;
                while (moves < 5) {
                    const best = await page.evaluate(() => findBestDiceGroup(gameState.diceRoll));
                    if (!best) break;
                    
                    for (const idx of best.indices) {
                        await page.click(`#die-${idx + 1}`);
                        await page.waitForTimeout(50);
                    }
                    
                    console.log(`  Move to mountain ${best.sum}`);
                    
                    await page.click('#make-move');
                    await page.waitForTimeout(500);
                    moves++;
                    
                    const diceLeft = await page.evaluate(() => gameState.diceRoll.length);
                    if (diceLeft === 0) break;
                }
            }
            
            // Check board state
            const state = await page.evaluate(() => ({
                scores: gameState.players.map(p => `${p.name}:${p.score}`).join(' '),
                tokens: Object.entries(gameState.pointTokens).map(([k,v]) => `${k}:${v}`).join(' '),
                peakGoats: mountains.map((m, mIdx) => {
                    const peakIdx = m.spaces - 1;
                    return gameState.board[mIdx][peakIdx].length;
                })
            }));
            
            console.log(`  Scores: ${state.scores}`);
            console.log(`  Peaks occupied: ${state.peakGoats.filter(n => n > 0).length}/6`);
            
            const totalScore = await page.evaluate(() => 
                gameState.players.reduce((sum, p) => sum + p.score, 0)
            );
            
            if (totalScore > 0) {
                console.log(`\n✓ SCORING WORKS! Total: ${totalScore}`);
                console.log(`Tokens: ${state.tokens}`);
                await browser.close();
                return;
            }
        }
    }
    
    console.log('\n✗ No scoring after 5 rounds (15 turns)');
    console.log('Investigating why...');
    
    // Check if peaks are being reached
    const analysis = await page.evaluate(() => {
        let analysis = '';
        mountains.forEach((m, mIdx) => {
            const peakIdx = m.spaces - 1;
            const peakGoats = gameState.board[mIdx][peakIdx];
            analysis += `Mountain ${m.number} peak: ${peakGoats.length} goats\n`;
            
            // Show all spaces
            for (let sIdx = 0; sIdx < m.spaces; sIdx++) {
                const goats = gameState.board[mIdx][sIdx];
                if (goats.length > 0) {
                    analysis += `  Space ${sIdx}: ${goats.map(g => g.color[0]).join(',')}\n`;
                }
            }
        });
        return analysis;
    });
    
    console.log('\nBoard state:');
    console.log(analysis);
    
    await browser.close();
})();
