const { chromium } = require('playwright');

async function interactiveLifeSimTest() {
  console.log('🎮 Interactive LifeSim Test Starting...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 }); // Visual mode for demo
  const page = await browser.newPage();
  
  try {
    console.log('📍 Navigating to LifeSim site...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    // Look for LifeSim specific button
    console.log('🔍 Looking for LifeSim button...');
    const lifesimButton = page.locator('text=/ライフシム|LifeSim|Life.*Sim/i');
    const lifesimCount = await lifesimButton.count();
    console.log(`🎯 LifeSim buttons found: ${lifesimCount}`);
    
    if (lifesimCount > 0) {
      console.log('🖱️ Clicking LifeSim button...');
      await lifesimButton.first().click();
      await page.waitForTimeout(3000);
      
      // Check for canvas after clicking
      const canvasAfterClick = await page.locator('canvas').count();
      console.log(`🎮 Canvas elements after clicking: ${canvasAfterClick}`);
      
      if (canvasAfterClick > 0) {
        console.log('✅ LifeSim game canvas detected!');
        
        // Look for game controls
        const gameButtons = await page.locator('button').allTextContents();
        console.log('🔘 Game buttons:');
        gameButtons.forEach((btn, i) => console.log(`   ${i+1}. ${btn}`));
        
        // Look for Mina references
        const minaText = await page.locator('text=/Mina|人間/i').count();
        console.log(`👥 Mina/Human references: ${minaText}`);
        
        // Try to interact with the game
        console.log('🎮 Testing game interactions...');
        
        // Look for start/pause buttons
        const startButton = page.locator('button:has-text("開始"), button:has-text("Start"), button:has-text("start")');
        const startCount = await startButton.count();
        
        if (startCount > 0) {
          console.log('▶️ Found start button, clicking...');
          await startButton.first().click();
          await page.waitForTimeout(5000);
          
          // Check for game activity
          const gameInfo = await page.locator('[class*="info"], [class*="stat"], [class*="log"]').count();
          console.log(`📊 Game info elements: ${gameInfo}`);
          
          // Take screenshot of active game
          await page.screenshot({ path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/game-active.png', fullPage: true });
          console.log('📸 Game screenshot saved');
          
          // Look for simulation data
          const humanList = await page.locator('text=/Mina.*[0-9]|人間.*[0-9]/i').count();
          console.log(`👥 Human/Mina entries found: ${humanList}`);
          
          // Test clicking on canvas for interaction
          if (canvasAfterClick > 0) {
            console.log('🖱️ Testing canvas interaction...');
            const canvas = page.locator('canvas').first();
            await canvas.click({ position: { x: 100, y: 100 } });
            await page.waitForTimeout(2000);
            
            // Click another position
            await canvas.click({ position: { x: 200, y: 150 } });
            await page.waitForTimeout(2000);
            
            console.log('✅ Canvas interaction completed');
          }
          
        } else {
          console.log('⚠️ No start button found');
        }
        
      } else {
        console.log('⚠️ No game canvas appeared after clicking');
      }
      
    } else {
      console.log('⚠️ LifeSim button not found, trying other approaches...');
      
      // Try clicking any button that might lead to the game
      const allButtons = await page.locator('button').allTextContents();
      console.log('🔘 Available buttons:');
      allButtons.forEach((btn, i) => console.log(`   ${i+1}. ${btn}`));
      
      // Try clicking buttons one by one
      for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
        const buttonText = allButtons[i];
        console.log(`🖱️ Testing button: "${buttonText}"`);
        
        await page.locator('button').nth(i).click();
        await page.waitForTimeout(2000);
        
        const newCanvas = await page.locator('canvas').count();
        if (newCanvas > 0) {
          console.log(`✅ Canvas appeared after clicking "${buttonText}"!`);
          break;
        }
      }
    }
    
    // Final state check
    console.log('📊 Final state check...');
    const finalCanvas = await page.locator('canvas').count();
    const finalButtons = await page.locator('button').count();
    const finalText = await page.textContent('body');
    
    console.log(`🎮 Final canvas count: ${finalCanvas}`);
    console.log(`🔘 Final button count: ${finalButtons}`);
    console.log(`📝 Contains "Mina": ${finalText.includes('Mina')}`);
    console.log(`🎯 Contains "Life": ${finalText.includes('Life') || finalText.includes('ライフ')}`);
    
    // Keep browser open for 10 seconds for visual inspection
    console.log('👀 Keeping browser open for visual inspection (10 seconds)...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Interactive test failed:', error.message);
  } finally {
    await browser.close();
    console.log('🎉 Interactive LifeSim test completed!');
  }
}

// Run the interactive test
interactiveLifeSimTest().catch(console.error);