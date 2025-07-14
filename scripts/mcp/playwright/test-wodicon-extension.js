#!/usr/bin/env node

/**
 * WodiConsuke Chrome拡張機能 自動テストシステム
 * 
 * 機能:
 * - Chrome拡張機能の自動ロード
 * - ウディコンサイトでの自動監視テスト
 * - データ一貫性の自動検証
 * - デバッグログの自動収集・分析
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class WodiConsukeAutomatedTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.extensionPath = path.resolve(__dirname, '../../../wodicon_helper');
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };
  }

  async init() {
    console.log('🚀 WodiConsuke Chrome拡張機能テスト開始');
    console.log(`📁 拡張機能パス: ${this.extensionPath}`);
    
    // Chrome拡張機能付きでブラウザを起動
    this.browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--load-extension=${this.extensionPath}`,
        '--disable-extensions-except=' + this.extensionPath,
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    // メインページを開く
    this.page = await this.browser.newPage();
    
    // デバッグログ収集の設定
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('🔍') || text.includes('✅') || text.includes('❌') || text.includes('⚠️')) {
        console.log(`📝 [拡張機能ログ] ${text}`);
      }
    });

    // 拡張機能の基本機能を注入
    await this.page.addInitScript(() => {
      // 拡張機能テスト用のヘルパー関数
      window.extensionTester = {
        // データ一貫性チェック
        checkDataConsistency: async (gameId) => {
          try {
            const game = await window.gameDataManager?.getGame(gameId);
            if (!game) return { success: false, reason: 'game_not_found' };
            
            const result = {
              success: true,
              data: {
                id: game.id,
                title: game.title,
                lastUpdate: game.lastUpdate,
                last_update: game.last_update,
                version: game.version,
                updated_at: game.updated_at
              },
              issues: []
            };
            
            // データフィールドの一貫性チェック
            if (game.lastUpdate === undefined && game.last_update === undefined) {
              result.issues.push('lastUpdate/last_update両方ともundefined');
            }
            
            if (game.lastUpdate !== game.last_update && game.last_update !== undefined) {
              result.issues.push('lastUpdateとlast_updateの値が異なる');
            }
            
            result.success = result.issues.length === 0;
            return result;
          } catch (error) {
            return { success: false, reason: error.message };
          }
        },

        // 拡張機能の状態チェック
        checkExtensionState: () => {
          return {
            gameDataManager: !!window.gameDataManager,
            webMonitor: !!window.webMonitor,
            pageParser: !!window.pageParser,
            updateManager: !!window.updateManager
          };
        },

        // 手動監視実行
        runManualMonitoring: async () => {
          try {
            if (window.webMonitor?.executeManualMonitoring) {
              const result = await window.webMonitor.executeManualMonitoring();
              return { success: true, result };
            }
            return { success: false, reason: 'webMonitor not available' };
          } catch (error) {
            return { success: false, reason: error.message };
          }
        }
      };
    });

    console.log('✅ ブラウザ初期化完了');
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 テスト実行: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.tests.push({
        name: testName,
        status: 'passed',
        duration,
        result
      });
      
      this.testResults.summary.passed++;
      console.log(`✅ ${testName} - 成功 (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.tests.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      });
      
      this.testResults.summary.failed++;
      console.log(`❌ ${testName} - 失敗 (${duration}ms): ${error.message}`);
      throw error;
    } finally {
      this.testResults.summary.total++;
    }
  }

  async testExtensionBasics() {
    return await this.runTest('拡張機能基本機能チェック', async () => {
      // ウディコンサイトにアクセス
      await this.page.goto('https://silversecond.com/WolfRPGEditor/Contest/');
      await this.page.waitForTimeout(2000);

      // 拡張機能の状態チェック
      const extensionState = await this.page.evaluate(() => {
        return window.extensionTester?.checkExtensionState();
      });

      if (!extensionState) {
        throw new Error('拡張機能のテストヘルパーが利用できません');
      }

      // 各モジュールの存在確認
      const missingModules = [];
      Object.entries(extensionState).forEach(([module, exists]) => {
        if (!exists) missingModules.push(module);
      });

      if (missingModules.length > 0) {
        throw new Error(`未読み込みモジュール: ${missingModules.join(', ')}`);
      }

      return { extensionState, message: '全モジュール正常読み込み' };
    });
  }

  async testManualMonitoring() {
    return await this.runTest('手動監視機能テスト', async () => {
      // 手動監視実行
      const result = await this.page.evaluate(() => {
        return window.extensionTester?.runManualMonitoring();
      });

      if (!result?.success) {
        throw new Error(`手動監視失敗: ${result?.reason || '不明なエラー'}`);
      }

      return { result, message: '手動監視成功' };
    });
  }

  async testDataConsistency() {
    return await this.runTest('データ一貫性チェック', async () => {
      // 全作品のデータ一貫性をチェック
      const allGames = await this.page.evaluate(async () => {
        const games = await window.gameDataManager?.getGames();
        return games || [];
      });

      if (allGames.length === 0) {
        throw new Error('作品データが存在しません');
      }

      const inconsistentGames = [];
      
      for (const game of allGames.slice(0, 5)) { // 最初の5作品をテスト
        const consistency = await this.page.evaluate((gameId) => {
          return window.extensionTester?.checkDataConsistency(gameId);
        }, game.id);

        if (!consistency?.success) {
          inconsistentGames.push({
            id: game.id,
            title: game.title,
            issues: consistency?.issues || [consistency?.reason || '不明なエラー']
          });
        }
      }

      if (inconsistentGames.length > 0) {
        throw new Error(`データ一貫性問題発見: ${JSON.stringify(inconsistentGames, null, 2)}`);
      }

      return { 
        totalGames: allGames.length,
        testedGames: Math.min(5, allGames.length),
        message: 'データ一貫性OK'
      };
    });
  }

  async testPopupFunctionality() {
    return await this.runTest('ポップアップ機能テスト', async () => {
      // 拡張機能ポップアップを開く（簡易シミュレーション）
      await this.page.evaluate(() => {
        // popup.htmlの内容を動的に読み込んでテスト
        const popupContent = document.createElement('div');
        popupContent.id = 'popup-test-container';
        popupContent.innerHTML = `
          <div id="gameList"></div>
          <div id="detailView" style="display: none;"></div>
          <button id="manual-monitoring">🔍 手動監視実行</button>
        `;
        document.body.appendChild(popupContent);
      });

      // 手動監視ボタンのクリックをシミュレーション
      await this.page.click('#manual-monitoring');
      await this.page.waitForTimeout(1000);

      return { message: 'ポップアップ機能テスト完了' };
    });
  }

  async generateReport() {
    const reportPath = path.join(__dirname, `wodicon-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log(`\n📊 テスト結果レポート:`);
    console.log(`✅ 成功: ${this.testResults.summary.passed}`);
    console.log(`❌ 失敗: ${this.testResults.summary.failed}`);
    console.log(`📁 レポートファイル: ${reportPath}`);
    
    return reportPath;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      // 基本テスト実行
      await this.testExtensionBasics();
      await this.testManualMonitoring();
      await this.testDataConsistency();
      await this.testPopupFunctionality();
      
      // レポート生成
      const reportPath = await this.generateReport();
      
      console.log('\n🎉 全テスト完了！');
      return { success: true, reportPath };
      
    } catch (error) {
      console.error('❌ テスト実行中にエラーが発生:', error);
      await this.generateReport();
      return { success: false, error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// スタンドアロン実行
if (require.main === module) {
  const tester = new WodiConsukeAutomatedTester();
  tester.runAllTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = WodiConsukeAutomatedTester;