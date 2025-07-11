// WodiConsuke Technical Validation - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Validation popup loaded');
  
  // 初期化
  initializePopup();
  
  // ボタンイベントの設定
  setupEventListeners();
  
  // 自動でいくつかのテストを実行
  runInitialTests();
});

function initializePopup() {
  // 拡張機能の基本情報を表示
  chrome.runtime.getManifest().then = undefined; // Manifest V3対応
  const manifest = chrome.runtime.getManifest();
  logResult(`拡張機能バージョン: ${manifest.version}`);
}

function setupEventListeners() {
  // 個別テストボタン
  document.getElementById('test-site-access').addEventListener('click', testSiteAccess);
  document.getElementById('test-storage-basic').addEventListener('click', testStorageBasic);
  document.getElementById('test-storage-capacity').addEventListener('click', testStorageCapacity);
  document.getElementById('test-file-protocol').addEventListener('click', testFileProtocol);
  document.getElementById('test-notification').addEventListener('click', testNotification);
  document.getElementById('test-alarm').addEventListener('click', testAlarm);
  
  // 一括テスト
  document.getElementById('run-all-tests').addEventListener('click', runAllTests);
  document.getElementById('clear-results').addEventListener('click', clearResults);
}

async function runInitialTests() {
  logResult('🚀 初期テストを開始します...');
  
  // ストレージの基本動作確認
  await testStorageBasic();
  
  // ストレージ使用量確認
  await checkStorageUsage();
}

async function testSiteAccess() {
  logResult('🔍 ウディコン公式サイトアクセステスト開始...');
  setStatus('site-access-status', 'pending');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'test_site_access' });
    
    if (response.success) {
      setStatus('site-access-status', 'success');
      setStatus('cors-status', 'success');
      setStatus('html-parse-status', response.hasContestData ? 'success' : 'error');
      
      logResult(`✅ サイトアクセス成功 (${response.length} bytes)`);
      logResult(`📊 コンテストデータ検出: ${response.hasContestData ? 'あり' : 'なし'}`);
    } else {
      setStatus('site-access-status', 'error');
      setStatus('cors-status', 'error');
      logResult(`❌ サイトアクセス失敗: ${response.error}`);
    }
  } catch (error) {
    setStatus('site-access-status', 'error');
    logResult(`❌ サイトアクセステスト例外: ${error.message}`);
  }
}

async function testStorageBasic() {
  logResult('💾 ストレージ基本動作テスト開始...');
  setStatus('storage-basic-status', 'pending');
  
  try {
    const testData = {
      timestamp: Date.now(),
      message: '技術検証テスト',
      number: 12345,
      array: [1, 2, 3],
      object: { test: true }
    };
    
    // 書き込みテスト
    await chrome.storage.local.set({ popup_test: testData });
    
    // 読み込みテスト
    const result = await chrome.storage.local.get('popup_test');
    
    if (result.popup_test && result.popup_test.timestamp === testData.timestamp) {
      setStatus('storage-basic-status', 'success');
      logResult('✅ ストレージ基本動作: 正常');
    } else {
      throw new Error('データの整合性チェック失敗');
    }
  } catch (error) {
    setStatus('storage-basic-status', 'error');
    logResult(`❌ ストレージ基本動作テスト失敗: ${error.message}`);
  }
}

async function testStorageCapacity() {
  logResult('📊 ストレージ容量テスト開始...');
  setStatus('storage-capacity-status', 'pending');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'test_storage_capacity' });
    
    if (response.success) {
      setStatus('storage-capacity-status', 'success');
      logResult(`✅ ストレージ容量テスト成功: ${response.usage} bytes使用`);
      document.getElementById('storage-usage').textContent = `${Math.round(response.usage / 1024)} KB`;
    } else {
      setStatus('storage-capacity-status', 'error');
      logResult(`❌ ストレージ容量テスト失敗: ${response.error}`);
    }
  } catch (error) {
    setStatus('storage-capacity-status', 'error');
    logResult(`❌ ストレージ容量テスト例外: ${error.message}`);
  }
}

async function testFileProtocol() {
  logResult('📁 file://プロトコルアクセステスト開始...');
  setStatus('file-protocol-status', 'pending');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'test_file_protocol' });
    
    if (response.success) {
      setStatus('file-protocol-status', 'success');
      setStatus('file-permission-status', 'success');
      logResult('✅ file://プロトコルアクセス: 成功');
      logResult('💡 「ファイルのURLへのアクセスを許可する」が有効です');
    } else {
      setStatus('file-protocol-status', 'error');
      setStatus('file-permission-status', 'error');
      logResult(`❌ file://プロトコルアクセス失敗: ${response.error}`);
      logResult('⚠️ 拡張機能の詳細設定で「ファイルのURLへのアクセスを許可する」を有効にしてください');
    }
  } catch (error) {
    setStatus('file-protocol-status', 'error');
    logResult(`❌ file://プロトコルテスト例外: ${error.message}`);
  }
}

async function testNotification() {
  logResult('🔔 通知機能テスト開始...');
  setStatus('notification-status', 'pending');
  
  try {
    await chrome.notifications.create('popup_test', {
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      title: 'WodiConsuke 技術検証',
      message: 'ポップアップからの通知テストです'
    });
    
    setStatus('notification-status', 'success');
    logResult('✅ 通知機能: 正常動作');
  } catch (error) {
    setStatus('notification-status', 'error');
    logResult(`❌ 通知機能テスト失敗: ${error.message}`);
  }
}

async function testAlarm() {
  logResult('⏰ アラーム機能テスト開始...');
  setStatus('alarm-status', 'pending');
  
  try {
    // テスト用の短期アラーム
    await chrome.alarms.create('popup_test_alarm', {
      delayInMinutes: 0.1 // 6秒後
    });
    
    // アラーム一覧確認
    const alarms = await chrome.alarms.getAll();
    const hasTestAlarm = alarms.some(alarm => alarm.name === 'popup_test_alarm');
    
    if (hasTestAlarm) {
      setStatus('alarm-status', 'success');
      logResult('✅ アラーム機能: 正常動作');
      logResult(`📋 現在のアラーム数: ${alarms.length}`);
    } else {
      throw new Error('テストアラームが作成されませんでした');
    }
  } catch (error) {
    setStatus('alarm-status', 'error');
    logResult(`❌ アラーム機能テスト失敗: ${error.message}`);
  }
}

async function checkStorageUsage() {
  try {
    const usage = await chrome.storage.local.getBytesInUse();
    document.getElementById('storage-usage').textContent = `${Math.round(usage / 1024)} KB`;
    logResult(`📊 現在のストレージ使用量: ${usage} bytes`);
  } catch (error) {
    logResult(`❌ ストレージ使用量取得失敗: ${error.message}`);
  }
}

async function runAllTests() {
  logResult('🚀 全テスト実行開始...');
  
  const tests = [
    testSiteAccess,
    testStorageBasic,
    testStorageCapacity,
    testFileProtocol,
    testNotification,
    testAlarm
  ];
  
  for (const test of tests) {
    await test();
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5秒待機
  }
  
  logResult('🏁 全テスト実行完了');
  
  // 結果サマリー
  generateTestSummary();
}

function generateTestSummary() {
  const statuses = {
    'site-access-status': 'サイトアクセス',
    'storage-basic-status': 'ストレージ基本',
    'storage-capacity-status': 'ストレージ容量',
    'file-protocol-status': 'file://アクセス',
    'notification-status': '通知機能',
    'alarm-status': 'アラーム機能'
  };
  
  let passCount = 0;
  let totalCount = 0;
  
  logResult('\n📋 テスト結果サマリー:');
  
  Object.entries(statuses).forEach(([id, name]) => {
    const element = document.getElementById(id);
    const isPassed = element.classList.contains('success');
    totalCount++;
    if (isPassed) passCount++;
    
    logResult(`${isPassed ? '✅' : '❌'} ${name}: ${isPassed ? '成功' : '失敗'}`);
  });
  
  logResult(`\n🎯 成功率: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);
}

function setStatus(elementId, status) {
  const element = document.getElementById(elementId);
  element.className = `test-status ${status}`;
  
  switch (status) {
    case 'success':
      element.textContent = '✅';
      break;
    case 'error':
      element.textContent = '❌';
      break;
    case 'pending':
      element.innerHTML = '<div class="loading"></div>';
      break;
  }
}

function logResult(message) {
  const resultsDiv = document.getElementById('test-results');
  const timestamp = new Date().toLocaleTimeString();
  resultsDiv.innerHTML += `[${timestamp}] ${message}\n`;
  resultsDiv.scrollTop = resultsDiv.scrollHeight;
  
  console.log(message);
}

function clearResults() {
  document.getElementById('test-results').innerHTML = '';
  logResult('🧹 テスト結果をクリアしました');
}