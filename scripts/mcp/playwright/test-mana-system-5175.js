const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // デバッグ用にheadlessをfalseに
  const page = await browser.newPage();
  
  console.log('🌟 Manaシステム動作テスト開始 (localhost:5175)');
  console.log('========================================');
  
  // コンソールメッセージをキャプチャ
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type().toUpperCase()}] ${text}`);
    
    if (msg.type() === 'error') {
      console.log('🚨 コンソールエラー:', text);
      errors.push(text);
    }
  });
  
  // ネットワークエラーも監視
  page.on('pageerror', error => {
    console.log('🚨 ページエラー:', error.message);
    errors.push(error.message);
  });
  
  try {
    // ページ読み込み
    console.log('📡 localhost:5175 に接続中...');
    await page.goto('http://localhost:5175/', { 
      waitUntil: 'networkidle', 
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log('📄 ページタイトル:', title);
    console.log('🌐 現在のURL:', page.url());
    
    // 初期スクリーンショット
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mana-system-initial.png', 
      fullPage: true 
    });
    console.log('📸 初期スクリーンショット保存: mana-system-initial.png');
    
    // ゲーム要素の確認
    console.log('\n🔍 ゲーム要素の確認');
    console.log('----------------------');
    
    // LifeSimコンポーネントの確認
    const lifesimElements = await page.$$('[class*="lifesim"], [class*="LifeSim"], #lifesim-root');
    console.log('🎮 LifeSimコンポーネント数:', lifesimElements.length);
    
    // キャンバス要素の確認
    const canvasElements = await page.$$('canvas');
    console.log('🖼️ Canvas要素数:', canvasElements.length);
    
    // 統計情報パネルの確認
    const statsElements = await page.$$('[class*="stats"], [class*="Statistics"], [class*="統計"]');
    console.log('📊 統計情報要素数:', statsElements.length);
    
    // Manaシステム関連の要素確認
    const manaElements = await page.$$('[class*="mana"], [class*="Mana"], [class*="world-tree"], [class*="WorldTree"]');
    console.log('🌟 Mana関連要素数:', manaElements.length);
    
    // 2秒待機してゲームが開始されるのを待つ
    console.log('\n⏳ ゲーム開始を2秒待機...');
    await page.waitForTimeout(2000);
    
    // ゲーム開始後のスクリーンショット
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mana-system-running.png', 
      fullPage: true 
    });
    console.log('📸 ゲーム実行中スクリーンショット保存: mana-system-running.png');
    
    // 統計情報の取得を試行
    console.log('\n📊 統計情報の取得');
    console.log('------------------');
    
    try {
      // JavaScriptでゲーム状態を取得
      const gameStats = await page.evaluate(() => {
        // Reactの開発者ツールやwindowオブジェクトからゲーム状態を取得する試み
        if (window.React && window.React.version) {
          console.log('React version:', window.React.version);
        }
        
        // LifeSimのグローバル変数があるかチェック
        if (window.gameState) {
          return window.gameState.getStats();
        }
        
        // DOMから統計情報を抽出
        const statsText = [];
        const possibleStatsSelectors = [
          '[class*="stats"]',
          '[class*="Statistics"]',
          '[class*="統計"]',
          '[class*="info"]',
          '[class*="panel"]'
        ];
        
        for (const selector of possibleStatsSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent && el.textContent.trim()) {
              statsText.push(el.textContent.trim());
            }
          });
        }
        
        return {
          statsFound: statsText.length > 0,
          statsText: statsText,
          canvasCount: document.querySelectorAll('canvas').length
        };
      });
      
      console.log('✅ ゲーム統計情報取得成功:');
      console.log('   - 統計情報発見:', gameStats.statsFound);
      console.log('   - Canvas数:', gameStats.canvasCount);
      if (gameStats.statsText.length > 0) {
        console.log('   - 統計テキスト:');
        gameStats.statsText.forEach((text, index) => {
          console.log(`     ${index + 1}. ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        });
      }
      
    } catch (evalError) {
      console.log('⚠️ 統計情報取得エラー:', evalError.message);
    }
    
    // 5秒間ゲームを観察
    console.log('\n👀 5秒間ゲーム観察中...');
    console.log('---------------------------');
    
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(1000);
      
      // 毎秒の観察
      try {
        const observation = await page.evaluate(() => {
          const canvases = document.querySelectorAll('canvas');
          let hasActiveCanvas = false;
          
          // キャンバスの活動チェック
          canvases.forEach(canvas => {
            const context = canvas.getContext('2d');
            if (context) {
              // キャンバスに何かが描画されているかの簡単なチェック
              const imageData = context.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
              const data = imageData.data;
              
              // 透明でないピクセルがあるかチェック
              for (let j = 3; j < data.length; j += 4) {
                if (data[j] > 0) { // アルファチャンネルが0より大きい
                  hasActiveCanvas = true;
                  break;
                }
              }
            }
          });
          
          return {
            canvasCount: canvases.length,
            hasActiveCanvas: hasActiveCanvas,
            timestamp: new Date().toLocaleTimeString()
          };
        });
        
        console.log(`   ${i}秒: Canvas=${observation.canvasCount}, Active=${observation.hasActiveCanvas ? '✅' : '❌'} (${observation.timestamp})`);
        
        // 3秒目でスクリーンショット
        if (i === 3) {
          await page.screenshot({ 
            path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mana-system-midpoint.png', 
            fullPage: true 
          });
          console.log('   📸 中間スクリーンショット保存: mana-system-midpoint.png');
        }
        
      } catch (obsError) {
        console.log(`   ${i}秒: 観察エラー - ${obsError.message}`);
      }
    }
    
    // 最終スクリーンショット
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mana-system-final.png', 
      fullPage: true 
    });
    console.log('📸 最終スクリーンショット保存: mana-system-final.png');
    
    // 色の確認（ライトブルーのManaと緑の世界樹）
    console.log('\n🎨 色彩確認');
    console.log('------------');
    
    try {
      const colorAnalysis = await page.evaluate(() => {
        const canvases = document.querySelectorAll('canvas');
        const results = [];
        
        canvases.forEach((canvas, index) => {
          if (canvas.width > 0 && canvas.height > 0) {
            const context = canvas.getContext('2d');
            if (context) {
              // キャンバスの中央付近をサンプリング
              const centerX = Math.floor(canvas.width / 2);
              const centerY = Math.floor(canvas.height / 2);
              const sampleSize = 50; // 50x50エリアをサンプリング
              
              const imageData = context.getImageData(
                Math.max(0, centerX - sampleSize/2), 
                Math.max(0, centerY - sampleSize/2), 
                Math.min(sampleSize, canvas.width), 
                Math.min(sampleSize, canvas.height)
              );
              
              const data = imageData.data;
              const colors = new Map();
              
              // 色を集計
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                if (a > 0) { // 透明でない場合
                  const colorKey = `rgb(${r},${g},${b})`;
                  colors.set(colorKey, (colors.get(colorKey) || 0) + 1);
                }
              }
              
              // 上位5色を取得
              const sortedColors = Array.from(colors.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
              
              results.push({
                canvasIndex: index,
                width: canvas.width,
                height: canvas.height,
                topColors: sortedColors
              });
            }
          }
        });
        
        return results;
      });
      
      colorAnalysis.forEach((analysis, index) => {
        console.log(`   Canvas ${analysis.canvasIndex}: ${analysis.width}x${analysis.height}`);
        analysis.topColors.forEach((color, colorIndex) => {
          console.log(`     ${colorIndex + 1}. ${color[0]} (${color[1]} pixels)`);
        });
      });
      
    } catch (colorError) {
      console.log('⚠️ 色彩分析エラー:', colorError.message);
    }
    
    // テスト結果の総合評価
    console.log('\n🎯 テスト結果総合評価');
    console.log('======================');
    
    const hasLifeSim = lifesimElements.length > 0;
    const hasCanvas = canvasElements.length > 0;
    const hasStats = statsElements.length > 0;
    const hasManaElements = manaElements.length > 0;
    const noErrors = errors.length === 0;
    
    console.log('✅ ページ読み込み:', '成功');
    console.log('✅ LifeSimコンポーネント:', hasLifeSim ? '発見' : '❌ 未発見');
    console.log('✅ Canvas要素:', hasCanvas ? '発見' : '❌ 未発見');
    console.log('✅ 統計情報要素:', hasStats ? '発見' : '⚠️ 未発見');
    console.log('✅ Mana関連要素:', hasManaElements ? '発見' : '⚠️ 未発見');
    console.log('✅ コンソールエラー:', noErrors ? 'なし' : `❌ あり (${errors.length}件)`);
    
    const overallScore = [hasLifeSim, hasCanvas, noErrors].filter(Boolean).length;
    console.log(`\n🏆 総合スコア: ${overallScore}/3`);
    
    if (overallScore === 3) {
      console.log('🎉 Manaシステムは正常に動作しています！');
    } else if (overallScore === 2) {
      console.log('⚠️ Manaシステムは概ね動作していますが、改善の余地があります。');
    } else {
      console.log('❌ Manaシステムに問題があります。詳細を確認してください。');
    }
    
    // ログファイルの保存
    const logContent = [
      '=== Manaシステムテスト結果 ===',
      `実行時刻: ${new Date().toLocaleString()}`,
      `URL: http://localhost:5175/`,
      `ページタイトル: ${title}`,
      '',
      '=== 要素検出結果 ===',
      `LifeSimコンポーネント: ${lifesimElements.length}個`,
      `Canvas要素: ${canvasElements.length}個`,
      `統計情報要素: ${statsElements.length}個`,
      `Mana関連要素: ${manaElements.length}個`,
      '',
      '=== エラー情報 ===',
      `エラー数: ${errors.length}件`,
      ...errors.map(error => `  - ${error}`),
      '',
      '=== コンソールメッセージ ===',
      ...consoleMessages.slice(-20) // 最後の20メッセージのみ
    ].join('\n');
    
    fs.writeFileSync('/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mana-system-test-log.txt', logContent);
    console.log('\n📝 テストログ保存: mana-system-test-log.txt');
    
  } catch (error) {
    console.log('❌ テスト実行エラー:', error.message);
    console.log('詳細:', error.stack);
  }
  
  // 5秒待機してからブラウザを閉じる（デバッグ用）
  console.log('\n⏳ 5秒後にブラウザを閉じます...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('🔚 テスト完了');
})();