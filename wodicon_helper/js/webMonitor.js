// ウディこん助 Web監視システム

class WebMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = 30; // 分
    this.lastCheckTime = null;
    this.monitoringMode = 'all'; // 'all' | 'selected' | 'disabled'
    this.selectedWorks = new Set(); // 注目作品のID
    this.checkOnStartup = false;
    
    // エラー管理
    this.consecutiveErrors = 0;
    this.maxRetries = 3;
    this.backoffMultiplier = 2;
    
    // 監視結果キャッシュ
    this.lastResult = null;
    this.lastHtml = null;
    
    this.initializeSettings();
  }

  // 設定初期化
  async initializeSettings() {
    try {
      const result = await chrome.storage.local.get('web_monitor_settings');
      const settings = result.web_monitor_settings || {};
      
      this.monitoringInterval = settings.interval || 30;
      this.monitoringMode = settings.mode || 'all';
      this.selectedWorks = new Set(settings.selectedWorks || []);
      this.checkOnStartup = settings.checkOnStartup || false;
      this.lastCheckTime = settings.lastCheckTime || null;
      
      console.log('🔧 Web監視設定読み込み完了:', {
        interval: this.monitoringInterval,
        mode: this.monitoringMode,
        selectedCount: this.selectedWorks.size
      });
      
    } catch (error) {
      console.error('❌ 設定読み込みエラー:', error);
    }
  }

  // 設定保存
  async saveSettings() {
    try {
      const settings = {
        interval: this.monitoringInterval,
        mode: this.monitoringMode,
        selectedWorks: Array.from(this.selectedWorks),
        checkOnStartup: this.checkOnStartup,
        lastCheckTime: this.lastCheckTime
      };
      
      await chrome.storage.local.set({ web_monitor_settings: settings });
      console.log('💾 Web監視設定保存完了');
      
    } catch (error) {
      console.error('❌ 設定保存エラー:', error);
    }
  }

  // 監視開始
  async startMonitoring() {
    if (this.monitoringMode === 'disabled' || this.monitoringInterval === 0) {
      console.log('📴 監視は無効に設定されています');
      return false;
    }

    try {
      this.isMonitoring = true;
      console.log(`🚀 Web監視開始 (${this.monitoringInterval}分間隔)`);
      
      // Chrome Alarms APIでスケジュール設定
      await this.scheduleMonitoring();
      
      // 即座に1回実行
      await this.performCheck();
      
      return true;
      
    } catch (error) {
      console.error('❌ 監視開始エラー:', error);
      this.isMonitoring = false;
      return false;
    }
  }

  // 監視停止
  async stopMonitoring() {
    try {
      this.isMonitoring = false;
      await chrome.alarms.clear('web_monitor_check');
      console.log('⏹️ Web監視停止');
      
      return true;
      
    } catch (error) {
      console.error('❌ 監視停止エラー:', error);
      return false;
    }
  }

  // スケジュール設定
  async scheduleMonitoring() {
    try {
      // 既存のアラームをクリア
      await chrome.alarms.clear('web_monitor_check');
      
      if (this.monitoringInterval > 0) {
        // 新しいアラームを設定
        await chrome.alarms.create('web_monitor_check', {
          delayInMinutes: this.monitoringInterval,
          periodInMinutes: this.monitoringInterval
        });
        
        console.log(`⏰ 監視スケジュール設定完了: ${this.monitoringInterval}分間隔`);
      }
      
    } catch (error) {
      console.error('❌ スケジュール設定エラー:', error);
      throw error;
    }
  }

  // 監視チェック実行
  async performCheck() {
    if (!this.isMonitoring && this.monitoringMode !== 'disabled') {
      console.log('📴 監視が停止されています');
      return null;
    }

    const checkId = `check_${Date.now()}`;
    console.log(`🔍 監視チェック開始 [${checkId}]`);

    try {
      // 現在時刻記録
      this.lastCheckTime = new Date().toISOString();
      await this.saveSettings();

      // ページ取得
      const html = await this.fetchContestPage();
      
      // 解析実行
      const parseResult = await window.pageParser.parseContestPage(html, 'https://silversecond.com/WolfRPGEditor/Contest/');
      
      if (!parseResult.success) {
        throw new Error(`ページ解析失敗: ${parseResult.error}`);
      }

      // 既存データ取得
      const existingWorks = await window.gameDataManager.getGames();
      
      // 差分検出
      const changes = await window.pageParser.detectChanges(parseResult.works, existingWorks);
      
      // 結果処理
      const result = await this.processChanges(changes, checkId);
      
      // エラーカウンタリセット
      this.consecutiveErrors = 0;
      
      console.log(`✅ 監視チェック完了 [${checkId}]:`, {
        newWorks: changes.newWorks.length,
        updatedWorks: changes.updatedWorks.length,
        totalWorks: parseResult.works.length
      });

      this.lastResult = result;
      return result;
      
    } catch (error) {
      this.consecutiveErrors++;
      console.error(`❌ 監視チェックエラー [${checkId}]:`, error);
      
      // 連続エラー対応
      if (this.consecutiveErrors >= this.maxRetries) {
        console.warn(`⚠️ 連続エラー上限到達 (${this.consecutiveErrors}回), 監視間隔を延長`);
        await this.handleConsecutiveErrors();
      }

      return {
        success: false,
        error: error.message,
        checkId: checkId,
        timestamp: new Date().toISOString(),
        consecutiveErrors: this.consecutiveErrors
      };
    }
  }

  // コンテストページ取得
  async fetchContestPage() {
    const targetUrls = window.pageParser.getTargetUrls();
    
    for (const url of targetUrls) {
      try {
        console.log(`📡 ページ取得中: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        
        if (html.length < 1000) {
          console.warn('⚠️ レスポンスが短すぎます:', html.length, 'chars');
        }

        this.lastHtml = html;
        console.log(`✅ ページ取得成功: ${html.length} chars`);
        return html;
        
      } catch (error) {
        console.error(`❌ ページ取得エラー [${url}]:`, error);
        
        // 最後のURLでエラーの場合は例外を投げる
        if (url === targetUrls[targetUrls.length - 1]) {
          throw error;
        }
      }
    }
    
    throw new Error('全ての対象URLでページ取得に失敗');
  }

  // 変更処理
  async processChanges(changes, checkId) {
    const result = {
      checkId: checkId,
      timestamp: changes.timestamp,
      newWorks: [],
      updatedWorks: [],
      success: true
    };

    try {
      // 新規作品処理
      for (const newWork of changes.newWorks) {
        if (this.shouldProcessWork(newWork)) {
          const addedWork = await this.addNewWork(newWork);
          if (addedWork) {
            result.newWorks.push(addedWork);
          }
        }
      }

      // 更新作品処理
      for (const updatedWork of changes.updatedWorks) {
        if (this.shouldProcessWork(updatedWork)) {
          const updated = await this.updateExistingWork(updatedWork);
          if (updated) {
            result.updatedWorks.push(updated);
          }
        }
      }

      // 監視結果をストレージに保存
      await this.saveMonitoringResult(result);

      return result;
      
    } catch (error) {
      console.error('❌ 変更処理エラー:', error);
      result.success = false;
      result.error = error.message;
      return result;
    }
  }

  // 作品処理対象判定
  shouldProcessWork(work) {
    if (this.monitoringMode === 'all') {
      return true;
    }
    
    if (this.monitoringMode === 'selected') {
      return this.selectedWorks.has(work.no) || this.selectedWorks.has(work.tempId);
    }
    
    return false;
  }

  // 新規作品追加
  async addNewWork(workData) {
    try {
      const newWork = {
        id: Date.now() + Math.random(), // 一意ID生成
        no: workData.no,
        title: workData.title,
        author: workData.author || '不明',
        genre: 'その他', // デフォルト
        description: '',
        wodicon_url: workData.url || '',
        local_folder_path: '',
        is_played: false,
        rating: {
          熱中度: 1, 斬新さ: 1, 物語性: 1,
          画像音声: 1, 遊びやすさ: 1, その他: 1,
          total: 6
        },
        review: '',
        review_length: 0,
        version_status: 'new',
        last_played: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        update_notification: true,
        web_monitoring: {
          detected_at: new Date().toISOString(),
          last_update: workData.updateTimestamp,
          source_url: workData.url
        }
      };

      // データベースに追加
      const success = await window.gameDataManager.addGame(newWork);
      
      if (success) {
        console.log(`➕ 新規作品追加: ${newWork.title} (No.${newWork.no})`);
        return newWork;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ 新規作品追加エラー:', error);
      return null;
    }
  }

  // 既存作品更新
  async updateExistingWork(workData) {
    try {
      const existingWork = workData.previousData;
      const updates = {
        version_status: 'updated',
        update_notification: true,
        updated_at: new Date().toISOString()
      };

      // タイトル変更
      if (workData.changeType.includes('title')) {
        updates.title = workData.title;
      }

      // 作者変更
      if (workData.changeType.includes('author')) {
        updates.author = workData.author;
      }

      // Web監視情報更新
      updates.web_monitoring = {
        ...existingWork.web_monitoring,
        last_check: new Date().toISOString(),
        last_update: workData.updateTimestamp,
        change_type: workData.changeType
      };

      const success = await window.gameDataManager.updateGame(existingWork.id, updates);
      
      if (success) {
        console.log(`🔄 作品更新: ${workData.title} (No.${workData.no}) - ${workData.changeType.join(', ')}`);
        return { ...existingWork, ...updates };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ 作品更新エラー:', error);
      return null;
    }
  }

  // 監視結果保存
  async saveMonitoringResult(result) {
    try {
      const monitoringHistory = await this.getMonitoringHistory();
      
      // 履歴に追加（最新50件まで保持）
      monitoringHistory.unshift(result);
      if (monitoringHistory.length > 50) {
        monitoringHistory.splice(50);
      }

      await chrome.storage.local.set({ 
        web_monitor_history: monitoringHistory,
        web_monitor_last_result: result
      });
      
    } catch (error) {
      console.error('❌ 監視結果保存エラー:', error);
    }
  }

  // 監視履歴取得
  async getMonitoringHistory() {
    try {
      const result = await chrome.storage.local.get('web_monitor_history');
      return result.web_monitor_history || [];
    } catch (error) {
      console.error('❌ 監視履歴取得エラー:', error);
      return [];
    }
  }

  // 連続エラー処理
  async handleConsecutiveErrors() {
    try {
      // 監視間隔を延長
      const newInterval = Math.min(this.monitoringInterval * this.backoffMultiplier, 240); // 最大4時間
      
      console.log(`⏱️ 監視間隔を延長: ${this.monitoringInterval}分 → ${newInterval}分`);
      
      this.monitoringInterval = newInterval;
      await this.scheduleMonitoring();
      await this.saveSettings();
      
    } catch (error) {
      console.error('❌ エラー処理失敗:', error);
    }
  }

  // 設定メソッド群
  async setMonitoringInterval(minutes) {
    if (minutes >= 0 && minutes <= 240) {
      this.monitoringInterval = minutes;
      await this.saveSettings();
      
      if (this.isMonitoring) {
        await this.scheduleMonitoring();
      }
      
      return true;
    }
    return false;
  }

  async setMonitoringMode(mode) {
    if (['all', 'selected', 'disabled'].includes(mode)) {
      this.monitoringMode = mode;
      await this.saveSettings();
      return true;
    }
    return false;
  }

  async setSelectedWorks(workIds) {
    if (Array.isArray(workIds)) {
      this.selectedWorks = new Set(workIds);
      await this.saveSettings();
      return true;
    }
    return false;
  }

  async setCheckOnStartup(enabled) {
    this.checkOnStartup = !!enabled;
    await this.saveSettings();
    return true;
  }

  // ステータス取得
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      monitoringInterval: this.monitoringInterval,
      monitoringMode: this.monitoringMode,
      selectedWorksCount: this.selectedWorks.size,
      lastCheckTime: this.lastCheckTime,
      consecutiveErrors: this.consecutiveErrors,
      checkOnStartup: this.checkOnStartup
    };
  }

  // 診断情報取得
  async getDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      status: this.getStatus(),
      lastResult: this.lastResult,
      recentHistory: []
    };

    try {
      const history = await this.getMonitoringHistory();
      diagnostics.recentHistory = history.slice(0, 5); // 最新5件
      
      // 最後のHTMLの診断
      if (this.lastHtml) {
        diagnostics.lastHtmlDiagnosis = await window.pageParser.diagnoseParsingIssues(this.lastHtml);
      }
      
    } catch (error) {
      diagnostics.error = error.message;
    }

    return diagnostics;
  }

  // 手動チェック実行
  async manualCheck() {
    console.log('🔍 手動監視チェック実行');
    return await this.performCheck();
  }
}

// グローバルインスタンス
window.webMonitor = new WebMonitor();

console.log('🌐 WebMonitor loaded successfully');