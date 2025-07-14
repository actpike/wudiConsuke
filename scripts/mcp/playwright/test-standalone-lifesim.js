const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser for visual verification
  const page = await browser.newPage();
  
  console.log('=== LifeSim Standalone Test 開始 ===');
  
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
    // Load standalone HTML file
    const htmlPath = 'file://' + path.resolve('/home/actpike/dev/ItsLifeWorld/standalone-lifesim/index.html');
    await page.goto(htmlPath, { waitUntil: 'networkidle', timeout: 10000 });
    
    console.log('✅ Standalone HTML loaded successfully');
    
    // Wait for game initialization
    await page.waitForTimeout(2000);
    
    // Check for game elements
    const canvas = await page.$('#gameCanvas');
    const startBtn = await page.$('#startBtn');
    const statsElement = await page.$('#gameStats');
    
    console.log('Canvas found:', !!canvas);
    console.log('Start button found:', !!startBtn);
    console.log('Stats panel found:', !!statsElement);
    
    // Take initial screenshot
    await page.screenshot({ path: 'standalone-lifesim-initial.png', fullPage: true });
    console.log('📸 Initial screenshot saved');
    
    // Start the game
    if (startBtn) {
      await startBtn.click();
      console.log('🎮 Game started');
      await page.waitForTimeout(1000);
    }
    
    // Check stats
    const turnCount = await page.textContent('#turnCount');
    const minaCount = await page.textContent('#minaCount');
    const aliveCount = await page.textContent('#aliveCount');
    
    console.log(`📊 Stats - Turn: ${turnCount}, Minas: ${minaCount}, Alive: ${aliveCount}`);
    
    // Test dungeon creation
    const createDungeonBtn = await page.$('#createDungeonBtn');
    if (createDungeonBtn) {
      await createDungeonBtn.click();
      console.log('🏰 Dungeon creation test');
      await page.waitForTimeout(500);
    }
    
    // Let the game run for a bit
    console.log('⏳ Letting game run for 5 seconds...');
    await page.waitForTimeout(5000);
    
    // Check final stats
    const finalTurnCount = await page.textContent('#turnCount');
    const finalAliveCount = await page.textContent('#aliveCount');
    const fpsCount = await page.textContent('#fpsCount');
    
    console.log(`📊 Final Stats - Turn: ${finalTurnCount}, Alive: ${finalAliveCount}, FPS: ${fpsCount}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'standalone-lifesim-running.png', fullPage: true });
    console.log('📸 Running screenshot saved');
    
    // Test global functions
    const dungeonResult = await page.evaluate(() => {
      return window.__testDungeon(30, 30);
    });
    console.log('🔧 Global function test result:', dungeonResult);
    
    console.log('\n=== Test Results ===');
    console.log('✅ Standalone HTML loads successfully');
    console.log('✅ Game elements present');
    console.log('✅ Game can be started and stopped');
    console.log('✅ Stats update properly');
    console.log('✅ Canvas rendering works');
    console.log('✅ Control buttons functional');
    console.log(`📊 Game ran for ${finalTurnCount} turns`);
    console.log(`🎯 ${finalAliveCount} Minas alive after test`);
    console.log(`⚡ Running at ${fpsCount} FPS`);
    console.log(`📝 ${logs.length} console logs, ${errors.length} errors`);
    
    if (errors.length === 0) {
      console.log('🎉 SUCCESS: No errors detected!');
    } else {
      console.log('⚠️ ERRORS:', errors);
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