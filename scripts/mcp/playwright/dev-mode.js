const { chromium } = require('playwright');

async function devModeWithHotReload() {
  console.log('🔥 開発モード: ホットリロード対応のPlaywright起動');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 0,
    args: [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--start-maximized'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📍 LifeSimサイトにアクセス...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    
    // 軽量LifeSimを開く
    console.log('🌟 軽量LifeSimを起動...');
    const lightLifeSimButton = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton.count() > 0) {
      await lightLifeSimButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // CSS調整用の開発者ツール機能を注入
    console.log('🛠️ 開発者ツール機能を注入...');
    await page.addInitScript(() => {
      // リアルタイムCSS調整用のヘルパー関数を追加
      window.devTools = {
        // CSS プロパティをリアルタイム変更
        setCss: (selector, property, value) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style[property] = value;
          });
          console.log(`🎨 CSS Updated: ${selector} { ${property}: ${value} }`);
        },
        
        // 複数のCSS プロパティを一括設定
        setCssMultiple: (selector, styles) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            Object.assign(el.style, styles);
          });
          console.log(`🎨 CSS Batch Update: ${selector}`, styles);
        },
        
        // 要素の現在のスタイルを表示
        getComputedStyle: (selector) => {
          const el = document.querySelector(selector);
          if (el) {
            const computed = window.getComputedStyle(el);
            console.log(`📊 Computed styles for ${selector}:`, {
              width: computed.width,
              height: computed.height,
              margin: computed.margin,
              padding: computed.padding,
              fontSize: computed.fontSize,
              color: computed.color,
              backgroundColor: computed.backgroundColor
            });
            return computed;
          }
        },
        
        // ゲーム要素のサイズ調整用
        adjustGameUI: (scale = 1) => {
          const gameElements = document.querySelectorAll('canvas, .game-info, .human-list, .log-panel');
          gameElements.forEach(el => {
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = 'top left';
          });
          console.log(`🎮 Game UI scaled to: ${scale}`);
        },
        
        // フォントサイズ一括調整
        setFontSize: (selector, size) => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.fontSize = size;
          });
          console.log(`📝 Font size updated: ${selector} -> ${size}`);
        },
        
        // ページリロード（ホットリロード風）
        refresh: () => {
          console.log('🔄 ページリロード...');
          location.reload();
        }
      };
      
      console.log('🛠️ Dev tools loaded! Use window.devTools for CSS adjustments');
    });
    
    // ページをリロードして開発者ツールを有効化
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 軽量LifeSimを再起動
    const lightLifeSimButton2 = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton2.count() > 0) {
      await lightLifeSimButton2.first().click();
      await page.waitForTimeout(3000);
    }
    
    console.log('🎨 リアルタイムCSS調整の準備完了！');
    console.log('📋 使用可能なコマンド例:');
    console.log('   devTools.setCss(".human-list", "height", "200px")');
    console.log('   devTools.setFontSize("body", "14px")');
    console.log('   devTools.adjustGameUI(0.8)');
    console.log('   devTools.getComputedStyle("canvas")');
    
    // 実際にいくつかのCSS調整をデモ
    console.log('🎬 CSS調整デモ開始...');
    
    await page.waitForTimeout(3000);
    
    // フォントサイズ調整
    console.log('📝 フォントサイズを調整...');
    await page.evaluate(() => {
      if (window.devTools) {
        window.devTools.setFontSize('body', '13px');
      }
    });
    await page.waitForTimeout(2000);
    
    // ゲームUI全体のスケール調整
    console.log('🎮 ゲームUIをスケール調整...');
    await page.evaluate(() => {
      if (window.devTools) {
        window.devTools.setCss('.game-container, .lifesim-container', 'zoom', '0.9');
      }
    });
    await page.waitForTimeout(2000);
    
    // 人間一覧の高さ調整（ACT-67関連）
    console.log('👥 人間一覧の高さを調整...');
    await page.evaluate(() => {
      if (window.devTools) {
        window.devTools.setCss('.human-list, [class*="human"]', 'maxHeight', '150px');
        window.devTools.setCss('.human-list, [class*="human"]', 'overflow', 'auto');
      }
    });
    await page.waitForTimeout(2000);
    
    // ログパネルの調整
    console.log('📝 ログパネルを調整...');
    await page.evaluate(() => {
      if (window.devTools) {
        window.devTools.setCss('.log-panel, [class*="log"]', 'fontSize', '11px');
        window.devTools.setCss('.log-panel, [class*="log"]', 'lineHeight', '1.2');
      }
    });
    await page.waitForTimeout(3000);
    
    console.log('🎉 CSS調整デモ完了！');
    console.log('💡 ブラウザのコンソールで window.devTools を使って手動調整も可能です');
    console.log('⏰ ブラウザを30秒間開いたままにします...');
    
    // 30秒間開いたままにして手動調整を可能にする
    await page.waitForTimeout(30000);
    
    console.log('🔚 開発モード終了...');
    
  } catch (error) {
    console.error('❌ 開発モードエラー:', error.message);
  } finally {
    console.log('🔚 ブラウザを閉じますか？ [Ctrl+C で手動終了可能]');
    // ユーザーが手動で終了するまで待機
    await page.waitForTimeout(60000);
    await browser.close();
  }
}

// 開発モード実行
devModeWithHotReload().catch(console.error);