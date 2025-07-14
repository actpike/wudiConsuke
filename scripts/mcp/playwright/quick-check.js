const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // エラーチェック
    const facilityConfigErrors = errors.filter(e => e.includes('FacilityConfig'));
    if (facilityConfigErrors.length > 0) {
      console.log('FacilityConfig errors still present:', facilityConfigErrors);
    } else if (errors.length > 0) {
      console.log('Other errors found:', errors);
    } else {
      console.log('✅ No console errors - TypeScript issues resolved!');
    }
    
    // ゲーム画面確認
    const gameVisible = await page.locator('.light-lifesim, .lifesim-canvas').isVisible();
    console.log('Game visible:', gameVisible);
    
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  await browser.close();
})();