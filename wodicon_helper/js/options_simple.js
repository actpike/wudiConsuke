// シンプルオプションページ用JavaScript
console.log('🚀 Simple options page script loaded');

// 基本動作確認
function showStatus(type, message, targetId = 'test-status') {
  const statusDiv = document.getElementById(targetId);
  statusDiv.className = `status ${type}`;
  statusDiv.textContent = message;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }, 3000);
}

// インラインテスト用関数
function inlineTest() {
  alert('インラインJavaScript動作確認');
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOMContentLoaded fired');
  document.getElementById('doc-ready').textContent = '✅ 完了';
  
  // Chrome APIの確認
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    document.getElementById('chrome-available').textContent = '✅ 利用可能';
    console.log('✅ Chrome APIs available');
  } else {
    document.getElementById('chrome-available').textContent = '❌ 利用不可';
    console.error('❌ Chrome APIs not available');
  }
  
  // イベントリスナー設定
  setupEventListeners();
});

function setupEventListeners() {
  console.log('🔧 Setting up event listeners');
  
  // インラインテスト
  const inlineBtn = document.getElementById('inline-test');
  if (inlineBtn) {
    inlineBtn.addEventListener('click', () => {
      console.log('🔧 Inline test button clicked');
      inlineTest();
    });
    console.log('✅ Inline test button listener added');
  }
  
  // 基本ボタンテスト
  const basicBtn = document.getElementById('basic-test');
  if (basicBtn) {
    basicBtn.addEventListener('click', () => {
      console.log('🔍 Basic button clicked');
      showStatus('success', '✅ 基本ボタン動作正常');
    });
    console.log('✅ Basic button listener added');
  } else {
    console.error('❌ Basic button not found');
  }
  
  // コンソールテスト
  const consoleBtn = document.getElementById('console-test');
  if (consoleBtn) {
    consoleBtn.addEventListener('click', () => {
      console.log('📝 Console test button clicked');
      console.warn('⚠️ Warning message test');
      console.error('❌ Error message test');
      showStatus('success', '✅ コンソール出力完了 (F12で確認)');
    });
    console.log('✅ Console button listener added');
  }
  
  // ストレージテスト
  const storageBtn = document.getElementById('storage-test');
  if (storageBtn) {
    storageBtn.addEventListener('click', async () => {
      console.log('💾 Storage test button clicked');
      try {
        await chrome.storage.local.set({ test_key: 'test_value' });
        const result = await chrome.storage.local.get('test_key');
        if (result.test_key === 'test_value') {
          showStatus('success', '✅ ストレージ動作正常', 'api-status');
          console.log('✅ Storage test passed');
        } else {
          showStatus('error', '❌ ストレージ読み取り失敗', 'api-status');
        }
      } catch (error) {
        console.error('❌ Storage test error:', error);
        showStatus('error', '❌ ストレージエラー: ' + error.message, 'api-status');
      }
    });
    console.log('✅ Storage button listener added');
  }
  
  // 通知テスト
  const notificationBtn = document.getElementById('notification-test');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', async () => {
      console.log('🔔 Notification test button clicked');
      try {
        // ユニークIDで毎回新しい通知を作成
        const uniqueId = `simple_test_${Date.now()}`;
        await chrome.notifications.create(uniqueId, {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: '🔔 テスト通知',
          message: `シンプル通知テストが正常に動作しています。\n時刻: ${new Date().toLocaleTimeString()}`
        });
        showStatus('success', '✅ 通知送信完了', 'api-status');
        console.log('✅ Notification test passed with ID:', uniqueId);
      } catch (error) {
        console.error('❌ Notification test error:', error);
        showStatus('error', '❌ 通知エラー: ' + error.message, 'api-status');
      }
    });
    console.log('✅ Notification button listener added');
  }
}

// グローバルエラーハンドラー
window.addEventListener('error', (e) => {
  console.error('🔥 Global Error:', e.error);
  console.error('🔥 Error details:', e.message, 'at', e.filename, ':', e.lineno);
  showStatus('error', '❌ JavaScript エラー: ' + e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('🔥 Unhandled Promise Rejection:', e.reason);
  showStatus('error', '❌ Promise エラー: ' + e.reason);
});

console.log('✅ Simple options page script setup complete');