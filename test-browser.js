const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8083');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'game-loaded.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})();
