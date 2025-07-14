const { chromium } = require('playwright');

/**
 * 🚀 最小限ヘルスチェック - 超低負荷版
 * 基本的な接続とエラーのみをチェック、詳細分析は行わない
 */
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const startTime = Date.now();
  let result = {
    status: 'unknown',
    url: 'http://localhost:4173/',
    errors: [],
    loadTime: 0,
    basicElements: false
  };
  
  try {
    // 1. 基本接続チェック（5秒でタイムアウト）
    await page.goto(result.url, { waitUntil: 'domcontentloaded', timeout: 5000 });
    result.loadTime = Date.now() - startTime;
    
    // 2. 致命的エラーのみ監視
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Runtime Error')) {
        result.errors.push(msg.text());
      }
    });
    
    // 3. 最小限要素チェック（軽量LifeSimボタンのみ）
    const lightLifeSimBtn = await page.$('button:has-text("軽量LifeSim")');
    result.basicElements = !!lightLifeSimBtn;
    
    // 4. 結果判定
    if (result.errors.length === 0 && result.basicElements) {
      result.status = 'healthy';
      console.log('✅ HEALTHY - React軽量LifeSim正常');
    } else if (result.errors.length === 0) {
      result.status = 'warning';
      console.log('⚠️ WARNING - 基本要素未検出');
    } else {
      result.status = 'error';
      console.log('❌ ERROR - 致命的エラー検出');
    }
    
  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    console.log('❌ FAILED - 接続不可');
  }
  
  await browser.close();
  
  // 結果出力（JSON形式で他のスクリプトからも利用可能）
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'healthy' ? 0 : 1);
})();