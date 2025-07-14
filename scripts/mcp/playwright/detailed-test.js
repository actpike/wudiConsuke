const { chromium } = require('playwright');

async function detailedLifeSimTest() {
  console.log('🔍 Detailed LifeSim Analysis Starting...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to LifeSim site
    console.log('📍 Navigating to LifeSim site...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    // Get page title and basic info
    const title = await page.title();
    console.log(`📋 Page Title: ${title}`);
    
    // Get all text content
    const bodyText = await page.textContent('body');
    console.log(`📊 Page Content Length: ${bodyText.length} characters`);
    
    // Log first 500 characters of content
    console.log(`📝 Content Preview: ${bodyText.substring(0, 500)}...`);
    
    // Check for React root
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️ React root elements: ${reactRoot}`);
    
    // Check for any divs
    const divs = await page.locator('div').count();
    console.log(`📦 Div elements: ${divs}`);
    
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log(`🔘 Button elements: ${buttons}`);
    
    // Check for any canvas elements
    const canvases = await page.locator('canvas').count();
    console.log(`🎮 Canvas elements: ${canvases}`);
    
    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🟡 Console Error: ${msg.text()}`);
      }
    });
    
    // Check all h1, h2, h3 headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log(`📋 Headings found: ${headings.length}`);
    headings.forEach((heading, i) => console.log(`   ${i+1}. ${heading}`));
    
    // Try to find any text containing "LifeSim" or "Mina"
    const lifesimText = await page.locator('text=/LifeSim|Mina|Life|Sim/i').count();
    console.log(`🎯 LifeSim/Mina related text: ${lifesimText}`);
    
    // Get all links
    const links = await page.locator('a').count();
    console.log(`🔗 Link elements: ${links}`);
    
    // Check for loading states
    const loadingElements = await page.locator('text=/loading|読み込み|Loading/i').count();
    console.log(`⏳ Loading indicators: ${loadingElements}`);
    
    // Wait a bit more and check again
    console.log('⏳ Waiting for potential lazy loading...');
    await page.waitForTimeout(10000);
    
    // Re-check for dynamic content
    const canvasesAfterWait = await page.locator('canvas').count();
    console.log(`🎮 Canvas elements after wait: ${canvasesAfterWait}`);
    
    const buttonsAfterWait = await page.locator('button').count();
    console.log(`🔘 Button elements after wait: ${buttonsAfterWait}`);
    
    // Try to click anywhere to trigger potential interactions
    console.log('🖱️ Attempting page interaction...');
    await page.click('body');
    await page.waitForTimeout(2000);
    
    // Check final state
    const finalCanvases = await page.locator('canvas').count();
    console.log(`🎮 Final canvas count: ${finalCanvases}`);
    
    // Get final page source
    const htmlContent = await page.content();
    const hasReactBundle = htmlContent.includes('react') || htmlContent.includes('bundle');
    console.log(`⚛️ Contains React/Bundle: ${hasReactBundle}`);
    
    // Save final screenshot
    await page.screenshot({ path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/detailed-test.png', fullPage: true });
    console.log('📸 Final screenshot saved');
    
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript errors detected:');
      jsErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    console.log('🎉 Detailed LifeSim Analysis Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the detailed test
detailedLifeSimTest().catch(console.error);