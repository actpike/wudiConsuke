const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // コンソールエラーをキャプチャ
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    console.log('=== localhost:5173 動作確認開始 ===');
    
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 3秒待機してエラーをキャプチャ
    
    // ページタイトル確認
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // エラーチェック
    if (errors.length > 0) {
      console.log('\n🚨 コンソールエラー発見:');
      errors.forEach(error => console.log('ERROR:', error));
    } else {
      console.log('\n✅ コンソールエラーなし');
    }
    
    // ゲーム画面が表示されているかチェック
    const gameElements = await page.locator('.lifesim-canvas, .light-lifesim, canvas').count();
    console.log('ゲーム要素数:', gameElements);
    
    // 開始ボタンを探す
    const startButton = await page.locator('button:has-text("開始"), button:has-text("▶"), button:has-text("スタート")').count();
    console.log('開始ボタン数:', startButton);
    
    // LifeSimコンポーネントの存在確認
    const lifesimComponent = await page.locator('[class*="lifesim"], [class*="LifeSim"]').count();
    console.log('LifeSimコンポーネント数:', lifesimComponent);
    
    // Reactアプリのroot要素確認
    const rootElement = await page.locator('#root').count();
    console.log('Reactルート要素:', rootElement);
    
    // 現在のURL確認
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);
    
    // スクリーンショット撮影
    await page.screenshot({ path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/localhost-5173-test.png' });
    console.log('スクリーンショット保存: localhost-5173-test.png');
    
    // 結果サマリー
    console.log('\n=== 動作確認結果 ===');
    console.log('ページ読み込み:', currentUrl.includes('localhost:5173') ? '✅ 成功' : '❌ 失敗');
    console.log('コンソールエラー:', errors.length === 0 ? '✅ なし' : `❌ あり (${errors.length}件)`);
    console.log('ゲーム表示:', gameElements > 0 ? '✅ 正常' : '❌ 異常');
    console.log('基本機能:', startButton > 0 || lifesimComponent > 0 ? '✅ 動作' : '❌ 不動作');
    
  } catch (error) {
    console.log('❌ ナビゲーションエラー:', error.message);
  }
  
  await page.waitForTimeout(2000); // 2秒待機してから終了
  await browser.close();
})();