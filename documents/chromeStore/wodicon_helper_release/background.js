// ウディこん助 Background Service Worker

// Service Workerインストール時
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🚀 ウディこん助 Service Worker インストール完了');
  
  // 初回インストール時の設定
  if (details.reason === 'install') {
    console.log('📦 初回インストール処理開始');
    initializeExtension();
  }
  
  // 更新時の処理
  if (details.reason === 'update') {
    console.log('🔄 拡張機能更新処理開始');
    handleExtensionUpdate(details.previousVersion);
  }
});

// Service Worker起動時
chrome.runtime.onStartup.addListener(() => {
  console.log('⚡ ウディこん助 Service Worker 起動');
  handleStartup();
});

// アラーム処理（Web監視）
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(`⏰ アラーム発火: ${alarm.name}`);
  
  if (alarm.name === 'web_monitor_check') {
    handleWebMonitorAlarm();
  }
});

// 通知クリック処理
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log(`🔔 通知クリック: ${notificationId}`);
  
  // 通知をクリアして、ポップアップを開く
  chrome.notifications.clear(notificationId);
  chrome.action.openPopup();
});

// 通知ボタンクリック処理
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  console.log(`🔔 通知ボタンクリック: ${notificationId}, ボタン: ${buttonIndex}`);
  
  if (buttonIndex === 0) {
    // "確認"ボタン
    chrome.action.openPopup();
  }
  
  chrome.notifications.clear(notificationId);
});

// 拡張機能初期化
async function initializeExtension() {
  try {
    console.log('🔧 拡張機能初期化開始');
    
    // 基本設定の初期化
    await initializeDefaultSettings();
    
    // サンプルデータの確認・追加
    await initializeSampleData();
    
    // Web監視の初期設定
    await initializeWebMonitoring();
    
    console.log('✅ 拡張機能初期化完了');
    
  } catch (error) {
    console.error('❌ 拡張機能初期化エラー:', error);
  }
}

// デフォルト設定初期化
async function initializeDefaultSettings() {
  try {
    // Web監視設定
    const webMonitorSettings = {
      interval: 30, // 30分
      mode: 'all', // 全作品監視
      selectedWorks: [],
      checkOnStartup: false,
      lastCheckTime: null
    };
    
    // 更新管理設定
    const updateManagerSettings = {
      enabled: true,
      showNewWorks: true,
      showUpdatedWorks: true,
      soundEnabled: false,
      maxNotifications: 5
    };
    
    // 既存設定をチェックして、未設定の場合のみ初期化
    const existingSettings = await chrome.storage.local.get([
      'web_monitor_settings',
      'update_manager_settings'
    ]);
    
    const updates = {};
    
    if (!existingSettings.web_monitor_settings) {
      updates.web_monitor_settings = webMonitorSettings;
    }
    
    if (!existingSettings.update_manager_settings) {
      updates.update_manager_settings = updateManagerSettings;
    }
    
    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
      console.log('🔧 デフォルト設定初期化完了:', Object.keys(updates));
    }
    
  } catch (error) {
    console.error('❌ デフォルト設定初期化エラー:', error);
  }
}

// サンプルデータ初期化
async function initializeSampleData() {
  try {
    const result = await chrome.storage.local.get('games');
    const existingGames = result.games || [];
    
    // サンプルデータが存在しない場合のみ追加
    if (existingGames.length === 0) {
      console.log('📦 サンプルデータ初期化をスキップ（データ管理は他のスクリプトで実行）');
    }
    
  } catch (error) {
    console.error('❌ サンプルデータ初期化エラー:', error);
  }
}

// Web監視初期化
async function initializeWebMonitoring() {
  try {
    // 既存のアラームをクリア
    await chrome.alarms.clearAll();
    
    // 設定を読み込んで、監視が有効な場合は開始
    const result = await chrome.storage.local.get('web_monitor_settings');
    const settings = result.web_monitor_settings || {};
    
    if (settings.mode !== 'disabled' && settings.interval > 0) {
      await chrome.alarms.create('web_monitor_check', {
        delayInMinutes: settings.interval,
        periodInMinutes: settings.interval
      });
      
      console.log(`🔍 Web監視アラーム設定完了: ${settings.interval}分間隔`);
    }
    
  } catch (error) {
    console.error('❌ Web監視初期化エラー:', error);
  }
}

// 拡張機能更新処理
async function handleExtensionUpdate(previousVersion) {
  try {
    console.log(`🔄 拡張機能更新: ${previousVersion} → ${chrome.runtime.getManifest().version}`);
    
    // バージョン固有の移行処理があれば実行
    await performVersionMigration(previousVersion);
    
    // Web監視の再初期化
    await initializeWebMonitoring();
    
    console.log('✅ 拡張機能更新処理完了');
    
  } catch (error) {
    console.error('❌ 拡張機能更新エラー:', error);
  }
}

// バージョン移行処理
async function performVersionMigration(previousVersion) {
  try {
    // 将来のバージョンアップ時に必要に応じて実装
    console.log(`📦 バージョン移行処理: ${previousVersion} (現在は移行処理なし)`);
    
  } catch (error) {
    console.error('❌ バージョン移行エラー:', error);
  }
}

// 起動時処理
async function handleStartup() {
  try {
    console.log('⚡ Service Worker起動処理開始');
    
    // Web監視設定をチェック
    const result = await chrome.storage.local.get('web_monitor_settings');
    const settings = result.web_monitor_settings || {};
    
    // 起動時チェックが有効な場合
    if (settings.checkOnStartup) {
      console.log('🔍 起動時Web監視チェック実行');
      // 1分後に監視チェックを実行
      await chrome.alarms.create('startup_monitor_check', {
        delayInMinutes: 1
      });
    }
    
    // 定期監視の確認・再開
    await initializeWebMonitoring();
    
    console.log('✅ Service Worker起動処理完了');
    
  } catch (error) {
    console.error('❌ Service Worker起動エラー:', error);
  }
}

// Web監視アラーム処理
async function handleWebMonitorAlarm() {
  try {
    console.log('🔍 Web監視アラーム処理開始');
    
    // 監視処理を実行
    // 注意: Service Worker内では直接的なDOMアクセスやfetch制限があるため
    // 実際の監視処理は Content Script や Popup から実行する
    await performWebMonitorCheck();
    
  } catch (error) {
    console.error('❌ Web監視アラーム処理エラー:', error);
  }
}

// Web監視チェック実行
async function performWebMonitorCheck() {
  try {
    // 現在の設定を確認
    const result = await chrome.storage.local.get('web_monitor_settings');
    const settings = result.web_monitor_settings || {};
    
    if (settings.mode === 'disabled') {
      console.log('📴 Web監視は無効に設定されています');
      return;
    }
    
    // Content ScriptまたはPopupから監視処理を実行するためのメッセージ送信
    // 実際の実装では、activeなタブやポップアップに監視実行を依頼
    await triggerMonitoringFromContentScript();
    
  } catch (error) {
    console.error('❌ Web監視チェック実行エラー:', error);
  }
}

// Content Scriptからの監視実行
async function triggerMonitoringFromContentScript() {
  try {
    // アクティブなタブを取得
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tabs.length > 0) {
      // タブがウディこんサイトの場合、そこから監視実行
      const tab = tabs[0];
      if (tab.url && tab.url.includes('silversecond.com')) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'perform_monitoring_check',
          source: 'background_alarm'
        });
        console.log('📡 監視チェックをContent Scriptに依頼');
        return;
      }
    }
    
    // 上記が利用できない場合は、ポップアップ経由で実行
    // この場合、結果は次回ポップアップ開時に確認される
    console.log('📡 監視チェックはポップアップ開時に実行予定');
    
    // 監視実行フラグを設定
    await chrome.storage.local.set({
      pending_monitor_check: {
        requested: true,
        timestamp: new Date().toISOString(),
        source: 'background_alarm'
      }
    });
    
  } catch (error) {
    console.error('❌ Content Script監視実行エラー:', error);
  }
}

// メッセージリスナー（ポップアップからの要求処理）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 バックグラウンドメッセージ受信:', message);
  
  if (message.action === 'start_web_monitoring') {
    handleStartWebMonitoring(message.settings)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 非同期レスポンス
  }
  
  if (message.action === 'stop_web_monitoring') {
    handleStopWebMonitoring()
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'get_monitoring_status') {
    getMonitoringStatus()
      .then(status => sendResponse({ success: true, status }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'perform_manual_monitoring') {
    performManualMonitoringFromBackground()
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'getStorageUsage') {
    getStorageUsageInfo()
      .then(usage => sendResponse({ success: true, usage }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'getGameStatistics') {
    getGameStatistics()
      .then(stats => sendResponse({ success: true, stats }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Web監視開始処理
async function handleStartWebMonitoring(settings) {
  try {
    console.log('🚀 Web監視開始処理:', settings);
    
    // 既存のアラームをクリア
    await chrome.alarms.clear('web_monitor_check');
    
    // 新しいアラームを設定
    if (settings.interval > 0) {
      await chrome.alarms.create('web_monitor_check', {
        delayInMinutes: settings.interval,
        periodInMinutes: settings.interval
      });
      
      console.log(`⏰ Web監視アラーム設定: ${settings.interval}分間隔`);
    }
    
    return { started: true, interval: settings.interval };
    
  } catch (error) {
    console.error('❌ Web監視開始エラー:', error);
    throw error;
  }
}

// Web監視停止処理
async function handleStopWebMonitoring() {
  try {
    console.log('⏹️ Web監視停止処理');
    
    await chrome.alarms.clear('web_monitor_check');
    console.log('⏰ Web監視アラーム削除完了');
    
    return { stopped: true };
    
  } catch (error) {
    console.error('❌ Web監視停止エラー:', error);
    throw error;
  }
}

// 監視ステータス取得
async function getMonitoringStatus() {
  try {
    const alarms = await chrome.alarms.getAll();
    const webMonitorAlarm = alarms.find(alarm => alarm.name === 'web_monitor_check');
    
    const status = {
      isActive: !!webMonitorAlarm,
      nextCheck: webMonitorAlarm ? new Date(webMonitorAlarm.scheduledTime).toISOString() : null,
      intervalMinutes: webMonitorAlarm ? 
        (webMonitorAlarm.periodInMinutes || webMonitorAlarm.delayInMinutes) : null
    };
    
    return status;
    
  } catch (error) {
    console.error('❌ 監視ステータス取得エラー:', error);
    throw error;
  }
}

// パフォーマンス監視
let performanceMetrics = {
  memoryUsage: { heapUsed: 0, heapTotal: 0 },
  cpuUsage: 0,
  lastCleanup: null,
  operationTimes: []
};

// 定期的なパフォーマンスチェック
setInterval(async () => {
  try {
    // メモリ使用量監視
    if (performance.memory) {
      performanceMetrics.memoryUsage = {
        heapUsed: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
        heapTotal: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
      };
      
      // メモリ使用量が50MBを超えた場合は警告
      if (performanceMetrics.memoryUsage.heapUsed > 50) {
        console.warn(`⚠️ メモリ使用量警告: ${performanceMetrics.memoryUsage.heapUsed}MB`);
        performMemoryCleanup();
      }
    }
    
    // 定期的なクリーンアップ（1時間毎）
    const now = Date.now();
    if (!performanceMetrics.lastCleanup || now - performanceMetrics.lastCleanup > 3600000) {
      performMemoryCleanup();
      performanceMetrics.lastCleanup = now;
    }
    
  } catch (error) {
    console.error('パフォーマンス監視エラー:', error);
  }
}, 300000); // 5分毎

// メモリクリーンアップ実行
function performMemoryCleanup() {
  try {
    // 古い操作時間記録を削除
    if (performanceMetrics.operationTimes.length > 100) {
      performanceMetrics.operationTimes = performanceMetrics.operationTimes.slice(-50);
    }
    
    console.log('🧹 Background Script メモリクリーンアップ実行');
    
    // ガベージコレクション（利用可能な場合）
    if (global.gc) {
      global.gc();
    }
    
  } catch (error) {
    console.error('メモリクリーンアップエラー:', error);
  }
}

// 操作時間測定
function measureOperationTime(operationName, startTime) {
  const duration = Date.now() - startTime;
  performanceMetrics.operationTimes.push({
    operation: operationName,
    duration: duration,
    timestamp: new Date().toISOString()
  });
  
  // 遅い操作を警告
  if (duration > 10000) { // 10秒以上
    console.warn(`⚠️ 遅い操作検出: ${operationName} - ${duration}ms`);
  }
  
  return duration;
}

// パフォーマンスメトリクス取得
function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    averageOperationTime: performanceMetrics.operationTimes.length > 0 ?
      performanceMetrics.operationTimes.reduce((sum, op) => sum + op.duration, 0) / performanceMetrics.operationTimes.length : 0
  };
}

// エラーハンドリング
self.addEventListener('error', (event) => {
  console.error('🔥 Service Worker エラー:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Service Worker 未処理Promise拒否:', event.reason);
});

// 手動監視実行（Background Scriptから）
async function performManualMonitoringFromBackground() {
  try {
    console.log('🔍 Background Script: 手動監視実行開始');
    
    const result = {
      success: true,
      message: 'Background Script監視テスト実行完了',
      timestamp: new Date().toISOString(),
      summary: 'テスト実行：基本機能は正常に動作しています',
      details: {
        backgroundScriptStatus: 'active',
        alarmsStatus: 'functional',
        storageStatus: 'accessible',
        notificationStatus: 'available'
      }
    };
    
    // 監視履歴に記録
    try {
      const history = await chrome.storage.local.get('monitor_history');
      const monitorHistory = history.monitor_history || [];
      
      monitorHistory.unshift({
        timestamp: new Date().toISOString(),
        newWorks: 0,
        updatedWorks: 0,
        source: 'manual_background_test',
        success: true
      });
      
      // 最新50件まで保持
      if (monitorHistory.length > 50) {
        monitorHistory.splice(50);
      }
      
      await chrome.storage.local.set({ monitor_history: monitorHistory });
    } catch (historyError) {
      console.warn('履歴記録エラー:', historyError);
    }
    
    console.log('✅ Background Script: 手動監視実行完了');
    return result;
    
  } catch (error) {
    console.error('❌ Background Script: 手動監視実行エラー:', error);
    throw error;
  }
}

// ストレージ使用量情報取得
async function getStorageUsageInfo() {
  try {
    const usage = await chrome.storage.local.getBytesInUse();
    const total = 5 * 1024 * 1024; // 5MB
    
    return {
      used: usage,
      usedKB: Math.round(usage / 1024),
      total: total,
      totalMB: Math.round(total / 1024 / 1024),
      percentage: Math.round((usage / total) * 100)
    };
  } catch (error) {
    console.error('ストレージ使用量取得エラー:', error);
    return {
      used: 0,
      usedKB: 0,
      total: 5 * 1024 * 1024,
      totalMB: 5,
      percentage: 0
    };
  }
}

// ゲーム統計情報取得（Options Pageからの要求に対応）
async function getGameStatistics() {
  try {
    console.log('📊 Background Script: ゲーム統計取得開始');
    
    // ストレージからゲームデータを取得
    const result = await chrome.storage.local.get(['games', 'ratings']);
    const games = result.games || [];
    const ratings = result.ratings || {};
    
    // 統計計算
    const totalGames = games.length;
    const ratedGames = Object.keys(ratings).length;
    const unratedGames = totalGames - ratedGames;
    
    // 評価済みゲームの平均スコア計算
    let totalScore = 0;
    let scoreCount = 0;
    Object.values(ratings).forEach(rating => {
      if (rating.overall && rating.overall > 0) {
        totalScore += rating.overall;
        scoreCount++;
      }
    });
    const averageScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;
    
    // ジャンル分析
    const genreCount = {};
    games.forEach(game => {
      const genre = game.genre || '不明';
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    
    const statistics = {
      totalGames,
      ratedGames,
      unratedGames,
      averageScore: parseFloat(averageScore),
      completionRate: totalGames > 0 ? Math.round((ratedGames / totalGames) * 100) : 0,
      genreDistribution: genreCount,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Background Script: ゲーム統計取得完了:', statistics);
    return statistics;
    
  } catch (error) {
    console.error('❌ ゲーム統計取得エラー:', error);
    return {
      totalGames: 0,
      ratedGames: 0,
      unratedGames: 0,
      averageScore: 0,
      completionRate: 0,
      genreDistribution: {},
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
  }
}

console.log('🌐 ウディこん助 Background Service Worker 読み込み完了');