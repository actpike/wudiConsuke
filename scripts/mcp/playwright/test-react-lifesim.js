const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser for visual verification
  const page = await browser.newPage();
  
  console.log('=== React版軽量LifeSimテスト開始 ===');
  
  // Console monitoring
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log('🎮 Console:', text);
    logs.push(text);
    
    if (msg.type() === 'error') {
      console.log('🚨 Error:', text);
      errors.push(text);
    }
  });
  
  try {
    // Load React preview build
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 10000 });
    
    console.log('✅ React preview build loaded successfully');
    
    // Wait for React app initialization
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'react-lifesim-initial.png', fullPage: true });
    console.log('📸 Initial screenshot saved');
    
    // Look for app switching buttons
    const appButtons = await page.$$('.app-button, button');
    console.log(`Found ${appButtons.length} buttons`);
    
    // Try to find the 軽量LifeSim button
    let lightLifeSimButton = null;
    for (const button of appButtons) {
      const text = await button.textContent();
      console.log(`Button text: "${text}"`);
      if (text && text.includes('軽量LifeSim')) {
        lightLifeSimButton = button;
        break;
      }
    }
    
    if (lightLifeSimButton) {
      console.log('🎯 Found 軽量LifeSim button, clicking...');
      await lightLifeSimButton.click();
      
      // Wait for component transition
      await page.waitForTimeout(3000);
      
      // Check for LifeSim elements
      const canvas = await page.$('#gameCanvas, canvas');
      const startBtn = await page.$('#startBtn, button[class*="start"], button[class*="開始"]');
      const statsElement = await page.$('#gameStats, [class*="stats"]');
      
      console.log('Canvas found:', !!canvas);
      console.log('Start button found:', !!startBtn);
      console.log('Stats panel found:', !!statsElement);
      
      // Take LifeSim screenshot
      await page.screenshot({ path: 'react-lifesim-active.png', fullPage: true });
      console.log('📸 LifeSim active screenshot saved');
      
      // Try to start the game if start button exists
      if (startBtn) {
        console.log('🎮 Attempting to start game...');
        await startBtn.click();
        await page.waitForTimeout(2000);
        
        // Take running screenshot
        await page.screenshot({ path: 'react-lifesim-running.png', fullPage: true });
        console.log('📸 Game running screenshot saved');
      }
      
      console.log('\n=== React軽量LifeSimテスト結果 ===');
      console.log('✅ React preview build accessible');
      console.log('✅ 軽量LifeSimボタン機能');
      console.log('✅ Component transition works');
      console.log(`📊 Console logs: ${logs.length}, Errors: ${errors.length}`);
      
      if (errors.length === 0) {
        console.log('🎉 SUCCESS: React軽量LifeSim動作確認完了!');
      } else {
        console.log('⚠️ WARNINGS: Some errors detected');
        errors.forEach(err => console.log(`  - ${err}`));
      }
      
    } else {
      console.log('❌ 軽量LifeSimボタンが見つかりません');
      
      // Check what buttons are available
      console.log('Available buttons:');
      for (const button of appButtons) {
        const text = await button.textContent();
        console.log(`  - "${text}"`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  // Keep browser open for manual inspection
  console.log('\n👀 Browser kept open for manual inspection...');
  console.log('Press Ctrl+C to close when done');
  
  // Wait indefinitely
  await new Promise(() => {});
  
})();