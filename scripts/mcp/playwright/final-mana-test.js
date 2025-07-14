const { chromium } = require('playwright');

async function finalManaTest() {
    console.log('🎯 Manaシステム最終確認テスト');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('http://localhost:5174');
        await page.waitForTimeout(2000);
        
        // LifeSimに移動
        await page.getByText('軽量LifeSim').first().click();
        await page.waitForTimeout(5000);
        
        // ゲームを開始
        const startButton = await page.locator('text=開始').first();
        if (await startButton.isVisible()) {
            await startButton.click();
            console.log('✅ ゲーム開始ボタンをクリック');
            await page.waitForTimeout(10000); // 10秒間動作観察
        }
        
        // Canvas分析
        const canvasAnalysis = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { error: 'Canvas not found' };
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return { error: 'Context not available' };
            
            // 小さな領域をサンプリング
            const sampleSize = 50;
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
            const data = imageData.data;
            
            let lightBluePixels = 0;
            let greenPixels = 0;
            let totalColorPixels = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                if (a > 128) { // 不透明な画素
                    totalColorPixels++;
                    
                    // ライトブルー（Mana）: 青が強く、緑もある程度
                    if (b > 150 && g > 100 && r < 150) {
                        lightBluePixels++;
                    }
                    
                    // 緑（世界樹エリア）: 緑が強い
                    if (g > 150 && r < 100 && b < 100) {
                        greenPixels++;
                    }
                }
            }
            
            return {
                canvasSize: { width: canvas.width, height: canvas.height },
                totalColorPixels,
                lightBluePixels,
                greenPixels,
                hasContent: totalColorPixels > 0
            };
        });
        
        // 統計情報の確認
        const manaStats = await page.evaluate(() => {
            const statElements = document.querySelectorAll('.stat-item');
            const stats = {};
            
            statElements.forEach(el => {
                const label = el.querySelector('.stat-label');
                const value = el.querySelector('.stat-value');
                if (label && value) {
                    stats[label.textContent] = value.textContent;
                } else {
                    // 直接テキストから抽出
                    const text = el.textContent;
                    if (text.includes('世界樹')) {
                        stats['世界樹'] = text.match(/\d+/)?.[0] || '?';
                    } else if (text.includes('収集Mana')) {
                        stats['収集Mana'] = text.match(/\d+/)?.[0] || '?';
                    } else if (text.includes('残りMana')) {
                        stats['残りMana'] = text.match(/\d+/)?.[0] || '?';
                    }
                }
            });
            
            return stats;
        });
        
        // 最終スクリーンショット
        await page.screenshot({ path: 'mana-final-test.png', fullPage: true });
        
        console.log('\n🎯 最終テスト結果:');
        console.log('=================');
        console.log('Canvas分析:', canvasAnalysis);
        console.log('Mana統計:', manaStats);
        
        const success = {
            canvasWorking: canvasAnalysis.hasContent,
            lightBlueDetected: canvasAnalysis.lightBluePixels > 0,
            greenDetected: canvasAnalysis.greenPixels > 0,
            statsFound: Object.keys(manaStats).length > 0
        };
        
        console.log('\n✅ 成功項目:');
        Object.entries(success).forEach(([key, value]) => {
            console.log(`${key}: ${value ? '✅' : '❌'}`);
        });
        
        return { canvasAnalysis, manaStats, success };
        
    } catch (error) {
        console.error('❌ エラー:', error.message);
        return { error: error.message };
    } finally {
        await browser.close();
    }
}

finalManaTest().then(result => {
    console.log('\n🏁 最終結果:', JSON.stringify(result, null, 2));
});