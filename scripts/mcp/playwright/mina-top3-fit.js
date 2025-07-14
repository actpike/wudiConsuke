const { chromium } = require('playwright');

async function minaTop3Fit() {
  console.log('🎯 Mina #1〜#3 一画面表示調整開始！');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('📍 LifeSimサイトにアクセス...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 軽量LifeSimを起動
    console.log('🌟 軽量LifeSimを起動...');
    const lightLifeSimButton = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton.count() > 0) {
      await lightLifeSimButton.first().click();
      await page.waitForTimeout(4000);
    }
    
    // Top3専用調整ツールを注入
    await page.addInitScript(() => {
      window.minaTop3Fitter = {
        // 現在のMina一覧状況を分析
        analyzeMinas: () => {
          const containers = document.querySelectorAll('.human-list, .mina-list, [class*="human-list"], [class*="mina-list"]');
          const items = document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]');
          
          console.log('📊 Mina一覧分析:');
          console.log(`   📋 コンテナ数: ${containers.length}`);
          console.log(`   👥 Minaアイテム数: ${items.length}`);
          
          containers.forEach((container, i) => {
            const rect = container.getBoundingClientRect();
            console.log(`   📦 コンテナ${i+1}: ${Math.round(rect.width)}x${Math.round(rect.height)} at (${Math.round(rect.left)}, ${Math.round(rect.top)})`);
          });
          
          items.forEach((item, i) => {
            const rect = item.getBoundingClientRect();
            const text = item.textContent?.trim() || '';
            console.log(`   👤 Mina${i+1}: "${text}" - ${Math.round(rect.height)}px高さ`);
          });
          
          return { containers: containers.length, items: items.length };
        },
        
        // Top3が収まるように最適化
        fitTop3: (containerHeight = 200) => {
          // Top3が確実に収まるアイテム高さを計算
          const itemCount = 3;
          const padding = 8; // コンテナ内パディング
          const margins = 2 * (itemCount - 1); // アイテム間のマージン
          const titleHeight = 25; // タイトル分
          const availableHeight = containerHeight - padding * 2 - titleHeight;
          const optimalItemHeight = Math.floor((availableHeight - margins) / itemCount);
          
          console.log(`🧮 Top3最適化計算:`);
          console.log(`   📏 コンテナ高さ: ${containerHeight}px`);
          console.log(`   📐 利用可能高さ: ${availableHeight}px`);
          console.log(`   📊 最適アイテム高さ: ${optimalItemHeight}px`);
          
          const css = `
            /* Mina一覧コンテナの最適化 */
            .human-list, .mina-list, [class*="human-list"], [class*="mina-list"] {
              position: fixed !important;
              top: 20px !important;
              right: 20px !important;
              width: 280px !important;
              height: ${containerHeight}px !important;
              max-height: ${containerHeight}px !important;
              background: white !important;
              border: 2px solid #4CAF50 !important;
              border-radius: 12px !important;
              padding: 8px !important;
              overflow: hidden !important; /* スクロールを完全に無効化 */
              z-index: 9999 !important;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            }
            
            /* タイトルの最適化 */
            .human-list h3, .mina-list h3, 
            .human-list > *:first-child, .mina-list > *:first-child {
              margin: 0 0 8px 0 !important;
              padding: 0 !important;
              color: #4CAF50 !important;
              font-size: 13px !important;
              font-weight: bold !important;
              height: 20px !important;
              line-height: 20px !important;
              text-align: center !important;
              border-bottom: 1px solid #e0e0e0 !important;
            }
            
            /* Minaアイテムの最適化 - Top3に特化 */
            .human-item, .mina-item, [class*="human-"], [class*="mina-"] {
              height: ${optimalItemHeight}px !important;
              min-height: ${optimalItemHeight}px !important;
              max-height: ${optimalItemHeight}px !important;
              font-size: 10px !important;
              padding: 3px 6px !important;
              margin: 1px 0 !important;
              line-height: 1.2 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              border: 1px solid #e8f5e8 !important;
              border-radius: 6px !important;
              background: linear-gradient(135deg, #f8fff8, #f0f8f0) !important;
              transition: all 0.2s ease !important;
              cursor: pointer !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            /* Top3の視覚的区別 */
            .human-item:nth-child(2), .mina-item:nth-child(2) {
              background: linear-gradient(135deg, #fff9e6, #ffd700) !important;
              border-color: #ffb300 !important;
              font-weight: bold !important;
            }
            
            .human-item:nth-child(3), .mina-item:nth-child(3) {
              background: linear-gradient(135deg, #f0f8ff, #e3f2fd) !important;
              border-color: #2196f3 !important;
            }
            
            .human-item:nth-child(4), .mina-item:nth-child(4) {
              background: linear-gradient(135deg, #fff3e0, #ffcc80) !important;
              border-color: #ff9800 !important;
            }
            
            /* ホバー効果 */
            .human-item:hover, .mina-item:hover {
              transform: translateX(3px) scale(1.02) !important;
              box-shadow: 2px 2px 8px rgba(0,0,0,0.15) !important;
            }
            
            /* 4番目以降は非表示（Top3に集中） */
            .human-item:nth-child(n+5), .mina-item:nth-child(n+5) {
              display: none !important;
            }
          `;
          
          window.minaTop3Fitter.injectCSS(css);
          console.log(`✅ Top3表示に最適化完了 (アイテム高さ: ${optimalItemHeight}px)`);
        },
        
        // 異なるコンテナサイズでのテスト
        testSizes: {
          compact: () => {
            window.minaTop3Fitter.fitTop3(150);
            console.log('📏 Compactサイズ (150px) でTop3最適化');
          },
          normal: () => {
            window.minaTop3Fitter.fitTop3(200);
            console.log('📐 Normalサイズ (200px) でTop3最適化');
          },
          comfortable: () => {
            window.minaTop3Fitter.fitTop3(250);
            console.log('📊 Comfortableサイズ (250px) でTop3最適化');
          },
          large: () => {
            window.minaTop3Fitter.fitTop3(300);
            console.log('📈 Largeサイズ (300px) でTop3最適化');
          }
        },
        
        // 精密調整機能
        precisionAdjust: (containerHeight, itemHeight, fontSize = 10) => {
          const css = `
            .human-list, .mina-list, [class*="human-list"], [class*="mina-list"] {
              height: ${containerHeight}px !important;
              max-height: ${containerHeight}px !important;
            }
            
            .human-item, .mina-item, [class*="human-"], [class*="mina-"] {
              height: ${itemHeight}px !important;
              min-height: ${itemHeight}px !important;
              max-height: ${itemHeight}px !important;
              font-size: ${fontSize}px !important;
            }
            
            .human-item:nth-child(n+5), .mina-item:nth-child(n+5) {
              display: none !important;
            }
          `;
          window.minaTop3Fitter.injectCSS(css);
          console.log(`🎯 精密調整: コンテナ${containerHeight}px, アイテム${itemHeight}px, フォント${fontSize}px`);
        },
        
        // Top3の収まり具合を検証
        validateTop3Fit: () => {
          const container = document.querySelector('.human-list, .mina-list, [class*="human-list"], [class*="mina-list"]');
          const items = document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]');
          
          if (!container) {
            console.log('❌ Mina一覧コンテナが見つかりません');
            return false;
          }
          
          const containerRect = container.getBoundingClientRect();
          console.log(`📦 コンテナ: ${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`);
          
          let allFit = true;
          for (let i = 0; i < Math.min(3, items.length); i++) {
            const item = items[i];
            const itemRect = item.getBoundingClientRect();
            const isVisible = window.getComputedStyle(item).display !== 'none';
            const fitsInContainer = itemRect.bottom <= containerRect.bottom;
            
            console.log(`👤 Mina#${i+1}: ${Math.round(itemRect.height)}px高さ, 表示:${isVisible}, 収まり:${fitsInContainer}`);
            
            if (!isVisible || !fitsInContainer) {
              allFit = false;
            }
          }
          
          const result = allFit ? '✅ Top3すべて収まっています！' : '⚠️ 調整が必要です';
          console.log(result);
          return allFit;
        },
        
        // ゲーム操作
        gameControls: {
          start: () => {
            const startBtn = Array.from(document.querySelectorAll('button')).find(btn => 
              btn.textContent.includes('開始') || btn.textContent.includes('Start')
            );
            if (startBtn) {
              startBtn.click();
              console.log('▶️ ゲーム開始');
              return true;
            }
            return false;
          },
          
          reset: () => {
            const resetBtn = Array.from(document.querySelectorAll('button')).find(btn => 
              btn.textContent.includes('リセット') || btn.textContent.includes('Reset')
            );
            if (resetBtn) {
              resetBtn.click();
              console.log('🔄 ゲームリセット');
              return true;
            }
            return false;
          }
        },
        
        // CSS注入ヘルパー
        injectCSS: (css) => {
          let style = document.getElementById('mina-top3-fitter');
          if (!style) {
            style = document.createElement('style');
            style.id = 'mina-top3-fitter';
            document.head.appendChild(style);
          }
          style.textContent = css;
        }
      };
      
      console.log('🛠️ Mina Top3 Fitter loaded!');
    });
    
    // ページリロードして機能を有効化
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 軽量LifeSimを再起動
    console.log('🌟 軽量LifeSim再起動...');
    const lightLifeSimButton2 = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton2.count() > 0) {
      await lightLifeSimButton2.first().click();
      await page.waitForTimeout(4000);
    }
    
    // ゲーム開始
    console.log('🎮 ゲーム開始してMina一覧を表示...');
    await page.evaluate(() => window.minaTop3Fitter?.gameControls.start());
    await page.waitForTimeout(5000);
    
    // 現在の状況を分析
    console.log('📊 現在のMina一覧を分析...');
    await page.evaluate(() => window.minaTop3Fitter?.analyzeMinas());
    
    // Top3最適化テスト開始
    console.log('🎯 Top3最適化テスト開始...');
    
    // Normalサイズで開始
    console.log('📐 Normalサイズ (200px) でテスト...');
    await page.evaluate(() => window.minaTop3Fitter?.testSizes.normal());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaTop3Fitter?.validateTop3Fit());
    
    // Compactサイズでテスト
    console.log('📏 Compactサイズ (150px) でテスト...');
    await page.evaluate(() => window.minaTop3Fitter?.testSizes.compact());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaTop3Fitter?.validateTop3Fit());
    
    // Comfortableサイズでテスト
    console.log('📊 Comfortableサイズ (250px) でテスト...');
    await page.evaluate(() => window.minaTop3Fitter?.testSizes.comfortable());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaTop3Fitter?.validateTop3Fit());
    
    // 精密調整のテスト
    console.log('🎯 精密調整テスト...');
    console.log('   💎 最適解を探索中...');
    
    // 異なるパラメータで精密テスト
    const testConfigs = [
      { container: 180, item: 45, font: 9 },
      { container: 190, item: 50, font: 10 },
      { container: 170, item: 42, font: 9 },
      { container: 160, item: 38, font: 8 }
    ];
    
    for (const config of testConfigs) {
      console.log(`   🔬 テスト: コンテナ${config.container}px, アイテム${config.item}px, フォント${config.font}px`);
      await page.evaluate((cfg) => {
        window.minaTop3Fitter?.precisionAdjust(cfg.container, cfg.item, cfg.font);
      }, config);
      await page.waitForTimeout(2000);
      
      const fits = await page.evaluate(() => window.minaTop3Fitter?.validateTop3Fit());
      if (fits) {
        console.log(`   ✅ 最適解発見: ${JSON.stringify(config)}`);
        break;
      }
    }
    
    // 最終スクリーンショット
    console.log('📸 Top3最適化スクリーンショット撮影...');
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mina-top3-optimized.png', 
      fullPage: true 
    });
    
    console.log('🎉 Top3最適化完了！');
    console.log('');
    console.log('📋 手動調整コマンド:');
    console.log('   minaTop3Fitter.testSizes.compact() - 150px');
    console.log('   minaTop3Fitter.testSizes.normal() - 200px');
    console.log('   minaTop3Fitter.testSizes.comfortable() - 250px');
    console.log('   minaTop3Fitter.precisionAdjust(180, 45, 9) - カスタム');
    console.log('   minaTop3Fitter.validateTop3Fit() - 収まり確認');
    console.log('   minaTop3Fitter.analyzeMinas() - 現状分析');
    console.log('');
    console.log('⏰ 30秒間の最終調整時間...');
    
    // 30秒間の手動調整時間
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Top3調整エラー:', error.message);
  } finally {
    console.log('🔚 Mina Top3調整セッション終了');
    await browser.close();
  }
}

// Ctrl+C での終了処理
process.on('SIGINT', () => {
  console.log('\n🔚 Top3調整を終了しています...');
  process.exit(0);
});

// Top3調整実行
minaTop3Fit().catch(console.error);