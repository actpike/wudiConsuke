const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testManaSystem() {
    console.log('🧪 Manaシステム動作テスト開始...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        args: ['--force-device-scale-factor=1']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 },
        deviceScaleFactor: 1
    });
    
    const page = await context.newPage();
    
    try {
        // ゲーム画面にアクセス
        console.log('📱 localhost:5174 にアクセス中...');
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // 初期スクリーンショット
        console.log('📸 初期ゲーム画面をキャプチャ...');
        await page.screenshot({ 
            path: 'mana-system-initial.png', 
            fullPage: true 
        });
        
        // 統計情報のUI要素を確認
        console.log('📊 統計情報UIの確認...');
        const statsElements = await page.evaluate(() => {
            const elements = {};
            
            // 世界樹関連の要素を探す
            const worldTreeElements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.textContent && (
                    el.textContent.includes('世界樹') || 
                    el.textContent.includes('World Tree') ||
                    el.textContent.includes('Tree')
                )
            );
            elements.worldTree = worldTreeElements.map(el => ({
                text: el.textContent.trim(),
                tagName: el.tagName,
                className: el.className
            }));
            
            // Mana関連の要素を探す
            const manaElements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.textContent && (
                    el.textContent.includes('Mana') || 
                    el.textContent.includes('マナ') ||
                    el.textContent.includes('収集') ||
                    el.textContent.includes('残り')
                )
            );
            elements.mana = manaElements.map(el => ({
                text: el.textContent.trim(),
                tagName: el.tagName,
                className: el.className
            }));
            
            // 統計情報エリア全体を探す
            const statsArea = Array.from(document.querySelectorAll('*')).filter(el => 
                el.className && (
                    el.className.includes('stats') || 
                    el.className.includes('statistics') ||
                    el.className.includes('info')
                )
            );
            elements.statsArea = statsArea.map(el => ({
                text: el.textContent.trim().substring(0, 200),
                tagName: el.tagName,
                className: el.className
            }));
            
            return elements;
        });
        
        console.log('🔍 発見されたUI要素:');
        console.log('世界樹関連:', JSON.stringify(statsElements.worldTree, null, 2));
        console.log('Mana関連:', JSON.stringify(statsElements.mana, null, 2));
        console.log('統計エリア:', JSON.stringify(statsElements.statsArea, null, 2));
        
        // キャンバス要素の確認
        console.log('🎨 キャンバス要素の確認...');
        const canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                return {
                    width: canvas.width,
                    height: canvas.height,
                    style: canvas.style.cssText,
                    context: canvas.getContext ? 'available' : 'not available'
                };
            }
            return null;
        });
        
        console.log('キャンバス情報:', canvasInfo);
        
        // ゲームを10秒間実行してManaの変化を観察
        console.log('⏱️ 10秒間のMana変化観察開始...');
        const observations = [];
        
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(1000);
            
            const currentStats = await page.evaluate(() => {
                // Mana関連の数値を抽出
                const allText = document.body.textContent;
                const manaMatches = allText.match(/(\d+)\s*(Mana|マナ|収集|残り)/gi) || [];
                const numbers = allText.match(/\d+/g) || [];
                
                return {
                    timestamp: new Date().toISOString(),
                    manaText: manaMatches,
                    allNumbers: numbers.slice(0, 20), // 最初の20個の数値
                    bodyText: allText.substring(0, 500) // 最初の500文字
                };
            });
            
            observations.push({
                second: i + 1,
                stats: currentStats
            });
            
            console.log(`${i + 1}秒: ${JSON.stringify(currentStats.manaText)}`);
        }
        
        // 最終スクリーンショット
        console.log('📸 最終ゲーム画面をキャプチャ...');
        await page.screenshot({ 
            path: 'mana-system-final.png', 
            fullPage: true 
        });
        
        // Canvas内容の詳細分析
        console.log('🔍 Canvas描画内容の分析...');
        const canvasAnalysis = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            
            // Canvas内容をImageDataとして取得
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 色の分析
            const colorAnalysis = {
                totalPixels: imageData.data.length / 4,
                colorCounts: {},
                hasLightBlue: false,
                hasGreen: false
            };
            
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const a = imageData.data[i + 3];
                
                if (a > 0) { // 透明でない画素のみ
                    const color = `rgb(${r},${g},${b})`;
                    colorAnalysis.colorCounts[color] = (colorAnalysis.colorCounts[color] || 0) + 1;
                    
                    // ライトブルー検出 (Mana色)
                    if (b > 200 && g > 150 && r < 150) {
                        colorAnalysis.hasLightBlue = true;
                    }
                    
                    // 緑色検出 (世界樹エリア)
                    if (g > 150 && r < 150 && b < 150) {
                        colorAnalysis.hasGreen = true;
                    }
                }
            }
            
            // 上位10色を取得
            const topColors = Object.entries(colorAnalysis.colorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            
            return {
                canvasSize: { width: canvas.width, height: canvas.height },
                totalPixels: colorAnalysis.totalPixels,
                hasLightBlue: colorAnalysis.hasLightBlue,
                hasGreen: colorAnalysis.hasGreen,
                topColors: topColors,
                uniqueColors: Object.keys(colorAnalysis.colorCounts).length
            };
        });
        
        console.log('🎨 Canvas分析結果:', canvasAnalysis);
        
        // ゲーム要素の位置確認
        console.log('📍 ゲーム要素の位置確認...');
        const elementPositions = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const positions = [];
            
            elements.forEach(el => {
                if (el.textContent && (
                    el.textContent.includes('Mana') ||
                    el.textContent.includes('世界樹') ||
                    el.textContent.includes('収集') ||
                    el.textContent.includes('残り')
                )) {
                    const rect = el.getBoundingClientRect();
                    positions.push({
                        text: el.textContent.trim().substring(0, 50),
                        position: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        },
                        visible: rect.width > 0 && rect.height > 0
                    });
                }
            });
            
            return positions;
        });
        
        console.log('📍 要素位置:', JSON.stringify(elementPositions, null, 2));
        
        // テスト結果のまとめ
        console.log('\n🎯 Manaシステムテスト結果まとめ:');
        console.log('=====================================');
        console.log(`✅ ゲーム画面アクセス: 成功`);
        console.log(`📊 統計UI要素発見: ${statsElements.worldTree.length + statsElements.mana.length}個`);
        console.log(`🎨 Canvas描画確認: ${canvasAnalysis ? '成功' : '失敗'}`);
        if (canvasAnalysis) {
            console.log(`   - ライトブルー(Mana)色検出: ${canvasAnalysis.hasLightBlue ? '✅' : '❌'}`);
            console.log(`   - 緑色(世界樹)検出: ${canvasAnalysis.hasGreen ? '✅' : '❌'}`);
            console.log(`   - 描画色数: ${canvasAnalysis.uniqueColors}色`);
        }
        console.log(`⏱️ Mana変化観察: ${observations.length}秒間完了`);
        console.log(`📍 UI要素位置確認: ${elementPositions.length}個の要素`);
        
        // 詳細な観察データを出力
        console.log('\n📈 時系列観察データ:');
        observations.forEach(obs => {
            console.log(`${obs.second}秒: Mana関連テキスト=${obs.stats.manaText.length}個, 数値=${obs.stats.allNumbers.length}個`);
        });
        
        // 最終的な評価
        const testResults = {
            gameAccess: true,
            uiElementsFound: statsElements.worldTree.length + statsElements.mana.length > 0,
            canvasRendering: canvasAnalysis !== null,
            manaColorDetected: canvasAnalysis?.hasLightBlue || false,
            worldTreeColorDetected: canvasAnalysis?.hasGreen || false,
            observationComplete: observations.length === 10,
            elementsVisible: elementPositions.some(el => el.visible)
        };
        
        console.log('\n🏆 最終評価:');
        Object.entries(testResults).forEach(([key, value]) => {
            console.log(`${key}: ${value ? '✅ 成功' : '❌ 失敗'}`);
        });
        
        const overallSuccess = Object.values(testResults).every(v => v === true);
        console.log(`\n総合評価: ${overallSuccess ? '✅ 全テスト成功' : '⚠️ 一部テスト失敗'}`);
        
        // 結果をファイルに保存
        const resultData = {
            timestamp: new Date().toISOString(),
            testResults,
            statsElements,
            canvasAnalysis,
            observations,
            elementPositions
        };
        
        fs.writeFileSync('mana-system-test-results.json', JSON.stringify(resultData, null, 2));
        console.log('📄 詳細結果を mana-system-test-results.json に保存しました');
        
    } catch (error) {
        console.error('❌ テスト実行エラー:', error);
    } finally {
        console.log('🔚 ブラウザを終了します...');
        await browser.close();
    }
}

testManaSystem();