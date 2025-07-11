// WodiConsuke Technical Validation - Options Script

document.addEventListener('DOMContentLoaded', () => {
  console.log('⚙️ Options page loaded');
  
  initializeOptionsPage();
  setupEventListeners();
  startResultsMonitoring();
});

function initializeOptionsPage() {
  logToDetailedLog('⚙️ オプションページ初期化開始');
  
  // 拡張機能情報の表示
  const manifest = chrome.runtime.getManifest();
  logToDetailedLog(`📦 拡張機能: ${manifest.name} v${manifest.version}`);
  logToDetailedLog(`🔧 Manifest Version: ${manifest.manifest_version}`);
  
  // 初期権限チェック
  checkPermissions();
}

function setupEventListeners() {
  // 結果更新
  document.getElementById('refresh-results').addEventListener('click', refreshResults);
  document.getElementById('export-results').addEventListener('click', exportResults);
  
  // ログ管理
  document.getElementById('clear-log').addEventListener('click', clearDetailedLog);
  document.getElementById('save-log').addEventListener('click', saveDetailedLog);
  
  // データ管理
  document.getElementById('export-data').addEventListener('click', exportTestData);
  document.getElementById('import-data').addEventListener('click', importTestData);
  
  // 権限確認
  document.getElementById('check-permissions').addEventListener('click', checkPermissions);
}

function startResultsMonitoring() {
  // 定期的に検証結果を更新
  setInterval(refreshResults, 5000); // 5秒ごと
  
  // 初回実行
  refreshResults();
}

async function refreshResults() {
  logToDetailedLog('🔄 検証結果を更新中...');
  
  try {
    // ストレージから検証結果を取得
    const results = await chrome.storage.local.get([
      'validation_test',
      'popup_test',
      'capacity_test',
      'analysis_results'
    ]);
    
    updateWebMonitoringResults(results);
    updateStorageResults(results);
    updateFileResults();
    updateNotificationResults();
    
    logToDetailedLog('✅ 検証結果更新完了');
  } catch (error) {
    logToDetailedLog(`❌ 検証結果更新エラー: ${error.message}`);
  }
}

function updateWebMonitoringResults(results) {
  const container = document.getElementById('web-monitoring-results');
  
  if (results.analysis_results) {
    const data = results.analysis_results;
    container.innerHTML = `
      <div class="test-result success">✅ サイトアクセス: 成功</div>
      <div class="test-result info">📊 URL: ${data.url}</div>
      <div class="test-result info">📄 タイトル: ${data.title}</div>
      <div class="test-result ${data.worksList ? 'success' : 'error'}">
        ${data.worksList ? '✅' : '❌'} 作品一覧検出: ${data.worksList ? '成功' : '失敗'}
      </div>
    `;
  } else {
    container.innerHTML = '<div class="test-result info">ウディコン公式ページでポップアップを開いてテストしてください</div>';
  }
}

function updateStorageResults(results) {
  const container = document.getElementById('storage-results');
  let html = '';
  
  if (results.validation_test) {
    html += '<div class="test-result success">✅ Background Script: 基本動作確認済み</div>';
  }
  
  if (results.popup_test) {
    html += '<div class="test-result success">✅ Popup Script: 基本動作確認済み</div>';
  }
  
  // 使用量確認
  chrome.storage.local.getBytesInUse().then(usage => {
    const usageKB = Math.round(usage / 1024);
    const usagePercent = Math.round((usage / (5 * 1024 * 1024)) * 100);
    
    html += `<div class="test-result info">📊 使用量: ${usage} bytes (${usageKB} KB, ${usagePercent}%)</div>`;
    
    if (results.capacity_test) {
      html += '<div class="test-result success">✅ 容量テスト: 完了</div>';
    }
    
    container.innerHTML = html || '<div class="test-result info">ストレージテスト未実行</div>';
  }).catch(error => {
    container.innerHTML = `<div class="test-result error">❌ ストレージ使用量取得エラー: ${error.message}</div>`;
  });
}

function updateFileResults() {
  const container = document.getElementById('file-results');
  
  // file://プロトコルの権限状態を確認
  // 注意: 実際の権限確認は困難なため、テスト実行結果に依存
  container.innerHTML = `
    <div class="test-result info">📁 ポップアップから file:// テストを実行してください</div>
    <div class="test-result info">⚠️ 「ファイルのURLへのアクセスを許可する」の設定が必要です</div>
  `;
}

function updateNotificationResults() {
  const container = document.getElementById('notification-results');
  
  // 通知権限の確認
  if ('Notification' in window) {
    const permission = Notification.permission;
    const permissionStatus = permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'info';
    
    container.innerHTML = `
      <div class="test-result ${permissionStatus}">
        ${permission === 'granted' ? '✅' : permission === 'denied' ? '❌' : '⏳'} 
        通知権限: ${permission}
      </div>
      <div class="test-result info">🔔 ポップアップから通知テストを実行してください</div>
    `;
  } else {
    container.innerHTML = '<div class="test-result error">❌ 通知API未対応</div>';
  }
}

async function exportResults() {
  try {
    logToDetailedLog('📤 検証結果をエクスポート中...');
    
    const results = await chrome.storage.local.get();
    const exportData = {
      timestamp: new Date().toISOString(),
      extension_info: chrome.runtime.getManifest(),
      validation_results: results,
      browser_info: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const filename = `wodicon_validation_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
    
    logToDetailedLog(`✅ エクスポート完了: ${filename}`);
  } catch (error) {
    logToDetailedLog(`❌ エクスポートエラー: ${error.message}`);
  }
}

async function exportTestData() {
  try {
    logToDetailedLog('📤 テストデータをエクスポート中...');
    
    const testData = {
      games: [
        { id: 1, title: 'テスト作品1', played: true, rating: 5, memo: '面白かった' },
        { id: 2, title: 'テスト作品2', played: false, rating: 0, memo: '' },
        { id: 3, title: 'テスト作品3', played: true, rating: 4, memo: 'まあまあ' }
      ],
      settings: {
        monitoring_interval: 15,
        notification_enabled: true,
        auto_backup: false
      },
      export_timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const filename = `wodicon_test_data_${Date.now()}.json`;
    
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
    
    document.getElementById('import-export-results').innerHTML = 
      '<div class="test-result success">✅ テストデータエクスポート完了</div>';
    
    logToDetailedLog(`✅ テストデータエクスポート完了: ${filename}`);
  } catch (error) {
    document.getElementById('import-export-results').innerHTML = 
      `<div class="test-result error">❌ エクスポートエラー: ${error.message}</div>`;
    logToDetailedLog(`❌ テストデータエクスポートエラー: ${error.message}`);
  }
}

function importTestData() {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files[0];
  
  if (!file) {
    document.getElementById('import-export-results').innerHTML = 
      '<div class="test-result error">❌ ファイルが選択されていません</div>';
    return;
  }
  
  logToDetailedLog(`📥 テストデータをインポート中: ${file.name}`);
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // データの妥当性チェック
      if (!importedData.games || !Array.isArray(importedData.games)) {
        throw new Error('無効なデータ形式: games配列が見つかりません');
      }
      
      // インポート処理（実際のアプリでは既存データとのマージ処理が必要）
      chrome.storage.local.set({ imported_test_data: importedData }).then(() => {
        document.getElementById('import-export-results').innerHTML = `
          <div class="test-result success">✅ インポート完了</div>
          <div class="test-result info">📊 作品数: ${importedData.games.length}</div>
          <div class="test-result info">⏰ エクスポート日時: ${importedData.export_timestamp}</div>
        `;
        
        logToDetailedLog(`✅ テストデータインポート完了: ${importedData.games.length}件の作品データ`);
      });
      
    } catch (error) {
      document.getElementById('import-export-results').innerHTML = 
        `<div class="test-result error">❌ インポートエラー: ${error.message}</div>`;
      logToDetailedLog(`❌ テストデータインポートエラー: ${error.message}`);
    }
  };
  
  reader.readAsText(file);
}

async function checkPermissions() {
  logToDetailedLog('🔐 権限状態を確認中...');
  
  const container = document.getElementById('permissions-check');
  const manifest = chrome.runtime.getManifest();
  
  let html = '<h4>📋 権限一覧:</h4>';
  
  // manifest.jsonの権限を確認
  if (manifest.permissions) {
    manifest.permissions.forEach(permission => {
      html += `<div class="test-result success">✅ ${permission}</div>`;
    });
  }
  
  if (manifest.host_permissions) {
    html += '<h4>🌐 ホスト権限:</h4>';
    manifest.host_permissions.forEach(host => {
      html += `<div class="test-result success">✅ ${host}</div>`;
    });
  }
  
  // 通知権限の確認
  if ('Notification' in window) {
    const notificationPermission = Notification.permission;
    const statusClass = notificationPermission === 'granted' ? 'success' : 
                       notificationPermission === 'denied' ? 'error' : 'info';
    html += `<div class="test-result ${statusClass}">🔔 通知権限: ${notificationPermission}</div>`;
  }
  
  container.innerHTML = html;
  
  logToDetailedLog('✅ 権限確認完了');
}

function logToDetailedLog(message) {
  const logArea = document.getElementById('detailed-log');
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  logArea.value += logEntry;
  logArea.scrollTop = logArea.scrollHeight;
  
  console.log(message);
}

function clearDetailedLog() {
  document.getElementById('detailed-log').value = '';
  logToDetailedLog('🧹 ログをクリアしました');
}

async function saveDetailedLog() {
  try {
    const logContent = document.getElementById('detailed-log').value;
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const filename = `wodicon_validation_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
    
    logToDetailedLog(`💾 ログ保存完了: ${filename}`);
  } catch (error) {
    logToDetailedLog(`❌ ログ保存エラー: ${error.message}`);
  }
}