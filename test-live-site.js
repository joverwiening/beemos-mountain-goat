const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Loading live site...');
    await page.goto('https://joverwiening.github.io/beemos-mountain-goat/', { waitUntil: 'networkidle' });
    
    // Check if bottom spaces show numbers
    const result = await page.evaluate(() => {
        const bottomSpaces = document.querySelectorAll('.space.bottom');
        const results = [];
        
        bottomSpaces.forEach((space, idx) => {
            const computedStyle = window.getComputedStyle(space);
            results.push({
                index: idx,
                textContent: space.textContent.trim(),
                fontSize: computedStyle.fontSize,
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity
            });
        });
        
        return results;
    });
    
    console.log('\nBottom spaces CSS check:');
    console.log(JSON.stringify(result, null, 2));
    
    await browser.close();
})();
