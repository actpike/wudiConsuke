/**
 * 🎯 TestManager - あなたのイメージに基づく統括管理システム
 * 登録されたテストケースを順次実行し、結果を集約
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class TestManager {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testCases = [];
    this.results = [];
    this.config = {
      baseUrl: 'http://localhost:4173/',
      timeout: 10000,
      headless: true
    };
  }

  /**
   * テストケース登録
   */
  registerTestCase(testCase) {
    this.testCases.push({
      id: testCase.id,
      name: testCase.name,
      description: testCase.description,
      execute: testCase.execute,
      priority: testCase.priority || 'normal'
    });
  }

  /**
   * 標準テストケース群の一括登録
   */
  registerStandardTestCases() {
    // テストケース1: 基本接続確認
    this.registerTestCase({
      id: 'CONNECTION_TEST',
      name: '基本接続テスト',
      description: 'React preview serverへの基本接続確認',
      priority: 'high',
      execute: async (page) => {
        try {
          await page.goto(this.config.baseUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: this.config.timeout 
          });
          const title = await page.title();
          return {
            status: 'PASS',
            message: `接続成功: ${title}`,
            data: { title, url: page.url() }
          };
        } catch (error) {
          return {
            status: 'NG',
            message: `接続失敗: ${error.message}`,
            data: { error: error.message }
          };
        }
      }
    });

    // テストケース2: 軽量LifeSimボタン存在確認
    this.registerTestCase({
      id: 'LIFESIM_BUTTON_TEST',
      name: '軽量LifeSimボタン確認',
      description: 'メイン画面に軽量LifeSimボタンが存在するか',
      priority: 'high',
      execute: async (page) => {
        try {
          const button = await page.$('button:has-text("軽量LifeSim")');
          if (button) {
            const isVisible = await button.isVisible();
            const text = await button.textContent();
            return {
              status: 'PASS',
              message: `ボタン発見: "${text}"`,
              data: { visible: isVisible, text }
            };
          } else {
            return {
              status: 'NG',
              message: '軽量LifeSimボタンが見つかりません',
              data: { found: false }
            };
          }
        } catch (error) {
          return {
            status: 'NG',
            message: `ボタン確認エラー: ${error.message}`,
            data: { error: error.message }
          };
        }
      }
    });

    // テストケース3: 軽量LifeSim画面遷移
    this.registerTestCase({
      id: 'LIFESIM_TRANSITION_TEST',
      name: '軽量LifeSim画面遷移',
      description: 'ボタンクリックで軽量LifeSim画面に遷移するか',
      priority: 'high',
      execute: async (page) => {
        try {
          const button = await page.$('button:has-text("軽量LifeSim")');
          if (!button) {
            return {
              status: 'NG',
              message: 'ボタンが見つからないため遷移テスト不可',
              data: { prereq_failed: true }
            };
          }

          await button.click();
          await page.waitForTimeout(2000);

          // LifeSim画面の特徴的要素を確認
          const canvas = await page.$('#gameCanvas, canvas');
          const gameStats = await page.$('#gameStats, [class*="stats"]');
          
          if (canvas || gameStats) {
            return {
              status: 'PASS',
              message: 'LifeSim画面への遷移成功',
              data: { 
                canvas_found: !!canvas, 
                stats_found: !!gameStats,
                current_url: page.url()
              }
            };
          } else {
            return {
              status: 'NG',
              message: 'LifeSim画面要素が見つかりません',
              data: { canvas_found: false, stats_found: false }
            };
          }
        } catch (error) {
          return {
            status: 'NG',
            message: `遷移テストエラー: ${error.message}`,
            data: { error: error.message }
          };
        }
      }
    });

    // テストケース4: ゲーム要素存在確認
    this.registerTestCase({
      id: 'GAME_ELEMENTS_TEST',
      name: 'ゲーム要素確認',
      description: 'ゲーム制御ボタンと統計パネルの存在確認',
      priority: 'normal',
      execute: async (page) => {
        try {
          // 軽量LifeSim画面に遷移済みの前提
          const startBtn = await page.$('#startBtn, button:has-text("開始")');
          const resetBtn = await page.$('#resetBtn, button:has-text("リセット")');
          const turnCount = await page.$('#turnCount, [class*="turn"]');
          const minaCount = await page.$('#minaCount, [class*="mina"]');

          const elements = {
            start_button: !!startBtn,
            reset_button: !!resetBtn,
            turn_counter: !!turnCount,
            mina_counter: !!minaCount
          };

          const foundCount = Object.values(elements).filter(Boolean).length;
          const totalCount = Object.keys(elements).length;

          if (foundCount >= totalCount * 0.75) { // 75%以上の要素が見つかればPASS
            return {
              status: 'PASS',
              message: `ゲーム要素確認: ${foundCount}/${totalCount}個発見`,
              data: elements
            };
          } else {
            return {
              status: 'NG',
              message: `ゲーム要素不足: ${foundCount}/${totalCount}個のみ発見`,
              data: elements
            };
          }
        } catch (error) {
          return {
            status: 'NG',
            message: `要素確認エラー: ${error.message}`,
            data: { error: error.message }
          };
        }
      }
    });

    // テストケース5: コンソールエラー監視
    this.registerTestCase({
      id: 'CONSOLE_ERROR_TEST',
      name: 'コンソールエラー監視',
      description: '致命的なJavaScriptエラーの有無確認',
      priority: 'high',
      execute: async (page) => {
        const errors = [];
        
        // エラー監視リスナー設定
        page.on('console', msg => {
          if (msg.type() === 'error' && (
            msg.text().includes('Runtime Error') ||
            msg.text().includes('Uncaught') ||
            msg.text().includes('TypeError')
          )) {
            errors.push(msg.text());
          }
        });

        // 5秒間監視
        await page.waitForTimeout(5000);

        if (errors.length === 0) {
          return {
            status: 'PASS',
            message: '致命的エラーは検出されませんでした',
            data: { error_count: 0 }
          };
        } else {
          return {
            status: 'NG',
            message: `${errors.length}個の致命的エラーを検出`,
            data: { error_count: errors.length, errors: errors.slice(0, 3) } // 最初の3個のみ
          };
        }
      }
    });
  }

  /**
   * テスト実行エンジン
   */
  async executeAllTests() {
    console.log('🎯 TestManager開始 - 登録テスト数:', this.testCases.length);
    
    // ブラウザ初期化
    this.browser = await chromium.launch({ 
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();

    // 優先度順にソート
    const sortedTests = this.testCases.sort((a, b) => {
      const priority = { high: 3, normal: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });

    // 各テストケースを順次実行
    for (const testCase of sortedTests) {
      console.log(`🔍 実行中: ${testCase.name} (${testCase.id})`);
      
      const startTime = Date.now();
      try {
        const result = await testCase.execute(this.page);
        const executionTime = Date.now() - startTime;
        
        this.results.push({
          id: testCase.id,
          name: testCase.name,
          description: testCase.description,
          status: result.status,
          message: result.message,
          data: result.data,
          executionTime,
          timestamp: new Date().toISOString()
        });

        const statusIcon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${statusIcon} ${testCase.name}: ${result.message} (${executionTime}ms)`);
        
      } catch (error) {
        const executionTime = Date.now() - startTime;
        this.results.push({
          id: testCase.id,
          name: testCase.name,
          description: testCase.description,
          status: 'ERROR',
          message: `実行エラー: ${error.message}`,
          data: { error: error.message },
          executionTime,
          timestamp: new Date().toISOString()
        });
        
        console.log(`💥 ${testCase.name}: 実行エラー - ${error.message}`);
      }
    }

    await this.cleanup();
    return this.generateFinalReport();
  }

  /**
   * 最終レポート生成
   */
  generateFinalReport() {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'NG').length,
      errors: this.results.filter(r => r.status === 'ERROR').length,
      totalExecutionTime: this.results.reduce((sum, r) => sum + r.executionTime, 0)
    };

    const report = {
      summary,
      success_rate: ((summary.passed / summary.total) * 100).toFixed(1) + '%',
      overall_status: summary.failed === 0 && summary.errors === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
      timestamp: new Date().toISOString(),
      results: this.results
    };

    // レポートをファイルに保存
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * リソースクリーンアップ
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 TestManager終了 - リソースクリーンアップ完了');
    }
  }
}

// CLI実行時
if (require.main === module) {
  (async () => {
    const manager = new TestManager();
    
    // 標準テストケース登録
    manager.registerStandardTestCases();
    
    try {
      // 全テスト実行
      const report = await manager.executeAllTests();
      
      // 結果出力
      console.log('\n📊 =====最終テスト結果===== ');
      console.log(`🎯 総合ステータス: ${report.overall_status}`);
      console.log(`📈 成功率: ${report.success_rate} (${report.summary.passed}/${report.summary.total})`);
      console.log(`⏱️ 総実行時間: ${report.summary.totalExecutionTime}ms`);
      
      if (report.summary.failed > 0 || report.summary.errors > 0) {
        console.log('\n❌ 問題のあるテスト:');
        report.results
          .filter(r => r.status !== 'PASS')
          .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
      }
      
      console.log(`\n📄 詳細レポート保存済み`);
      
      // 出力用JSON（ClaudeCodeで解析しやすい形式）
      process.stdout.write('\n--- REPORT_JSON_START ---\n');
      process.stdout.write(JSON.stringify(report, null, 2));
      process.stdout.write('\n--- REPORT_JSON_END ---\n');
      
    } catch (error) {
      console.error('💥 TestManager実行エラー:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = TestManager;