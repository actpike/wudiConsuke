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

  // ゲーム追加
  async addGame(gameData) {
    const games = await this.getGames();
    const newId = Math.max(...games.map(g => g.id), 0) + 1;
    
    const newGame = {
      ...gameData,
      id: newId,
      no: String(newId).padStart(3, '0'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    games.push(newGame);
    await chrome.storage.local.set({ [this.STORAGE_KEY]: games });
    await this.updateMetadata();
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

  // ゲーム削除
  async deleteGame(id) {
    const games = await this.getGames();
    const filteredGames = games.filter(game => game.id !== id);
    
    if (filteredGames.length === games.length) return false;

    await chrome.storage.local.set({ [this.STORAGE_KEY]: filteredGames });
    await this.updateMetadata();
    return true;
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
        no: "001",
        title: "魔法少女アリスの冒険",
        author: "MagicCoder",
        genre: "RPG",
        description: "魔法の力を失った少女アリスが、仲間と共に世界を救う王道RPG。美しいピクセルアートと感動的なストーリーが魅力。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#1",
        local_folder_path: "C:\\Games\\WodiCon\\アリスの冒険",
        is_played: true,
        rating: {
          熱中度: 10,
          斬新さ: 9,
          物語性: 10,
          画像音声: 8,
          遊びやすさ: 9,
          その他: 8,
          total: 54
        },
        review: "素晴らしいストーリー展開でした。特にラストの展開は涙なしには見られませんでした。キャラクター同士の関係性も丁寧に描かれており、RPGとしても非常に完成度が高いです。",
        review_length: 87,
        version_status: "latest",
        last_played: "2025-07-10T20:30:00.000Z",
        created_at: "2025-07-05T10:00:00.000Z",
        updated_at: "2025-07-10T20:30:00.000Z",
        update_notification: true,
        bbs_check: true,
        last_update_check: "2025-07-11T08:00:00.000Z"
      },
      {
        id: 2,
        no: "002",
        title: "謎解きカフェ事件簿",
        author: "DetectiveGamer",
        genre: "アドベンチャー",
        description: "小さなカフェで起こる日常の謎を解く推理アドベンチャー。プレイヤーの観察力と推理力が試される。",
        wodicon_url: "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#1",
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
        last_update_check: "2025-07-11T08:00:00.000Z"
      },
      {
        id: 3,
        no: "003",
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
        last_update_check: null
      },
      {
        id: 4,
        no: "004",
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
        last_update_check: "2025-07-11T08:00:00.000Z"
      },
      {
        id: 5,
        no: "005",
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
        last_update_check: "2025-07-11T08:00:00.000Z"
      },
      {
        id: 6,
        no: "006",
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
        last_update_check: null
      }
    ];

    await chrome.storage.local.set({ [this.STORAGE_KEY]: sampleGames });
    await this.updateMetadata();
    console.log('Sample data initialized');
  }
}

// グローバルインスタンス
window.gameDataManager = new GameDataManager();