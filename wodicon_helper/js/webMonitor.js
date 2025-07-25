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
    this.baseRetryDelay = 1000; // 1秒
    this.maxRetryDelay = 300000; // 5分
    this.errorHistory = [];
    this.lastErrorTime = null;
    
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
      
      // アラームベーススケジュールは削除済み
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

  // 監視停止（アラーム機能削除済み）
  async stopMonitoring() {
    try {
      this.isMonitoring = false;
      console.log('⏹️ Web監視停止（アラーム機能削除済み）');
      console.log('ℹ️ サイト訪問時・ポップアップ開時の自動監視は継続動作');
      
      return true;
      
    } catch (error) {
      console.error('❌ 監視停止エラー:', error);
      return false;
    }
  }

  // スケジュール設定（アラーム機能削除済み）
  async scheduleMonitoring() {
    try {
      console.log('ℹ️ アラームベース定期監視は削除済み（Chrome審査簡素化のため）');
      console.log('✅ 代替監視方式: サイト訪問時・ポップアップ開時・手動実行');
      console.log(`📋 設定値保持: ${this.monitoringInterval}分間隔（参考値）`);
      
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

      // エラー回復チェック: 前回エラーから十分時間が経過している場合はリセット
      if (this.consecutiveErrors > 0 && this.lastErrorTime) {
        const timeSinceError = Date.now() - new Date(this.lastErrorTime).getTime();
        const resetThreshold = this.monitoringInterval * 60000 * 2; // 監視間隔の2倍
        if (timeSinceError > resetThreshold) {
          console.log('🔄 エラーカウンターリセット: 十分な時間が経過');
          this.consecutiveErrors = 0;
        }
      }

      // ページ取得（リトライ付き）
      const html = await this.performWithRetry(() => this.fetchContestPage(), 'ページ取得');
      
      // 設定からURLを取得
      const settings = await chrome.storage.local.get('web_monitor_settings');
      // 年度別URL取得
      let contestUrl = settings.web_monitor_settings?.contest_url;
      if (!contestUrl) {
        const currentYear = window.yearManager ? await window.yearManager.getCurrentYear() : 2025;
        contestUrl = window.constants?.URLS?.getContestUrl?.(currentYear) || 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml';
      }
      
      // 解析実行
      const parseResult = await window.pageParser.parseContestPage(html, contestUrl);
      
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
        totalWorks: parseResult.works.length,
        pattern: parseResult.pattern
      });

      // 詳細情報出力
      if (changes.newWorks.length > 0) {
        console.group('🆕 新規検出作品:');
        changes.newWorks.forEach((work, i) => {
          console.log(`${i+1}. No.${work.no} ${work.title} by ${work.author}`);
        });
        console.groupEnd();
      }

      if (changes.updatedWorks.length > 0) {
        console.group('🔄 更新検出作品:');
        changes.updatedWorks.forEach((work, i) => {
          console.log(`${i+1}. No.${work.no} ${work.title} (${work.changeType?.join(', ')})`);
        });
        console.groupEnd();
      }

      this.lastResult = result;
      return result;
      
    } catch (error) {
      // エラー処理の強化版を使用
      this.handleOperationFailure('監視チェック', error);
      
      // Graceful degradationの試行
      try {
        const fallbackResult = await this.performGracefulDegradation(error);
        if (fallbackResult) {
          console.log('🔄 Graceful degradation成功');
          return fallbackResult;
        }
      } catch (degradationError) {
        console.error('Graceful degradation失敗:', degradationError);
      }

      return {
        success: false,
        error: error.message,
        checkId: checkId,
        timestamp: new Date().toISOString(),
        consecutiveErrors: this.consecutiveErrors,
        errorDetails: this.getErrorDetails()
      };
    }
  }

  // コンテストページ取得
  async fetchContestPage() {
    // 設定からURLを取得
    const settings = await chrome.storage.local.get('web_monitor_settings');
    // 年度別URL取得
    let configuredUrl = settings.web_monitor_settings?.contest_url;
    if (!configuredUrl) {
      const currentYear = window.yearManager ? await window.yearManager.getCurrentYear() : 2025;
      configuredUrl = window.constants?.URLS?.getContestUrl?.(currentYear) || 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml';
    }
    const targetUrls = [configuredUrl];
    
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

        // Shift_JISエンコーディング対応（強化版）
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder('shift_jis', { 
          fatal: false, 
          ignoreBOM: true 
        });
        const html = decoder.decode(arrayBuffer);
        
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

  // 変更処理（updateManagerに統一）
  async processChanges(changes, checkId) {
    const result = {
      checkId: checkId,
      timestamp: changes.timestamp,
      newWorks: [],
      updatedWorks: [],
      success: true
    };

    try {
      // 監視結果をストレージに保存
      await this.saveMonitoringResult(result);

      // 更新管理システムに処理を委譲
      if (window.updateManager) {
        try {
          const updateResult = await window.updateManager.processUpdates(changes, checkId);
          result.newWorks = updateResult.processed.newWorks || [];
          result.updatedWorks = updateResult.processed.updatedWorks || [];
          console.log('📢 更新管理システムで処理完了');
        } catch (error) {
          console.error('❌ 更新管理システム処理エラー:', error);
          result.success = false;
          result.error = error.message;
        }
      }

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

  // 単体作品の監視初期化
  async initializeWorkMonitoring(gameId, webData) {
    try {
      console.log(`🔧 作品ID ${gameId} の監視初期化開始`);
      
      // Web取得データから最新の更新情報を設定
      const initData = {
        lastUpdate: webData.lastUpdate || '更新情報なし',
        version_status: 'latest',
        web_monitoring_enabled: true, // 監視を有効化
        initialized_at: new Date().toISOString()
      };
      
      // Web取得データの updateTimestamp も設定
      if (webData.updateTimestamp) {
        initData.updateTimestamp = webData.updateTimestamp;
      }
      
      console.log(`🔧 監視初期化データ:`, {
        gameId: gameId,
        lastUpdate: initData.lastUpdate,
        updateTimestamp: initData.updateTimestamp
      });
      
      // データベース更新
      const success = await window.gameDataManager.updateGame(gameId, initData);
      
      if (success) {
        console.log(`✅ 作品ID ${gameId} の監視初期化完了`);
        return true;
      } else {
        throw new Error('データベース更新に失敗しました');
      }
      
    } catch (error) {
      console.error(`❌ 作品ID ${gameId} の監視初期化エラー:`, error);
      return false;
    }
  }

  // バックグラウンド更新実行
  async executeBackgroundUpdate() {
    const updateId = `bg_update_${Date.now()}`;
    console.log(`🚀 バックグラウンド更新開始 [${updateId}]`);

    try {
      // 現在時刻記録
      this.lastCheckTime = new Date().toISOString();
      await this.saveSettings();

      let parseResult;
      
      // ページ取得（既存のfetchContestPageを使用）
      console.log('📡 ウディコンページ取得中...');
      const html = await this.performWithRetry(() => this.fetchContestPage(), 'ページ取得');
      
      // 解析実行（既存のpageParserを使用）
      console.log('🔍 ページ解析実行中...');
      // 年度別URL取得
      const currentYear = window.yearManager ? await window.yearManager.getCurrentYear() : 2025;
      const contestUrl = window.constants?.URLS?.getContestUrl?.(currentYear) || 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml';
      parseResult = await window.pageParser.parseContestPage(html, contestUrl);
      
      if (!parseResult.success) {
        throw new Error(`ページ解析失敗: ${parseResult.error}`);
      }

      console.log(`📊 解析完了: ${parseResult.works.length}件の作品を検出`);

      // 既存データ取得
      const existingWorks = await window.gameDataManager.getGames();
      
      // 差分検出（既存のdetectChangesを使用）
      const changes = await window.pageParser.detectChanges(parseResult.works, existingWorks);
      
      // 変更処理（既存のprocessChangesを使用）
      const result = await this.processChanges(changes, updateId);
      
      // 成功結果を拡張
      result.totalWorks = parseResult.works.length;
      result.pattern = parseResult.pattern;
      result.backgroundUpdate = true;

      // エラーカウンタリセット
      this.consecutiveErrors = 0;
      
      console.log(`✅ バックグラウンド更新完了 [${updateId}]:`, {
        newWorks: changes.newWorks.length,
        updatedWorks: changes.updatedWorks.length,
        totalWorks: parseResult.works.length,
        pattern: parseResult.pattern
      });

      // 詳細情報出力
      if (changes.newWorks.length > 0) {
        console.group('🆕 新規検出作品:');
        changes.newWorks.forEach((work, i) => {
          console.log(`${i+1}. No.${work.no} ${work.title} by ${work.author}`);
        });
        console.groupEnd();
      }

      if (changes.updatedWorks.length > 0) {
        console.group('🔄 更新検出作品:');
        changes.updatedWorks.forEach((work, i) => {
          console.log(`${i+1}. No.${work.no} ${work.title} (${work.changeType?.join(', ')})`)
        });
        console.groupEnd();
      }

      this.lastResult = result;
      return result;
      
    } catch (error) {
      // エラー処理
      this.handleOperationFailure('バックグラウンド更新', error);
      
      console.error(`❌ バックグラウンド更新失敗 [${updateId}]:`, error);
      
      return {
        success: false,
        error: error.message,
        updateId: updateId,
        timestamp: new Date().toISOString(),
        consecutiveErrors: this.consecutiveErrors,
        backgroundUpdate: true
      };
    }
  }

  // 作品データをgameDataManager形式に変換
  convertToGameFormat(workData) {
    return {
      no: workData.no,
      title: workData.title || '取得失敗',
      author: workData.author || '不明',
      genre: 'その他',
      description: 'バックグラウンド更新で自動取得された作品です。',
      wodicon_url: workData.url || (window.constants?.URLS?.getContestUrl?.() || 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml') + '#1',
      local_folder_path: '',
      is_played: false,
      rating: {
        熱中度: null,
        斬新さ: null,
        物語性: null,
        画像音声: null,
        遊びやすさ: null,
        その他: null,
        total: 0
      },
      review: '',
      review_length: 0,
      version_status: 'new',
      last_played: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      update_notification: true,
      bbs_check: false,
      last_update_check: new Date().toISOString(),
      web_monitoring_enabled: false,
      web_monitoring: {
        detected_at: new Date().toISOString(),
        last_update: workData.lastUpdate || new Date().toISOString(),
        source_url: workData.url || (window.constants?.URLS?.getContestUrl?.() || 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml') + '#1',
        detection_type: 'background_update'
      },
      // 検出元
      source: 'background_update',
      version: workData.version || workData.lastUpdate || '',
      lastUpdate: workData.lastUpdate || ''
    };
  }

  // リトライ付き実行
  async performWithRetry(operation, operationName) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${operationName} 実行: 試行 ${attempt}/${this.maxRetries}`);
        const result = await operation();
        
        // 成功時はエラーカウンターリセット
        if (this.consecutiveErrors > 0) {
          console.log('✅ エラー回復: 操作成功');
          this.consecutiveErrors = 0;
          this.lastErrorTime = null;
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${operationName} 失敗 (試行 ${attempt}/${this.maxRetries}):`, error.message);
        
        // 最後の試行でない場合は遅延後リトライ
        if (attempt < this.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          console.log(`⏳ ${delay}ms後にリトライします`);
          await this.sleep(delay);
        }
      }
    }
    
    // 全試行失敗
    this.handleOperationFailure(operationName, lastError);
    throw lastError;
  }

  // リトライ遅延計算（指数バックオフ）
  calculateRetryDelay(attempt) {
    const delay = this.baseRetryDelay * Math.pow(this.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.maxRetryDelay);
  }

  // 操作失敗処理
  handleOperationFailure(operationName, error) {
    this.consecutiveErrors++;
    this.lastErrorTime = new Date().toISOString();
    
    // エラー履歴記録
    this.errorHistory.push({
      timestamp: this.lastErrorTime,
      operation: operationName,
      error: error.message,
      attempt: this.consecutiveErrors
    });
    
    // 履歴サイズ制限（最新50件まで）
    if (this.errorHistory.length > 50) {
      this.errorHistory = this.errorHistory.slice(-50);
    }
    
    console.error(`❌ ${operationName} 完全失敗 (連続 ${this.consecutiveErrors}回目):`, error.message);
    
    // 連続エラー数に応じた対処
    if (this.consecutiveErrors >= 5) {
      console.warn('🚨 監視システム不安定: 5回連続エラー');
      this.notifySystemInstability();
    }
  }

  // システム不安定通知
  async notifySystemInstability() {
    try {
      // 重要なエラーの場合は通知
      await chrome.notifications.create(`system_error_${Date.now()}`, {
        type: 'basic',
        iconUrl: '../icons/icon48.png',
        title: '⚠️ Web監視システム警告',
        message: `監視システムでエラーが続いています (連続${this.consecutiveErrors}回)\n詳細は設定画面でご確認ください`,
        priority: 2
      });
    } catch (notificationError) {
      console.error('通知送信失敗:', notificationError);
    }
  }

  // スリープユーティリティ
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Graceful degradation: 部分的障害時の機能縮退
  async performGracefulDegradation(error) {
    console.log('🔄 Graceful degradation開始:', error.message);
    
    try {
      // キャッシュされたデータがあれば使用
      if (this.lastResult && this.lastHtml) {
        const cacheAge = Date.now() - new Date(this.lastResult.timestamp).getTime();
        const maxCacheAge = this.monitoringInterval * 60000 * 2; // 監視間隔の2倍
        
        if (cacheAge < maxCacheAge) {
          console.log('📦 キャッシュデータを使用してフォールバック実行');
          
          // キャッシュベースの簡易チェック
          return {
            success: true,
            checkId: `fallback_${Date.now()}`,
            timestamp: new Date().toISOString(),
            newWorks: [],
            updatedWorks: [],
            error: `フォールバック実行 (原因: ${error.message})`,
            source: 'cache_fallback'
          };
        }
      }
      
      // キャッシュも使用できない場合は監視間隔を延長
      if (this.consecutiveErrors >= 3) {
        const newInterval = Math.min(this.monitoringInterval * 2, 240); // 最大4時間
        console.log(`⏰ 監視間隔を一時的に延長: ${this.monitoringInterval}分 → ${newInterval}分`);
        
        // Background Scriptに間隔変更を通知
        try {
          chrome.runtime.sendMessage({
            action: 'adjust_monitoring_interval',
            interval: newInterval,
            reason: 'error_recovery'
          });
        } catch (msgError) {
          console.warn('Background Script通知失敗:', msgError);
        }
      }
      
    } catch (degradationError) {
      console.error('Graceful degradation実行エラー:', degradationError);
    }
    
    return null;
  }

  // エラー詳細取得
  getErrorDetails() {
    return {
      consecutiveErrors: this.consecutiveErrors,
      lastErrorTime: this.lastErrorTime,
      errorHistory: this.errorHistory.slice(-10), // 最新10件
      systemHealth: this.consecutiveErrors === 0 ? 'healthy' : 
                   this.consecutiveErrors < 3 ? 'warning' : 'critical'
    };
  }

  // エラーログクリア
  clearErrorHistory() {
    this.errorHistory = [];
    this.consecutiveErrors = 0;
    this.lastErrorTime = null;
    console.log('🧹 エラー履歴をクリアしました');
  }
}

// グローバルインスタンス
window.webMonitor = new WebMonitor();

console.log('🌐 WebMonitor loaded successfully');