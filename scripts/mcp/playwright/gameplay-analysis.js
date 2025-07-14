const { chromium } = require('playwright');

async function analyzeGameplay() {
  console.log('🎮 LifeSim ゲームプレイ分析開始！');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    args: ['--start-maximized']
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
    
    // ゲームプレイ分析用のツールを注入
    await page.addInitScript(() => {
      window.gameplayAnalyzer = {
        // ゲームの基本状態を分析
        analyzeGameState: () => {
          const canvas = document.querySelector('canvas');
          const humans = document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]');
          const gameStats = document.querySelectorAll('[class*="stat-value"]');
          const buttons = document.querySelectorAll('button');
          
          const analysis = {
            canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
            humanCount: humans.length,
            gameStatsCount: gameStats.length,
            availableButtons: Array.from(buttons).map(btn => btn.textContent.trim()),
            timestamp: new Date().toISOString()
          };
          
          console.log('🎲 ゲーム状態分析:', analysis);
          return analysis;
        },
        
        // 長期間プレイして変化を観察
        watchGameEvolution: (duration = 30000) => {
          const startTime = Date.now();
          const observations = [];
          
          const observer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const humans = document.querySelectorAll('.human-item, .mina-item, [class*="human-"], [class*="mina-"]');
            const humanStates = Array.from(humans).map(h => {
              const text = h.textContent || '';
              const energyMatch = text.match(/(\d+)%/) || text.match(/(\d+)/);
              const stateMatch = text.match(/(探索|食糧|帰還|休息)/);
              return {
                energy: energyMatch ? parseInt(energyMatch[1]) : null,
                state: stateMatch ? stateMatch[1] : 'unknown',
                position: text.match(/\((\d+),\s*(\d+)\)/) ? {
                  x: parseInt(text.match(/\((\d+),\s*(\d+)\)/)[1]),
                  y: parseInt(text.match(/\((\d+),\s*(\d+)\)/)[2])
                } : null
              };
            });
            
            observations.push({
              time: elapsed / 1000,
              humanCount: humans.length,
              states: humanStates,
              averageEnergy: humanStates.reduce((sum, h) => sum + (h.energy || 0), 0) / humanStates.length
            });
            
            if (elapsed >= duration) {
              clearInterval(observer);
              console.log('📊 長期観察結果:', observations);
              window.gameplayObservations = observations;
            }
          }, 2000);
          
          return `${duration/1000}秒間の観察を開始しました`;
        },
        
        // プレイヤーの関心ポイントを分析
        analyzeEngagement: () => {
          const interactiveElements = {
            clickableHumans: document.querySelectorAll('.human-id[style*="cursor: pointer"]').length,
            gameControls: document.querySelectorAll('.control-btn').length,
            informationPanels: document.querySelectorAll('.info-section').length,
            logs: document.querySelectorAll('.log-item').length
          };
          
          console.log('👀 エンゲージメント要素:', interactiveElements);
          return interactiveElements;
        },
        
        // ゲームの問題点を特定
        identifyIssues: () => {
          const issues = [];
          
          // 情報の見つけやすさ
          const humanList = document.querySelector('.human-list, .mina-list');
          if (!humanList) {
            issues.push('❌ Mina一覧が見つからない');
          } else if (humanList.scrollHeight > humanList.clientHeight) {
            issues.push('⚠️ Mina一覧がスクロール必要');
          }
          
          // インタラクション性
          const clickableElements = document.querySelectorAll('[style*="cursor: pointer"]').length;
          if (clickableElements < 5) {
            issues.push('⚠️ インタラクティブ要素が少ない');
          }
          
          // 視覚的フィードバック
          const canvas = document.querySelector('canvas');
          if (canvas && (canvas.width < 400 || canvas.height < 400)) {
            issues.push('⚠️ キャンバスサイズが小さい');
          }
          
          console.log('🔍 特定された問題:', issues);
          return issues;
        }
      };
      
      console.log('🛠️ ゲームプレイ分析ツール準備完了');
    });
    
    // ページリロードしてツールを有効化
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
    console.log('🎮 ゲーム開始...');
    const startBtn = page.locator('button:has-text("開始"), button:has-text("Start")');
    if (await startBtn.count() > 0) {
      await startBtn.first().click();
      await page.waitForTimeout(5000);
    }
    
    // 基本状態分析
    console.log('📊 基本状態分析...');
    const basicAnalysis = await page.evaluate(() => window.gameplayAnalyzer?.analyzeGameState());
    
    // エンゲージメント分析
    console.log('👀 エンゲージメント分析...');
    const engagement = await page.evaluate(() => window.gameplayAnalyzer?.analyzeEngagement());
    
    // 問題点特定
    console.log('🔍 問題点特定...');
    const issues = await page.evaluate(() => window.gameplayAnalyzer?.identifyIssues());
    
    // 長期間プレイテスト開始
    console.log('⏰ 60秒間の長期プレイテスト開始...');
    await page.evaluate(() => window.gameplayAnalyzer?.watchGameEvolution(60000));
    
    // Minaをクリックしてインタラクション テスト
    console.log('🖱️ Minaインタラクションテスト...');
    const humanIds = page.locator('.human-id');
    const humanCount = await humanIds.count();
    if (humanCount > 0) {
      await humanIds.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Minaクリック成功');
    }
    
    // キャンバス操作テスト
    console.log('🎯 キャンバス操作テスト...');
    const canvas = page.locator('canvas');
    if (await canvas.count() > 0) {
      const box = await canvas.boundingBox();
      if (box) {
        await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
        await page.waitForTimeout(1000);
        console.log('✅ キャンバスクリック成功');
      }
    }
    
    // ゲームコントロールテスト
    console.log('🎮 ゲームコントロールテスト...');
    const resetBtn = page.locator('button:has-text("リセット"), button:has-text("Reset")');
    if (await resetBtn.count() > 0) {
      await resetBtn.first().click();
      await page.waitForTimeout(3000);
      console.log('🔄 リセット成功');
      
      // 再開始
      const restartBtn = page.locator('button:has-text("開始"), button:has-text("Start")');
      if (await restartBtn.count() > 0) {
        await restartBtn.first().click();
        await page.waitForTimeout(3000);
        console.log('▶️ 再開始成功');
      }
    }
    
    // 60秒待機して長期観察結果を取得
    console.log('⏳ 長期観察完了まで待機...');
    await page.waitForTimeout(65000);
    
    const longTermObservations = await page.evaluate(() => window.gameplayObservations || []);
    
    // 最終スクリーンショット
    console.log('📸 最終ゲームプレイスクリーンショット...');
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/gameplay-analysis.png', 
      fullPage: true 
    });
    
    // 分析結果の表示
    console.log('\n🎯 ゲームプレイ分析結果:');
    console.log('=====================================');
    console.log('📊 基本状態:', JSON.stringify(basicAnalysis, null, 2));
    console.log('👀 エンゲージメント:', JSON.stringify(engagement, null, 2));
    console.log('🔍 特定された問題:', issues);
    console.log('📈 長期観察結果:', longTermObservations.length + '個のデータポイント取得');
    
    if (longTermObservations.length > 0) {
      const finalObservation = longTermObservations[longTermObservations.length - 1];
      const initialObservation = longTermObservations[0];
      console.log('📊 変化分析:');
      console.log(`   Mina数変化: ${initialObservation.humanCount} → ${finalObservation.humanCount}`);
      console.log(`   平均エネルギー変化: ${initialObservation.averageEnergy?.toFixed(1)} → ${finalObservation.averageEnergy?.toFixed(1)}`);
    }
    
    console.log('\n💡 改善提案生成のため、さらに10秒間観察...');
    await page.waitForTimeout(10000);
    
    console.log('🎉 ゲームプレイ分析完了！');
    
  } catch (error) {
    console.error('❌ ゲームプレイ分析エラー:', error.message);
  } finally {
    await browser.close();
  }
}

// Ctrl+C での終了処理
process.on('SIGINT', () => {
  console.log('\n🔚 ゲームプレイ分析を終了しています...');
  process.exit(0);
});

// ゲームプレイ分析実行
analyzeGameplay().catch(console.error);