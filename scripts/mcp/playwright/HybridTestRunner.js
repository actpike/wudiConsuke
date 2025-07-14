/**
 * 🔗 HybridTestRunner - GitHook自動実行対応
 * あなたの設計思想（TestManager）+ 私の軽量化手法の融合
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class HybridTestRunner {
  constructor(mode = 'auto') {
    this.browser = null;
    this.page = null;
    this.testSuites = new Map();
    this.results = [];
    this.mode = mode; // 'quick', 'standard', 'full', 'auto'
    this.config = {
      baseUrl: 'http://localhost:4173/',
      timeout: 5000,
      headless: true
    };
  }

  /**
   * テストスイート登録
   */
  registerTestSuite(level, testSuite) {
    this.testSuites.set(level, testSuite);
  }

  /**
   * GitHook用標準テストスイート群を登録
   */
  registerGitHookTestSuites() {
    // QUICK: 基本接続確認（GitHook頻繁実行用）
    this.registerTestSuite('quick', [
      {
        id: 'CONNECTION',
        name: '基本接続',
        timeout: 3000,
        execute: async (page) => {
          await page.goto(this.config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 3000 });
          const title = await page.title();
          return { success: !!title, data: { title } };
        }
      },
      {
        id: 'LIFESIM_BUTTON',
        name: 'LifeSimボタン存在',
        timeout: 2000,
        execute: async (page) => {
          const button = await page.$('button:has-text("軽量LifeSim")');
          return { success: !!button, data: { found: !!button } };
        }
      }
    ]);

    // STANDARD: 機能確認（プッシュ時実行用）
    this.registerTestSuite('standard', [
      ...this.testSuites.get('quick'), // QUICKテストを含む
      {
        id: 'SCREEN_TRANSITION',
        name: '画面遷移',
        timeout: 5000,
        execute: async (page) => {
          const button = await page.$('button:has-text("軽量LifeSim")');
          if (!button) return { success: false, data: { reason: 'button_not_found' } };
          
          await button.click();
          await page.waitForTimeout(2000);
          
          const canvas = await page.$('#gameCanvas, canvas');
          return { success: !!canvas, data: { canvas_found: !!canvas } };
        }
      },
      {
        id: 'GAME_CONTROLS',
        name: 'ゲーム制御要素',
        timeout: 3000,
        execute: async (page) => {
          const elements = await Promise.all([
            page.$('#startBtn'),
            page.$('#resetBtn'),
            page.$('#gameStats')
          ]);
          const foundCount = elements.filter(Boolean).length;
          return { success: foundCount >= 2, data: { found_elements: foundCount } };
        }
      }
    ]);

    // FULL: 完全テスト（リリース前実行用）
    this.registerTestSuite('full', [
      ...this.testSuites.get('standard'), // STANDARDテストを含む
      {
        id: 'GAME_FUNCTIONALITY',
        name: 'ゲーム機能',
        timeout: 10000,
        execute: async (page) => {
          const startBtn = await page.$('#startBtn');
          if (!startBtn) return { success: false, data: { reason: 'start_button_not_found' } };
          
          await startBtn.click();
          await page.waitForTimeout(3000);
          
          const turnCount = await page.textContent('#turnCount').catch(() => '0');
          const gameRunning = parseInt(turnCount) > 0;
          
          return { success: gameRunning, data: { turn_count: turnCount, running: gameRunning } };
        }
      },
      {
        id: 'ERROR_MONITORING',
        name: 'エラー監視',
        timeout: 8000,
        execute: async (page) => {
          const errors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
          });
          
          await page.waitForTimeout(5000);
          return { success: errors.length === 0, data: { error_count: errors.length, errors: errors.slice(0, 3) } };
        }
      }
    ]);
  }

  /**
   * 自動モード選択（GitHookコンテキスト判定）
   */
  determineTestMode() {
    // 環境変数やGitコンテキストに基づいて判定
    const gitRef = process.env.GITHUB_REF || '';
    const gitEvent = process.env.GITHUB_EVENT_NAME || '';
    
    // GitHub Actions環境での判定
    if (gitRef.includes('refs/heads/main') || gitRef.includes('refs/heads/master')) {
      return 'full'; // メインブランチは完全テスト
    }
    if (gitEvent === 'pull_request') {
      return 'standard'; // PRは標準テスト
    }
    if (gitEvent === 'push') {
      return 'quick'; // 通常プッシュは軽量テスト
    }
    
    // ローカル環境での判定（ファイル変更情報など）
    const changedFiles = this.getChangedFiles();
    if (changedFiles.some(f => f.includes('lifesim') || f.includes('components'))) {
      return 'standard'; // LifeSim関連変更は標準テスト
    }
    
    return 'quick'; // デフォルトは軽量
  }

  /**
   * Git変更ファイル取得（簡易版）
   */
  getChangedFiles() {
    try {
      const { execSync } = require('child_process');
      const result = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
      return result.split('\n').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  /**
   * テスト実行エンジン
   */
  async executeTests() {
    const testMode = this.mode === 'auto' ? this.determineTestMode() : this.mode;
    const testSuite = this.testSuites.get(testMode);
    
    if (!testSuite) {
      throw new Error(`Test suite not found for mode: ${testMode}`);
    }

    console.log(`🔗 HybridTestRunner開始 - モード: ${testMode.toUpperCase()}`);
    console.log(`📋 実行テスト数: ${testSuite.length}`);

    // ブラウザ初期化
    this.browser = await chromium.launch({ 
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();

    const startTime = Date.now();
    let successCount = 0;

    // テスト実行
    for (const test of testSuite) {
      const testStart = Date.now();
      console.log(`🔍 ${test.name}...`);
      
      try {
        const result = await Promise.race([
          test.execute(this.page),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), test.timeout || this.config.timeout)
          )
        ]);

        const executionTime = Date.now() - testStart;
        const status = result.success ? 'PASS' : 'FAIL';
        
        this.results.push({
          id: test.id,
          name: test.name,
          status,
          data: result.data,
          executionTime,
          timestamp: new Date().toISOString()
        });

        if (result.success) {
          successCount++;
          console.log(`✅ ${test.name} (${executionTime}ms)`);
        } else {
          console.log(`❌ ${test.name}: ${JSON.stringify(result.data)} (${executionTime}ms)`);
        }

      } catch (error) {
        const executionTime = Date.now() - testStart;
        this.results.push({
          id: test.id,
          name: test.name,
          status: 'ERROR',
          data: { error: error.message },
          executionTime,
          timestamp: new Date().toISOString()
        });
        
        console.log(`💥 ${test.name}: ${error.message} (${executionTime}ms)`);
      }
    }

    await this.cleanup();

    // 結果集約
    const totalTime = Date.now() - startTime;
    const summary = {
      mode: testMode,
      total: testSuite.length,
      passed: successCount,
      failed: testSuite.length - successCount,
      success_rate: ((successCount / testSuite.length) * 100).toFixed(1) + '%',
      total_time: totalTime,
      overall_status: successCount === testSuite.length ? 'SUCCESS' : 'FAILURE',
      timestamp: new Date().toISOString()
    };

    return { summary, results: this.results };
  }

  /**
   * GitHook用結果出力
   */
  outputGitHookResult(report) {
    console.log('\n🎯 ===== GitHook Test Results =====');
    console.log(`Mode: ${report.summary.mode.toUpperCase()}`);
    console.log(`Status: ${report.summary.overall_status}`);
    console.log(`Success Rate: ${report.summary.success_rate} (${report.summary.passed}/${report.summary.total})`);
    console.log(`Total Time: ${report.summary.total_time}ms`);

    if (report.summary.overall_status === 'FAILURE') {
      console.log('\n❌ Failed Tests:');
      report.results
        .filter(r => r.status !== 'PASS')
        .forEach(r => console.log(`  - ${r.name}: ${JSON.stringify(r.data)}`));
    }

    // GitHook用終了コード
    process.exit(report.summary.overall_status === 'SUCCESS' ? 0 : 1);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI実行
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args[0] || 'auto';
  
  if (args.includes('--help')) {
    console.log(`
🔗 HybridTestRunner - GitHook自動実行対応

使用方法:
  node HybridTestRunner.js [mode]

モード:
  auto     - Git context に基づいて自動選択 (default)
  quick    - 基本接続確認のみ (2-3秒)
  standard - 機能確認含む (10-15秒)  
  full     - 完全テスト (20-30秒)

GitHook設定例:
  pre-push: node HybridTestRunner.js quick
  post-commit: node HybridTestRunner.js auto
  pre-release: node HybridTestRunner.js full

環境変数:
  GITHUB_REF, GITHUB_EVENT_NAME で自動モード判定
    `);
    process.exit(0);
  }

  (async () => {
    const runner = new HybridTestRunner(mode);
    runner.registerGitHookTestSuites();
    
    try {
      const report = await runner.executeTests();
      runner.outputGitHookResult(report);
    } catch (error) {
      console.error('💥 HybridTestRunner Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = HybridTestRunner;