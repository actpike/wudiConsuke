// ウディこん助 データ管理システム

class GameDataManager {
  constructor() {
    this.STORAGE_KEY = 'wodicon_games';
    this.SETTINGS_KEY = 'wodicon_settings';
    this.METADATA_KEY = 'wodicon_metadata';
  }

  // データ初期化
  async initialize() {
    const games = await this.getGames();
    if (games.length === 0) {
      await this.initializeSampleData();
    }
  }

  // ゲームデータ取得
  async getGames() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error('Failed to get games:', error);
      return [];
    }
  }

  // 単一ゲーム取得
  async getGame(id) {
    const games = await this.getGames();
    return games.find(game => game.id === id) || null;
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
      
      await chrome.storage.local.set({ [this.STORAGE_KEY]: games });
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
    await chrome.storage.local.set({ [this.STORAGE_KEY]: games });
    await this.updateMetadata();
    
    console.log(`✅ 新規ゲーム追加: No.${newGame.no} "${newGame.title}"`);
    return newId;
  }

  // ゲーム更新
  async updateGame(id, updates) {
    const games = await this.getGames();
    const index = games.findIndex(game => game.id === id);
    
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

    await chrome.storage.local.set({ [this.STORAGE_KEY]: games });
    await this.updateMetadata();
    return true;
  }

  // ゲーム削除（安全確認付き）
  async deleteGame(id, options = {}) {
    const games = await this.getGames();
    const targetGame = games.find(game => game.id === id);
    
    if (!targetGame) return false;
    
    // 評価・コメントがある場合の安全確認
    const hasUserData = this.hasUserData(targetGame);
    
    if (hasUserData && !options.forceDelete && !options.isSystemDelete) {
      console.warn(`⚠️ 削除警告: No.${targetGame.no} "${targetGame.title}" には評価・コメントデータがあります`);
      
      // UI側で確認ダイアログを表示するためのエラーを投げる
      throw new Error(`CONFIRM_DELETE:この作品には評価・コメントが保存されています。\n\n作品: ${targetGame.title}\n評価: ${this.formatRating(targetGame.rating)}\n感想: ${targetGame.review ? targetGame.review.substring(0, 50) + '...' : 'なし'}\n\n本当に削除しますか？`);
    }
    
    const filteredGames = games.filter(game => game.id !== id);
    await chrome.storage.local.set({ [this.STORAGE_KEY]: filteredGames });
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
    // 評価が初期値以外、またはコメントがある場合
    const defaultRating = { 熱中度: 1, 斬新さ: 1, 物語性: 1, 画像音声: 1, 遊びやすさ: 1, その他: 1, total: 6 };
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
      
      await chrome.storage.local.set({ [this.STORAGE_KEY]: games });
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
        return games.filter(game => game.version_status === 'new');
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
        total: 5 * 1024 * 1024, // 5MB
        percentage: Math.round((usage / (5 * 1024 * 1024)) * 100)
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
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
      version: "1.0.0"
    };
  }

  // データインポート
  async importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (!data.games || !Array.isArray(data.games)) {
        throw new Error('Invalid data format: games array not found');
      }

      await chrome.storage.local.set({
        [this.STORAGE_KEY]: data.games,
        [this.SETTINGS_KEY]: data.settings || {},
        [this.METADATA_KEY]: data.metadata || {}
      });

      await this.updateMetadata();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // 評価完了チェック
  isRatingComplete(rating) {
    return rating && 
           rating.熱中度 > 0 && 
           rating.斬新さ > 0 && 
           rating.物語性 > 0 && 
           rating.画像音声 > 0 && 
           rating.遊びやすさ > 0 && 
           rating.その他 > 0;
  }

  // 合計点計算
  calculateTotalRating(rating) {
    return (rating.熱中度 || 0) + 
           (rating.斬新さ || 0) + 
           (rating.物語性 || 0) + 
           (rating.画像音声 || 0) + 
           (rating.遊びやすさ || 0) + 
           (rating.その他 || 0);
  }

  // 設定管理
  async getSettings() {
    const result = await chrome.storage.local.get(this.SETTINGS_KEY);
    return result[this.SETTINGS_KEY] || {
      default_sort: 'updated_at',
      default_filter: 'all',
      list_view_mode: 'list',
      items_per_page: 10,
      enable_notifications: true
    };
  }

  async updateSettings(settings) {
    await chrome.storage.local.set({ [this.SETTINGS_KEY]: settings });
  }

  // メタデータ管理
  async getMetadata() {
    const result = await chrome.storage.local.get(this.METADATA_KEY);
    return result[this.METADATA_KEY] || {
      version: "1.0.0",
      last_backup: null,
      total_games: 0,
      storage_usage: 0
    };
  }

  async updateMetadata() {
    const games = await this.getGames();
    const usage = await this.getStorageUsage();
    
    const metadata = {
      version: "1.0.0",
      last_backup: null,
      total_games: games.length,
      storage_usage: usage.used,
      last_updated: new Date().toISOString()
    };

    await chrome.storage.local.set({ [this.METADATA_KEY]: metadata });
  }

  // サンプルデータ初期化
  async initializeSampleData() {
    const sampleGames = [
      {
        id: 1,
        no: "1",
        title: "ウディコン17回大会サンプル作品",
        author: "SmokingWOLF",
        genre: "その他",
        description: "ウディコン第17回大会の実際のエントリー作品。Web監視機能のテスト・動作確認用として追加されたサンプルデータです。実際のコンテストページから取得した情報を基にしています。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml",
        local_folder_path: "",
        is_played: false,
        rating: {
          熱中度: 1,
          斬新さ: 1,
          物語性: 1,
          画像音声: 1,
          遊びやすさ: 1,
          その他: 1,
          total: 6
        },
        review: "",
        review_length: 0,
        version_status: "new",
        last_played: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        update_notification: true,
        bbs_check: false,
        last_update_check: null,
        web_monitoring_enabled: false,
        web_monitoring: {
          detected_at: new Date().toISOString(),
          last_update: new Date().toISOString(),
          source_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml",
          detection_type: "manual_sample"
        }
      },
      {
        id: 2,
        no: "2",
        title: "謎解きカフェ事件簿",
        author: "DetectiveGamer",
        genre: "アドベンチャー",
        description: "小さなカフェで起こる日常の謎を解く推理アドベンチャー。プレイヤーの観察力と推理力が試される。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#2",
        local_folder_path: "",
        is_played: false,
        rating: {
          熱中度: 8,
          斬新さ: 7,
          物語性: 9,
          画像音声: 7,
          遊びやすさ: 8,
          その他: 6,
          total: 45
        },
        review: "推理要素が面白く、謎解きの難易度も適切です。カフェの雰囲気作りも上手で、リラックスして楽しめます。",
        review_length: 52,
        version_status: "updated",
        last_played: "2025-07-11T15:45:00.000Z",
        created_at: "2025-07-08T14:20:00.000Z",
        updated_at: "2025-07-11T15:45:00.000Z",
        update_notification: true,
        bbs_check: false,
        last_update_check: "2025-07-11T08:00:00.000Z",
        web_monitoring_enabled: false
      },
      {
        id: 3,
        no: "3",
        title: "スチームパンク大戦",
        author: "GearsOfWar",
        genre: "シミュレーション",
        description: "蒸気機関技術が発達した世界での戦略シミュレーション。機械と魔法が交錯する独特の世界観。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#3",
        local_folder_path: "D:\\ゲーム\\ウディコン2025\\スチームパンク大戦",
        is_played: true,
        rating: {
          熱中度: 6,
          斬新さ: 9,
          物語性: 7,
          画像音声: 9,
          遊びやすさ: 5,
          その他: 7,
          total: 43
        },
        review: "世界観は素晴らしいのですが、操作が複雑で挫折してしまいました。シミュレーション慣れしている人には良いかも。",
        review_length: 54,
        version_status: "updated",
        last_played: "2025-07-07T19:20:00.000Z",
        created_at: "2025-07-06T16:15:00.000Z",
        updated_at: "2025-07-07T19:20:00.000Z",
        update_notification: false,
        bbs_check: false,
        last_update_check: null,
        web_monitoring_enabled: false
      },
      {
        id: 4,
        no: "4",
        title: "放課後の怪談話",
        author: "SchoolGhost",
        genre: "ホラー",
        description: "学校を舞台にした学園ホラー。7つの怪談を体験する短編オムニバス形式。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#4",
        local_folder_path: "",
        is_played: false,
        rating: {
          熱中度: 0,
          斬新さ: 0,
          物語性: 0,
          画像音声: 0,
          遊びやすさ: 0,
          その他: 0,
          total: 0
        },
        review: "",
        review_length: 0,
        version_status: "latest",
        last_played: null,
        created_at: "2025-07-09T12:30:00.000Z",
        updated_at: "2025-07-09T12:30:00.000Z",
        update_notification: true,
        bbs_check: true,
        last_update_check: "2025-07-11T08:00:00.000Z",
        web_monitoring_enabled: false
      },
      {
        id: 5,
        no: "5",
        title: "料理の達人への道",
        author: "ChefMaster",
        genre: "育成",
        description: "料理人として成長していく育成シミュレーション。様々なレシピを覚えて、最高の料理人を目指そう。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#5",
        local_folder_path: "C:\\Games\\WodiCon\\料理の達人",
        is_played: true,
        rating: {
          熱中度: 8,
          斬新さ: 6,
          物語性: 8,
          画像音声: 8,
          遊びやすさ: 9,
          その他: 7,
          total: 46
        },
        review: "料理のミニゲームが楽しく、実際のレシピも学べて一石二鳥です。キャラクターも魅力的で続きが気になります。",
        review_length: 55,
        version_status: "latest",
        last_played: "2025-07-11T12:15:00.000Z",
        created_at: "2025-07-04T09:45:00.000Z",
        updated_at: "2025-07-11T12:15:00.000Z",
        update_notification: true,
        bbs_check: true,
        last_update_check: "2025-07-11T08:00:00.000Z",
        web_monitoring_enabled: false
      },
      {
        id: 6,
        no: "6",
        title: "新作ファンタジーRPG",
        author: "FantasyMaker",
        genre: "RPG",
        description: "王道ファンタジー世界での冒険RPG。豊富なクエストと自由度の高い冒険が楽しめる。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#6",
        local_folder_path: "",
        is_played: false,
        rating: {
          熱中度: 0,
          斬新さ: 0,
          物語性: 0,
          画像音声: 0,
          遊びやすさ: 0,
          その他: 0,
          total: 0
        },
        review: "",
        review_length: 0,
        version_status: "new",
        last_played: null,
        created_at: "2025-07-11T10:00:00.000Z",
        updated_at: "2025-07-11T10:00:00.000Z",
        update_notification: true,
        bbs_check: false,
        last_update_check: null,
        web_monitoring_enabled: false
      }
    ];

    await chrome.storage.local.set({ [this.STORAGE_KEY]: sampleGames });
    await this.updateMetadata();
    console.log('Sample data initialized');
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
        await chrome.storage.local.set({ [this.STORAGE_KEY]: games });
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
          await chrome.storage.local.set({ [this.STORAGE_KEY]: mergedGames });
          console.log(`🔄 マージ復元完了: ${mergedGames.length}作品`);
          return { merged: true, count: mergedGames.length };
        } else {
          throw new Error('CONFIRM_RESTORE:既存データが存在します。上書きしますか？');
        }
      }
      
      // 完全復元
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: backupGames,
        [this.SETTINGS_KEY]: backupData.data.settings || {},
        [this.METADATA_KEY]: backupData.data.metadata || {}
      });
      
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
}

// グローバルインスタンス
window.gameDataManager = new GameDataManager();