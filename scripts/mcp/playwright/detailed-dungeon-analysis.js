const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let consoleErrors = [];
  let act91Errors = [];
  
  // Set up console logging to capture errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
    
    if (type === 'error') {
      consoleErrors.push(text);
    }
    
    // Check for ACT-91 related errors specifically
    if (text.includes('ACT-91') || 
        text.includes('BFS') || 
        text.includes('pathfinding') || 
        text.includes('dungeon') || 
        text.includes('exit') || 
        text.includes('warp') || 
        text.includes('cache') ||
        text.toLowerCase().includes('error')) {
      console.log('🚨 POTENTIAL ACT-91 RELATED ERROR DETECTED: ' + text);
      act91Errors.push(text);
    }
  });
  
  // Navigate to the game
  console.log('Navigating to http://localhost:5174/...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Click on 軽量LifeSim button
  const gameButton = await page.locator('text=軽量LifeSim').first();
  
  if (await gameButton.isVisible()) {
    console.log('Clicking 軽量LifeSim button...');
    await gameButton.click();
    
    // Wait for game to load
    await page.waitForTimeout(5000);
    
    // Check if canvas is visible
    const canvas = await page.locator('canvas').first();
    if (await canvas.isVisible()) {
      console.log('✅ Game canvas found and loaded');
      
      // Take initial screenshot
      await page.screenshot({ path: 'detailed-dungeon-initial.png', fullPage: true });
      
      // Look for Mina list and check for dungeon missions
      console.log('Checking for Mina with dungeon missions...');
      
      // Wait for Minas to be assigned missions (we can see this in console logs)
      await page.waitForTimeout(3000);
      
      // Try to click on different areas of the canvas to interact with the game
      console.log('Interacting with the game canvas...');
      const canvasBounds = await canvas.boundingBox();
      
      // Click in various spots on the canvas to potentially reveal dungeons
      const clickPoints = [
        { x: canvasBounds.x + canvasBounds.width * 0.2, y: canvasBounds.y + canvasBounds.height * 0.2 },
        { x: canvasBounds.x + canvasBounds.width * 0.5, y: canvasBounds.y + canvasBounds.height * 0.5 },
        { x: canvasBounds.x + canvasBounds.width * 0.8, y: canvasBounds.y + canvasBounds.height * 0.8 },
      ];
      
      for (let i = 0; i < clickPoints.length; i++) {
        console.log(`Clicking point ${i + 1}: (${clickPoints[i].x}, ${clickPoints[i].y})`);
        await page.mouse.click(clickPoints[i].x, clickPoints[i].y);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `detailed-dungeon-click-${i + 1}.png`, fullPage: true });
      }
      
      // Look for dungeon-related UI elements
      console.log('Looking for dungeon-related UI elements...');
      
      // Check if there are any buttons or elements with "ダンジョン" text
      const dungeonElements = await page.locator('text=ダンジョン').all();
      console.log(`Found ${dungeonElements.length} elements containing "ダンジョン"`);
      
      // Check the right panel for Mina information
      const minaListElements = await page.locator('[data-testid*="mina"], .mina, [class*="mina"]').all();
      console.log(`Found ${minaListElements.length} potential Mina-related elements`);
      
      // Monitor the game for a longer period to see if dungeons appear
      console.log('Monitoring game for dungeon functionality over 60 seconds...');
      for (let i = 0; i < 12; i++) {
        await page.waitForTimeout(5000);
        console.log(`Monitoring ${i + 1}/12: Watching for dungeon activity...`);
        
        // Take periodic screenshots
        await page.screenshot({ path: `detailed-dungeon-monitor-${i + 1}.png`, fullPage: true });
        
        // Check for any new console messages
        if (act91Errors.length > 0) {
          console.log(`⚠️ Found ${act91Errors.length} ACT-91 related errors so far`);
        }
      }
      
      // Final analysis
      console.log('\n=== FINAL ANALYSIS ===');
      console.log(`Total console errors: ${consoleErrors.length}`);
      console.log(`ACT-91 related issues: ${act91Errors.length}`);
      
      if (act91Errors.length > 0) {
        console.log('\nACT-91 Related Issues Found:');
        act91Errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
      
      if (consoleErrors.length > 0) {
        console.log('\nAll Console Errors:');
        consoleErrors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'detailed-dungeon-final.png', fullPage: true });
      
    } else {
      console.log('❌ Game canvas not found - game may not have loaded properly');
    }
  } else {
    console.log('❌ 軽量LifeSim button not found');
  }
  
  await browser.close();
  console.log('\n✅ Detailed dungeon analysis completed');
})();