const { chromium } = require('playwright');

async function fullscreenMinaTuning() {
  console.log('🖥️ 全画面表示でMina一覧調整開始！');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--kiosk', // 全画面モード
      '--disable-infobars',
      '--disable-extensions'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    // ビューポートを大きく設定
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('📍 LifeSimサイトにアクセス（全画面）...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🖥️ 画面サイズ確認...');
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    }));
    console.log(`📏 ビューポート: ${viewport.width}x${viewport.height} (DPR: ${viewport.devicePixelRatio})`);
    
    // 軽量LifeSimを起動
    console.log('🌟 軽量LifeSimを起動...');
    const lightLifeSimButton = page.locator('text=/軽量.*LifeSim/i');
    const buttonCount = await lightLifeSimButton.count();
    console.log(`🎯 軽量LifeSimボタン: ${buttonCount}個見つかりました`);
    
    if (buttonCount > 0) {
      await lightLifeSimButton.first().click();
      await page.waitForTimeout(5000);
      console.log('✅ 軽量LifeSim起動完了');
    }
    
    // 全画面用のMina一覧調整ツールを注入
    await page.addInitScript(() => {
      window.fullscreenMinaTuner = {
        // 画面レイアウト確認
        checkLayout: () => {
          const elements = {
            canvas: document.querySelectorAll('canvas').length,
            minaList: document.querySelectorAll('.human-list, .mina-list, [class*="human-list"], [class*="mina-list"]').length,
            minaItems: document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]').length,
            buttons: document.querySelectorAll('button').length,
            gameInfo: document.querySelectorAll('[class*="info"], [class*="stat"]').length
          };
          
          console.log('📊 画面要素確認:');
          console.log(`   🎮 Canvas: ${elements.canvas}個`);
          console.log(`   📋 Mina一覧コンテナ: ${elements.minaList}個`);
          console.log(`   👥 Minaアイテム: ${elements.minaItems}個`);
          console.log(`   🔘 ボタン: ${elements.buttons}個`);
          console.log(`   📊 ゲーム情報: ${elements.gameInfo}個`);
          
          // Mina一覧の表示状態を詳細チェック
          const minaContainers = document.querySelectorAll('.human-list, .mina-list, [class*="human-list"], [class*="mina-list"]');
          minaContainers.forEach((container, i) => {
            const rect = container.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
            console.log(`   📋 Mina一覧${i+1}: 位置(${Math.round(rect.left)}, ${Math.round(rect.top)}) サイズ(${Math.round(rect.width)}x${Math.round(rect.height)}) 表示:${isVisible}`);
          });
          
          return elements;
        },
        
        // 強制的にMina一覧を表示
        forceShowMinaList: () => {
          const css = `
            .human-list, .mina-list, [class*="human-list"], [class*="mina-list"] {
              position: fixed !important;
              top: 10px !important;
              right: 10px !important;
              width: 300px !important;
              max-height: 600px !important;
              background: white !important;
              border: 2px solid #2196f3 !important;
              border-radius: 8px !important;
              padding: 10px !important;
              overflow-y: auto !important;
              z-index: 9999 !important;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
            }
            
            .human-list h3, .mina-list h3 {
              margin: 0 0 10px 0 !important;
              color: #2196f3 !important;
              font-size: 14px !important;
              font-weight: bold !important;
            }
          `;
          window.fullscreenMinaTuner.injectCSS(css);
          console.log('🔧 Mina一覧を強制表示モードに設定');
        },
        
        // Minaアイテムのサイズ調整（全画面最適化版）
        optimizeMinaItems: (size = 'normal') => {
          let height, fontSize, padding, margin;
          
          switch(size) {
            case 'tiny':
              height = '22px'; fontSize = '9px'; padding = '2px 4px'; margin = '1px 0';
              break;
            case 'small':
              height = '28px'; fontSize = '10px'; padding = '3px 6px'; margin = '2px 0';
              break;
            case 'normal':
              height = '35px'; fontSize = '11px'; padding = '4px 8px'; margin = '3px 0';
              break;
            case 'large':
              height = '42px'; fontSize = '12px'; padding = '6px 10px'; margin = '4px 0';
              break;
          }
          
          const css = `
            .human-item, .mina-item, [class*="human-"], [class*="mina-"] {
              height: ${height} !important;
              min-height: ${height} !important;
              font-size: ${fontSize} !important;
              padding: ${padding} !important;
              margin: ${margin} !important;
              line-height: 1.2 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 4px !important;
              background: linear-gradient(135deg, #f9f9f9, #f0f8ff) !important;
              transition: all 0.2s ease !important;
              cursor: pointer !important;
            }
            
            .human-item:hover, .mina-item:hover, [class*="human-"]:hover, [class*="mina-"]:hover {
              background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
              border-color: #2196f3 !important;
              transform: translateX(2px) !important;
            }
            
            .human-item:nth-child(even), .mina-item:nth-child(even) {
              background: linear-gradient(135deg, #f5f5f5, #e8f5e8) !important;
            }
          `;
          window.fullscreenMinaTuner.injectCSS(css);
          console.log(`👥 Minaアイテムを${size}サイズに最適化`);
        },
        
        // ゲーム操作（改良版）
        gameControls: {
          start: () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            console.log('🔘 利用可能なボタン:');
            buttons.forEach((btn, i) => console.log(`   ${i+1}. "${btn.textContent.trim()}"`));
            
            const startBtn = buttons.find(btn => 
              btn.textContent.includes('開始') || btn.textContent.includes('Start') || btn.textContent.includes('▶')
            );
            if (startBtn) {
              startBtn.click();
              console.log('▶️ ゲーム開始しました');
              return true;
            }
            console.log('⚠️ 開始ボタンが見つかりません');
            return false;
          },
          
          reset: () => {
            const resetBtn = Array.from(document.querySelectorAll('button')).find(btn => 
              btn.textContent.includes('リセット') || btn.textContent.includes('Reset') || btn.textContent.includes('🔄')
            );
            if (resetBtn) {
              resetBtn.click();
              console.log('🔄 ゲームをリセットしました');
              return true;
            }
            console.log('⚠️ リセットボタンが見つかりません');
            return false;
          },
          
          addHuman: () => {
            const addBtn = Array.from(document.querySelectorAll('button')).find(btn => 
              btn.textContent.includes('追加') || btn.textContent.includes('人間') || btn.textContent.includes('👤')
            );
            if (addBtn) {
              addBtn.click();
              console.log('👤 人間を追加しました');
              return true;
            }
            console.log('⚠️ 人間追加ボタンが見つかりません');
            return false;
          }
        },
        
        // 表示されているMina数をカウント
        countVisibleMinas: () => {
          const minaItems = Array.from(document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]'));
          const visibleItems = minaItems.filter(item => {
            const rect = item.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && 
                             rect.top >= 0 && rect.bottom <= window.innerHeight &&
                             rect.left >= 0 && rect.right <= window.innerWidth;
            return isVisible;
          });
          console.log(`👥 表示中のMina: ${visibleItems.length}/${minaItems.length}`);
          return { visible: visibleItems.length, total: minaItems.length };
        },
        
        // CSS注入ヘルパー
        injectCSS: (css) => {
          let style = document.getElementById('fullscreen-mina-tuner');
          if (!style) {
            style = document.createElement('style');
            style.id = 'fullscreen-mina-tuner';
            document.head.appendChild(style);
          }
          style.textContent = css;
        },
        
        // スクリーンショット撮影ヘルパー
        takeScreenshot: () => {
          console.log('📸 現在の状態をキャプチャ中...');
          // この関数は Playwright側から呼び出し
        }
      };
      
      console.log('🛠️ Fullscreen Mina Tuner loaded!');
    });
    
    // ページリロードして機能を有効化
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 軽量LifeSimを再起動
    console.log('🌟 軽量LifeSim再起動...');
    const lightLifeSimButton2 = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton2.count() > 0) {
      await lightLifeSimButton2.first().click();
      await page.waitForTimeout(5000);
    }
    
    // 画面レイアウトチェック
    console.log('📊 画面レイアウト確認...');
    await page.evaluate(() => window.fullscreenMinaTuner?.checkLayout());
    
    // Mina一覧を強制表示
    console.log('🔧 Mina一覧を強制表示...');
    await page.evaluate(() => window.fullscreenMinaTuner?.forceShowMinaList());
    await page.waitForTimeout(2000);
    
    // ゲーム開始
    console.log('🎮 ゲーム開始...');
    await page.evaluate(() => window.fullscreenMinaTuner?.gameControls.start());
    await page.waitForTimeout(5000);
    
    // 現在の状態確認
    console.log('👥 現在のMina表示状況...');
    await page.evaluate(() => window.fullscreenMinaTuner?.countVisibleMinas());
    
    // サイズ調整テスト開始
    console.log('🎬 全画面サイズ調整テスト開始...');
    
    // Normal サイズ
    console.log('📐 Normalサイズでテスト...');
    await page.evaluate(() => window.fullscreenMinaTuner?.optimizeMinaItems('normal'));
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.fullscreenMinaTuner?.countVisibleMinas());
    
    // Small サイズ
    console.log('📏 Smallサイズでテスト...');
    await page.evaluate(() => window.fullscreenMinaTuner?.optimizeMinaItems('small'));
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.fullscreenMinaTuner?.countVisibleMinas());
    
    // Tiny サイズ（最大密度）
    console.log('🔬 Tinyサイズで最大密度テスト...');
    await page.evaluate(() => window.fullscreenMinaTuner?.optimizeMinaItems('tiny'));
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.fullscreenMinaTuner?.countVisibleMinas());
    
    // 人間追加テスト
    console.log('👤 人間追加テスト...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.fullscreenMinaTuner?.gameControls.addHuman());
      await page.waitForTimeout(1000);
    }
    await page.evaluate(() => window.fullscreenMinaTuner?.countVisibleMinas());
    
    // スクリーンショット撮影
    console.log('📸 最終状態スクリーンショット...');
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/fullscreen-mina-final.png', 
      fullPage: true 
    });
    
    // リセット→再開始テスト
    console.log('🔄 リセット→再開始テスト...');
    await page.evaluate(() => window.fullscreenMinaTuner?.gameControls.reset());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.fullscreenMinaTuner?.gameControls.start());
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.fullscreenMinaTuner?.countVisibleMinas());
    
    console.log('🎉 全画面Mina一覧調整完了！');
    console.log('');
    console.log('📋 手動調整コマンド:');
    console.log('   fullscreenMinaTuner.optimizeMinaItems("tiny") - 超小サイズ');
    console.log('   fullscreenMinaTuner.optimizeMinaItems("small") - 小サイズ');
    console.log('   fullscreenMinaTuner.optimizeMinaItems("normal") - 標準サイズ');
    console.log('   fullscreenMinaTuner.countVisibleMinas() - 表示数確認');
    console.log('   fullscreenMinaTuner.gameControls.addHuman() - 人間追加');
    console.log('   fullscreenMinaTuner.checkLayout() - レイアウト確認');
    console.log('');
    console.log('⏰ 45秒間の手動調整時間...');
    console.log('💡 ブラウザコンソールでコマンドを試してください！');
    
    // 45秒間の手動調整時間
    await page.waitForTimeout(45000);
    
  } catch (error) {
    console.error('❌ 全画面Mina調整エラー:', error.message);
  } finally {
    console.log('🔚 全画面Mina調整セッション終了');
    await browser.close();
  }
}

// Ctrl+C での終了処理
process.on('SIGINT', () => {
  console.log('\n🔚 全画面調整を終了しています...');
  process.exit(0);
});

// 全画面Mina調整実行
fullscreenMinaTuning().catch(console.error);