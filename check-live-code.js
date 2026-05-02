const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Checking live JavaScript code...\n');
    await page.goto('https://joverwiening.github.io/beemos-mountain-goat/', { waitUntil: 'networkidle' });
    
    // Get the actual renderBoard function from the live site
    const renderBoardCode = await page.evaluate(() => {
        return renderBoard.toString();
    });
    
    console.log('=== LIVE renderBoard function ===');
    console.log(renderBoardCode.substring(0, 1500));
    console.log('\n...\n');
    
    // Check if goat-at-base handling exists
    const hasBaseHandling = renderBoardCode.includes('goat-at-base');
    console.log('Has .goat-at-base handling:', hasBaseHandling);
    
    // Check CSS for goat-at-base
    const cssCheck = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets)
            .flatMap(sheet => {
                try {
                    return Array.from(sheet.cssRules);
                } catch (e) {
                    return [];
                }
            })
            .map(rule => rule.cssText)
            .join('\n');
        
        const hasGoatAtBase = styles.includes('goat-at-base');
        const goatAtBaseRule = styles.split('\n')
            .find(line => line.includes('.goat-at-base'));
        
        return { hasGoatAtBase, goatAtBaseRule };
    });
    
    console.log('\nCSS has .goat-at-base:', cssCheck.hasGoatAtBase);
    if (cssCheck.goatAtBaseRule) {
        console.log('Rule:', cssCheck.goatAtBaseRule);
    }
    
    await browser.close();
})();
