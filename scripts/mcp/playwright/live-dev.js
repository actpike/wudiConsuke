const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function liveDevEnvironment() {
  console.log('🚀 Live Development Environment 起動');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 0,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  try {
    // カスタムCSS注入用のファイル作成
    const customCssPath = path.join(__dirname, 'live-adjustments.css');
    if (!fs.existsSync(customCssPath)) {
      fs.writeFileSync(customCssPath, `
/* Live CSS Adjustments for LifeSim */
/* このファイルを編集してリアルタイムでスタイルを調整 */

/* ゲーム全体のサイズ調整 */
.lifesim-container {
  zoom: 0.9;
  transition: all 0.3s ease;
}

/* 人間一覧の調整 (ACT-67) */
.human-list {
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
}

/* ログパネルの調整 (ACT-66) */
.log-panel {
  max-height: 150px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.3;
}

/* ヘッダーの高さ調整 (ACT-65) */
.header, .game-header {
  height: 40px;
  padding: 5px 10px;
}

/* フォントサイズ全体調整 (ACT-64) */
body {
  font-size: 13px;
}

/* ゲーム情報パネル */
.game-info {
  font-size: 12px;
  padding: 8px;
}

/* キャンバスの調整 */
canvas {
  border: 1px solid #ddd;
  transition: transform 0.3s ease;
}

canvas:hover {
  transform: scale(1.02);
}
      `);
    }
    
    console.log('📍 LifeSimサイトにアクセス...');
    await page.goto('https://its-life-world.vercel.app', { waitUntil: 'networkidle' });
    
    // 軽量LifeSimを起動
    console.log('🌟 軽量LifeSimを起動...');
    const lightLifeSimButton = page.locator('text=/軽量.*LifeSim/i');
    if (await lightLifeSimButton.count() > 0) {
      await lightLifeSimButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // カスタムCSS注入システムを追加
    await page.addInitScript(() => {
      window.liveCSS = {
        inject: (css) => {
          let style = document.getElementById('live-css');
          if (!style) {
            style = document.createElement('style');
            style.id = 'live-css';
            document.head.appendChild(style);
          }
          style.textContent = css;
          console.log('🎨 Live CSS injected');
        },
        
        // ファイルからCSSを読み込み（シミュレート）
        loadFromFile: (cssContent) => {
          window.liveCSS.inject(cssContent);
        },
        
        // よく使う調整のプリセット
        presets: {
          compact: () => window.liveCSS.inject(`
            .lifesim-container { zoom: 0.8; }
            .human-list { max-height: 120px; font-size: 10px; }
            .log-panel { max-height: 100px; font-size: 10px; }
            body { font-size: 11px; }
          `),
          
          normal: () => window.liveCSS.inject(`
            .lifesim-container { zoom: 1; }
            .human-list { max-height: 200px; font-size: 12px; }
            .log-panel { max-height: 150px; font-size: 11px; }
            body { font-size: 13px; }
          `),
          
          large: () => window.liveCSS.inject(`
            .lifesim-container { zoom: 1.1; }
            .human-list { max-height: 250px; font-size: 14px; }
            .log-panel { max-height: 200px; font-size: 12px; }
            body { font-size: 15px; }
          `),
          
          mobile: () => window.liveCSS.inject(`
            .lifesim-container { zoom: 0.7; }
            .human-list { max-height: 100px; font-size: 9px; }
            .log-panel { max-height: 80px; font-size: 9px; }
            body { font-size: 10px; }
            canvas { width: 90% !important; height: auto !important; }
          `)
        },
        
        // ファイル監視シミュレート機能
        watchMode: false,
        startWatch: () => {
          if (!window.liveCSS.watchMode) {
            window.liveCSS.watchMode = true;
            console.log('👁️ CSS Watch mode started');
            
            // 5秒ごとにCSS更新をチェック（実際のファイル監視の代替）
            setInterval(() => {
              if (window.liveCSS.watchMode) {
                console.log('🔄 Checking for CSS updates...');
                // 実際の開発では、ここでファイルの変更をチェック
              }
            }, 5000);
          }
        },
        
        stopWatch: () => {
          window.liveCSS.watchMode = false;
          console.log('⏹️ CSS Watch mode stopped');
        }
      };
      
      console.log('🛠️ Live CSS system loaded!');
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
    
    // 初期CSSを適用
    console.log('🎨 初期CSSを適用...');
    const initialCSS = fs.readFileSync(customCssPath, 'utf8');
    await page.evaluate((css) => {
      if (window.liveCSS) {
        window.liveCSS.inject(css);
        window.liveCSS.startWatch();
      }
    }, initialCSS);
    
    console.log('🎉 Live Development Environment 準備完了！');
    console.log('');
    console.log('📋 使用可能な機能:');
    console.log('   🎨 liveCSS.inject(css) - CSSを直接注入');
    console.log('   📁 liveCSS.presets.compact() - コンパクトプリセット');
    console.log('   📁 liveCSS.presets.normal() - 通常プリセット');
    console.log('   📁 liveCSS.presets.large() - 大きめプリセット');
    console.log('   📱 liveCSS.presets.mobile() - モバイル向けプリセット');
    console.log('   👁️ liveCSS.startWatch() - 監視モード開始');
    console.log('');
    console.log(`📄 CSSファイル: ${customCssPath}`);
    console.log('💡 このファイルを編集して保存すると、手動でリロードできます');
    console.log('');
    
    // プリセットのデモ
    console.log('🎬 プリセットデモ開始...');
    
    await page.waitForTimeout(3000);
    console.log('📱 Mobile preset...');
    await page.evaluate(() => window.liveCSS?.presets.mobile());
    await page.waitForTimeout(3000);
    
    console.log('📏 Compact preset...');
    await page.evaluate(() => window.liveCSS?.presets.compact());
    await page.waitForTimeout(3000);
    
    console.log('📐 Normal preset...');
    await page.evaluate(() => window.liveCSS?.presets.normal());
    await page.waitForTimeout(3000);
    
    console.log('📊 Large preset...');
    await page.evaluate(() => window.liveCSS?.presets.large());
    await page.waitForTimeout(3000);
    
    console.log('🔄 Normal に戻します...');
    await page.evaluate(() => window.liveCSS?.presets.normal());
    
    console.log('');
    console.log('🚀 Live Development Mode アクティブ！');
    console.log('⏰ ブラウザを2分間開いたままにします...');
    console.log('💡 Ctrl+C で終了 | ブラウザコンソールで liveCSS を使用可能');
    
    // 2分間開いたままにして開発作業を可能にする
    await page.waitForTimeout(120000);
    
  } catch (error) {
    console.error('❌ Live Dev Environment エラー:', error.message);
  } finally {
    console.log('🔚 Live Development Environment 終了');
    await browser.close();
  }
}

// Ctrl+C での終了処理
process.on('SIGINT', () => {
  console.log('\n🔚 Live Development Environment を終了しています...');
  process.exit(0);
});

// Live Development Environment 実行
liveDevEnvironment().catch(console.error);