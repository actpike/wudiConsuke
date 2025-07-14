#!/usr/bin/env node

/**
 * WodiConsuke データ一貫性問題 特化テストシステム
 * 
 * 問題:
 * - Web取得: "[7/13]Ver1.2に更新 → ご意見/バグ報告BBS" ✅
 * - DataManager保存: "[7/13]Ver1.2に更新 → ご意見/バグ報告BBS" ✅  
 * - 詳細画面表示: lastUpdate: undefined ❌
 * 
 * 目的:
 * - 上記の問題を自動的に再現・特定
 * - データフィールド名の不整合を検出
 * - 修正前後の比較テスト
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class DataConsistencyTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.extensionPath = path.resolve(__dirname, '../../../wodicon_helper');
    this.testLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.testLog.push(logEntry);
    console.log(logEntry);
  }

  async init() {
    this.log('🚀 データ一貫性テスト開始');
    
    this.browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--load-extension=${this.extensionPath}`,
        '--disable-extensions-except=' + this.extensionPath,
        '--disable-web-security'
      ]
    });

    this.page = await this.browser.newPage();
    
    // デバッグログ収集
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('🔍') || text.includes('✅') || text.includes('❌')) {
        this.log(`[拡張機能] ${text}`);
      }
    });

    // テスト専用ヘルパー関数を注入
    await this.page.addInitScript(() => {
      window.dataConsistencyTester = {
        // データ削除（全データ削除をシミュレート）
        clearAllData: async () => {
          try {
            // chrome.storage.local.clear()の代わりにgameDataManagerを使用
            if (window.gameDataManager) {
              const storageKey = 'wodicon_games';
              await window.gameDataManager.constructor.prototype.clearAllData?.call(window.gameDataManager) || 
                    (async () => {
                      // 手動でクリア
                      await chrome.storage.local.remove(storageKey);
                      await chrome.storage.local.remove('wodicon_metadata');
                    })();
              return { success: true, message: 'All data cleared via gameDataManager' };
            }
            return { success: false, reason: 'gameDataManager not available' };
          } catch (error) {
            return { success: false, reason: error.message };
          }
        },

        // バックグラウンド更新実行
        runBackgroundUpdate: async () => {
          try {
            if (window.webMonitor?.executeManualMonitoring) {
              const result = await window.webMonitor.executeManualMonitoring();
              return { success: true, result };
            }
            return { success: false, reason: 'webMonitor not available' };
          } catch (error) {
            return { success: false, reason: error.message };
          }
        },

        // 詳細なデータ取得
        getDetailedGameData: async (gameId) => {
          try {
            const game = await window.gameDataManager?.getGame(gameId);
            if (!game) return { success: false, reason: 'Game not found' };
            
            return {
              success: true,
              data: {
                id: game.id,
                title: game.title,
                no: game.no,
                
                // 重要: 異なるフィールド名をすべて確認
                lastUpdate: game.lastUpdate,
                last_update: game.last_update,
                version: game.version,
                updated_at: game.updated_at,
                
                // その他のフィールド
                created_at: game.created_at,
                source: game.source,
                addedAt: game.addedAt
              },
              rawData: game // 生データも含める
            };
          } catch (error) {
            return { success: false, reason: error.message };
          }
        },

        // storage.localの直接確認
        checkStorage: async () => {
          try {
            const result = await chrome.storage.local.get(null);
            return { success: true, data: result };
          } catch (error) {
            return { success: false, reason: error.message };
          }
        },

        // 詳細画面表示のシミュレート
        simulateDetailView: async (gameId) => {
          try {
            // navigation.js の loadGameData をシミュレート
            const game = await window.gameDataManager?.getGame(gameId);
            if (!game) return { success: false, reason: 'Game not found' };
            
            // 詳細画面での表示処理をシミュレート
            const displayData = {
              title: game.title,
              author: game.author,
              genre: game.genre,
              // navigation.js:256 でのlastUpdate表示をシミュレート
              lastUpdate: game.lastUpdate,
              formattedDate: game.lastUpdate ? 
                (game.lastUpdate.includes('/') ? 
                  game.lastUpdate : 
                  `更新日: ${new Date().toLocaleDateString('ja-JP')}`
                ) : 
                `更新日: ${new Date().toLocaleDateString('ja-JP')}`
            };
            
            return { success: true, displayData, rawGame: game };
          } catch (error) {
            return { success: false, reason: error.message };
          }
        }
      };
    });

    await this.page.goto('https://silversecond.com/WolfRPGEditor/Contest/');
    await this.page.waitForTimeout(3000);
    
    this.log('✅ 初期化完了');
  }

  async reproduceDataInconsistency() {
    this.log('\n🔄 データ一貫性問題の再現開始');
    
    // Step 1: 全データ削除
    this.log('1️⃣ 全データ削除実行');
    const clearResult = await this.page.evaluate(() => {
      return window.dataConsistencyTester?.clearAllData();
    });
    
    if (!clearResult?.success) {
      throw new Error(`データ削除失敗: ${clearResult?.reason}`);
    }
    
    this.log('✅ 全データ削除完了');
    
    // Step 2: バックグラウンド更新実行
    this.log('2️⃣ バックグラウンド更新実行');
    const updateResult = await this.page.evaluate(() => {
      return window.dataConsistencyTester?.runBackgroundUpdate();
    });
    
    if (!updateResult?.success) {
      throw new Error(`バックグラウンド更新失敗: ${updateResult?.reason}`);
    }
    
    this.log('✅ バックグラウンド更新完了');
    await this.page.waitForTimeout(5000); // 更新処理完了待機
    
    // Step 3: 保存されたデータを確認
    this.log('3️⃣ 保存データの確認');
    const allGames = await this.page.evaluate(async () => {
      const games = await window.gameDataManager?.getGames();
      return games || [];
    });
    
    if (allGames.length === 0) {
      throw new Error('バックグラウンド更新後にデータが見つかりません');
    }
    
    this.log(`📊 ${allGames.length}個の作品が保存されました`);
    
    // Step 4: 最初の作品での詳細データ確認
    const firstGame = allGames[0];
    this.log(`4️⃣ 作品「${firstGame.title}」の詳細データ確認`);
    
    const detailedData = await this.page.evaluate((gameId) => {
      return window.dataConsistencyTester?.getDetailedGameData(gameId);
    }, firstGame.id);
    
    if (!detailedData?.success) {
      throw new Error(`詳細データ取得失敗: ${detailedData?.reason}`);
    }
    
    this.log('📋 詳細データ分析:');
    this.log(`  - lastUpdate: ${detailedData.data.lastUpdate}`);
    this.log(`  - last_update: ${detailedData.data.last_update}`);
    this.log(`  - version: ${detailedData.data.version}`);
    this.log(`  - updated_at: ${detailedData.data.updated_at}`);
    
    // Step 5: 詳細画面表示のシミュレート
    this.log('5️⃣ 詳細画面表示シミュレート');
    const detailView = await this.page.evaluate((gameId) => {
      return window.dataConsistencyTester?.simulateDetailView(gameId);
    }, firstGame.id);
    
    if (!detailView?.success) {
      throw new Error(`詳細画面シミュレート失敗: ${detailView?.reason}`);
    }
    
    this.log('🖼️ 詳細画面表示結果:');
    this.log(`  - 表示lastUpdate: ${detailView.displayData.lastUpdate}`);
    this.log(`  - フォーマット済み日付: ${detailView.displayData.formattedDate}`);
    
    // Step 6: 問題の特定
    this.log('6️⃣ 問題の特定');
    const issues = [];
    
    if (detailedData.data.lastUpdate === undefined) {
      issues.push('lastUpdateがundefined');
    }
    
    if (detailedData.data.lastUpdate !== detailedData.data.last_update) {
      issues.push('lastUpdateとlast_updateが異なる');
    }
    
    if (detailView.displayData.lastUpdate === undefined) {
      issues.push('詳細画面でのlastUpdateがundefined');
    }
    
    if (issues.length > 0) {
      this.log('❌ 問題発見:');
      issues.forEach(issue => this.log(`  - ${issue}`));
      return { success: false, issues, detailedData, detailView };
    } else {
      this.log('✅ データ一貫性OK');
      return { success: true, detailedData, detailView };
    }
  }

  async checkStorageStructure() {
    this.log('\n💾 Storage構造の確認');
    
    const storageData = await this.page.evaluate(() => {
      return window.dataConsistencyTester?.checkStorage();
    });
    
    if (!storageData?.success) {
      throw new Error(`Storage確認失敗: ${storageData?.reason}`);
    }
    
    this.log('📊 Storage内容:');
    Object.keys(storageData.data).forEach(key => {
      const data = storageData.data[key];
      if (Array.isArray(data)) {
        this.log(`  - ${key}: 配列 (${data.length}個)`);
        if (data.length > 0 && data[0].title) {
          this.log(`    例: ${data[0].title} (lastUpdate: ${data[0].lastUpdate})`);
        }
      } else {
        this.log(`  - ${key}: ${typeof data}`);
      }
    });
    
    return storageData;
  }

  async generateReport() {
    const reportPath = path.join(__dirname, `data-consistency-report-${Date.now()}.json`);
    const reportData = {
      timestamp: new Date().toISOString(),
      testLog: this.testLog,
      summary: 'データ一貫性問題の自動テスト結果'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    this.log(`📄 レポート保存: ${reportPath}`);
    
    return reportPath;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runTest() {
    try {
      await this.init();
      
      // メインテスト実行
      const result = await this.reproduceDataInconsistency();
      
      // Storage構造確認
      await this.checkStorageStructure();
      
      // レポート生成
      const reportPath = await this.generateReport();
      
      this.log('\n🎯 テスト完了！');
      return { success: true, result, reportPath };
      
    } catch (error) {
      this.log(`❌ テスト失敗: ${error.message}`);
      await this.generateReport();
      return { success: false, error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// スタンドアロン実行
if (require.main === module) {
  const tester = new DataConsistencyTester();
  tester.runTest().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = DataConsistencyTester;