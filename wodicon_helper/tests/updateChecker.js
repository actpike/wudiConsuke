// 更新チェック機能のテストツール

class UpdateCheckerTest {
  constructor() {
    this.testGameNo = 4; // テスト対象のゲームNo
    this.testDate = '7/10'; // 意図的に設定する更新日
  }

  // No4作品の更新日を意図的に変更するテスト
  async modifyGameUpdateDate() {
    try {
      console.log(`🧪 テスト開始: No${this.testGameNo}の更新日を「${this.testDate}」に変更`);
      
      // 現在のゲームデータを取得
      const games = await window.gameDataManager.getGames();
      const targetGame = games.find(game => game.no === this.testGameNo);
      
      if (!targetGame) {
        throw new Error(`No${this.testGameNo}のゲームが見つかりません`);
      }
      
      console.log(`📋 対象ゲーム: ${targetGame.title} (作者: ${targetGame.author})`);
      console.log(`📅 現在の更新日: ${targetGame.lastUpdate}`);
      
      // バックアップを作成
      const originalDate = targetGame.lastUpdate;
      
      // ゲームデータの更新日を変更
      targetGame.lastUpdate = this.testDate;
      
      // データベースに保存
      await window.gameDataManager.saveGame(targetGame);
      
      console.log(`✅ 更新日変更完了: ${originalDate} → ${this.testDate}`);
      
      return {
        success: true,
        gameTitle: targetGame.title,
        originalDate: originalDate,
        newDate: this.testDate,
        gameNo: this.testGameNo
      };
      
    } catch (error) {
      console.error('❌ テスト実行エラー:', error);
      throw error;
    }
  }

  // テスト結果の検証用：更新検知をチェック
  async verifyUpdateDetection() {
    try {
      console.log('🔍 更新検知テスト開始...');
      
      // 現在保存されているゲームの状態を確認
      const games = await window.gameDataManager.getGames();
      const targetGame = games.find(game => game.no === this.testGameNo);
      
      if (!targetGame) {
        throw new Error(`No${this.testGameNo}のゲームが見つかりません`);
      }
      
      console.log(`📋 検証対象: ${targetGame.title}`);
      console.log(`📅 設定済み更新日: ${targetGame.lastUpdate}`);
      
      // 手動で更新チェックを実行
      if (window.webMonitor) {
        console.log('🚀 Web監視による更新チェック実行...');
        const result = await window.webMonitor.performMonitoring();
        
        if (result.success) {
          const updates = result.updates || [];
          const targetUpdate = updates.find(update => 
            update.no === this.testGameNo || 
            update.title === targetGame.title
          );
          
          if (targetUpdate) {
            console.log('✅ 更新検知成功！');
            console.log(`📝 検知内容:`, targetUpdate);
            return {
              success: true,
              detected: true,
              updateInfo: targetUpdate
            };
          } else {
            console.log('⚠️ 更新が検知されませんでした');
            console.log('📊 全更新情報:', updates);
            return {
              success: true,
              detected: false,
              allUpdates: updates
            };
          }
        } else {
          throw new Error(`Web監視エラー: ${result.error}`);
        }
      } else {
        throw new Error('WebMonitorが初期化されていません');
      }
      
    } catch (error) {
      console.error('❌ 検証エラー:', error);
      throw error;
    }
  }

  // テストデータをリセット（元の状態に戻す）
  async resetTestData() {
    try {
      console.log('🔄 テストデータリセット開始...');
      
      // 最新のWebデータを取得して復元
      if (window.webMonitor) {
        console.log('🌐 最新Web情報を取得中...');
        const result = await window.webMonitor.performMonitoring();
        
        if (result.success) {
          console.log('✅ テストデータリセット完了');
          return { success: true, message: 'Web情報で自動更新されました' };
        } else {
          throw new Error(`Web監視エラー: ${result.error}`);
        }
      } else {
        throw new Error('WebMonitorが初期化されていません');
      }
      
    } catch (error) {
      console.error('❌ リセットエラー:', error);
      throw error;
    }
  }

  // 包括的なテスト実行
  async runFullTest() {
    try {
      console.log('🧪🧪🧪 更新チェック機能 包括テスト開始 🧪🧪🧪');
      
      // Step 1: データ変更
      console.log('\n--- Step 1: テストデータ準備 ---');
      const modifyResult = await this.modifyGameUpdateDate();
      
      // Step 2: 更新検知テスト
      console.log('\n--- Step 2: 更新検知テスト ---');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
      const verifyResult = await this.verifyUpdateDetection();
      
      // Step 3: 結果まとめ
      console.log('\n--- Step 3: テスト結果 ---');
      const testResult = {
        dataModification: modifyResult,
        updateDetection: verifyResult,
        overall: verifyResult.detected ? 'PASS' : 'FAIL'
      };
      
      console.log('📊 最終結果:', testResult.overall);
      if (testResult.overall === 'PASS') {
        console.log('🎉 更新チェック機能は正常に動作しています！');
      } else {
        console.log('⚠️ 更新チェック機能に問題がある可能性があります。');
      }
      
      return testResult;
      
    } catch (error) {
      console.error('❌ 包括テスト失敗:', error);
      throw error;
    }
  }
}

// グローバルに公開
window.updateCheckerTest = new UpdateCheckerTest();