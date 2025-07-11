// ウディこん助 バックグラウンドスクリプト

// 拡張機能インストール時の初期化
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🌊 ウディこん助 installed');
  
  try {
    // 初期設定
    await initializeSettings();
    
    // 通知権限チェック
    await checkNotificationPermission();
    
    console.log('✅ Background script initialized successfully');
  } catch (error) {
    console.error('❌ Background script initialization failed:', error);
  }
});

// 初期設定
async function initializeSettings() {
  const defaultSettings = {
    default_sort: 'updated_at',
    default_filter: 'all',
    list_view_mode: 'list',
    items_per_page: 10,
    enable_notifications: true,
    monitoring_interval: 30, // 分
    auto_backup_enabled: false,
    file_access_warned: false
  };

  const result = await chrome.storage.local.get('wodicon_settings');
  if (!result.wodicon_settings) {
    await chrome.storage.local.set({ wodicon_settings: defaultSettings });
    console.log('Default settings initialized');
  }
}

// 通知権限チェック
async function checkNotificationPermission() {
  try {
    await chrome.notifications.create('init_test', {
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      title: 'ウディこん助',
      message: '初期化完了しました'
    });
    
    // テスト通知を即座に削除
    setTimeout(() => {
      chrome.notifications.clear('init_test');
    }, 2000);
    
  } catch (error) {
    console.log('Notification permission not granted yet');
  }
}

// メッセージハンドリング
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openFolder':
      handleOpenFolder(request.path).then(sendResponse);
      return true;
      
    case 'openUrl':
      handleOpenUrl(request.url).then(sendResponse);
      return true;
      
    case 'exportData':
      handleExportData(request.data).then(sendResponse);
      return true;
      
    case 'showNotification':
      handleShowNotification(request.options).then(sendResponse);
      return true;
      
    case 'getStorageUsage':
      handleGetStorageUsage().then(sendResponse);
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// フォルダ開く処理
async function handleOpenFolder(folderPath) {
  try {
    if (!folderPath) {
      return { success: false, error: 'フォルダパスが指定されていません' };
    }

    // パス正規化
    const normalizedPath = folderPath.replace(/\\/g, '/');
    const fileUrl = normalizedPath.startsWith('file://') ? 
                   normalizedPath : 
                   `file:///${normalizedPath}`;

    const tab = await chrome.tabs.create({ 
      url: fileUrl, 
      active: false 
    });

    return { success: true, tabId: tab.id };
    
  } catch (error) {
    console.error('Failed to open folder:', error);
    return { 
      success: false, 
      error: 'フォルダを開けませんでした。ファイルアクセス権限を確認してください。' 
    };
  }
}

// URL開く処理
async function handleOpenUrl(url) {
  try {
    if (!url) {
      return { success: false, error: 'URLが指定されていません' };
    }

    const tab = await chrome.tabs.create({ 
      url: url, 
      active: true 
    });

    return { success: true, tabId: tab.id };
    
  } catch (error) {
    console.error('Failed to open URL:', error);
    return { success: false, error: 'URLを開けませんでした' };
  }
}

// データエクスポート処理
async function handleExportData(data) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `wodicon_data_${timestamp}.json`;

    const downloadId = await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    return { success: true, downloadId: downloadId };
    
  } catch (error) {
    console.error('Failed to export data:', error);
    return { success: false, error: 'データエクスポートに失敗しました' };
  }
}

// 通知表示処理
async function handleShowNotification(options) {
  try {
    const notificationId = await chrome.notifications.create({
      type: options.type || 'basic',
      iconUrl: options.iconUrl || 'assets/icon48.png',
      title: options.title || 'ウディこん助',
      message: options.message,
      priority: options.priority || 1
    });

    // 自動削除タイマー
    if (options.autoClose !== false) {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, options.duration || 5000);
    }

    return { success: true, notificationId: notificationId };
    
  } catch (error) {
    console.error('Failed to show notification:', error);
    return { success: false, error: '通知の表示に失敗しました' };
  }
}

// ストレージ使用量取得
async function handleGetStorageUsage() {
  try {
    const usage = await chrome.storage.local.getBytesInUse();
    const quota = 5 * 1024 * 1024; // 5MB
    
    return {
      success: true,
      usage: {
        used: usage,
        total: quota,
        percentage: Math.round((usage / quota) * 100),
        availableKB: Math.round((quota - usage) / 1024),
        usedKB: Math.round(usage / 1024)
      }
    };
    
  } catch (error) {
    console.error('Failed to get storage usage:', error);
    return { success: false, error: 'ストレージ使用量の取得に失敗しました' };
  }
}

// 通知クリック処理
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('Notification clicked:', notificationId);
  
  // 通知をクリアして拡張機能を開く
  chrome.notifications.clear(notificationId);
  chrome.action.openPopup();
});

// 通知ボタンクリック処理
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  console.log('Notification button clicked:', notificationId, buttonIndex);
  chrome.notifications.clear(notificationId);
});

// アラーム処理（将来の更新監視機能用）
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  switch (alarm.name) {
    case 'update_check':
      // 将来実装: 更新チェック処理
      handleUpdateCheck();
      break;
      
    case 'auto_backup':
      // 将来実装: 自動バックアップ処理
      handleAutoBackup();
      break;
      
    default:
      console.log('Unknown alarm:', alarm.name);
  }
});

// 更新チェック処理（将来実装用スケルトン）
async function handleUpdateCheck() {
  console.log('Update check triggered (not implemented yet)');
  // TODO: ウディコン公式サイトの更新チェック実装
}

// 自動バックアップ処理（将来実装用スケルトン）
async function handleAutoBackup() {
  console.log('Auto backup triggered (not implemented yet)');
  // TODO: 自動バックアップ機能実装
}

// コンテキストメニュー（将来実装用）
chrome.runtime.onInstalled.addListener(() => {
  // 将来実装: 右クリックメニューでの機能追加
  /*
  chrome.contextMenus.create({
    id: 'wodicon-helper',
    title: 'ウディこん助で管理',
    contexts: ['link'],
    targetUrlPatterns: ['*://silversecond.com/*']
  });
  */
});

// タブ更新検知（将来の更新監視機能用）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('silversecond.com')) {
    console.log('Wodicon page loaded:', tab.url);
    // TODO: 将来実装 - ページ内容の変更検知
  }
});

// エラーハンドリング
chrome.runtime.onStartup.addListener(() => {
  console.log('🌊 ウディこん助 service worker started');
});

chrome.runtime.onSuspend.addListener(() => {
  console.log('🌊 ウディこん助 service worker suspended');
});

// 未処理エラーキャッチ
self.addEventListener('error', (error) => {
  console.error('Background script error:', error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('🌊 ウディこん助 background script loaded');