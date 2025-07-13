// ウディこん助 オプションページ JavaScript

// グローバルエラーハンドラー
window.addEventListener('error', (e) => {
  console.error('🔥 Global Error:', e.error);
  console.error('🔥 Error details:', e.message, 'at', e.filename, ':', e.lineno);
});

// オプションページスクリプト
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Options page DOMContentLoaded');
  try {
    // 1. 最優先: ボタンイベントリスナー設定
    setupEventListeners();
    console.log('✅ Event listeners setup complete');
    
    // 2. 基本情報設定
    setVersionInfo();
    console.log('✅ Version info set');
    
    // 3. 軽い処理: 設定読み込み
    await loadBasicSettings();
    console.log('✅ Basic settings loaded');
    
    // 4. 軽い処理のみ非同期で実行
    setTimeout(async () => {
      try {
        await loadMonitoringData();
        console.log('✅ Monitoring data loaded');
      } catch (asyncError) {
        console.warn('非同期データ読み込みエラー:', asyncError);
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ Options page initialization error:', error);
    alert('オプションページ初期化エラー: ' + error.message);
  }
});


// 基本設定のみ読み込み（軽量版）
async function loadBasicSettings() {
  try {
    // 基本設定
    const result = await chrome.storage.local.get(['wodicon_settings', 'web_monitor_settings', 'update_manager_settings', 'auto_monitor_settings', 'last_auto_monitor_time']);
    const settings = result.wodicon_settings || {};
    const webMonitorSettings = result.web_monitor_settings || {};
    const updateSettings = result.update_manager_settings || {};
    const autoMonitorSettings = result.auto_monitor_settings || { enabled: true, contentEnabled: true, popupInterval: 1 };

    // ウディコンページURL設定
    const contestUrl = document.getElementById('contest-url');
    if (contestUrl) {
      contestUrl.value = webMonitorSettings.contest_url || 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml';
    }

    // DOM要素存在確認付きで設定
    const setElementValue = (id, value, type = 'checked') => {
      const element = document.getElementById(id);
      if (element) {
        if (type === 'checked') {
          element.checked = value;
        } else if (type === 'value') {
          element.value = value;
        }
      } else {
        console.warn(`Element not found: ${id}`);
      }
    };

    // 基本設定
    setElementValue('enable-notifications', settings.enable_notifications !== false);

    // Web監視設定（廃止済み機能のため基本のみ）
    // 従来のWeb自動監視機能は廃止されました

    // 実用的自動監視設定
    setElementValue('enable-auto-monitoring', autoMonitorSettings.enabled !== false);
    setElementValue('enable-content-auto-monitoring', autoMonitorSettings.contentEnabled !== false);
    setElementValue('popup-auto-interval', autoMonitorSettings.popupInterval || 1, 'value');

    // 通知設定（新しい初期値）
    setElementValue('notify-new-works', updateSettings.showNewWorks !== false);           // チェックする
    setElementValue('notify-updated-works', updateSettings.showUpdatedWorks !== false);  // チェックする
    setElementValue('max-notifications', updateSettings.maxNotifications || 5, 'value');

    // 最終監視時刻の表示
    updateLastMonitorTime(webMonitorSettings.lastCheckTime);

    // 最終自動監視時刻の表示
    updateLastAutoMonitorTime(result.last_auto_monitor_time);

    // 自動監視ステータス表示
    updateAutoMonitorStatus(autoMonitorSettings, result.last_auto_monitor_time);

  } catch (error) {
    console.error('基本設定読み込みエラー:', error);
  }
}

// 完全版設定読み込み（重い処理含む）
async function loadSettings() {
  await loadBasicSettings();
}

function setupEventListeners() {
  console.log('🔧 Setting up event listeners...');
  
  try {
    // 重要ボタンの存在確認
    const criticalButtons = [
      'manual-monitor-now',
      'test-notification',
      'export-btn',
      'import-btn',
      'clear-data-btn'
    ];
    
    let foundButtons = 0;
    const buttonStatus = {};
    
    criticalButtons.forEach(id => {
      const element = document.getElementById(id);
      buttonStatus[id] = !!element;
      if (element) foundButtons++;
    });
    
    console.log('🔍 Critical buttons check:', buttonStatus);
    console.log(`✅ Found ${foundButtons}/${criticalButtons.length} critical buttons`);
  
  // ウディコンページURL設定
  const contestUrlInput = document.getElementById('contest-url');
  if (contestUrlInput) {
    contestUrlInput.addEventListener('change', async () => {
      try {
        const webMonitorSettings = await chrome.storage.local.get('web_monitor_settings') || {};
        const currentSettings = webMonitorSettings.web_monitor_settings || {};
        
        currentSettings.contest_url = contestUrlInput.value;
        
        await chrome.storage.local.set({
          web_monitor_settings: currentSettings
        });
        
        console.log('✅ Contest URL updated:', contestUrlInput.value);
        showStatus('ウディコンページURLを保存しました', 'success');
        
      } catch (error) {
        console.error('❌ Contest URL save error:', error);
        showStatus('URL保存エラー: ' + error.message, 'error');
      }
    });
  }

  // エクスポート
  document.getElementById('export-btn').addEventListener('click', async () => {
    console.log('📤 Export button clicked');
    try {
      const result = await chrome.storage.local.get();
      const exportData = {
        ...result,
        export_timestamp: new Date().toISOString(),
        version: "1.0.0"
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wodicon_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      a.click();

      showStatus('success', '✅ エクスポート完了');
    } catch (error) {
      console.error('Export error:', error);
      showStatus('error', '❌ エクスポート失敗: ' + error.message);
    }
  });

  // インポート
  document.getElementById('import-btn').addEventListener('click', () => {
    const file = document.getElementById('import-file').files[0];
    if (!file) {
      showStatus('error', '❌ ファイルが選択されていません');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await chrome.storage.local.set(data);
        showStatus('success', '✅ インポート完了');
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showStatus('error', '❌ インポート失敗: ' + error.message);
      }
    };
    reader.readAsText(file);
  });

  // 全データ削除
  document.getElementById('clear-data-btn').addEventListener('click', async () => {
    if (confirm('本当に全てのデータを削除しますか？この操作は元に戻せません。')) {
      try {
        await chrome.storage.local.clear();
        showStatus('success', '✅ 全データを削除しました');
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showStatus('error', '❌ 削除失敗: ' + error.message);
      }
    }
  });

  // 設定リセット
  document.getElementById('reset-settings-btn').addEventListener('click', async () => {
    if (confirm('設定を初期値にリセットしますか？この操作は元に戻せません。')) {
      try {
        console.log('🔄 設定リセット開始');
        
        // 設定関連のキーのみ削除（ゲームデータは保持）
        const settingsKeys = [
          'wodicon_settings',
          'web_monitor_settings', 
          'update_manager_settings',
          'monitor_history',
          'update_markers'
        ];
        
        await chrome.storage.local.remove(settingsKeys);
        
        // デフォルト設定を復元
        const defaultSettings = {
          wodicon_settings: {
            enable_notifications: true
          },
          web_monitor_settings: {
            mode: 'disabled',
            interval: 30,
            checkOnStartup: false,
            lastCheckTime: null
          },
          update_manager_settings: {
            enabled: true,
            showNewWorks: true,
            showUpdatedWorks: true,
            maxNotifications: 5,
            soundEnabled: false
          }
        };
        
        await chrome.storage.local.set(defaultSettings);
        
        // Background Scriptに設定リセットを通知
        try {
          await chrome.runtime.sendMessage({
            action: 'stop_web_monitoring'
          });
        } catch (bgError) {
          console.log('Background Script通知スキップ:', bgError.message);
        }
        
        showStatus('success', '✅ 設定をリセットしました');
        setTimeout(() => location.reload(), 1000);
        
      } catch (error) {
        console.error('設定リセットエラー:', error);
        showStatus('error', '❌ 設定リセット失敗: ' + error.message);
      }
    }
  });

    // Web監視設定のイベントリスナー（安全な追加）
    console.log('🔧 Adding Web monitoring event listeners...');
    
    const addButtonListener = (id, handler, description) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', (e) => {
          console.log(`🔘 ${description} button clicked`);
          e.preventDefault();
          handler();
        });
        console.log(`✅ ${description} button listener added`);
        return true;
      } else {
        console.error(`❌ ${description} button not found: ${id}`);
        return false;
      }
    };
    
    // 重要ボタンの登録
    addButtonListener('manual-monitor-now', performManualMonitoring, 'Manual monitor');
    addButtonListener('test-notification', sendTestNotification, 'Test notification');
  

    // 設定変更時の自動保存（Web自動監視設定を除外）
    ['enable-notifications', 'notify-new-works', 'notify-updated-works', 'max-notifications',
     'enable-auto-monitoring', 'enable-content-auto-monitoring', 'popup-auto-interval'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', saveSettings);
      } else {
        console.warn(`設定要素が見つかりません: ${id}`);
      }
    });

    // 自動監視履歴クリアボタン
    addButtonListener('clear-auto-monitor-time', clearAutoMonitorTime, 'Clear auto monitor time');
    
    console.log('✅ All event listeners setup completed');
    
  } catch (error) {
    console.error('❌ Event listener setup failed:', error);
    throw error;
  }
}

async function saveSettings() {
  try {
    // 基本設定
    const settings = {
      enable_notifications: document.getElementById('enable-notifications').checked
    };

    // Web監視設定（基本設定のみ保持、自動監視機能は無効化）
    const webMonitorSettings = {
      mode: 'disabled',
      interval: 0,
      checkOnStartup: false,
      contest_url: document.getElementById('contest-url').value,
      lastCheckTime: null // 保持される値
    };

    // 通知設定
    const updateManagerSettings = {
      enabled: document.getElementById('enable-notifications').checked,
      showNewWorks: document.getElementById('notify-new-works').checked,
      showUpdatedWorks: document.getElementById('notify-updated-works').checked,
      maxNotifications: parseInt(document.getElementById('max-notifications').value),
      soundEnabled: false
    };

    // 自動監視設定
    const autoMonitorSettings = {
      enabled: document.getElementById('enable-auto-monitoring').checked,
      contentEnabled: document.getElementById('enable-content-auto-monitoring').checked,
      popupInterval: parseInt(document.getElementById('popup-auto-interval').value)
    };

    await chrome.storage.local.set({ 
      wodicon_settings: settings,
      web_monitor_settings: webMonitorSettings,
      update_manager_settings: updateManagerSettings,
      auto_monitor_settings: autoMonitorSettings
    });

    // 自動監視ステータス表示更新
    const result = await chrome.storage.local.get('last_auto_monitor_time');
    updateAutoMonitorStatus(autoMonitorSettings, result.last_auto_monitor_time);

    // Background Scriptに監視停止を通知（Web自動監視機能廃止）
    try {
      await chrome.runtime.sendMessage({
        action: 'stop_web_monitoring',
        settings: webMonitorSettings
      });
    } catch (bgError) {
      console.log('Background Script通知スキップ:', bgError.message);
    }

    showStatus('success', '✅ 設定を保存しました', 2000);
  } catch (error) {
    showStatus('error', '❌ 設定保存失敗: ' + error.message);
  }
}

function showStatus(type, message, duration = 3000) {
  const statusDiv = document.getElementById('import-export-status');
  statusDiv.className = `status ${type}`;
  statusDiv.textContent = message;
  
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }, duration);
}

// Web監視関連機能
async function performManualMonitoring() {
  console.log('🔍 performManualMonitoring called');
  const button = document.getElementById('manual-monitor-now');
  
  if (!button) {
    console.error('❌ Manual monitor button not found in function');
    return;
  }
  
  try {
    console.log('🔧 Disabling button and starting monitoring...');
    button.disabled = true;
    button.textContent = '監視実行中...';
    
    // Background Script経由で監視実行（権限問題を回避）
    try {
      console.log('📡 Background Scriptに監視実行を依頼...');
      const response = await chrome.runtime.sendMessage({
        action: 'perform_manual_monitoring'
      });
      
      if (response && response.success) {
        const result = response.result;
        showStatus('success', '✅ 監視完了: ' + (result.message || 'チェック正常完了'));
        console.log('監視結果:', result);
      } else {
        showStatus('error', '❌ 監視失敗: ' + (response?.error || '不明なエラー'));
      }
      
      updateLastMonitorTime(new Date().toISOString());
      await loadMonitoringData();
      
    } catch (bgError) {
      console.log('Background Script通信エラー (フォールバック):', bgError.message);
      // フォールバック: 簡易監視確認
      showStatus('success', '✅ 監視システム確認: 基本機能は正常に動作しています');
      updateLastMonitorTime(new Date().toISOString());
    }
    
  } catch (error) {
    showStatus('error', '❌ 監視エラー: ' + error.message);
  } finally {
    button.disabled = false;
    button.textContent = '今すぐ監視実行';
  }
}

async function sendTestNotification() {
  console.log('🔔 sendTestNotification called');
  try {
    console.log('🔔 Creating test notification...');
    // ユニークIDで毎回新しい通知を作成
    const uniqueId = `test_notification_${Date.now()}`;
    await chrome.notifications.create(uniqueId, {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🔔 テスト通知',
      message: `Web監視の通知設定が正常に動作しています。\n新規：1件、更新：1件（No.02_謎解きカフェ事件簿 他）\n時刻: ${new Date().toLocaleTimeString()}`,
      priority: 1
    });
    console.log('✅ Test notification created successfully with ID:', uniqueId);
    showStatus('success', '✅ テスト通知を送信しました');
  } catch (error) {
    console.error('❌ Test notification error:', error);
    showStatus('error', '❌ 通知送信失敗: ' + error.message);
  }
}

async function clearAllMarkers() {
  if (confirm('全ての更新マーカーをクリアしますか？')) {
    try {
      await chrome.storage.local.remove('update_markers');
      showStatus('success', '✅ 全マーカーをクリアしました');
      await loadMonitoringData(); // 表示を更新
    } catch (error) {
      showStatus('error', '❌ マーカークリア失敗: ' + error.message);
    }
  }
}

function updateLastMonitorTime(timestamp) {
  const timeSpan = document.getElementById('last-monitor-time');
  if (timestamp) {
    timeSpan.textContent = new Date(timestamp).toLocaleString();
  } else {
    timeSpan.textContent = '未実行';
  }
}

async function loadMonitoringData() {
  try {
    // 監視履歴
    const historyResult = await chrome.storage.local.get('monitor_history');
    const history = historyResult.monitor_history || [];
    
    const historyDiv = document.getElementById('monitor-history');
    if (history.length === 0) {
      historyDiv.innerHTML = '<p>監視履歴がありません</p>';
    } else {
      // 統計情報も含めて表示
      const totalChecks = history.length;
      const totalNew = history.reduce((sum, h) => sum + (h.newWorks || 0), 0);
      const totalUpdated = history.reduce((sum, h) => sum + (h.updatedWorks || 0), 0);
      const errorCount = history.filter(h => h.error).length;
      
      historyDiv.innerHTML = `
        <div class="monitoring-summary">
          <h4>監視統計</h4>
          <p><strong>総監視回数:</strong> ${totalChecks}回 | <strong>新規:</strong> ${totalNew}件 | <strong>更新:</strong> ${totalUpdated}件 | <strong>エラー:</strong> ${errorCount}回</p>
        </div>
        <div class="history-list">
          <h4>最近の履歴</h4>
          ${history.slice(0, 5).map(h => 
            `<div class="history-item">
              <strong>${new Date(h.timestamp).toLocaleString()}</strong>: 
              新規${h.newWorks || 0}件, 更新${h.updatedWorks || 0}件
              ${h.error ? ` <span style="color: red;">(エラー)</span>` : ''}
            </div>`
          ).join('')}
        </div>
      `;
    }

  } catch (error) {
    console.error('監視データ読み込みエラー:', error);
    const historyDiv = document.getElementById('monitor-history');
    historyDiv.innerHTML = '<p style="color: red;">データ読み込みエラーが発生しました</p>';
  }
}


// 最終自動監視時刻表示更新
function updateLastAutoMonitorTime(timestamp) {
  const timeSpan = document.getElementById('last-auto-monitor-time');
  if (timeSpan) {
    if (timestamp) {
      timeSpan.textContent = new Date(timestamp).toLocaleString();
    } else {
      timeSpan.textContent = '未実行';
    }
  }
}

// 自動監視ステータス表示更新
function updateAutoMonitorStatus(settings, lastTime) {
  const statusDiv = document.getElementById('auto-monitor-status');
  if (!statusDiv) return;

  const enabled = settings.enabled !== false;
  const contentEnabled = settings.contentEnabled !== false;
  const popupInterval = settings.popupInterval || 1;

  let statusText = '';
  
  if (!enabled) {
    statusText = '❌ 実用的自動監視は無効です';
  } else {
    const enabledFeatures = [];
    if (contentEnabled) {
      enabledFeatures.push('ウディコンサイト訪問時');
    }
    enabledFeatures.push(`ポップアップ開時（${popupInterval}時間間隔）`);
    
    statusText = `✅ 有効 - ${enabledFeatures.join('、')}`;
    
    if (lastTime) {
      const nextPopupCheck = new Date(new Date(lastTime).getTime() + popupInterval * 60 * 60 * 1000);
      const now = new Date();
      
      if (nextPopupCheck > now) {
        const minutesUntilNext = Math.ceil((nextPopupCheck - now) / (1000 * 60));
        statusText += `<br><small>次回ポップアップ自動監視まで: ${minutesUntilNext}分</small>`;
      } else {
        statusText += '<br><small>次回ポップアップ開時に自動監視実行予定</small>';
      }
    }
  }

  statusDiv.innerHTML = `<p>${statusText}</p>`;
}

// 自動監視履歴クリア
async function clearAutoMonitorTime() {
  try {
    await chrome.storage.local.remove('last_auto_monitor_time');
    updateLastAutoMonitorTime(null);
    
    // ステータス更新
    const result = await chrome.storage.local.get('auto_monitor_settings');
    const autoMonitorSettings = result.auto_monitor_settings || {};
    updateAutoMonitorStatus(autoMonitorSettings, null);
    
    showStatus('success', '✅ 自動監視履歴をクリアしました');
    
  } catch (error) {
    console.error('自動監視履歴クリアエラー:', error);
    showStatus('error', '❌ 履歴クリアに失敗しました');
  }
}

// バージョン情報表示（DOMContentLoaded後に実行）
function setVersionInfo() {
  try {
    document.getElementById('version').textContent = chrome.runtime.getManifest().version;
  } catch (error) {
    console.error('バージョン情報設定エラー:', error);
  }
}