const { chromium } = require('playwright');
const fs = require('fs');

async function testLifeSimManaSystem() {
    console.log('🎮 LifeSimのManaシステム詳細テスト開始...');
    
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
        // LifeSimゲーム画面に直接アクセス
        console.log('🎯 LifeSimに直接アクセス中...');
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // LifeSimボタンをクリック
        console.log('🔘 LifeSimボタンを探してクリック...');
        const lifeSimButton = await page.getByText('軽量LifeSim').first();
        if (lifeSimButton) {
            await lifeSimButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ LifeSimボタンをクリックしました');
        } else {
            console.log('⚠️ LifeSimボタンが見つかりません。直接URLを試します');
        }
        
        // 初期スクリーンショット
        console.log('📸 LifeSim画面をキャプチャ...');
        await page.screenshot({ 
            path: 'lifesim-mana-initial.png', 
            fullPage: true 
        });
        
        // ページ全体のコンテンツを確認
        console.log('📋 ページ全体のコンテンツ確認...');
        const pageContent = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                bodyText: document.body.textContent.substring(0, 1000),
                allElements: Array.from(document.querySelectorAll('*')).length,
                hasCanvas: !!document.querySelector('canvas'),
                canvasCount: document.querySelectorAll('canvas').length
            };
        });
        
        console.log('📄 ページ情報:', pageContent);
        
        // Canvas要素の詳細確認
        if (pageContent.hasCanvas) {
            console.log('🎨 Canvas要素の詳細分析...');
            const canvasDetails = await page.evaluate(() => {
                const canvases = Array.from(document.querySelectorAll('canvas'));
                return canvases.map((canvas, index) => ({
                    index,
                    width: canvas.width,
                    height: canvas.height,
                    clientWidth: canvas.clientWidth,
                    clientHeight: canvas.clientHeight,
                    style: canvas.style.cssText,
                    className: canvas.className,
                    id: canvas.id,
                    parent: canvas.parentElement ? canvas.parentElement.tagName : null
                }));
            });
            
            console.log('🎨 Canvas詳細:', JSON.stringify(canvasDetails, null, 2));
        }
        
        // Mana関連のテキストを詳しく検索
        console.log('🔍 Mana/統計情報の詳細検索...');
        const detailedSearch = await page.evaluate(() => {
            const allText = document.body.textContent.toLowerCase();
            const elements = Array.from(document.querySelectorAll('*'));
            
            // 様々なキーワードで検索
            const keywords = [
                'mana', 'マナ', '世界樹', '収集', '残り', 'tree', 'world',
                '統計', 'stats', 'statistics', '情報', 'info',
                'エネルギー', 'energy', '食糧', 'food', 'mina', 'ミナ'
            ];
            
            const foundElements = [];
            
            elements.forEach((el, index) => {
                if (el.textContent) {
                    const text = el.textContent.toLowerCase();
                    const matchedKeywords = keywords.filter(keyword => 
                        text.includes(keyword.toLowerCase())
                    );
                    
                    if (matchedKeywords.length > 0) {
                        const rect = el.getBoundingClientRect();
                        foundElements.push({
                            index,
                            text: el.textContent.trim().substring(0, 100),
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            matchedKeywords,
                            visible: rect.width > 0 && rect.height > 0,
                            position: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
                        });
                    }
                }
            });
            
            return {
                totalSearchResults: foundElements.length,
                elements: foundElements,
                pageContainsNumbers: /\d+/.test(allText),
                numbersFound: (allText.match(/\d+/g) || []).slice(0, 20)
            };
        });
        
        console.log('🎯 詳細検索結果:', JSON.stringify(detailedSearch, null, 2));
        
        // LifeSimが実際に動作しているかチェック
        console.log('⚡ LifeSimの動作状態確認...');
        const gameState = await page.evaluate(() => {
            // React DevToolsやゲーム状態を確認
            const reactElements = Array.from(document.querySelectorAll('[data-reactroot], [data-react-*]'));
            const gameElements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.className && (
                    el.className.includes('game') ||
                    el.className.includes('lifesim') ||
                    el.className.includes('canvas') ||
                    el.className.includes('mina')
                )
            );
            
            return {
                reactElementsCount: reactElements.length,
                gameElementsCount: gameElements.length,
                gameElements: gameElements.map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id,
                    text: el.textContent ? el.textContent.substring(0, 50) : ''
                }))
            };
        });
        
        console.log('🎮 ゲーム状態:', JSON.stringify(gameState, null, 2));
        
        // Canvas描画内容の分析（if Canvas exists）
        if (pageContent.hasCanvas) {
            console.log('🖼️ Canvas描画内容分析...');
            const canvasAnalysis = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return null;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) return null;
                
                try {
                    const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
                    const data = imageData.data;
                    
                    let hasContent = false;
                    let colorMap = {};
                    let lightBluePixels = 0;
                    let greenPixels = 0;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const a = data[i + 3];
                        
                        if (a > 0) {
                            hasContent = true;
                            const color = `${r},${g},${b}`;
                            colorMap[color] = (colorMap[color] || 0) + 1;
                            
                            // ライトブルー（Mana）検出: 青が強く、緑もある程度あり、赤は少ない
                            if (b > 150 && g > 100 && r < 150) {
                                lightBluePixels++;
                            }
                            
                            // 緑（世界樹）検出: 緑が強く、赤と青は少ない
                            if (g > 150 && r < 100 && b < 100) {
                                greenPixels++;
                            }
                        }
                    }
                    
                    const topColors = Object.entries(colorMap)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5);
                    
                    return {
                        hasContent,
                        totalPixels: data.length / 4,
                        uniqueColors: Object.keys(colorMap).length,
                        topColors,
                        lightBluePixels,
                        greenPixels,
                        canvasSize: { width: canvas.width, height: canvas.height }
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });
            
            console.log('🎨 Canvas分析結果:', JSON.stringify(canvasAnalysis, null, 2));
        }
        
        // 30秒間の動的観察
        console.log('⏱️ 30秒間の動的観察開始...');
        const observations = [];
        
        for (let i = 0; i < 30; i++) {
            await page.waitForTimeout(1000);
            
            const observation = await page.evaluate(() => {
                const allText = document.body.textContent;
                const numbers = (allText.match(/\d+/g) || []).slice(0, 10);
                
                // 特定のパターンを探す
                const patterns = {
                    manaPattern: allText.match(/(\d+)\s*(mana|マナ|収集|残り)/gi) || [],
                    treePattern: allText.match(/(\d+)\s*(world|tree|世界樹)/gi) || [],
                    energyPattern: allText.match(/(\d+)\s*(energy|エネルギー|活力)/gi) || [],
                    minaPattern: allText.match(/(\d+)\s*(mina|ミナ)/gi) || []
                };
                
                return {
                    timestamp: Date.now(),
                    numbers,
                    patterns,
                    textLength: allText.length
                };
            });
            
            observations.push({
                second: i + 1,
                data: observation
            });
            
            // 変化があったかログ出力
            if (i > 0) {
                const prev = observations[i - 1].data;
                const curr = observation;
                const numberChanged = JSON.stringify(prev.numbers) !== JSON.stringify(curr.numbers);
                const textChanged = prev.textLength !== curr.textLength;
                
                if (numberChanged || textChanged) {
                    console.log(`${i + 1}秒: 変化検出 - 数値:${numberChanged}, テキスト:${textChanged}`);
                }
            }
        }
        
        // 最終スクリーンショット
        console.log('📸 最終スクリーンショット...');
        await page.screenshot({ 
            path: 'lifesim-mana-final.png', 
            fullPage: true 
        });
        
        // 結果まとめ
        const summary = {
            access: pageContent.url.includes('localhost'),
            hasCanvas: pageContent.hasCanvas,
            foundGameElements: gameState.gameElementsCount > 0,
            foundManaElements: detailedSearch.totalSearchResults > 0,
            observationCompleted: observations.length === 30,
            dynamicChanges: observations.some((obs, index) => 
                index > 0 && 
                JSON.stringify(obs.data.numbers) !== JSON.stringify(observations[index-1].data.numbers)
            )
        };
        
        console.log('\n🎯 テスト結果サマリー:');
        console.log('==================');
        Object.entries(summary).forEach(([key, value]) => {
            console.log(`${key}: ${value ? '✅' : '❌'}`);
        });
        
        // 詳細結果保存
        const results = {
            timestamp: new Date().toISOString(),
            summary,
            pageContent,
            detailedSearch,
            gameState,
            observations: observations.slice(0, 5), // 最初の5秒分のみ保存
            lastObservation: observations[observations.length - 1]
        };
        
        fs.writeFileSync('lifesim-mana-detailed-results.json', JSON.stringify(results, null, 2));
        console.log('📄 詳細結果を lifesim-mana-detailed-results.json に保存');
        
        return summary;
        
    } catch (error) {
        console.error('❌ テスト実行エラー:', error);
        return { error: error.message };
    } finally {
        console.log('🔚 ブラウザを終了します...');
        await browser.close();
    }
}

testLifeSimManaSystem().then(result => {
    console.log('\n🏁 最終結果:', result);
});