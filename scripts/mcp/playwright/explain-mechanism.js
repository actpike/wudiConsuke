/*
🔍 Playwright CSS調整システムの仕組み解説

このシステムは以下の4段階で動作します：
1. JavaScript機能注入 (addInitScript)
2. CSS動的変更 (DOM操作)
3. 状態検証 (DOM分析)
4. 結果確認 (スクリーンショット)
*/

const { chromium } = require('playwright');

async function explainMechanism() {
  console.log('🔍 CSS調整システムの仕組み解説');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    console.log('\n📚 ステップ1: JavaScript機能注入');
    console.log('   addInitScript() でブラウザにカスタム関数を注入');
    
    // ============================================
    // ステップ1: JavaScript機能注入システム
    // ============================================
    await page.addInitScript(() => {
      console.log('🚀 カスタム関数がブラウザに注入されました');
      
      window.cssAdjuster = {
        // CSS注入の仕組み
        injectCSS: (css) => {
          console.log('📝 CSS注入プロセス開始...');
          
          // 1. 既存のstyleタグを探すか新規作成
          let style = document.getElementById('dynamic-css');
          if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-css';
            document.head.appendChild(style);
            console.log('   ✅ 新しい<style>タグを作成');
          } else {
            console.log('   🔄 既存の<style>タグを更新');
          }
          
          // 2. CSS内容を設定
          style.textContent = css;
          console.log('   📋 CSS適用完了');
          
          // 3. 適用結果を即座に確認
          const appliedElements = document.querySelectorAll('*');
          console.log(`   📊 ${appliedElements.length}個の要素に影響可能`);
        },
        
        // DOM要素分析の仕組み
        analyzeElements: (selector) => {
          console.log(`🔍 要素分析: "${selector}"`);
          
          const elements = document.querySelectorAll(selector);
          console.log(`   📋 ${elements.length}個の要素が見つかりました`);
          
          const analysis = Array.from(elements).map((el, i) => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            
            return {
              index: i + 1,
              text: el.textContent?.trim().substring(0, 30) || '',
              position: {
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              styles: {
                fontSize: computedStyle.fontSize,
                height: computedStyle.height,
                display: computedStyle.display,
                overflow: computedStyle.overflow
              },
              isVisible: rect.width > 0 && rect.height > 0 && 
                        rect.top >= 0 && rect.bottom <= window.innerHeight
            };
          });
          
          console.log('   📊 分析結果:');
          analysis.forEach(item => {
            console.log(`     ${item.index}. "${item.text}" - ${item.position.width}x${item.position.height} - 表示:${item.isVisible}`);
          });
          
          return analysis;
        },
        
        // 収まり具合検証の仕組み
        validateFit: (containerSelector, itemSelector, maxItems = 3) => {
          console.log(`🎯 収まり検証: コンテナ"${containerSelector}" に アイテム"${itemSelector}" が${maxItems}個`);
          
          const container = document.querySelector(containerSelector);
          const items = document.querySelectorAll(itemSelector);
          
          if (!container) {
            console.log('   ❌ コンテナが見つかりません');
            return { success: false, reason: 'container_not_found' };
          }
          
          const containerRect = container.getBoundingClientRect();
          console.log(`   📦 コンテナ: ${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`);
          
          let allFit = true;
          const results = [];
          
          for (let i = 0; i < Math.min(maxItems, items.length); i++) {
            const item = items[i];
            const itemRect = item.getBoundingClientRect();
            
            // 重要: 相対位置で収まりを判定
            const fitsHorizontally = itemRect.left >= containerRect.left && 
                                   itemRect.right <= containerRect.right;
            const fitsVertically = itemRect.top >= containerRect.top && 
                                 itemRect.bottom <= containerRect.bottom;
            const isVisible = window.getComputedStyle(item).display !== 'none';
            
            const itemFits = fitsHorizontally && fitsVertically && isVisible;
            
            results.push({
              index: i + 1,
              fits: itemFits,
              position: {
                top: Math.round(itemRect.top - containerRect.top),
                bottom: Math.round(itemRect.bottom - containerRect.top),
                height: Math.round(itemRect.height)
              }
            });
            
            console.log(`   👤 アイテム${i+1}: 高さ${Math.round(itemRect.height)}px, 収まり:${itemFits}`);
            
            if (!itemFits) allFit = false;
          }
          
          const result = {
            success: allFit,
            containerSize: {
              width: Math.round(containerRect.width),
              height: Math.round(containerRect.height)
            },
            items: results,
            totalItems: items.length
          };
          
          console.log(`   🎯 最終結果: ${allFit ? '✅ 全て収まっています' : '⚠️ 調整が必要です'}`);
          return result;
        }
      };
    });
    
    console.log('\n📚 ステップ2: サイトアクセスと初期状態確認');
    await page.goto('https://its-life-world.vercel.app');
    await page.waitForTimeout(2000);
    
    // 軽量LifeSimを起動
    const lifesimBtn = page.locator('text=/軽量.*LifeSim/i');
    if (await lifesimBtn.count() > 0) {
      await lifesimBtn.click();
      await page.waitForTimeout(3000);
    }
    
    console.log('\n📚 ステップ3: DOM要素の分析デモ');
    const analysis = await page.evaluate(() => {
      return window.cssAdjuster?.analyzeElements('.human-item, .mina-item, [class*="human-"], [class*="mina-"]');
    });
    
    console.log('\n📚 ステップ4: CSS動的変更デモ');
    console.log('   🎨 現在のスタイルから調整版スタイルに変更...');
    
    await page.evaluate(() => {
      const css = `
        /* デモ用CSS - リアルタイム変更 */
        .human-list, [class*="human-list"] {
          position: fixed !important;
          top: 50px !important;
          right: 50px !important;
          width: 250px !important;
          height: 200px !important;
          background: linear-gradient(135deg, #fff, #f0f8ff) !important;
          border: 3px solid #ff4444 !important;
          border-radius: 10px !important;
          padding: 10px !important;
          z-index: 9999 !important;
          box-shadow: 0 10px 30px rgba(255,68,68,0.3) !important;
        }
        
        .human-item, [class*="human-"] {
          height: 40px !important;
          background: linear-gradient(90deg, #ffeeee, #ffe0e0) !important;
          border: 2px solid #ff6666 !important;
          margin: 2px 0 !important;
          border-radius: 8px !important;
          font-size: 11px !important;
          padding: 5px !important;
          transition: all 0.3s ease !important;
        }
      `;
      
      if (window.cssAdjuster) {
        window.cssAdjuster.injectCSS(css);
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('\n📚 ステップ5: 調整結果の検証デモ');
    const validation = await page.evaluate(() => {
      return window.cssAdjuster?.validateFit(
        '.human-list, [class*="human-list"]',
        '.human-item, [class*="human-"]',
        3
      );
    });
    
    console.log('   📊 検証結果:', JSON.stringify(validation, null, 2));
    
    console.log('\n📚 ステップ6: さらなる精密調整デモ');
    console.log('   🔬 最適なサイズを探索中...');
    
    // 複数のサイズパターンをテスト
    const testSizes = [
      { container: 180, item: 45 },
      { container: 200, item: 50 },
      { container: 160, item: 40 }
    ];
    
    for (const size of testSizes) {
      console.log(`   🧪 テスト: コンテナ${size.container}px, アイテム${size.item}px`);
      
      await page.evaluate((sz) => {
        const css = `
          .human-list, [class*="human-list"] {
            height: ${sz.container}px !important;
          }
          .human-item, [class*="human-"] {
            height: ${sz.item}px !important;
          }
        `;
        window.cssAdjuster?.injectCSS(css);
      }, size);
      
      await page.waitForTimeout(1000);
      
      const result = await page.evaluate(() => {
        return window.cssAdjuster?.validateFit(
          '.human-list, [class*="human-list"]',
          '.human-item, [class*="human-"]',
          3
        );
      });
      
      console.log(`      ${result?.success ? '✅' : '❌'} 結果: ${result?.success ? '成功' : '要調整'}`);
      
      if (result?.success) {
        console.log(`   🎯 最適解発見: コンテナ${size.container}px, アイテム${size.item}px`);
        break;
      }
    }
    
    console.log('\n📚 ステップ7: スクリーンショット保存');
    await page.screenshot({ 
      path: '/home/actpike/dev/ItsLifeWorld/its_life_world/mcp/playwright/mechanism-demo.png',
      fullPage: true 
    });
    console.log('   📸 結果をスクリーンショットで保存');
    
    console.log('\n🎉 CSS調整システムの仕組み解説完了！');
    console.log('\n📋 このシステムの特徴:');
    console.log('   1. 🔄 リアルタイム変更: CSS変更が即座に反映');
    console.log('   2. 📊 精密分析: DOM要素の位置・サイズを数値で確認');
    console.log('   3. 🎯 自動検証: 目標条件を満たすかプログラムで判定');
    console.log('   4. 🔬 反復改善: 複数パターンを自動テストして最適解発見');
    console.log('   5. 📸 結果保存: 視覚的確認用のスクリーンショット');
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 解説デモエラー:', error.message);
  } finally {
    await browser.close();
  }
}

explainMechanism().catch(console.error);