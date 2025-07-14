const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set up console logging to capture errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
    
    // Check for ACT-91 related errors
    if (text.includes('ACT-91') || 
        text.includes('BFS') || 
        text.includes('pathfinding') || 
        text.includes('dungeon') || 
        text.includes('exit') || 
        text.includes('warp') || 
        text.includes('cache') ||
        text.toLowerCase().includes('error')) {
      console.log('🚨 POTENTIAL ACT-91 RELATED ERROR DETECTED: ' + text);
    }
  });
  
  // Navigate to the game
  console.log('Navigating to http://localhost:5174/...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  
  // Take initial screenshot
  await page.screenshot({ path: 'lifesim-initial.png', fullPage: true });
  console.log('Initial screenshot saved: lifesim-initial.png');
  
  // Wait for page to load and look for the game button
  await page.waitForTimeout(2000);
  
  // Click on 軽量LifeSim button
  console.log('Looking for 軽量LifeSim button...');
  const gameButton = await page.locator('text=軽量LifeSim').first();
  
  if (await gameButton.isVisible()) {
    console.log('Found 軽量LifeSim button, clicking...');
    await gameButton.click();
    
    // Wait for game to load
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'lifesim-game-loaded.png', fullPage: true });
    console.log('Game loaded screenshot saved: lifesim-game-loaded.png');
    
    // Check for canvas element (game should be rendered on canvas)
    const canvas = await page.locator('canvas').first();
    if (await canvas.isVisible()) {
      console.log('✅ Game canvas found and visible');
      
      // Get canvas dimensions
      const canvasBounds = await canvas.boundingBox();
      console.log('Canvas dimensions:', canvasBounds);
      
      // Monitor for dungeon-related elements
      console.log('Monitoring game for dungeon functionality...');
      
      // Wait and observe the game for 30 seconds
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(5000);
        console.log(`Observation ${i + 1}/6: Monitoring console and game state...`);
        
        // Take periodic screenshots
        await page.screenshot({ path: `lifesim-observation-${i + 1}.png`, fullPage: true });
      }
      
      console.log('✅ 30-second observation completed');
      
    } else {
      console.log('❌ Game canvas not found');
    }
    
  } else {
    console.log('❌ 軽量LifeSim button not found');
    
    // Take screenshot of what we see
    await page.screenshot({ path: 'lifesim-button-not-found.png', fullPage: true });
    console.log('Button not found screenshot saved: lifesim-button-not-found.png');
  }
  
  // Final screenshot
  await page.screenshot({ path: 'lifesim-final.png', fullPage: true });
  console.log('Final screenshot saved: lifesim-final.png');
  
  await browser.close();
  console.log('Testing completed');
})();