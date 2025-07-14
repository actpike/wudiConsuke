const { chromium } = require('playwright');

async function minaListTuning() {
  console.log('👥 Mina一覧サイズ調整モード開始！');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📍 LifeSimサイトにアクセス...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 軽量LifeSimを起動
    console.log('🌟 軽量LifeSimを起動...');
    const lightLifeSimButton = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton.count() > 0) {
      await lightLifeSimButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // Mina一覧専用の調整ツールを注入
    await page.addInitScript(() => {
      window.minaListTuner = {
        // Mina個別パネルのサイズ調整
        setMinaPanelSize: (height = '40px', fontSize = '11px', padding = '4px') => {
          const css = `
            .human-item, .mina-item, [class*="human-"], [class*="mina-"] {
              height: ${height} !important;
              min-height: ${height} !important;
              font-size: ${fontSize} !important;
              padding: ${padding} !important;
              margin: 2px 0 !important;
              line-height: 1.2 !important;
              display: flex !important;
              align-items: center !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 4px !important;
              background: #f9f9f9 !important;
            }
            
            .human-item:hover, .mina-item:hover, [class*="human-"]:hover, [class*="mina-"]:hover {
              background: #e8f4fd !important;
              border-color: #2196f3 !important;
            }
          `;
          window.minaListTuner.injectCSS(css);
          console.log(`👥 Minaパネルサイズ調整: height=${height}, fontSize=${fontSize}`);
        },
        
        // Mina一覧コンテナのサイズ調整
        setMinaListContainer: (maxHeight = '300px', overflow = 'auto') => {
          const css = `
            .human-list, .mina-list, [class*="human-list"], [class*="mina-list"] {
              max-height: ${maxHeight} !important;
              overflow-y: ${overflow} !important;
              border: 1px solid #ddd !important;
              border-radius: 6px !important;
              padding: 8px !important;
              background: white !important;
            }
          `;
          window.minaListTuner.injectCSS(css);
          console.log(`📋 Mina一覧コンテナ調整: maxHeight=${maxHeight}`);
        },
        
        // プリセット調整
        presets: {
          compact: () => {
            window.minaListTuner.setMinaPanelSize('32px', '10px', '3px');
            window.minaListTuner.setMinaListContainer('250px');
            console.log('📏 Compactモード適用');
          },
          
          normal: () => {
            window.minaListTuner.setMinaPanelSize('40px', '11px', '4px');
            window.minaListTuner.setMinaListContainer('300px');
            console.log('📐 Normalモード適用');
          },
          
          large: () => {
            window.minaListTuner.setMinaPanelSize('50px', '12px', '6px');
            window.minaListTuner.setMinaListContainer('400px');
            console.log('📊 Largeモード適用');
          },
          
          tiny: () => {
            window.minaListTuner.setMinaPanelSize('26px', '9px', '2px');
            window.minaListTuner.setMinaListContainer('200px');
            console.log('🔬 Tinyモード適用 - 最大表示数');
          }
        },
        
        // CSS注入用ヘルパー
        injectCSS: (css) => {
          let style = document.getElementById('mina-list-tuner');
          if (!style) {
            style = document.createElement('style');
            style.id = 'mina-list-tuner';
            document.head.appendChild(style);
          }
          style.textContent = css;
        },
        
        // 現在表示されているMina数をカウント
        countVisibleMinas: () => {
          const minaElements = document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]');
          const visibleCount = Array.from(minaElements).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.height > 0 && rect.width > 0;
          }).length;
          console.log(`👥 現在表示中のMina数: ${visibleCount}`);
          return visibleCount;
        },
        
        // ゲーム操作ヘルパー
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
            console.log('⚠️ 開始ボタンが見つかりません');
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
            console.log('⚠️ リセットボタンが見つかりません');
            return false;
          },
          
          addHuman: () => {
            const addBtn = Array.from(document.querySelectorAll('button')).find(btn => 
              btn.textContent.includes('追加') || btn.textContent.includes('人間')
            );
            if (addBtn) {
              addBtn.click();
              console.log('👤 人間追加');
              return true;
            }
            console.log('⚠️ 人間追加ボタンが見つかりません');
            return false;
          },
          
          // 利用可能なボタン一覧を表示
          listButtons: () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            console.log('🔘 利用可能なボタン一覧:');
            buttons.forEach((btn, i) => {
              console.log(`   ${i+1}. "${btn.textContent.trim()}"`);
            });
            return buttons.map(btn => btn.textContent.trim());
          }
        }
      };
      
      console.log('🛠️ Mina List Tuner loaded!');
    });
    
    // ページリロードして機能を有効化
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 軽量LifeSimを再起動
    const lightLifeSimButton2 = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton2.count() > 0) {
      await lightLifeSimButton2.first().click();
      await page.waitForTimeout(3000);
    }
    
    console.log('🎮 ゲーム開始してMina一覧を表示...');
    await page.evaluate(() => {
      if (window.minaListTuner) {
        window.minaListTuner.gameControls.start();
      }
    });
    await page.waitForTimeout(5000);
    
    console.log('👥 現在のMina一覧状態を確認...');
    await page.evaluate(() => {
      if (window.minaListTuner) {
        window.minaListTuner.countVisibleMinas();
      }
    });
    
    console.log('🎬 サイズ調整デモ開始...');
    
    // Normal サイズで開始
    console.log('📐 Normal サイズで開始...');
    await page.evaluate(() => window.minaListTuner?.presets.normal());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaListTuner?.countVisibleMinas());
    
    // Compact サイズに変更
    console.log('📏 Compact サイズに変更...');
    await page.evaluate(() => window.minaListTuner?.presets.compact());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaListTuner?.countVisibleMinas());
    
    // Tiny サイズでより多く表示
    console.log('🔬 Tiny サイズで最大表示...');
    await page.evaluate(() => window.minaListTuner?.presets.tiny());
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaListTuner?.countVisibleMinas());
    
    // 人間を追加してテスト
    console.log('👤 人間を追加してテスト...');
    await page.evaluate(() => window.minaListTuner?.gameControls.addHuman());
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.minaListTuner?.gameControls.addHuman());
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.minaListTuner?.countVisibleMinas());
    
    // リセットしてから再開始
    console.log('🔄 リセットしてから再開始...');
    await page.evaluate(() => window.minaListTuner?.gameControls.reset());
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.minaListTuner?.gameControls.start());
    await page.waitForTimeout(3000);
    
    // 最適サイズを試す
    console.log('⚡ カスタム最適サイズを試行...');
    await page.evaluate(() => {
      if (window.minaListTuner) {
        // 非常に小さくして多数表示
        window.minaListTuner.setMinaPanelSize('28px', '9px', '2px 4px');
        window.minaListTuner.setMinaListContainer('280px');
      }
    });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.minaListTuner?.countVisibleMinas());
    
    console.log('🎉 Mina一覧調整完了！');
    console.log('');
    console.log('📋 使用可能なコマンド:');
    console.log('   minaListTuner.presets.tiny() - 最小サイズ');
    console.log('   minaListTuner.presets.compact() - コンパクト');
    console.log('   minaListTuner.presets.normal() - 通常');
    console.log('   minaListTuner.setMinaPanelSize("24px", "8px", "1px") - カスタム');
    console.log('   minaListTuner.countVisibleMinas() - 表示数確認');
    console.log('   minaListTuner.gameControls.start() - ゲーム開始');
    console.log('   minaListTuner.gameControls.reset() - リセット');
    console.log('');
    console.log('⏰ 30秒間手動調整時間...');
    console.log('💡 ブラウザコンソールでコマンドを試してください！');
    
    // 30秒間の手動調整時間
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Mina一覧調整エラー:', error.message);
  } finally {
    console.log('🔚 Mina一覧調整セッション終了');
    await browser.close();
  }
}

// Ctrl+C での終了処理
process.on('SIGINT', () => {
  console.log('\n🔚 Mina一覧調整を終了しています...');
  process.exit(0);
});

// Mina一覧調整実行
minaListTuning().catch(console.error);