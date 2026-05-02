const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Loading live site and rolling dice...');
    await page.goto('https://joverwiening.github.io/beemos-mountain-goat/', { waitUntil: 'networkidle' });
    
    // Roll dice and place a goat at bottom (space 0 in game state)
    const result = await page.evaluate(() => {
        // Roll dice
        document.getElementById('roll-dice').click();
        
        // Wait for dice to appear
        return new Promise(resolve => {
            setTimeout(() => {
                // Get the dice values
                const diceValues = gameState.diceRoll;
                
                // Select first die if it's a valid mountain number (5-10)
                if (diceValues[0] >= 5 && diceValues[0] <= 10) {
                    gameState.selectedDice = [0];
                    gameState.diceSum = diceValues[0];
                    gameState.phase = 'group';
                    
                    // Make move (should place at bottom)
                    makeMove();
                    
                    setTimeout(() => {
                        // Check for goats
                        const goatsAtBase = document.querySelectorAll('.goat-at-base');
                        const goatsInSpaces = document.querySelectorAll('.space .goat');
                        
                        // Check game state board
                        const boardState = gameState.board.map((mountain, mIdx) => ({
                            mountain: mountains[mIdx].number,
                            bottomSpace: mountain[0].length,
                            allSpaces: mountain.map(s => s.length)
                        }));
                        
                        resolve({
                            goatsAtBase: goatsAtBase.length,
                            goatsInSpaces: goatsInSpaces.length,
                            boardState: boardState
                        });
                    }, 100);
                }
            }, 100);
        });
    });
    
    console.log('\nGoat rendering check:');
    console.log('Goats with .goat-at-base class:', result.goatsAtBase);
    console.log('Goats inside spaces:', result.goatsInSpaces);
    console.log('\nBoard state (bottom space goat count by mountain):');
    result.boardState.forEach(m => {
        console.log(`  Mountain ${m.mountain}: bottom=${m.bottomSpace}, all spaces=[${m.allSpaces.join(', ')}]`);
    });
    
    await browser.close();
})();
