const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Loading live site...');
    await page.goto('https://joverwiening.github.io/beemos-mountain-goat/', { waitUntil: 'load' });
    
    // Wait for page to be ready
    await page.waitForTimeout(1000);
    
    const result = await page.evaluate(() => {
        // All goats start in hand (at base, game state board[mIdx][0])
        const goatsAtBase = document.querySelectorAll('.goat-at-base');
        const goatsInSpaces = document.querySelectorAll('.space .goat');
        
        // Check game state
        let totalGoatsAtBottom = 0;
        gameState.board.forEach(mountain => {
            totalGoatsAtBottom += mountain[0].length;
        });
        
        return {
            goatsAtBaseDOM: goatsAtBase.length,
            goatsInSpacesDOM: goatsInSpaces.length,
            totalGoatsAtBottomState: totalGoatsAtBottom,
            expectedGoats: gameState.players.length * 12 // 3 players × 12 goats
        };
    });
    
    console.log('\nInitial goat rendering:');
    console.log('Expected goats at base:', result.expectedGoats);
    console.log('Goats in game state at bottom (space 0):', result.totalGoatsAtBottomState);
    console.log('Goats with .goat-at-base class in DOM:', result.goatsAtBaseDOM);
    console.log('Goats inside .space elements in DOM:', result.goatsInSpacesDOM);
    console.log('\nTest:', result.goatsAtBaseDOM === result.expectedGoats ? 'PASS ✓' : 'FAIL ✗');
    
    await browser.close();
})();
