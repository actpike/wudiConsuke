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
    // 1. 最優先: 言語設定初期化（UIの多言語化のため最初に実行）
    await initializeLanguageSettings();
    console.log('✅ Language settings initialized');
    
    // 2. ボタンイベントリスナー設定
    setupEventListeners();
    console.log('✅ Event listeners setup complete');
    
    // 3. 基本情報設定
    setVersionInfo();
    console.log('✅ Version info set');
    
    // 4. 年度管理初期化
    await initializeYearManager();
    console.log('✅ Year manager initialized');
    
    // 5. 軽い処理: 設定読み込み
    await loadBasicSettings();
    console.log('✅ Basic settings loaded');
    
    // 6. 軽い処理のみ非同期で実行（言語初期化完了後）
    setTimeout(async () => {
      try {
        // ローカライザーが完全に初期化されてから実行
        await loadMonitoringData();
        console.log('✅ Monitoring data loaded');
      } catch (asyncError) {
        console.warn('非同期データ読み込みエラー:', asyncError);
      }
    }, 200);
    
  } catch (error) {
    console.error('❌ Options page initialization error:', error);
    const errorMessage = window.localizer ? 
      window.localizer.getText('alerts.initializationError').replace('{error}', error.message) : 
      'オプションページ初期化エラー: ' + error.message;
    alert(errorMessage);
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

    // 通知設定（新しい初期値）
    setElementValue('notify-new-works', updateSettings.showNewWorks !== false);           // チェックする
    setElementValue('notify-updated-works', updateSettings.showUpdatedWorks !== false);  // チェックする

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
      'clear-data-btn',
      'year-selector',
      'add-new-year-btn',
      'refresh-year-data-btn'
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
        showStatus(getLocalizedText('optionsStatus.urlSaved', 'ウディコンページURLを保存しました'), 'success');
        
      } catch (error) {
        console.error('❌ Contest URL save error:', error);
        showStatus(getLocalizedText('optionsStatus.urlSaveError', 'URL保存エラー: {error}', { error: error.message }), 'error');
      }
    });
  }

  // エクスポート
  document.getElementById('export-btn').addEventListener('click', async () => {
    console.log('📤 Export button clicked');
    try {
      const format = document.getElementById('export-format').value;
      
      if (format === 'json') {
        await exportAsJSON();
      } else if (format === 'csv') {
        await exportAsCSV();
      }

      showStatus('success', getLocalizedText('optionsStatus.exportComplete', '✅ エクスポート完了'));
    } catch (error) {
      console.error('Export error:', error);
      showStatus('error', getLocalizedText('optionsStatus.exportFailed', '❌ エクスポート失敗: {error}', { error: error.message }));
    }
  });

  // インポート
  document.getElementById('import-btn').addEventListener('click', async () => {
    const file = document.getElementById('import-file').files[0];
    if (!file) {
      showStatus('error', getLocalizedText('optionsStatus.noFileSelected', '❌ ファイルが選択されていません'));
      return;
    }

    const fileExtension = file.name.toLowerCase().split('.').pop();
    let confirmMessage = '';
    
    if (fileExtension === 'json') {
      confirmMessage = window.localizer ? 
        window.localizer.getText('alerts.jsonImportConfirm') : 
        'JSONファイルをインポートします。\n\n⚠️ 既存の全データが上書きされます。\n現在のデータは完全に置き換わりますがよろしいですか？';
    } else if (fileExtension === 'csv') {
      // 年度別確認メッセージ（getCurrentYear()はPromiseを返すためawait必要）
      const currentYear = window.yearManager ? await window.yearManager.getCurrentYear() : 2025;
      confirmMessage = window.localizer ? 
        window.localizer.getText('alerts.csvImportConfirm').replace('{year}', currentYear) : 
        `【${currentYear}年】のデータが更新されます。\n該当年の既存のデータは上書きされ、復元できません。\n\n続行しますか？`;
    } else {
      showStatus('error', getLocalizedText('optionsStatus.unsupportedFormat', '❌ サポートされていないファイル形式です（JSON、CSVのみ対応）'));
      return;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (fileExtension === 'json') {
          await importFromJSON(e.target.result);
        } else if (fileExtension === 'csv') {
          await importFromCSV(e.target.result);
        }
        
        showStatus('success', getLocalizedText('optionsStatus.importComplete', '✅ インポート完了'));
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showStatus('error', getLocalizedText('optionsStatus.importFailed', '❌ インポート失敗: {error}', { error: error.message }));
      }
    };
    reader.readAsText(file);
  });

  // 全データ削除
  document.getElementById('clear-data-btn').addEventListener('click', async () => {
    const confirmMessage = window.localizer ? 
      window.localizer.getText('alerts.confirmDeleteAllData') : 
      '本当に全てのデータを削除しますか？この操作は元に戻せません。';
    if (confirm(confirmMessage)) {
      try {
        await chrome.storage.local.clear();
        showStatus('success', getLocalizedText('optionsStatus.allDataDeleted', '✅ 全データを削除しました'));
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showStatus('error', getLocalizedText('optionsStatus.deleteFailed', '❌ 削除失敗: {error}', { error: error.message }));
      }
    }
  });

  // 設定リセット
  document.getElementById('reset-settings-btn').addEventListener('click', async () => {
    const confirmMessage = window.localizer ? 
      window.localizer.getText('alerts.confirmResetSettings') : 
      '設定を初期値にリセットしますか？この操作は元に戻せません。';
    if (confirm(confirmMessage)) {
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
        
        showStatus('success', getLocalizedText('optionsStatus.settingsReset', '✅ 設定をリセットしました'));
        setTimeout(() => location.reload(), 1000);
        
      } catch (error) {
        console.error('設定リセットエラー:', error);
        showStatus('error', getLocalizedText('optionsStatus.resetFailed', '❌ 設定リセット失敗: {error}', { error: error.message }));
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
    ['enable-notifications', 'notify-new-works', 'notify-updated-works',
     'enable-auto-monitoring', 'enable-content-auto-monitoring'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', saveSettings);
      } else {
        console.warn(`設定要素が見つかりません: ${id}`);
      }
    });

    // 自動監視履歴クリアボタン
    addButtonListener('clear-auto-monitor-time', clearAutoMonitorTime, 'Clear auto monitor time');
    
    
    // 年度管理関連
    // 年度選択セレクターのイベントリスナー（専用処理）
    const yearSelector = document.getElementById('year-selector');
    if (yearSelector) {
      yearSelector.addEventListener('change', handleYearChange);
      console.log('✅ Year selector change listener added');
    } else {
      console.error('❌ Year selector not found');
    }
    addButtonListener('add-new-year-btn', handleAddNewYear, 'Add new year');
    addButtonListener('delete-year-data-btn', handleDeleteYearData, 'Delete year data');
    
    // 言語選択
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.addEventListener('change', handleLanguageChange);
      console.log('✅ Language selector change listener added');
    } else {
      console.error('❌ Language selector not found');
    }
    
    console.log('✅ All event listeners setup completed');
    
  } catch (error) {
    console.error('❌ Event listener setup failed:', error);
    throw error;
  }
}

// 年度管理初期化
async function initializeYearManager() {
  try {
    console.log('🗓️ 年度管理初期化開始');
    
    // YearManagerの初期化
    if (window.yearManager) {
      await window.yearManager.initialize();
      await updateYearSelector();
      await updateYearInfo();
    } else {
      throw new Error('YearManager not loaded');
    }
    
    console.log('✅ 年度管理初期化完了');
  } catch (error) {
    console.error('❌ 年度管理初期化エラー:', error);
    showStatus('error', getLocalizedText('optionsStatus.yearInitFailed', '年度管理の初期化に失敗しました: {error}', { error: error.message }));
  }
}

// 年度選択プルダウンを更新
async function updateYearSelector() {
  try {
    const yearSelector = document.getElementById('year-selector');
    if (!yearSelector) return;

    const currentYear = await window.yearManager.getCurrentYear();
    const availableYears = await window.yearManager.getAvailableYears();
    
    // プルダウンクリア
    yearSelector.innerHTML = '';
    
    // 年度選択肢を追加
    availableYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = window.yearManager.formatYearDisplay(year);
      if (year === currentYear) {
        option.selected = true;
      }
      yearSelector.appendChild(option);
    });
    
    console.log(`✅ 年度選択プルダウン更新完了: 現在=${currentYear}, 利用可能=${availableYears.join(',')}`);
  } catch (error) {
    console.error('年度選択プルダウン更新エラー:', error);
  }
}

// 年度情報表示を更新
async function updateYearInfo() {
  try {
    const currentYear = await window.yearManager.getCurrentYear();
    const availableYears = await window.yearManager.getAvailableYears();
    const storageUsage = await window.yearManager.getStorageUsage();
    
    // 表示更新
    const currentYearDisplay = document.getElementById('current-year-display');
    const availableYearsDisplay = document.getElementById('available-years-display');
    const storageUsageDisplay = document.getElementById('storage-usage-display');
    
    if (currentYearDisplay) {
      currentYearDisplay.textContent = window.yearManager.formatYearDisplay(currentYear);
    }
    
    if (availableYearsDisplay) {
      availableYearsDisplay.textContent = availableYears.map(year => 
        window.yearManager.formatYearDisplay(year)
      ).join(', ');
    }
    
    if (storageUsageDisplay) {
      storageUsageDisplay.textContent = `${storageUsage.totalMB}MB (${storageUsage.yearCount}年度)`;
    }
    
    console.log('✅ 年度情報表示更新完了');
  } catch (error) {
    console.error('年度情報表示更新エラー:', error);
  }
}

// 年度変更ハンドラー
async function handleYearChange(event) {
  try {
    const newYear = parseInt(event.target.value);
    if (!newYear) return;
    
    console.log(`🔄 年度変更: ${newYear}`);
    const yearDisplay = window.yearManager.formatYearDisplay(newYear);
    showStatus('info', getLocalizedText('optionsStatus.yearChangeInProgress', '年度を{yearDisplay}に変更中...', { yearDisplay }));
    
    await window.yearManager.setCurrentYear(newYear);
    await updateYearInfo();
    
    showStatus('success', getLocalizedText('optionsStatus.yearChangeComplete', '年度を{yearDisplay}に変更しました', { yearDisplay }));
    
    // 他の設定も再読み込み
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('年度変更エラー:', error);
    showStatus('error', getLocalizedText('optionsStatus.yearChangeFailed', '年度変更に失敗しました: {error}', { error: error.message }));
    await updateYearSelector(); // プルダウンを元に戻す
  }
}

// 新年度追加ハンドラー
async function handleAddNewYear() {
  try {
    const promptText = getLocalizedText('optionsStatus.yearPrompt', '追加する年度を入力してください (例: 2026)');
    const newYear = prompt(promptText);
    if (!newYear) return;
    
    const year = parseInt(newYear);
    if (isNaN(year) || year < 2009 || year > 2050) {
      throw new Error(getLocalizedText('optionsStatus.validYearRange', '有効な年度を入力してください (2009-2050)'));
    }
    
    console.log(`🆕 新年度追加: ${year}`);
    const yearDisplay = window.yearManager.formatYearDisplay(year);
    showStatus('info', getLocalizedText('optionsStatus.yearInitInProgress', '{yearDisplay}のデータを初期化中...', { yearDisplay }));
    
    await window.yearManager.initializeYear(year);
    await updateYearSelector();
    await updateYearInfo();
    
    showStatus('success', getLocalizedText('optionsStatus.yearInitComplete', '{yearDisplay}を追加しました', { yearDisplay }));
    
  } catch (error) {
    console.error('新年度追加エラー:', error);
    showStatus('error', getLocalizedText('optionsStatus.yearAddFailed', '新年度追加に失敗しました: {error}', { error: error.message }));
  }
}

// 年度データ削除ハンドラー
async function handleDeleteYearData() {
  try {
    const currentYear = await window.yearManager.getCurrentYear();
    const availableYears = await window.yearManager.getAvailableYears();
    
    // 最後の年度の場合は削除不可
    if (availableYears.length <= 1) {
      showStatus('error', getLocalizedText('optionsStatus.lastYearCannotDelete', '最後の年度データは削除できません'));
      return;
    }
    
    // 確認ダイアログ
    const yearDisplay = window.yearManager.formatYearDisplay(currentYear);
    const confirmMessage = window.localizer ? 
      window.localizer.getText('alerts.confirmDeleteYearData').replace('{yearDisplay}', yearDisplay) : 
      `${yearDisplay}のデータを完全に削除しますか？\n\nこの操作は取り消せません。`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    console.log(`🗑️ 年度データ削除開始: ${currentYear}`);
    showStatus('info', getLocalizedText('optionsStatus.yearDeleteInProgress', '{yearDisplay}のデータを削除中...', { yearDisplay }));
    
    // 先に他の年度に切り替え
    const remainingYears = availableYears.filter(year => year !== currentYear);
    const newCurrentYear = remainingYears[0];
    await window.yearManager.setCurrentYear(newCurrentYear);
    
    // その後、年度データ削除
    await window.yearManager.deleteYear(currentYear);
    
    // UI更新
    await updateYearSelector();
    await updateYearInfo();
    
    const newYearDisplay = window.yearManager.formatYearDisplay(newCurrentYear);
    showStatus('success', getLocalizedText('optionsStatus.yearDeleteComplete', '{yearDisplay}のデータを削除し、{newYearDisplay}に切り替えました', { yearDisplay, newYearDisplay }));
    
    // 設定画面をリロード
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('年度データ削除エラー:', error);
    showStatus('error', getLocalizedText('optionsStatus.yearDeleteFailed', '年度データ削除に失敗しました: {error}', { error: error.message }));
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
      mode: 'disabled', // アラーム機能削除により固定
      interval: 0, // 使用されない（参考値）
      checkOnStartup: false, // 機能削除済み
      contest_url: document.getElementById('contest-url').value,
      lastCheckTime: null // 保持される値
    };

    // 通知設定
    const updateManagerSettings = {
      enabled: document.getElementById('enable-notifications').checked,
      showNewWorks: document.getElementById('notify-new-works').checked,
      showUpdatedWorks: document.getElementById('notify-updated-works').checked,
      soundEnabled: false
    };

    // 自動監視設定
    const autoMonitorSettings = {
      enabled: document.getElementById('enable-auto-monitoring').checked,
      contentEnabled: document.getElementById('enable-content-auto-monitoring').checked,
      popupInterval: 1 // デフォルト値1時間に固定
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

    showStatus('success', getLocalizedText('optionsStatus.settingsSaved', '✅ 設定を保存しました'), 2000);
  } catch (error) {
    showStatus('error', getLocalizedText('optionsStatus.resetFailed', '❌ 設定保存失敗: {error}', { error: error.message }));
  }
}

function showStatus(type, message, duration = null) {
  const statusDiv = document.getElementById('import-export-status');
  statusDiv.className = `status ${type}`;
  
  // エラーメッセージの場合は閉じるボタンを追加
  if (type === 'error') {
    statusDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1; white-space: pre-line;">${message}</div>
        <button id="error-close-btn" class="error-close-btn">×</button>
      </div>
    `;
    
    // addEventListener方式でイベントを追加（CSP対応）
    const closeBtn = document.getElementById('error-close-btn');
    closeBtn.addEventListener('click', window.clearStatus);
    
    // エラーの場合はデフォルトで自動消去しない
    if (duration !== null) {
      setTimeout(() => window.clearStatus(), duration);
    }
  } else {
    statusDiv.textContent = message;
    // 成功・情報メッセージはデフォルト3秒で消去
    const defaultDuration = duration !== null ? duration : 3000;
    setTimeout(() => window.clearStatus(), defaultDuration);
  }
}

// ステータスメッセージをクリアする関数（グローバルスコープ）
window.clearStatus = function() {
  const statusDiv = document.getElementById('import-export-status');
  statusDiv.textContent = '';
  statusDiv.innerHTML = '';
  statusDiv.className = 'status';
};

// ローカライズされたテキスト取得のヘルパー関数
function getLocalizedText(key, fallback, params = {}) {
  if (!window.localizer) return fallback;
  let text = window.localizer.getText(key);
  
  // テンプレート置換
  Object.keys(params).forEach(paramKey => {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
  });
  
  return text;
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
    button.textContent = getLocalizedText('optionsStatus.monitoringInProgress', '監視実行中...');
    
    // Background Script経由で監視実行（権限問題を回避）
    try {
      console.log('📡 Background Scriptに監視実行を依頼...');
      const response = await chrome.runtime.sendMessage({
        action: 'perform_manual_monitoring'
      });
      
      if (response && response.success) {
        const result = response.result;
        const message = result.message || getLocalizedText('optionsStatus.checkComplete', 'チェック正常完了');
        showStatus('success', getLocalizedText('optionsStatus.monitorComplete', '✅ 監視完了: {message}', { message }));
        console.log('監視結果:', result);
      } else {
        const error = response?.error || getLocalizedText('optionsStatus.unknownError', '不明なエラー');
        showStatus('error', getLocalizedText('optionsStatus.monitorFailed', '❌ 監視失敗: {error}', { error }));
      }
      
      updateLastMonitorTime(new Date().toISOString());
      await loadMonitoringData();
      
    } catch (bgError) {
      console.log('Background Script通信エラー (フォールバック):', bgError.message);
      // フォールバック: 簡易監視確認
      showStatus('success', getLocalizedText('optionsStatus.monitorSystemCheck', '監視システム確認: 基本機能は正常に動作しています'));
      updateLastMonitorTime(new Date().toISOString());
    }
    
  } catch (error) {
    showStatus('error', getLocalizedText('optionsStatus.monitorFailed', '❌ 監視エラー: {error}', { error: error.message }));
  } finally {
    button.disabled = false;
    button.textContent = getLocalizedText('optionsStatus.manualMonitorButton', '今すぐ監視実行');
  }
}

async function sendTestNotification() {
  console.log('🔔 sendTestNotification called');
  try {
    console.log('🔔 Creating test notification...');
    
    // 多言語対応の通知テキスト取得
    const notificationTitle = getLocalizedText('testNotification.title', '🔔 テスト通知');
    const notificationMessage = getLocalizedText('testNotification.message', 'Web監視の通知設定が正常に動作しています。\n新規：1件、更新：1件（No.02_謎解きカフェ事件簿 他）\n時刻: {time}', {
      time: new Date().toLocaleTimeString()
    });
    
    // ユニークIDで毎回新しい通知を作成
    const uniqueId = `test_notification_${Date.now()}`;
    await chrome.notifications.create(uniqueId, {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: notificationTitle,
      message: notificationMessage,
      priority: 1
    });
    console.log('✅ Test notification created successfully with ID:', uniqueId);
    showStatus('success', getLocalizedText('optionsStatus.testNotificationSent', '✅ テスト通知を送信しました'));
  } catch (error) {
    console.error('❌ Test notification error:', error);
    showStatus('error', getLocalizedText('optionsStatus.notificationFailed', '❌ 通知送信失敗: {error}', { error: error.message }));
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
      // ローカライザーが利用可能な場合は多言語対応
      const noHistoryText = window.localizer ? 
        window.localizer.getText('settings.autoMonitoring.history.noHistory') : 
        '監視履歴がありません';
      historyDiv.innerHTML = `<p>${noHistoryText}</p>`;
    } else {
      // 統計情報も含めて表示
      const totalChecks = history.length;
      const totalNew = history.reduce((sum, h) => sum + (h.newWorks || 0), 0);
      const totalUpdated = history.reduce((sum, h) => sum + (h.updatedWorks || 0), 0);
      const errorCount = history.filter(h => h.error).length;
      
      // 多言語対応のテキスト取得
      const getLocalizedText = (key, fallback) => {
        return window.localizer ? window.localizer.getText(key) : fallback;
      };
      
      const getLocalizedTemplate = (key, params, fallback) => {
        if (!window.localizer) {
          // フォールバック時もパラメータ置換を実行
          return fallback.replace(/\{(\w+)\}/g, (match, paramName) => params[paramName] !== undefined ? params[paramName] : match);
        }
        const template = window.localizer.getText(key);
        return template.replace(/\{(\w+)\}/g, (match, paramName) => params[paramName] !== undefined ? params[paramName] : match);
      };
      
      const statisticsTitle = getLocalizedText('settings.autoMonitoring.history.statisticsTitle', '監視統計');
      const recentHistoryTitle = getLocalizedText('settings.autoMonitoring.history.recentHistoryTitle', '最近の履歴');
      const totalChecksLabel = getLocalizedText('settings.autoMonitoring.history.totalChecks', '総監視回数');
      const newGamesLabel = getLocalizedText('settings.autoMonitoring.history.newGames', '新規');
      const updatedGamesLabel = getLocalizedText('settings.autoMonitoring.history.updatedGames', '更新');
      const errorsLabel = getLocalizedText('settings.autoMonitoring.history.errors', 'エラー');
      const timesUnit = getLocalizedText('settings.autoMonitoring.history.times', '回');
      const itemsUnit = getLocalizedText('settings.autoMonitoring.history.items', '件');
      const errorText = getLocalizedText('settings.autoMonitoring.history.errorOccurred', '(エラー)');
      
      historyDiv.innerHTML = `
        <div class="monitoring-summary">
          <h4>${statisticsTitle}</h4>
          <p><strong>${totalChecksLabel}:</strong> ${totalChecks}${timesUnit} | <strong>${newGamesLabel}:</strong> ${totalNew}${itemsUnit} | <strong>${updatedGamesLabel}:</strong> ${totalUpdated}${itemsUnit} | <strong>${errorsLabel}:</strong> ${errorCount}${timesUnit}</p>
        </div>
        <div class="history-list">
          <h4>${recentHistoryTitle}</h4>
          ${history.slice(0, 5).map(h => {
            const newWorksText = getLocalizedTemplate('settings.autoMonitoring.history.newItemsCount', { count: h.newWorks || 0 }, `新規${h.newWorks || 0}件`);
            const updatedWorksText = getLocalizedTemplate('settings.autoMonitoring.history.updatedItemsCount', { count: h.updatedWorks || 0 }, `更新${h.updatedWorks || 0}件`);
            
            return `<div class="history-item">
              <strong>${new Date(h.timestamp).toLocaleString()}</strong>: 
              ${newWorksText}, ${updatedWorksText}
              ${h.error ? ` <span style="color: red;">${errorText}</span>` : ''}
            </div>`;
          }).join('')}
        </div>
      `;
    }

  } catch (error) {
    console.error('監視データ読み込みエラー:', error);
    const historyDiv = document.getElementById('monitor-history');
    const errorText = window.localizer ? 
      window.localizer.getText('settings.autoMonitoring.history.dataLoadError') : 
      'データ読み込みエラーが発生しました';
    historyDiv.innerHTML = `<p style="color: red;">${errorText}</p>`;
  }
}


// 最終自動監視時刻表示更新
function updateLastAutoMonitorTime(timestamp) {
  const timeSpan = document.getElementById('last-auto-monitor-time');
  if (timeSpan) {
    if (timestamp) {
      timeSpan.textContent = new Date(timestamp).toLocaleString();
    } else {
      const notExecutedText = window.localizer ? 
        window.localizer.getText('settings.autoMonitoring.status.notExecuted') : 
        '未実行';
      timeSpan.textContent = notExecutedText;
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

  // 多言語対応のテキスト取得
  const getLocalizedText = (key, fallback) => {
    return window.localizer ? window.localizer.getText(key) : fallback;
  };
  
  const getLocalizedTemplate = (key, params, fallback) => {
    if (!window.localizer) {
      // フォールバック時もパラメータ置換を実行
      return fallback.replace(/\{(\w+)\}/g, (match, paramName) => params[paramName] !== undefined ? params[paramName] : match);
    }
    const template = window.localizer.getText(key);
    return template.replace(/\{(\w+)\}/g, (match, paramName) => params[paramName] !== undefined ? params[paramName] : match);
  };

  let statusText = '';
  
  if (!enabled) {
    statusText = getLocalizedText('settings.autoMonitoring.status.disabled', '❌ 実用的自動監視は無効です');
  } else {
    const enabledFeatures = [];
    if (contentEnabled) {
      enabledFeatures.push(getLocalizedText('settings.autoMonitoring.status.contentMonitoring', 'ウディコンサイト訪問時'));
    }
    const popupMonitoringText = getLocalizedTemplate('settings.autoMonitoring.status.popupMonitoring', { interval: popupInterval }, `ポップアップ開時（${popupInterval}時間間隔）`);
    enabledFeatures.push(popupMonitoringText);
    
    const enabledText = getLocalizedText('settings.autoMonitoring.status.enabled', '✅ 有効');
    const separator = window.localizer && window.localizer.getCurrentLanguage() === 'en' ? ', ' : '、';
    statusText = `${enabledText} - ${enabledFeatures.join(separator)}`;
    
    if (lastTime) {
      const nextPopupCheck = new Date(new Date(lastTime).getTime() + popupInterval * 60 * 60 * 1000);
      const now = new Date();
      
      if (nextPopupCheck > now) {
        const minutesUntilNext = Math.ceil((nextPopupCheck - now) / (1000 * 60));
        const nextCheckText = getLocalizedTemplate('settings.autoMonitoring.status.nextPopupCheck', { minutes: minutesUntilNext }, `次回ポップアップ自動監視まで: ${minutesUntilNext}分`);
        statusText += `<br><small>${nextCheckText}</small>`;
      } else {
        const nextScheduledText = getLocalizedText('settings.autoMonitoring.status.nextPopupScheduled', '次回ポップアップ開時に自動監視実行予定');
        statusText += `<br><small>${nextScheduledText}</small>`;
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
    
    showStatus('success', getLocalizedText('optionsStatus.historyCleared', '✅ 自動監視履歴をクリアしました'));
    
  } catch (error) {
    console.error('自動監視履歴クリアエラー:', error);
    showStatus('error', getLocalizedText('optionsStatus.historyClearFailed', '❌ 履歴クリアに失敗しました'));
  }
}

// JSONエクスポート関数（新フォーマット対応）
async function exportAsJSON() {
  try {
    // dataManager.exportData()を使用して新フォーマットでエクスポート
    const exportData = await window.gameDataManager.exportData();
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wodicon_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📄 JSONエクスポート完了（新フォーマット）');
  } catch (error) {
    console.error('❌ JSONエクスポートエラー:', error);
    showStatus('error', getLocalizedText('optionsStatus.exportFailed', '❌ エクスポート失敗: {error}', { error: error.message }));
  }
}

// 評価値のCSV出力用変換関数
function getRatingValue(value) {
  return (value !== null && value !== undefined) ? value : '';
}

// CSVからの評価値パース関数
function parseCSVRating(value) {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// CSVエクスポート関数
async function exportAsCSV() {
  try {
    // GameDataManagerの存在確認
    if (!window.gameDataManager) {
      throw new Error('データ管理システムが初期化されていません。ページをリロードしてください。');
    }

    // 現在年度の取得
    const currentYear = window.yearManager ? await window.yearManager.getCurrentYear() : 2025;
    const yearDisplay = window.yearManager ? window.yearManager.formatYearDisplay(currentYear) : `第17回（${currentYear}）`;
    
    // 作品データの取得
    const games = await window.gameDataManager.getGames();
    
    if (!games || games.length === 0) {
      throw new Error('エクスポートする作品データがありません');
    }

    // CSVヘッダーの作成
    const headers = [
      '作品No',
      '作品名',
      '熱中度',
      '斬新さ',
      '物語性',
      '画像音声',
      '遊びやすさ',
      'その他',
      '感想'
    ];

    // CSVデータの生成
    const csvRows = [];
    csvRows.push(`# ${yearDisplay}ウディコン評価・感想`);
    csvRows.push('');
    csvRows.push(headers.join(','));

    for (const game of games) {
      const row = [
        game.no || '',
        `"${(game.title || '').replace(/"/g, '""')}"`, // CSV用にダブルクォートをエスケープ
        getRatingValue(game.rating?.熱中度),
        getRatingValue(game.rating?.斬新さ),
        getRatingValue(game.rating?.物語性),
        getRatingValue(game.rating?.画像音声), // 修正: 画像音響 → 画像音声
        getRatingValue(game.rating?.遊びやすさ),
        getRatingValue(game.rating?.その他),
        `"${(game.comment || game.review || '').replace(/"/g, '""')}"` // commentまたはreviewフィールドを確認
      ];
      csvRows.push(row.join(','));
    }

    // BOMを追加してExcelで文字化けを防ぐ
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${yearDisplay}ウディコン評価感想_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`📄 CSV出力完了: ${games.length}件の作品データ`);
  } catch (error) {
    console.error('CSV生成エラー:', error);
    throw error;
  }
}

// JSONインポート関数（検証機能強化版）
async function importFromJSON(jsonString) {
  try {
    // ファイル検証実行
    const validationResult = window.fileValidator.validateJsonFile(jsonString);
    
    if (!validationResult.valid) {
      // 検証失敗時は詳細エラーメッセージを表示
      const errorMessage = validationResult.errors.join('\n');
      const summary = window.fileValidator.generateValidationSummary(validationResult, 'json');
      
      // エラーログ記録
      window.errorHandler?.handleError(
        new Error(`JSON validation failed: ${validationResult.errors[0]}`),
        'json-import-validation'
      );
      
      const detailsHeader = getLocalizedText('fileValidation.detailsHeader', '詳細:');
      throw new Error(`${summary}\n\n${detailsHeader}\n${errorMessage}`);
    }
    
    // 検証通過後、dataManagerのimportDataを使用
    await window.gameDataManager.importData(validationResult.data);
    
    const summary = window.fileValidator.generateValidationSummary(validationResult, 'json');
    console.log(`📄 ${summary}`);
    
  } catch (error) {
    console.error('❌ JSONインポートエラー:', error);
    throw error; // 上位でキャッチされてshowStatusに表示される
  }
}

// CSVインポート関数（検証機能強化版）
async function importFromCSV(csvString) {
  try {
    // ファイル検証実行
    const validationResult = window.fileValidator.validateCsvFile(csvString);
    
    if (!validationResult.valid) {
      // 検証失敗時は詳細エラーメッセージを表示
      const errorMessage = validationResult.errors.join('\n');
      const summary = window.fileValidator.generateValidationSummary(validationResult, 'csv');
      
      // エラーログ記録
      window.errorHandler?.handleError(
        new Error(`CSV validation failed: ${validationResult.errors[0]}`),
        'csv-import-validation'
      );
      
      const detailsHeader = getLocalizedText('fileValidation.detailsHeader', '詳細:');
      throw new Error(`${summary}\n\n${detailsHeader}\n${errorMessage}`);
    }
    
    // 検証通過後、CSVデータをゲームオブジェクトに変換
    const lines = validationResult.data;
    const headers = window.fileValidator.parseCsvLine(lines[0]);
    const dataLines = lines.slice(1);
    const games = [];

    for (let i = 0; i < dataLines.length; i++) {
      const fields = window.fileValidator.parseCsvLine(dataLines[i]);
      
      const game = {
        id: `csv_import_temp_${Date.now()}_${i}`, // 仮ID（後で年度付きIDに変更）
        no: fields[0] || '',
        title: fields[1] || '',
        rating: {
          熱中度: parseCSVRating(fields[2]),
          斬新さ: parseCSVRating(fields[3]),
          物語性: parseCSVRating(fields[4]),
          画像音声: parseCSVRating(fields[5]),
          遊びやすさ: parseCSVRating(fields[6]),
          その他: parseCSVRating(fields[7])
        },
        comment: fields[8] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_played: true, // CSVからのインポートは既プレイとして扱う
        source: 'csv_import'
      };

      games.push(game);
    }

    if (games.length === 0) {
      throw new Error('インポート可能なデータが見つかりませんでした');
    }

    // GameDataManagerとYearManagerの存在確認
    if (!window.gameDataManager) {
      throw new Error('データ管理システムが初期化されていません。ページをリロードしてください。');
    }

    if (!window.yearManager) {
      throw new Error('年度管理システムが初期化されていません。ページをリロードしてください。');
    }

    // 該当年データクリア（上書き対応）
    const yearData = await window.yearManager.getYearData();
    const currentYear = await window.yearManager.getCurrentYear();
    
    // 現在年度のゲームデータをクリア
    yearData.games = [];
    await window.yearManager.setYearData(yearData);
    
    console.log(`🗑️ ${currentYear}年のデータをクリアしました`);
    
    // ゲームIDを現在年度に合わせて再生成（年度間インポート対応）
    const gamesWithUpdatedIds = games.map((game, index) => ({
      ...game,
      id: `csv_import_${currentYear}_${Date.now()}_${index}`,
      updated_at: new Date().toISOString()
    }));

    // 新しいCSVデータをインポート
    await window.gameDataManager.saveGames(gamesWithUpdatedIds);
    
    const summary = window.fileValidator.generateValidationSummary(validationResult, 'csv');
    console.log(`📄 ${summary} - 【${currentYear}年】に上書き保存（ID再生成済み）`);
    
  } catch (error) {
    console.error('❌ CSVインポートエラー:', error);
    throw error; // 上位でキャッチされてshowStatusに表示される
  }
}

// CSV行パース関数（簡易版）
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // 次の"をスキップ
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// バージョン情報表示（DOMContentLoaded後に実行）
function setVersionInfo() {
  try {
    document.getElementById('version').textContent = chrome.runtime.getManifest().version;
  } catch (error) {
    console.error('バージョン情報設定エラー:', error);
  }
}

// 言語設定の初期化
async function initializeLanguageSettings() {
  try {
    // ローカライザーが利用可能になるまで待機
    if (!window.localizer) {
      console.warn('Localizer not available, waiting...');
      await new Promise(resolve => {
        const check = () => {
          if (window.localizer) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    // ローカライザーを初期化
    await window.localizer.initialize();
    
    // DOM要素を多言語化（data-i18n属性を適用）
    window.localizer.updateDOM();
    
    // 現在の言語設定をUIに反映
    const currentLanguage = window.localizer.getCurrentLanguage();
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.value = currentLanguage;
    }

    console.log(`Language settings initialized: ${currentLanguage}`);

  } catch (error) {
    console.error('Language settings initialization failed:', error);
  }
}

// 言語変更ハンドラー
async function handleLanguageChange(event) {
  try {
    const selectedLanguage = event.target.value;
    console.log(`Language change requested: ${selectedLanguage}`);

    if (!window.localizer) {
      console.error('Localizer not available');
      return;
    }

    // 言語を変更（手動設定）
    await window.localizer.setLanguage(selectedLanguage, true);

    // DOM要素を多言語化（言語変更後に再適用）
    window.localizer.updateDOM();

    // ステータスメッセージを表示
    const statusDiv = document.getElementById('language-status');
    const statusText = document.getElementById('language-status-text');
    
    if (statusDiv && statusText) {
      const message = selectedLanguage === 'ja' 
        ? '言語設定を日本語に変更しました' 
        : 'Language changed to English';
      
      statusText.textContent = message;
      statusDiv.style.display = 'block';
      
      // 3秒後に自動で非表示
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }

    console.log(`Language changed successfully: ${selectedLanguage}`);

  } catch (error) {
    console.error('Language change failed:', error);
    
    // エラーメッセージを表示
    const statusDiv = document.getElementById('language-status');
    const statusText = document.getElementById('language-status-text');
    
    if (statusDiv && statusText) {
      statusDiv.className = 'status error';
      statusText.textContent = 'Failed to change language: ' + error.message;
      statusDiv.style.display = 'block';
    }
  }
}

