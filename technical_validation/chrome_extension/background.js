// WodiConsuke Technical Validation - Background Script

// 拡張機能インストール時の初期化
chrome.runtime.onInstalled.addListener(async () => {
  console.log('WodiConsuke Technical Validation installed');
  
  // 初期設定の保存テスト
  await testStorageBasicFunction();
  
  // 定期監視の設定テスト
  await testAlarmSetup();
  
  // 通知機能のテスト
  await testNotificationPermission();
});

// ストレージ基本機能のテスト
async function testStorageBasicFunction() {
  try {
    const testData = {
      validation_timestamp: Date.now(),
      test_string: "技術検証テストデータ",
      test_array: [1, 2, 3],
      test_object: { name: "テスト作品", played: false }
    };
    
    await chrome.storage.local.set({ validation_test: testData });
    const result = await chrome.storage.local.get('validation_test');
    
    console.log('✅ Storage Basic Test:', result);
    return true;
  } catch (error) {
    console.error('❌ Storage Basic Test Failed:', error);
    return false;
  }
}

// アラーム機能のテスト
async function testAlarmSetup() {
  try {
    // 15分間隔のアラーム設定（最小値1分を15分に設定）
    await chrome.alarms.create('wodicon_monitor', {
      delayInMinutes: 1, // テスト用に1分
      periodInMinutes: 15
    });
    
    console.log('✅ Alarm Setup Test: Success');
    return true;
  } catch (error) {
    console.error('❌ Alarm Setup Test Failed:', error);
    return false;
  }
}

// 通知権限のテスト
async function testNotificationPermission() {
  try {
    await chrome.notifications.create('validation_test', {
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      title: 'WodiConsuke 技術検証',
      message: '通知機能の動作確認テストです'
    });
    
    console.log('✅ Notification Test: Success');
    return true;
  } catch (error) {
    console.error('❌ Notification Test Failed:', error);
    return false;
  }
}

// アラーム実行時の処理
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'wodicon_monitor') {
    console.log('🔍 Monitoring alarm triggered');
    await testWodiconSiteAccess();
  }
});

// ウディコン公式サイトアクセステスト
async function testWodiconSiteAccess() {
  try {
    const response = await fetch('https://silversecond.com/WolfRPGEditor/Contest/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const text = await response.text();
      console.log('✅ Wodicon Site Access Test: Success');
      console.log('📄 Response length:', text.length);
      
      // HTMLの基本的な解析テスト
      const hasContestData = text.includes('コンテスト') || text.includes('contest');
      console.log('📊 Contains contest data:', hasContestData);
      
      return { success: true, length: text.length, hasContestData };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Wodicon Site Access Test Failed:', error);
    return { success: false, error: error.message };
  }
}

// ストレージ容量テスト
async function testStorageCapacity() {
  try {
    const testData = {};
    const largeString = 'a'.repeat(1024); // 1KB
    
    // 1MBずつテストデータを追加
    for (let i = 0; i < 1000; i++) {
      testData[`test_${i}`] = largeString;
    }
    
    await chrome.storage.local.set({ capacity_test: testData });
    console.log('✅ Storage Capacity Test: 1MB stored successfully');
    
    // 使用量確認
    const usage = await chrome.storage.local.getBytesInUse();
    console.log('📊 Storage usage:', usage, 'bytes');
    
    return { success: true, usage };
  } catch (error) {
    console.error('❌ Storage Capacity Test Failed:', error);
    return { success: false, error: error.message };
  }
}

// メッセージハンドリング
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'test_storage_capacity') {
    testStorageCapacity().then(sendResponse);
    return true; // 非同期レスポンス
  }
  
  if (request.action === 'test_site_access') {
    testWodiconSiteAccess().then(sendResponse);
    return true;
  }
  
  if (request.action === 'test_file_protocol') {
    // file://プロトコルテスト（content scriptから呼び出し）
    chrome.tabs.create({ 
      url: 'file:///C:/', 
      active: false 
    }).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});