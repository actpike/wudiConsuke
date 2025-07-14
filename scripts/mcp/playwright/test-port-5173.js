const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('=== localhost:5173 動作確認開始 ===');
  
  // コンソールエラーを監視
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🚨 コンソールエラー発見:');
      console.log('ERROR:', msg.text());
      errors.push(msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 10000 });
    
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // 簡単な要素確認
    const gameElements = await page.$$('.game-container, .lifesim-container, #game-root');
    const startButtons = await page.$$('button[class*="start"], button[class*="開始"]');
    const lifeSimComponents = await page.$$('[class*="lifesim"], [class*="LifeSim"]');
    const reactRoot = await page.$$('#root');
    
    console.log('ゲーム要素数:', gameElements.length);
    console.log('開始ボタン数:', startButtons.length);
    console.log('LifeSimコンポーネント数:', lifeSimComponents.length);
    console.log('Reactルート要素:', reactRoot.length);
    console.log('現在のURL:', page.url());
    
    // スクリーンショット
    await page.screenshot({ path: 'localhost-5174-test.png', fullPage: true });
    console.log('スクリーンショット保存: localhost-5174-test.png');
    
    console.log('\n=== 動作確認結果 ===');
    console.log('ページ読み込み:', errors.length === 0 ? '✅ 成功' : '❌ エラーあり');
    console.log('コンソールエラー:', errors.length === 0 ? '✅ なし' : `❌ あり (${errors.length}件)`);
    console.log('ゲーム表示:', gameElements.length > 0 || lifeSimComponents.length > 0 ? '✅ 正常' : '❌ 異常');
    console.log('基本機能:', errors.length === 0 && (gameElements.length > 0 || lifeSimComponents.length > 0) ? '✅ 動作' : '❌ 不動作');
    
  } catch (error) {
    console.log('❌ 接続エラー:', error.message);
  }
  
  await browser.close();
})();