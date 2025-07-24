// ウディこん助 データ管理システム

class GameDataManager {
  constructor() {
    // constants.jsの定数を使用（年度別アーキテクチャ対応）
    this.DATA_PREFIX = window.constants.STORAGE_KEYS.DATA_PREFIX;
    this.LEGACY_STORAGE_KEY = window.constants.STORAGE_KEYS.LEGACY_GAMES;
    this.LEGACY_SETTINGS_KEY = window.constants.STORAGE_KEYS.WODICON_SETTINGS;
    this.LEGACY_METADATA_KEY = 'wodicon_metadata';
    
    // 年度管理モードフラグ
    this.yearManagerMode = true;
  }

  // 年度別ストレージキー取得
  async getCurrentStorageKey() {
    if (!window.yearManager) {
      console.warn('YearManager not available, using legacy key');
      return this.LEGACY_STORAGE_KEY;
    }
    
    const currentYear = await window.yearManager.getCurrentYear();
    return this.DATA_PREFIX + currentYear;
  }

  // データ初期化
  async initialize() {
    try {
      // YearManagerが利用可能かチェック
      if (window.yearManager) {
        await window.yearManager.initialize();
      }
      
      const games = await this.getGames();
      if (games.length === 0) {
        await this.initializeSampleData();
      }
    } catch (error) {
      console.error('GameDataManager初期化エラー:', error);
    }
  }

  // ゲームデータ取得（年度別対応）
  async getGames() {
    try {
      if (!window.yearManager) {
        // フォールバック: レガシーキーから取得
        const result = await chrome.storage.local.get(this.LEGACY_STORAGE_KEY);
        return result[this.LEGACY_STORAGE_KEY] || [];
      }
      
      const yearData = await window.yearManager.getYearData();
      return yearData?.games || [];
    } catch (error) {
      console.error('Failed to get games:', error);
      return [];
    }
  }

  // 単一ゲーム取得
  async getGame(id) {
    const games = await this.getGames();
    return games.find(game => game.id == id) || null;
  }

  // 作品番号でゲーム取得
  async getGameByNo(no) {
    const games = await this.getGames();
    return games.find(game => game.no === no) || null;
  }

  // ゲーム追加（既存データ保護機能付き）
  async addGame(gameData) {
    const games = await this.getGames();
    
    // 同じ作品番号の既存データをチェック
    const existingGame = games.find(game => game.no === gameData.no);
    
    if (existingGame) {
      console.log(`🔒 既存データ保護: No.${gameData.no} の評価・コメントを保持`);
      
      // 既存の評価・コメントデータを保持してマージ
      const preservedData = {
        rating: existingGame.rating,
        review: existingGame.review,
        review_length: existingGame.review_length,
        is_played: existingGame.is_played,
        last_played: existingGame.last_played,
        version_status: existingGame.version_status
      };
      
      // 新しいデータで既存ゲームを更新（評価・コメントは保持）
      const mergedGame = {
        ...gameData,
        ...preservedData,
        id: existingGame.id,
        created_at: existingGame.created_at,
        updated_at: new Date().toISOString(),
        data_protected: true // 保護フラグ
      };
      
      const index = games.findIndex(game => game.id === existingGame.id);
      games[index] = mergedGame;
      
      await this.saveGames(games);
      await this.updateMetadata();
      
      console.log(`✅ データ保護マージ完了: No.${gameData.no} "${mergedGame.title}"`);
      return existingGame.id;
    }
    
    // 新規追加の場合
    const newId = Math.max(...games.map(g => g.id), 0) + 1;
    
    const newGame = {
      ...gameData,
      id: newId,
      no: gameData.no || String(newId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    games.push(newGame);
    await this.saveGames(games);
    await this.updateMetadata();
    
    console.log(`✅ 新規ゲーム追加: No.${newGame.no} "${newGame.title}"`);
    return newId;
  }

  // ゲーム更新
  async updateGame(id, updates) {
    const games = await this.getGames();
    const index = games.findIndex(game => game.id == id);
    
    if (index === -1) return false;

    games[index] = {
      ...games[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // 評価完了時の既プレイフラグ自動更新
    if (updates.rating && this.isRatingComplete(games[index].rating)) {
      games[index].is_played = true;
    }

    await this.saveGames(games);
    await this.updateMetadata();
    return true;
  }

  // ゲーム削除（安全確認付き）
  async deleteGame(id, options = {}) {
    const games = await this.getGames();
    const targetGame = games.find(game => game.id == id);
    
    if (!targetGame) return false;
    
    // 評価・コメントがある場合の安全確認
    const hasUserData = this.hasUserData(targetGame);
    
    if (hasUserData && !options.forceDelete && !options.isSystemDelete) {
      console.warn(`⚠️ 削除警告: No.${targetGame.no} "${targetGame.title}" には評価・コメントデータがあります`);
      
      // UI側で確認ダイアログを表示するためのエラーを投げる
      throw new Error(`CONFIRM_DELETE:この作品には評価・コメントが保存されています。\n\n作品: ${targetGame.title}\n評価: ${this.formatRating(targetGame.rating)}\n感想: ${targetGame.review ? targetGame.review.substring(0, 50) + '...' : 'なし'}\n\n本当に削除しますか？`);
    }
    
    const filteredGames = games.filter(game => game.id !== id);
    await this.saveGames(filteredGames);
    await this.updateMetadata();
    
    if (hasUserData) {
      console.log(`🗑️ 評価・コメント付きデータを削除: No.${targetGame.no} "${targetGame.title}"`);
    } else {
      console.log(`🗑️ データ削除: No.${targetGame.no} "${targetGame.title}"`);
    }
    
    return true;
  }
  
  // ユーザーデータ存在チェック
  hasUserData(game) {
    // 評価がnull初期値以外、またはコメントがある場合
    const defaultRating = Object.fromEntries(
      window.constants.RATING_CATEGORIES.map(category => [category, null])
    );
    defaultRating.total = 0;
    const hasCustomRating = JSON.stringify(game.rating) !== JSON.stringify(defaultRating);
    const hasReview = game.review && game.review.trim().length > 0;
    const isPlayed = game.is_played === true;
    
    return hasCustomRating || hasReview || isPlayed;
  }
  
  // 評価フォーマット
  formatRating(rating) {
    if (!rating) return '未評価';
    return `${rating.total || 6}/60点`;
  }

  // Web監視対象フラグ更新
  async updateWebMonitoringFlag(gameId, enabled) {
    try {
      const games = await this.getGames();
      const gameIndex = games.findIndex(game => game.id === gameId);
      
      if (gameIndex === -1) {
        throw new Error(`Game with id ${gameId} not found`);
      }
      
      games[gameIndex].web_monitoring_enabled = enabled;
      games[gameIndex].updated_at = new Date().toISOString();
      
      await this.saveGames(games);
      await this.updateMetadata();
      
      console.log(`🔄 Web監視フラグ更新: Game ${gameId} -> ${enabled}`);
      return true;
    } catch (error) {
      console.error('Failed to update web monitoring flag:', error);
      return false;
    }
  }

  // Web監視対象作品一覧取得
  async getMonitoringEnabledGames() {
    try {
      const games = await this.getGames();
      return games.filter(game => game.web_monitoring_enabled === true);
    } catch (error) {
      console.error('Failed to get monitoring enabled games:', error);
      return [];
    }
  }

  // 検索・フィルタ
  async searchGames(query) {
    const games = await this.getGames();
    const lowercaseQuery = query.toLowerCase();
    
    return games.filter(game => 
      game.title.toLowerCase().includes(lowercaseQuery) ||
      game.author.toLowerCase().includes(lowercaseQuery) ||
      game.genre.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterGames(filter) {
    const games = await this.getGames();
    
    switch (filter) {
      case 'played':
        return games.filter(game => game.is_played);
      case 'unplayed':
        return games.filter(game => !game.is_played);
      case 'new':
        return games.filter(game => game.version_status === 'new' || game.version_status === 'updated');
      case 'updated':
        return games.filter(game => game.version_status === 'updated');
      default:
        return games;
    }
  }

  // ソート
  async sortGames(field, order = 'asc') {
    const games = await this.getGames();
    
    return games.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      if (field === 'rating.total') {
        valueA = a.rating.total;
        valueB = b.rating.total;
      }
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (order === 'desc') {
        return valueB > valueA ? 1 : -1;
      }
      return valueA > valueB ? 1 : -1;
    });
  }

  // 統計情報取得
  async getStatistics() {
    const games = await this.getGames();
    const playedGames = games.filter(game => game.is_played);
    
    return {
      total_games: games.length,
      played_games: playedGames.length,
      unplayed_games: games.length - playedGames.length,
      total_score: playedGames.reduce((sum, game) => sum + (game.rating.total || 0), 0),
      average_score: playedGames.length > 0 ? 
        Math.round(playedGames.reduce((sum, game) => sum + (game.rating.total || 0), 0) / playedGames.length) : 0
    };
  }

  // ストレージ使用量取得
  async getStorageUsage() {
    try {
      const usage = await chrome.storage.local.getBytesInUse();
      return {
        used: usage,
        total: window.constants.LIMITS.STORAGE_LIMIT_BYTES,
        percentage: Math.round((usage / window.constants.LIMITS.STORAGE_LIMIT_BYTES) * 100)
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, total: window.constants.LIMITS.STORAGE_LIMIT_BYTES, percentage: 0 };
    }
  }

  // データエクスポート
  async exportData() {
    const games = await this.getGames();
    const settings = await this.getSettings();
    const metadata = await this.getMetadata();
    
    return {
      games,
      settings,
      metadata,
      export_timestamp: new Date().toISOString(),
      version: window.constants.VERSION_INFO.CURRENT
    };
  }

  // データインポート
  async importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // 古いフォーマット（wodicon_games）を新フォーマット（games）に変換
      let games = null;
      if (data.games && Array.isArray(data.games)) {
        // 新フォーマット
        games = data.games;
      } else if (data.wodicon_games && Array.isArray(data.wodicon_games)) {
        // 古いフォーマット（互換性対応）
        console.log('🔄 古いJSONフォーマットを検出、2025年データとして変換中...');
        games = data.wodicon_games;
        
        // 古いフォーマットのメタデータも変換
        if (data.wodicon_settings) data.settings = data.wodicon_settings;
        if (data.wodicon_metadata) data.metadata = data.wodicon_metadata;
        
        // 古いフォーマットインポート時は削除済み年度リストをクリア
        if (window.yearManager) {
          await window.yearManager.clearDeletedYears();
        }
      } else {
        throw new Error('Invalid data format: games array not found');
      }
      
      // gamesを新しいdataオブジェクトに設定
      data.games = games;

      // 年度別対応インポート
      if (window.yearManager) {
        const yearData = await window.yearManager.getYearData();
        if (yearData) {
          yearData.games = data.games;
          if (data.settings) yearData.settings = data.settings;
          if (data.metadata) yearData.metadata = data.metadata;
          await window.yearManager.setYearData(yearData);
        } else {
          // 年度データが存在しない場合は新規初期化
          const currentYear = await window.yearManager.getCurrentYear();
          await window.yearManager.initializeYear(currentYear);
          const newYearData = await window.yearManager.getYearData();
          newYearData.games = data.games;
          if (data.settings) newYearData.settings = data.settings;
          if (data.metadata) newYearData.metadata = data.metadata;
          await window.yearManager.setYearData(newYearData);
        }
      } else {
        // フォールバック: レガシー形式でインポート
        await chrome.storage.local.set({
          [this.LEGACY_STORAGE_KEY]: data.games,
          [this.LEGACY_SETTINGS_KEY]: data.settings || {},
          [this.LEGACY_METADATA_KEY]: data.metadata || {}
        });
      }

      await this.updateMetadata();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // 評価完了チェック（定数使用）
  isRatingComplete(rating) {
    if (!rating) return false;
    
    return window.constants.RATING_CATEGORIES.every(category => {
      const value = rating[category];
      // 「その他」だけは0以上、他は1以上
      const minValue = category === 'その他' ? 0 : 1;
      return value !== null && value !== undefined && value >= minValue;
    });
  }

  // 合計点計算（定数使用）
  calculateTotalRating(rating) {
    return window.constants.RATING_CATEGORIES.reduce((total, category) => {
      return total + (rating[category] || 0);
    }, 0);
  }

  // ゲームデータ保存（年度別対応）
  async saveGames(games) {
    try {
      if (!window.yearManager) {
        // フォールバック: レガシーキーに保存
        await chrome.storage.local.set({ [this.LEGACY_STORAGE_KEY]: games });
        return;
      }
      
      const yearData = await window.yearManager.getYearData();
      if (yearData) {
        yearData.games = games;
        await window.yearManager.setYearData(yearData);
      } else {
        // 年度データが存在しない場合は初期化
        const currentYear = await window.yearManager.getCurrentYear();
        await window.yearManager.initializeYear(currentYear);
        const newYearData = await window.yearManager.getYearData();
        newYearData.games = games;
        await window.yearManager.setYearData(newYearData);
      }
    } catch (error) {
      console.error('ゲームデータ保存エラー:', error);
      throw error;
    }
  }

  // 設定管理（年度別対応）
  async getSettings() {
    try {
      if (!window.yearManager) {
        // フォールバック: レガシーキーから取得
        const result = await chrome.storage.local.get(this.LEGACY_SETTINGS_KEY);
        return result[this.LEGACY_SETTINGS_KEY] || this.getDefaultSettings();
      }
      
      const yearData = await window.yearManager.getYearData();
      return yearData?.settings || this.getDefaultSettings();
    } catch (error) {
      console.error('設定取得エラー:', error);
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      default_sort: 'updated_at',
      default_filter: 'all',
      list_view_mode: 'list',
      items_per_page: 10,
      enable_notifications: true
    };
  }

  async updateSettings(settings) {
    try {
      if (!window.yearManager) {
        // フォールバック: レガシーキーに保存
        await chrome.storage.local.set({ [this.LEGACY_SETTINGS_KEY]: settings });
        return;
      }
      
      const yearData = await window.yearManager.getYearData();
      if (yearData) {
        yearData.settings = settings;
        await window.yearManager.setYearData(yearData);
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      throw error;
    }
  }

  // メタデータ管理（年度別対応）
  async getMetadata() {
    try {
      if (!window.yearManager) {
        // フォールバック: レガシーキーから取得
        const result = await chrome.storage.local.get(this.LEGACY_METADATA_KEY);
        return result[this.LEGACY_METADATA_KEY] || this.getDefaultMetadata();
      }
      
      const yearData = await window.yearManager.getYearData();
      return yearData?.metadata || this.getDefaultMetadata();
    } catch (error) {
      console.error('メタデータ取得エラー:', error);
      return this.getDefaultMetadata();
    }
  }

  getDefaultMetadata() {
    return {
      version: "1.0.3",
      last_backup: null,
      total_games: 0,
      storage_usage: 0
    };
  }

  async updateMetadata() {
    try {
      const games = await this.getGames();
      const usage = await this.getStorageUsage();
      
      const metadata = {
        version: "1.0.3",
        last_backup: null,
        total_games: games.length,
        storage_usage: usage.used,
        last_updated: new Date().toISOString()
      };

      if (!window.yearManager) {
        // フォールバック: レガシーキーに保存
        await chrome.storage.local.set({ [this.LEGACY_METADATA_KEY]: metadata });
        return;
      }
      
      const yearData = await window.yearManager.getYearData();
      if (yearData) {
        yearData.metadata = metadata;
        await window.yearManager.setYearData(yearData);
      }
    } catch (error) {
      console.error('メタデータ更新エラー:', error);
    }
  }

  // 本番用初期化（空のデータベース）
  async initializeSampleData() {
    // 本番運用では空のデータベースでスタート
    console.log('Production mode: Starting with empty database');
  }

  // 既存データの作品番号正規化（ゼロパディング削除）
  async normalizeWorkNumbers() {
    try {
      const games = await this.getGames();
      let updated = false;

      for (const game of games) {
        // "001" -> "1" 形式に変換
        if (game.no && game.no.match(/^0+(\d+)$/)) {
          const newNo = game.no.replace(/^0+/, '');
          console.log(`🔄 作品番号正規化: ${game.no} -> ${newNo} (${game.title})`);
          game.no = newNo;
          game.updated_at = new Date().toISOString();
          updated = true;
        }
      }

      if (updated) {
        await this.saveGames(games);
        await this.updateMetadata();
        console.log('✅ 作品番号正規化完了');
        return true;
      } else {
        console.log('ℹ️ 正規化が必要な作品番号はありませんでした');
        return false;
      }
    } catch (error) {
      console.error('❌ 作品番号正規化エラー:', error);
      return false;
    }
  }
  
  // データバックアップ作成
  async createBackup() {
    try {
      const games = await this.getGames();
      const settings = await chrome.storage.local.get([this.SETTINGS_KEY, this.METADATA_KEY]);
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          games: games,
          settings: settings[this.SETTINGS_KEY] || {},
          metadata: settings[this.METADATA_KEY] || {}
        },
        stats: {
          totalGames: games.length,
          playedGames: games.filter(g => g.is_played).length,
          gamesWithReviews: games.filter(g => g.review && g.review.trim().length > 0).length
        }
      };
      
      console.log(`💾 バックアップ作成: ${backup.stats.totalGames}作品`);
      return backup;
      
    } catch (error) {
      console.error('❌ バックアップ作成エラー:', error);
      throw error;
    }
  }
  
  // データ復元
  async restoreFromBackup(backupData, options = {}) {
    try {
      if (!backupData || !backupData.data || !backupData.data.games) {
        throw new Error('無効なバックアップデータです');
      }
      
      const currentGames = await this.getGames();
      const backupGames = backupData.data.games;
      
      if (!options.forceRestore && currentGames.length > 0) {
        console.warn('⚠️ 復元警告: 既存データが存在します');
        
        // マージ復元の場合
        if (options.mergeRestore) {
          const mergedGames = await this.mergeBackupData(currentGames, backupGames);
          await this.saveGames(mergedGames);
          console.log(`🔄 マージ復元完了: ${mergedGames.length}作品`);
          return { merged: true, count: mergedGames.length };
        } else {
          throw new Error('CONFIRM_RESTORE:既存データが存在します。上書きしますか？');
        }
      }
      
      // 完全復元（年度別対応）
      if (window.yearManager) {
        const yearData = await window.yearManager.getYearData();
        if (yearData) {
          yearData.games = backupGames;
          yearData.settings = backupData.data.settings || {};
          yearData.metadata = backupData.data.metadata || {};
          await window.yearManager.setYearData(yearData);
        }
      } else {
        // フォールバック: レガシー形式で復元
        await chrome.storage.local.set({
          [this.LEGACY_STORAGE_KEY]: backupGames,
          [this.LEGACY_SETTINGS_KEY]: backupData.data.settings || {},
          [this.LEGACY_METADATA_KEY]: backupData.data.metadata || {}
        });
      }
      
      console.log(`✅ 完全復元完了: ${backupGames.length}作品`);
      return { restored: true, count: backupGames.length };
      
    } catch (error) {
      console.error('❌ データ復元エラー:', error);
      throw error;
    }
  }
  
  // バックアップデータのマージ
  async mergeBackupData(currentGames, backupGames) {
    const mergedGames = [...currentGames];
    const currentNoSet = new Set(currentGames.map(g => g.no));
    
    for (const backupGame of backupGames) {
      if (!currentNoSet.has(backupGame.no)) {
        // 新しい作品として追加
        const newId = Math.max(...mergedGames.map(g => g.id), 0) + 1;
        mergedGames.push({
          ...backupGame,
          id: newId,
          restored_from_backup: true,
          restored_at: new Date().toISOString()
        });
      } else {
        // 既存作品の評価・コメントをバックアップから復元（選択的）
        const currentGame = mergedGames.find(g => g.no === backupGame.no);
        if (currentGame && this.hasUserData(backupGame) && !this.hasUserData(currentGame)) {
          currentGame.rating = backupGame.rating;
          currentGame.review = backupGame.review;
          currentGame.review_length = backupGame.review_length;
          currentGame.is_played = backupGame.is_played;
          currentGame.last_played = backupGame.last_played;
          currentGame.restored_rating = true;
        }
      }
    }
    
    return mergedGames;
  }

  // 全てのバージョンステータスをクリア
  async clearAllVersionStatus() {
    const games = await this.getGames();
    games.forEach(game => {
      if (game.version_status === 'new' || game.version_status === 'updated') {
        game.version_status = 'latest';
      }
    });
    await this.saveGames(games);
    await this.updateMetadata();
  }
}

// グローバルインスタンス
window.gameDataManager = new GameDataManager();