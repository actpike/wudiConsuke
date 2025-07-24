// ウディこん助 年度管理システム

class YearManager {
  constructor() {
    this.APP_SETTINGS_KEY = 'app_settings';
    this.DATA_PREFIX = 'wodicon_data_';
    this.BACKUP_PREFIX = 'backup_';
    this.DEFAULT_YEAR = 2025;
    this.TEST_YEARS = [2025, 2026]; // テスト用年度
  }

  // 初期化
  async initialize() {
    try {
      console.log('🗓️ YearManager 初期化開始');
      
      // アプリ設定の存在確認
      const appSettings = await this.getAppSettings();
      
      if (!appSettings) {
        console.log('📦 初回起動: 既存データを新構造に移行します');
        await this.migrateExistingData();
      }
      
      // テスト年度の初期化（開発用）
      await this.initializeTestYears();
      
      console.log('✅ YearManager 初期化完了');
      return true;
    } catch (error) {
      console.error('❌ YearManager 初期化エラー:', error);
      throw error;
    }
  }

  // アプリ設定取得
  async getAppSettings() {
    try {
      const result = await chrome.storage.local.get(this.APP_SETTINGS_KEY);
      return result[this.APP_SETTINGS_KEY] || null;
    } catch (error) {
      console.error('アプリ設定取得エラー:', error);
      return null;
    }
  }

  // アプリ設定保存
  async setAppSettings(settings) {
    try {
      await chrome.storage.local.set({
        [this.APP_SETTINGS_KEY]: settings
      });
      console.log('💾 アプリ設定保存完了:', settings);
    } catch (error) {
      console.error('アプリ設定保存エラー:', error);
      throw error;
    }
  }

  // 現在選択中の年度を取得
  async getCurrentYear() {
    try {
      const appSettings = await this.getAppSettings();
      return appSettings?.current_year || this.DEFAULT_YEAR;
    } catch (error) {
      console.error('現在年度取得エラー:', error);
      return this.DEFAULT_YEAR;
    }
  }

  // 年度を変更
  async setCurrentYear(year) {
    try {
      console.log(`🔄 年度変更: ${await this.getCurrentYear()} → ${year}`);
      
      // 指定年度のデータが存在するかチェック
      const availableYears = await this.getAvailableYears();
      if (!availableYears.includes(year)) {
        // テスト年度の場合は自動初期化
        if (this.TEST_YEARS.includes(year)) {
          console.log(`🧪 テスト年度 ${year} を自動初期化`);
          await this.initializeYear(year);
        } else {
          throw new Error(`指定された年度 ${year} のデータが存在しません`);
        }
      }

      // アプリ設定更新
      let appSettings = await this.getAppSettings();
      if (!appSettings) {
        appSettings = {
          current_year: this.DEFAULT_YEAR,
          available_years: [this.DEFAULT_YEAR],
          version: '1.0.3'
        };
      }
      appSettings.current_year = year;
      await this.setAppSettings(appSettings);

      console.log(`✅ 年度変更完了: ${year}`);
      return true;
    } catch (error) {
      console.error('年度変更エラー:', error);
      throw error;
    }
  }

  // 利用可能な年度一覧を取得
  async getAvailableYears() {
    try {
      const appSettings = await this.getAppSettings();
      return appSettings?.available_years || [this.DEFAULT_YEAR];
    } catch (error) {
      console.error('利用可能年度取得エラー:', error);
      return [this.DEFAULT_YEAR];
    }
  }

  // 新年度データを初期化
  async initializeYear(year) {
    try {
      console.log(`🆕 新年度データ初期化: ${year}`);
      
      const dataKey = this.DATA_PREFIX + year;
      const initialData = {
        games: [],
        web_monitor_settings: {
          interval: 30,
          mode: 'all',
          selectedWorks: [],
          checkOnStartup: false,
          lastCheckTime: null
        },
        auto_monitor_settings: {
          enabled: true,
          popupInterval: 1
        },
        last_auto_monitor_time: null,
        monitor_history: [],
        metadata: {
          created_at: new Date().toISOString(),
          version: '1.0.3',
          year: year
        }
      };

      // 年度データ保存
      await chrome.storage.local.set({
        [dataKey]: initialData
      });

      // 利用可能年度リストに追加
      let appSettings = await this.getAppSettings();
      if (!appSettings) {
        appSettings = {
          current_year: this.DEFAULT_YEAR,
          available_years: [this.DEFAULT_YEAR],
          version: '1.0.3'
        };
      }
      if (!appSettings.available_years.includes(year)) {
        appSettings.available_years.push(year);
        appSettings.available_years.sort((a, b) => b - a); // 降順ソート
        await this.setAppSettings(appSettings);
      }

      console.log(`✅ 新年度データ初期化完了: ${year}`);
      return true;
    } catch (error) {
      console.error('新年度データ初期化エラー:', error);
      throw error;
    }
  }

  // 指定年度のデータを取得
  async getYearData(year = null) {
    try {
      const targetYear = year || await this.getCurrentYear();
      const dataKey = this.DATA_PREFIX + targetYear;
      
      const result = await chrome.storage.local.get(dataKey);
      return result[dataKey] || null;
    } catch (error) {
      console.error('年度データ取得エラー:', error);
      return null;
    }
  }

  // 指定年度のデータを保存
  async setYearData(data, year = null) {
    try {
      const targetYear = year || await this.getCurrentYear();
      const dataKey = this.DATA_PREFIX + targetYear;
      
      await chrome.storage.local.set({
        [dataKey]: data
      });
      
      console.log(`💾 年度データ保存完了: ${targetYear}`);
      return true;
    } catch (error) {
      console.error('年度データ保存エラー:', error);
      throw error;
    }
  }

  // 既存データを新構造に移行
  async migrateExistingData() {
    try {
      console.log('🔄 既存データ移行開始');
      
      // 移行前のバックアップ作成
      await this.createBackup();
      
      // 既存データ取得
      const existingKeys = [
        'wodicon_games',
        'wodicon_settings', 
        'wodicon_metadata',
        'web_monitor_settings',
        'auto_monitor_settings',
        'last_auto_monitor_time',
        'monitor_history'
      ];
      
      const existingData = await chrome.storage.local.get(existingKeys);
      
      // 2025年データとして新構造に変換
      const migratedData = {
        games: existingData.wodicon_games || [],
        web_monitor_settings: existingData.web_monitor_settings || {
          interval: 30,
          mode: 'all',
          selectedWorks: [],
          checkOnStartup: false,
          lastCheckTime: null
        },
        auto_monitor_settings: existingData.auto_monitor_settings || {
          enabled: true,
          popupInterval: 1
        },
        last_auto_monitor_time: existingData.last_auto_monitor_time || null,
        monitor_history: existingData.monitor_history || [],
        metadata: {
          ...existingData.wodicon_metadata,
          migrated_at: new Date().toISOString(),
          migrated_from: 'legacy_structure',
          year: this.DEFAULT_YEAR
        }
      };

      // 新構造でデータ保存
      await this.setYearData(migratedData, this.DEFAULT_YEAR);
      
      // アプリ設定初期化
      const appSettings = {
        current_year: this.DEFAULT_YEAR,
        available_years: [this.DEFAULT_YEAR],
        version: '1.0.0',
        migrated_at: new Date().toISOString()
      };
      
      await this.setAppSettings(appSettings);
      
      // 古いキーを削除
      await chrome.storage.local.remove(existingKeys);
      
      console.log('✅ 既存データ移行完了');
      return true;
    } catch (error) {
      console.error('❌ 既存データ移行エラー:', error);
      
      // 移行失敗時はバックアップから復旧
      await this.restoreFromBackup();
      throw error;
    }
  }

  // バックアップ作成
  async createBackup() {
    try {
      console.log('💾 データバックアップ作成中...');
      
      const allData = await chrome.storage.local.get(null);
      const backupKey = this.BACKUP_PREFIX + Date.now();
      
      await chrome.storage.local.set({
        [backupKey]: {
          data: allData,
          created_at: new Date().toISOString(),
          type: 'migration_backup'
        }
      });
      
      console.log(`✅ バックアップ作成完了: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
      throw error;
    }
  }

  // バックアップから復旧
  async restoreFromBackup() {
    try {
      console.log('🔄 バックアップから復旧中...');
      
      // 最新のバックアップを取得
      const allData = await chrome.storage.local.get(null);
      const backupKeys = Object.keys(allData).filter(key => key.startsWith(this.BACKUP_PREFIX));
      
      if (backupKeys.length === 0) {
        throw new Error('利用可能なバックアップが見つかりません');
      }
      
      // 最新のバックアップを選択
      const latestBackupKey = backupKeys.sort().pop();
      const backup = allData[latestBackupKey];
      
      // ストレージをクリアして復旧
      await chrome.storage.local.clear();
      await chrome.storage.local.set(backup.data);
      
      console.log(`✅ バックアップから復旧完了: ${latestBackupKey}`);
      return true;
    } catch (error) {
      console.error('バックアップ復旧エラー:', error);
      throw error;
    }
  }

  // 年度表示用文字列を生成
  formatYearDisplay(year) {
    const contestNumber = year - 2008; // 2009年が第1回
    return `第${contestNumber}回 (${year}年)`;
  }

  // ストレージ使用量を取得
  async getStorageUsage() {
    try {
      const usage = await chrome.storage.local.getBytesInUse();
      const availableYears = await this.getAvailableYears();
      
      return {
        totalBytes: usage,
        totalMB: (usage / 1024 / 1024).toFixed(2),
        yearCount: availableYears.length,
        availableYears: availableYears
      };
    } catch (error) {
      console.error('ストレージ使用量取得エラー:', error);
      return { totalBytes: 0, totalMB: '0.00', yearCount: 0, availableYears: [] };
    }
  }

  // テスト年度初期化（開発用）
  async initializeTestYears() {
    try {
      let appSettings = await this.getAppSettings();
      if (!appSettings) return;

      // 削除済み年度リストの初期化
      if (!appSettings.deleted_years) {
        appSettings.deleted_years = [];
      }

      let updated = false;
      for (const testYear of this.TEST_YEARS) {
        // 削除済み年度は復活させない
        if (appSettings.deleted_years.includes(testYear)) {
          console.log(`🚫 削除済み年度のため追加をスキップ: ${testYear}`);
          continue;
        }

        if (!appSettings.available_years.includes(testYear)) {
          // テスト年度が利用可能年度リストにない場合は追加
          appSettings.available_years.push(testYear);
          updated = true;
          console.log(`🧪 テスト年度追加: ${testYear}`);
        }
      }

      if (updated) {
        appSettings.available_years.sort((a, b) => b - a); // 降順ソート
        await this.setAppSettings(appSettings);
        console.log('📅 テスト年度初期化完了');
      }
    } catch (error) {
      console.error('❌ テスト年度初期化エラー:', error);
    }
  }

  // 年度データ削除
  async deleteYear(year) {
    try {
      console.log(`🗑️ 年度データ削除: ${year}`);
      
      // 削除対象の年度データキー
      const dataKey = this.DATA_PREFIX + year;
      
      // ストレージから年度データを削除
      await chrome.storage.local.remove(dataKey);
      console.log(`✅ ストレージから削除: ${dataKey}`);
      
      // アプリ設定から年度を削除
      let appSettings = await this.getAppSettings();
      if (appSettings && appSettings.available_years) {
        appSettings.available_years = appSettings.available_years.filter(y => y !== year);
        appSettings.available_years.sort((a, b) => b - a); // 降順ソート
        
        // 削除済み年度リストに追加（復活防止）
        if (!appSettings.deleted_years) {
          appSettings.deleted_years = [];
        }
        if (!appSettings.deleted_years.includes(year)) {
          appSettings.deleted_years.push(year);
          console.log(`📝 削除済み年度リストに追加: ${year}`);
        }
        
        await this.setAppSettings(appSettings);
        console.log(`✅ 利用可能年度リストから削除: ${year}`);
      }
      
      console.log(`✅ 年度データ削除完了: ${year}`);
      return true;
    } catch (error) {
      console.error(`❌ 年度データ削除エラー (${year}):`, error);
      throw error;
    }
  }

  // 削除済み年度リストをクリア（JSONインポート対応）
  async clearDeletedYears() {
    try {
      console.log('🔄 削除済み年度リストをクリア中...');
      
      let appSettings = await this.getAppSettings();
      if (appSettings) {
        const oldDeletedYears = appSettings.deleted_years || [];
        appSettings.deleted_years = [];
        await this.setAppSettings(appSettings);
        
        console.log(`✅ 削除済み年度リストクリア完了: [${oldDeletedYears.join(', ')}] → []`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ 削除済み年度リストクリアエラー:', error);
      throw error;
    }
  }
}

// グローバルインスタンス作成
if (typeof window !== 'undefined') {
  window.yearManager = new YearManager();
  console.log('🗓️ YearManager グローバルインスタンス作成完了');
  
  // デバッグ用グローバル関数
  window.clearDeletedYearsDebug = async () => {
    console.log('🛠️ [DEBUG] 削除済み年度リストを手動クリア...');
    const result = await window.yearManager.clearDeletedYears();
    if (result) {
      console.log('✅ [DEBUG] 削除済み年度リストクリア完了。ページをリロードしてください。');
      console.log('💡 [TIP] location.reload() を実行するか、F5でリロードしてください。');
    }
    return result;
  };
}