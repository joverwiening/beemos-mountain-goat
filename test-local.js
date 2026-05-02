const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Testing local version...\n');
    await page.goto('http://localhost:8123/', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(1000);
    
    const result = await page.evaluate(() => {
        const goatsAtBase = document.querySelectorAll('.goat-at-base');
        const goatsInSpaces = document.querySelectorAll('.space .goat');
        const bottomSpaces = document.querySelectorAll('.space.bottom');
        const inHandCounts = Array.from(document.querySelectorAll('.in-hand')).map(el => el.textContent);
        
        return {
            goatsAtBase: goatsAtBase.length,
            goatsInSpaces: goatsInSpaces.length,
            bottomSpaces: bottomSpaces.length,
            bottomSpaceTexts: Array.from(bottomSpaces).map(s => s.textContent.trim()),
            inHandCounts: inHandCounts
        };
    });
    
    console.log('Initial state check:');
    console.log('  Bottom spaces:', result.bottomSpaces, '- Numbers:', result.bottomSpaceTexts.join(', '));
    console.log('  Goats at base (reserve):', result.goatsAtBase);
    console.log('  Goats in spaces (on board):', result.goatsInSpaces);
    console.log('  In hand counts:', result.inHandCounts.join(', '));
    console.log('\nExpected: 0 goats on board, ~18 reserve goats visible, all players have 12 in hand');
    
    // Take screenshot
    await page.screenshot({ path: 'test-local.png', fullPage: true });
    console.log('\nScreenshot saved to test-local.png');
    
    await browser.close();
})();
