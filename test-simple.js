const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Loading live site...');
    await page.goto('https://joverwiening.github.io/beemos-mountain-goat/', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'live-site.png', fullPage: true });
    console.log('Screenshot saved to live-site.png');
    
    // Check DOM
    const result = await page.evaluate(() => {
        const goatsAtBase = document.querySelectorAll('.goat-at-base');
        const goatsInSpaces = document.querySelectorAll('.space .goat');
        const bottomSpaces = document.querySelectorAll('.space.bottom');
        
        return {
            goatsAtBase: goatsAtBase.length,
            goatsInSpaces: goatsInSpaces.length,
            bottomSpaces: bottomSpaces.length,
            bottomSpaceTexts: Array.from(bottomSpaces).map(s => s.textContent.trim())
        };
    });
    
    console.log('\nDOM Check:');
    console.log('Bottom spaces:', result.bottomSpaces);
    console.log('Bottom space numbers:', result.bottomSpaceTexts.join(', '));
    console.log('Goats with .goat-at-base:', result.goatsAtBase);
    console.log('Goats in .space elements:', result.goatsInSpaces);
    
    await browser.close();
})();
