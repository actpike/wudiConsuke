const { chromium } = require('playwright');

async function testLifeSim() {
  console.log('🚀 LifeSim E2E Test Starting...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to LifeSim site
    console.log('📍 Navigating to LifeSim site...');
    await page.goto('https://its-life-world.vercel.app');
    
    // Get page title
    const title = await page.title();
    console.log(`📋 Page Title: ${title}`);
    
    // Check if page loaded successfully
    const bodyText = await page.textContent('body');
    console.log(`📊 Page loaded: ${bodyText.length} characters`);
    
    // Look for LifeSim specific elements
    console.log('🔍 Checking for LifeSim elements...');
    
    // Check for game canvas
    const canvas = await page.locator('canvas').count();
    console.log(`🎮 Canvas elements found: ${canvas}`);
    
    // Check for LifeSim heading
    const lifesimHeading = await page.locator('h2:has-text("LifeSim")').count();
    console.log(`🎯 LifeSim headings found: ${lifesimHeading}`);
    
    // Check for Mina references (our creature names)
    const minaReferences = await page.locator('text=Mina').count();
    console.log(`👥 Mina references found: ${minaReferences}`);
    
    // Check for simulation controls
    const startButton = await page.locator('button:has-text("開始"), button:has-text("start"), button:has-text("Start")').count();
    console.log(`🎮 Start buttons found: ${startButton}`);
    
    // Check for game stats
    const statsElements = await page.locator('[class*="stat"], [class*="info"]').count();
    console.log(`📊 Stats elements found: ${statsElements}`);
    
    // Take a screenshot for visual verification
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/lifesim-test.png', fullPage: true });
    
    // Check if JavaScript loaded properly
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    
    // Wait a bit for any JS to execute
    await page.waitForTimeout(3000);
    
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript errors detected:');
      jsErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    // Test interaction if possible
    if (startButton > 0) {
      console.log('🎮 Testing start button interaction...');
      await page.locator('button:has-text("開始"), button:has-text("start"), button:has-text("Start")').first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Start button clicked successfully');
    }
    
    console.log('🎉 LifeSim E2E Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testLifeSim().catch(console.error);