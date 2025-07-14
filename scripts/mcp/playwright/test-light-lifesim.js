const { chromium } = require('playwright');

async function testLightLifeSim() {
  console.log('🌟 軽量LifeSim専用テスト開始！');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    console.log('📍 LifeSimサイトにアクセス...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 軽量LifeSimボタンを探す
    console.log('🔍 軽量LifeSimボタンを検索...');
    const lightLifeSimButton = page.locator('text=/軽量.*LifeSim|軽量LifeSim/i');
    const buttonCount = await lightLifeSimButton.count();
    console.log(`🎯 軽量LifeSimボタン発見: ${buttonCount}個`);
    
    if (buttonCount > 0) {
      console.log('🖱️ 軽量LifeSimボタンをクリック...');
      await lightLifeSimButton.first().click();
      await page.waitForTimeout(5000);
      
      // ゲームキャンバスの確認
      const canvas = await page.locator('canvas').count();
      console.log(`🎮 ゲームキャンバス: ${canvas}個`);
      
      if (canvas > 0) {
        console.log('✅ 軽量LifeSimが正常に起動！');
        
        // Minaの確認（ACT-75の実装確認）
        const minaCount = await page.locator('text=Mina').count();
        console.log(`👥 Mina表示: ${minaCount}箇所`);
        
        // ゲーム要素の確認
        const gameStats = await page.locator('[class*="stat"], [class*="info"], [class*="count"]').count();
        console.log(`📊 ゲーム統計要素: ${gameStats}個`);
        
        // 人間一覧の確認（ACT-67の実装確認）
        const humanList = await page.locator('text=/Mina.*一覧|生存.*Mina/i').count();
        console.log(`👥 Mina一覧表示: ${humanList}箇所`);
        
        // ログシステムの確認（ACT-66の実装確認）
        const logElements = await page.locator('[class*="log"], [class*="message"]').count();
        console.log(`📝 ログ要素: ${logElements}個`);
        
        // ゲーム開始テスト
        console.log('🎮 ゲーム開始テスト...');
        const startButton = page.locator('button:has-text("開始"), button:has-text("Start")');
        const startCount = await startButton.count();
        
        if (startCount > 0) {
          console.log('▶️ 開始ボタンクリック...');
          await startButton.first().click();
          await page.waitForTimeout(10000); // ゲーム動作を観察
          
          // ゲーム動作中の状態確認
          const activeElements = await page.locator('text=/生存|探索|帰還|食糧/i').count();
          console.log(`🏃 ゲーム活動要素: ${activeElements}個`);
          
          // キャンバス操作テスト
          console.log('🖱️ キャンバス操作テスト...');
          const gameCanvas = page.locator('canvas').first();
          
          // 複数箇所をクリックしてインタラクションテスト
          await gameCanvas.click({ position: { x: 50, y: 50 } });
          await page.waitForTimeout(1000);
          await gameCanvas.click({ position: { x: 150, y: 100 } });
          await page.waitForTimeout(1000);
          await gameCanvas.click({ position: { x: 250, y: 150 } });
          await page.waitForTimeout(2000);
          
          console.log('✅ キャンバス操作完了');
          
          // 実装された機能のテスト
          console.log('🔧 実装機能テスト...');
          
          // 人間追加ボタンのテスト（基地システム関連）
          const addHumanButton = page.locator('button:has-text("追加"), button:has-text("人間")');
          const addCount = await addHumanButton.count();
          if (addCount > 0) {
            console.log('👤 人間追加ボタンをテスト...');
            await addHumanButton.first().click();
            await page.waitForTimeout(3000);
          }
          
          // リセットボタンのテスト
          const resetButton = page.locator('button:has-text("リセット"), button:has-text("Reset")');
          const resetCount = await resetButton.count();
          if (resetCount > 0) {
            console.log('🔄 リセット機能をテスト...');
            await resetButton.first().click();
            await page.waitForTimeout(3000);
          }
          
        } else {
          console.log('⚠️ 開始ボタンが見つかりません');
        }
        
        // 最終スクリーンショット
        await page.screenshot({ 
          path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/light-lifesim-final.png', 
          fullPage: true 
        });
        console.log('📸 最終スクリーンショット保存');
        
        // 実装されたACTの機能確認
        console.log('📋 実装機能確認結果:');
        console.log(`  ✅ ACT-75 (Mina呼称): ${minaCount > 0 ? '実装済み' : '未確認'}`);
        console.log(`  ✅ ACT-67 (人間一覧): ${humanList > 0 ? '実装済み' : '未確認'}`);
        console.log(`  ✅ ACT-66 (ログ位置): ${logElements > 0 ? '実装済み' : '未確認'}`);
        console.log(`  ✅ ゲーム基本機能: ${canvas > 0 && startCount > 0 ? '正常動作' : '要確認'}`);
        
      } else {
        console.log('❌ 軽量LifeSimのキャンバスが見つかりません');
      }
      
    } else {
      console.log('⚠️ 軽量LifeSimボタンが見つかりません。利用可能なボタン一覧:');
      const allButtons = await page.locator('button').allTextContents();
      allButtons.forEach((btn, i) => console.log(`   ${i+1}. ${btn}`));
    }
    
    // 10秒間ブラウザを開いたままにして目視確認
    console.log('👀 10秒間の目視確認時間...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
  } finally {
    await browser.close();
    console.log('🎉 軽量LifeSimテスト完了！');
  }
}

// テスト実行
testLightLifeSim().catch(console.error);