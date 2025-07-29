// ウディこん助 更新検出・管理システム

class UpdateManager {
  constructor() {
    this.updateQueue = []; // 更新処理キュー
    this.notificationSettings = {
      enabled: true,
      showNewWorks: true,
      showUpdatedWorks: true,
      soundEnabled: false
    };
    
    this.updateMarkers = new Map(); // 更新マーカー管理
    this.lastNotificationTime = null;
    
    this.initializeSettings();
  }

  // 設定初期化
  async initializeSettings() {
    try {
      const result = await chrome.storage.local.get('update_manager_settings');
      const settings = result.update_manager_settings || {};
      
      this.notificationSettings = {
        ...this.notificationSettings,
        ...settings
      };
      
      console.log('🔔 更新管理設定読み込み完了:', this.notificationSettings);
      
    } catch (error) {
      console.error('❌ 更新管理設定読み込みエラー:', error);
    }
  }

  // 設定保存
  async saveSettings() {
    try {
      await chrome.storage.local.set({ 
        update_manager_settings: this.notificationSettings 
      });
      console.log('💾 更新管理設定保存完了');
    } catch (error) {
      console.error('❌ 更新管理設定保存エラー:', error);
    }
  }

  // 更新処理メイン
  async processUpdates(changes, checkId) {
    const result = {
      checkId: checkId,
      timestamp: changes.timestamp,
      processed: {
        newWorks: 0,
        updatedWorks: 0,
        notifications: 0
      },
      errors: []
    };

    try {
      console.log(`🔄 更新処理開始 [${checkId}]:`, {
        new: changes.newWorks.length,
        updated: changes.updatedWorks.length
      });

      // 新規作品処理
      if (changes.newWorks.length > 0) {
        const newWorksResult = await this.processNewWorks(changes.newWorks);
        result.processed.newWorks = newWorksResult.processed;
        result.errors.push(...newWorksResult.errors);
      }

      // 更新作品処理
      if (changes.updatedWorks.length > 0) {
        const updatedWorksResult = await this.processUpdatedWorks(changes.updatedWorks);
        result.processed.updatedWorks = updatedWorksResult.processed;
        result.errors.push(...updatedWorksResult.errors);
      }

      // 通知処理
      if (this.notificationSettings.enabled) {
        const notificationResult = await this.sendUpdateNotifications(changes);
        result.processed.notifications = notificationResult.sent;
        result.errors.push(...notificationResult.errors);
      }

      // 更新マーカー設定
      await this.setUpdateMarkers(changes);

      console.log(`✅ 更新処理完了 [${checkId}]:`, result.processed);

    } catch (error) {
      console.error(`❌ 更新処理エラー [${checkId}]:`, error);
      result.errors.push(error.message);
    }

    return result;
  }

  // 新規作品処理
  async processNewWorks(newWorks) {
    const result = { processed: 0, errors: [] };

    for (const work of newWorks) {
      try {
        // 重複チェック: 既にwebMonitor.addNewWorkで追加済みかチェック
        const existing = await window.gameDataManager.getGameByNo(work.no);
        if (existing) {
          console.log(`⚠️ 作品No.${work.no}は既に追加済み - updateManager処理をスキップ`);
          result.processed++;
          
          // 更新マーカー設定のみ実行
          this.updateMarkers.set(work.no, {
            type: 'new',
            timestamp: new Date().toISOString(),
            confirmed: false
          });
          continue;
        }
        
        // 作品データの正規化
        const normalizedWork = this.normalizeWorkData(work, 'new');
        
        // データベースに追加（重複がない場合のみ）
        const success = await window.gameDataManager.addGame(normalizedWork);
        
        if (success) {
          result.processed++;
          console.log(`➕ 新規作品追加完了: ${work.title} (No.${work.no})`);
          
          // 更新マーカー設定
          this.updateMarkers.set(work.no, {
            type: 'new',
            timestamp: new Date().toISOString(),
            confirmed: false
          });
        }
        
      } catch (error) {
        result.errors.push(`新規作品処理エラー [${work.title}]: ${error.message}`);
        console.error(`❌ 新規作品処理エラー [${work.title}]:`, error);
      }
    }

    return result;
  }

  // 更新作品処理
  async processUpdatedWorks(updatedWorks) {
    const result = { processed: 0, errors: [] };

    for (const work of updatedWorks) {
      try {
        const existingWork = work.previousData;
        const updates = {
          version_status: 'updated',
          update_notification: true,
          updated_at: new Date().toISOString()
        };

        // 変更内容に応じた更新
        if (work.changeType.includes('title')) {
          updates.title = work.title;
        }
        
        if (work.changeType.includes('author')) {
          updates.author = work.author;
        }
        
        // 更新日変更の場合はlastUpdateを更新
        if (work.changeType.includes('updated') && work.lastUpdate) {
          updates.lastUpdate = work.lastUpdate;
        }

        // Web監視情報更新
        updates.web_monitoring = {
          ...existingWork.web_monitoring,
          last_check: new Date().toISOString(),
          last_update: work.updateTimestamp,
          change_type: work.changeType
        };

        const success = await window.gameDataManager.updateGame(existingWork.id, updates);
        
        if (success) {
          result.processed++;
          console.log(`🔄 作品更新完了: ${work.title} (No.${work.no}) - ${work.changeType.join(', ')}`);
          
          // 更新マーカー設定
          this.updateMarkers.set(work.no, {
            type: 'updated',
            changeType: work.changeType,
            timestamp: new Date().toISOString(),
            confirmed: false
          });
        }
        
      } catch (error) {
        result.errors.push(`作品更新エラー [${work.title}]: ${error.message}`);
        console.error(`❌ 作品更新エラー [${work.title}]:`, error);
      }
    }

    return result;
  }

  // 作品データ正規化
  normalizeWorkData(workData, type = 'new') {
    const normalizedWork = {
      id: Date.now() + Math.random(),
      no: workData.no,
      title: workData.title || '不明なタイトル',
      author: workData.author || '不明',
      genre: 'その他',
      description: '',
      wodicon_url: workData.url || '',
      local_folder_path: '',
      is_played: false,
      rating: {
        熱中度: null, 斬新さ: null, 物語性: null,
        画像音声: null, 遊びやすさ: null, その他: null,
        total: 0
      },
      review: '',
      review_length: 0,
      version_status: type,
      last_played: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      update_notification: true,
      lastUpdate: workData.lastUpdate || workData.updateTimestamp,
      web_monitoring: {
        detected_at: new Date().toISOString(),
        last_update: workData.updateTimestamp,
        source_url: workData.url,
        detection_type: type
      }
    };

    return normalizedWork;
  }

  // 通知送信
  async sendUpdateNotifications(changes) {
    const result = { sent: 0, errors: [] };

    try {
      if (!this.notificationSettings.enabled) {
        return result;
      }

      // 通知レート制限チェック
      if (this.lastNotificationTime) {
        const timeSinceLastNotification = Date.now() - new Date(this.lastNotificationTime).getTime();
        if (timeSinceLastNotification < 60000) { // 1分以内は通知を制限
          console.log('⏰ 通知レート制限により通知をスキップ');
          return result;
        }
      }

      // 新規作品通知
      if (this.notificationSettings.showNewWorks && changes.newWorks.length > 0) {
        await this.sendNewWorksNotification(changes.newWorks, changes.newWorks.length);
        result.sent += 1; // 通知件数としては1件
      }

      // 更新作品通知
      if (this.notificationSettings.showUpdatedWorks && changes.updatedWorks.length > 0) {
        await this.sendUpdatedWorksNotification(changes.updatedWorks, changes.updatedWorks.length);
        result.sent += 1; // 通知件数としては1件
      }

      this.lastNotificationTime = new Date().toISOString();

    } catch (error) {
      result.errors.push(`通知送信エラー: ${error.message}`);
      console.error('❌ 通知送信エラー:', error);
    }

    return result;
  }

  // 新規作品通知
  async sendNewWorksNotification(newWorks, actualCount) {
    try {
      const title = actualCount === 1 
        ? `🎮 新作品発見: ${newWorks[0].title}`
        : `🎮 新作品 ${actualCount}件を発見`;

      const message = actualCount === 1
        ? `作者: ${newWorks[0].author || '不明'}`
        : newWorks.slice(0, 3).map(work => `• No.${work.no}_${work.title}`).join('\n') +
          (actualCount > 3 ? `\n...他${actualCount - 3}件` : '');

      await chrome.notifications.create(`new_works_${Date.now()}`, {
        type: 'basic',
        iconUrl: '../icons/icon48.png',
        title: title,
        message: message,
        priority: 1
      });

      console.log(`🔔 新規作品通知送信: ${actualCount}件`);

    } catch (error) {
      console.error('❌ 新規作品通知エラー:', error);
      throw error;
    }
  }

  // 更新作品通知
  async sendUpdatedWorksNotification(updatedWorks, actualCount) {
    try {
      const title = actualCount === 1
        ? `🔄 作品更新: ${updatedWorks[0].title}`
        : `🔄 作品更新 ${actualCount}件を検出`;

      const message = actualCount === 1
        ? `変更内容: ${this.formatChangeType(updatedWorks[0].changeType)}`
        : updatedWorks.slice(0, 3).map(work => `• No.${work.no}_${work.title}`).join('\n') +
          (actualCount > 3 ? `\n...他${actualCount - 3}件` : '');

      await chrome.notifications.create(`updated_works_${Date.now()}`, {
        type: 'basic',
        iconUrl: '../icons/icon48.png',
        title: title,
        message: message,
        priority: 1
      });

      console.log(`🔔 更新作品通知送信: ${actualCount}件`);

    } catch (error) {
      console.error('❌ 更新作品通知エラー:', error);
      throw error;
    }
  }

  // 変更タイプのフォーマット
  formatChangeType(changeTypes) {
    const typeNames = {
      title: 'タイトル変更',
      author: '作者変更',
      updated: '更新日時変更'
    };

    return changeTypes.map(type => typeNames[type] || type).join(', ');
  }

  // 更新マーカー設定
  async setUpdateMarkers(changes) {
    try {
      // 新規作品マーカー
      changes.newWorks.forEach(work => {
        this.updateMarkers.set(work.no, {
          type: 'new',
          timestamp: new Date().toISOString(),
          confirmed: false
        });
      });

      // 更新作品マーカー
      changes.updatedWorks.forEach(work => {
        this.updateMarkers.set(work.no, {
          type: 'updated',
          changeType: work.changeType,
          timestamp: new Date().toISOString(),
          confirmed: false
        });
      });

      // マーカーをストレージに保存
      await chrome.storage.local.set({
        update_markers: Object.fromEntries(this.updateMarkers)
      });

      console.log(`🏷️ 更新マーカー設定完了: ${this.updateMarkers.size}件`);

    } catch (error) {
      console.error('❌ 更新マーカー設定エラー:', error);
    }
  }

  // 更新マーカー取得
  async getUpdateMarkers() {
    try {
      const result = await chrome.storage.local.get('update_markers');
      const markers = result.update_markers || {};
      
      this.updateMarkers = new Map(Object.entries(markers));
      return this.updateMarkers;
      
    } catch (error) {
      console.error('❌ 更新マーカー取得エラー:', error);
      return new Map();
    }
  }

  // 更新確認済みマーク
  async markAsConfirmed(workNo) {
    try {
      const marker = this.updateMarkers.get(workNo);
      if (marker) {
        marker.confirmed = true;
        marker.confirmedAt = new Date().toISOString();
        
        await chrome.storage.local.set({
          update_markers: Object.fromEntries(this.updateMarkers)
        });
        
        console.log(`✅ 更新確認済みマーク: No.${workNo}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ 更新確認マークエラー:', error);
      return false;
    }
  }

  // 全マーカークリア
  async clearAllMarkers() {
    try {
      this.updateMarkers.clear();
      await chrome.storage.local.remove('update_markers');
      console.log('🧹 全更新マーカークリア完了');
      return true;
    } catch (error) {
      console.error('❌ マーカークリアエラー:', error);
      return false;
    }
  }

  // 古いマーカー自動削除
  async cleanupOldMarkers(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let removedCount = 0;
      for (const [workNo, marker] of this.updateMarkers.entries()) {
        const markerDate = new Date(marker.timestamp);
        if (markerDate < cutoffDate) {
          this.updateMarkers.delete(workNo);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        await chrome.storage.local.set({
          update_markers: Object.fromEntries(this.updateMarkers)
        });
        console.log(`🧹 古い更新マーカー削除: ${removedCount}件`);
      }

      return removedCount;
      
    } catch (error) {
      console.error('❌ マーカークリーンアップエラー:', error);
      return 0;
    }
  }

  // パフォーマンス最適化: メモリクリーンアップ
  performMemoryCleanup() {
    try {
      // 大きなオブジェクトの参照を削除
      this.updateQueue = [];
      
      // 更新マーカーサイズ制限
      if (this.updateMarkers.size > 100) {
        const markersArray = Array.from(this.updateMarkers.entries());
        markersArray.sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
        
        this.updateMarkers.clear();
        markersArray.slice(0, 50).forEach(([key, value]) => {
          this.updateMarkers.set(key, value);
        });
        
        console.log('🧹 更新マーカーメモリ最適化: 50件に制限');
      }
      
      // ガベージコレクションの促進
      if (global.gc) {
        global.gc();
      }
      
    } catch (error) {
      console.error('❌ メモリクリーンアップエラー:', error);
    }
  }

  // バッチ処理による効率化
  async processBatch(items, processor, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      // バッチ間の小休止（CPU負荷軽減）
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }

  // 設定メソッド群
  async setNotificationEnabled(enabled) {
    this.notificationSettings.enabled = !!enabled;
    await this.saveSettings();
    return true;
  }

  async setShowNewWorks(enabled) {
    this.notificationSettings.showNewWorks = !!enabled;
    await this.saveSettings();
    return true;
  }

  async setShowUpdatedWorks(enabled) {
    this.notificationSettings.showUpdatedWorks = !!enabled;
    await this.saveSettings();
    return true;
  }


  // ステータス取得
  getStatus() {
    return {
      notificationSettings: { ...this.notificationSettings },
      updateMarkersCount: this.updateMarkers.size,
      lastNotificationTime: this.lastNotificationTime,
      queueLength: this.updateQueue.length
    };
  }

  // 統計情報取得
  async getStatistics() {
    try {
      const markers = await this.getUpdateMarkers();
      const stats = {
        totalMarkers: markers.size,
        newWorks: 0,
        updatedWorks: 0,
        confirmedMarkers: 0,
        unconfirmedMarkers: 0
      };

      for (const marker of markers.values()) {
        if (marker.type === 'new') stats.newWorks++;
        if (marker.type === 'updated') stats.updatedWorks++;
        if (marker.confirmed) stats.confirmedMarkers++;
        else stats.unconfirmedMarkers++;
      }

      return stats;
      
    } catch (error) {
      console.error('❌ 統計情報取得エラー:', error);
      return null;
    }
  }
}

// グローバルインスタンス
window.updateManager = new UpdateManager();

console.log('📋 UpdateManager loaded successfully');