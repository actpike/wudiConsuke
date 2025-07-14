/**
 * 🤖 Gemini-authored: Mina Movement Performance Test
 *
 * 目的:
 * - 多数のMinaが高密度環境で移動する際のパフォーマンスを計測・分析する。
 * - 特にMinaBehaviorSystemの経路探索と衝突回避ロジックに負荷をかける。
 *
 * シナリオ:
 * 1. 50体のMinaを生成する。
 * 2. 障害物を多数配置し、複雑な移動経路を強制する。
 * 3. 60秒間、ゲームを実行し続ける。
 * 4. 1秒ごとにFPSとメモリ使用量を記録する。
 * 5. 終了後、収集したデータを集計・分析してコンソールに出力する。
 */

import { test, expect } from '@playwright/test';

test.describe('Mina Movement Performance Analysis (60s)', () => {
  test('should maintain performance under high load', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // ゲームが完全に初期化されるのを待つ
    await page.waitForFunction(() => window.gameState && window.gameState.debug);

    console.log('🧪 テスト環境のセットアップを開始します...');

    // 1. 高負荷環境を構築
    await page.evaluate(() => {
      window.gameState.debug.addMinas(50); // Minaを50体追加
      window.gameState.debug.createObstacleMaze(0.2); // 20%の密度で障害物を配置
      console.log('✅ 50体のMinaと障害物メイズを生成しました。');
    });

    // 2. ゲーム開始
    await page.getByRole('button', { name: 'ゲーム開始' }).click();
    console.log('🚀 ゲームを開始しました。60秒間のパフォーマンス計測を開始します...');

    const performanceData = {
      fps: [],
      memory: [],
    };

    // 3. 60秒間、1秒ごとにデータを収集
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1000);
      const metrics = await page.evaluate(() => {
        const fps = window.performanceMonitor?.getFPS() || 0;
        const memory = window.performance.memory.usedJSHeapSize / (1024 * 1024); // MB単位
        return { fps, memory };
      });

      performanceData.fps.push(metrics.fps);
      performanceData.memory.push(metrics.memory);

      if ((i + 1) % 10 === 0) {
        console.log(`[${i + 1}秒経過] FPS: ${metrics.fps.toFixed(1)}, Memory: ${metrics.memory.toFixed(2)} MB`);
      }
    }

    // 4. テスト終了と結果分析
    console.log('\n📊 パフォーマンス計測完了。結果を分析します...');

    const analyze = (data) => {
      const sum = data.reduce((a, b) => a + b, 0);
      const avg = sum / data.length;
      const min = Math.min(...data);
      const max = Math.max(...data);
      return { avg, min, max };
    };

    const fpsStats = analyze(performanceData.fps);
    const memoryStats = analyze(performanceData.memory);

    const initialMemory = performanceData.memory[0];
    const finalMemory = performanceData.memory[performanceData.memory.length - 1];
    const memoryLeak = finalMemory - initialMemory;

    console.log('\n--- 📈 パフォーマンス分析レポート ---');
    console.log(`[FPS]`);
    console.log(`  - 平均: ${fpsStats.avg.toFixed(2)} FPS`);
    console.log(`  - 最低: ${fpsStats.min.toFixed(2)} FPS`);
    console.log(`  - 最高: ${fpsStats.max.toFixed(2)} FPS`);
    console.log(`[メモリ使用量 (MB)]`);
    console.log(`  - 平均: ${memoryStats.avg.toFixed(2)} MB`);
    console.log(`  - 最小: ${memoryStats.min.toFixed(2)} MB`);
    console.log(`  - 最大: ${memoryStats.max.toFixed(2)} MB`);
    console.log(`  - メモリ増加量: ${memoryLeak.toFixed(2)} MB ${memoryLeak > 5 ? '(⚠️ リークの可能性あり)' : ''}`);
    console.log('------------------------------------');

    // パフォーマンスの期待値をアサーションでチェック
    expect(fpsStats.avg).toBeGreaterThan(45, '平均FPSが45を下回りました。');
    expect(memoryLeak).toBeLessThan(10, '60秒間でメモリ使用量が10MB以上増加しました。');

    // スクリーンショットを保存
    const screenshotPath = `its_life_world/mcp/playwright/gemini/performance-result-${new Date().toISOString()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 最終状態のスクリーンショットを保存しました: ${screenshotPath}`);
  });
});

