# 🎮 ウディこん助 サンプルデータ設計書

## 📋 データ構造仕様

### 作品データスキーマ

```typescript
interface GameWork {
  id: number;                    // 作品ID (1-80)
  no: string;                    // 作品番号（001-080形式）
  title: string;                 // 作品タイトル
  author: string;                // 作者名
  genre: string;                 // ジャンル
  description: string;           // 概要・説明
  wodicon_url: string;           // ウディコン公式URL
  local_folder_path: string;     // ローカルフォルダパス
  is_played: boolean;            // 既プレイフラグ（評価済み=true）
  
  // ウディコン公式準拠評価システム
  rating: {
    熱中度: number;              // 1-10点
    斬新さ: number;              // 1-10点
    物語性: number;              // 1-10点
    画像音声: number;            // 1-10点
    遊びやすさ: number;          // 1-10点
    その他: number;              // 1-10点
    total: number;               // 合計点（自動計算）
  };
  
  review: string;                // 感想（2000字以内）
  review_length: number;         // 文字数カウント
  version_status: 'latest' | 'updated' | 'new'; // バージョン状態
  last_played: Date | null;      // 最終プレイ日時
  created_at: Date;              // 追加日時
  updated_at: Date;              // 更新日時
  
  // 将来機能用
  update_notification: boolean;   // 更新通知有効/無効
  bbs_check: boolean;            // BBS監視有効/無効
  last_update_check: Date | null; // 最終更新確認日時
}

enum PlayStatus {
  NOT_PLAYED = 'not_played',     // 未プレイ
  PLAYING = 'playing',           // プレイ中
  COMPLETED = 'completed',       // 完了
  DROPPED = 'dropped'            // 中断
}
```

### ストレージ構造

```typescript
interface WodiconStorage {
  games: GameWork[];             // 作品リスト
  settings: UserSettings;        // ユーザー設定
  metadata: StorageMetadata;     // メタデータ
}

interface UserSettings {
  default_sort: 'title' | 'author' | 'rating' | 'updated_at';
  default_filter: PlayStatus | 'all';
  list_view_mode: 'grid' | 'list';
  items_per_page: number;
  enable_notifications: boolean;
}

interface StorageMetadata {
  version: string;               // データバージョン
  last_backup: Date | null;      // 最終バックアップ日時
  total_games: number;           // 総作品数
  storage_usage: number;         // 使用容量（bytes）
}
```

## 🎯 6作品サンプルデータ（ウディコン準拠）

```json
{
  "games": [
    {
      "id": 1,
      "no": "001",
      "title": "魔法少女アリスの冒険",
      "author": "MagicCoder",
      "genre": "RPG",
      "description": "魔法の力を失った少女アリスが、仲間と共に世界を救う王道RPG。美しいピクセルアートと感動的なストーリーが魅力。",
      "wodicon_url": "https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#001",
      "local_folder_path": "C:\\Games\\WodiCon\\アリスの冒険",
      "is_played": true,
      "rating": {
        "熱中度": 10,
        "斬新さ": 9,
        "物語性": 10,
        "画像音声": 8,
        "遊びやすさ": 9,
        "その他": 8,
        "total": 54
      },
      "review": "素晴らしいストーリー展開でした。特にラストの展開は涙なしには見られませんでした。キャラクター同士の関係性も丁寧に描かれており、RPGとしても非常に完成度が高いです。魔法システムも独特で、戦闘が飽きることがありませんでした。グラフィックも美麗で、特にエフェクトが印象的でした。音楽も場面場面に合っており、感情移入しやすかったです。全体的に非常にバランスが取れた作品だと思います。",
      "review_length": 198,
      "version_status": "latest",
      "last_played": "2025-07-10T20:30:00.000Z",
      "created_at": "2025-07-05T10:00:00.000Z",
      "updated_at": "2025-07-10T20:30:00.000Z",
      "update_notification": true,
      "bbs_check": true,
      "last_update_check": "2025-07-11T08:00:00.000Z"
    },
    {
      "id": 2,
      "title": "謎解きカフェ事件簿",
      "author": "DetectiveGamer",
      "genre": "アドベンチャー",
      "description": "小さなカフェで起こる日常の謎を解く推理アドベンチャー。プレイヤーの観察力と推理力が試される。",
      "thumbnail_url": "https://example.com/thumbnails/cafe_mystery.png",
      "download_url": "https://silversecond.com/download/cafe_mystery.zip",
      "local_folder_path": "",
      "play_status": "playing",
      "rating": 4,
      "review": "推理要素が面白く、謎解きの難易度も適切です。カフェの雰囲気作りも上手で、リラックスして楽しめます。",
      "memo": "#推理 #日常系 #カフェ ★第3話まで進行中 ★コーヒーの薀蓄が勉強になる",
      "play_time": 120,
      "last_played": "2025-07-11T15:45:00.000Z",
      "created_at": "2025-07-08T14:20:00.000Z",
      "updated_at": "2025-07-11T15:45:00.000Z",
      "update_notification": true,
      "bbs_check": false,
      "last_update_check": "2025-07-11T08:00:00.000Z"
    },
    {
      "id": 3,
      "title": "スチームパンク大戦",
      "author": "GearsOfWar",
      "genre": "シミュレーション",
      "description": "蒸気機関技術が発達した世界での戦略シミュレーション。機械と魔法が交錯する独特の世界観。",
      "thumbnail_url": "https://example.com/thumbnails/steampunk_war.png",
      "download_url": "https://silversecond.com/download/steampunk_war.zip",
      "local_folder_path": "D:\\ゲーム\\ウディコン2025\\スチームパンク大戦",
      "play_status": "dropped",
      "rating": 3,
      "review": "世界観は素晴らしいのですが、操作が複雑で挫折してしまいました。シミュレーション慣れしている人には良いかも。",
      "memo": "#スチームパンク #戦略SLG #難易度高 ★チュートリアルが不親切 ★世界観◎",
      "play_time": 45,
      "last_played": "2025-07-07T19:20:00.000Z",
      "created_at": "2025-07-06T16:15:00.000Z",
      "updated_at": "2025-07-07T19:20:00.000Z",
      "update_notification": false,
      "bbs_check": false,
      "last_update_check": null
    },
    {
      "id": 4,
      "title": "放課後の怪談話",
      "author": "SchoolGhost",
      "genre": "ホラー",
      "description": "学校を舞台にした学園ホラー。7つの怪談を体験する短編オムニバス形式。",
      "thumbnail_url": "https://example.com/thumbnails/school_horror.png",
      "download_url": "https://silversecond.com/download/school_horror.zip",
      "local_folder_path": "",
      "play_status": "not_played",
      "rating": 0,
      "review": "",
      "memo": "#ホラー #学園もの #短編 ★夜にプレイ予定 ★心の準備が必要",
      "play_time": 0,
      "last_played": null,
      "created_at": "2025-07-09T12:30:00.000Z",
      "updated_at": "2025-07-09T12:30:00.000Z",
      "update_notification": true,
      "bbs_check": true,
      "last_update_check": "2025-07-11T08:00:00.000Z"
    },
    {
      "id": 5,
      "title": "料理の達人への道",
      "author": "ChefMaster",
      "genre": "育成",
      "description": "料理人として成長していく育成シミュレーション。様々なレシピを覚えて、最高の料理人を目指そう。",
      "thumbnail_url": "https://example.com/thumbnails/cooking_master.png",
      "download_url": "https://silversecond.com/download/cooking_master.zip",
      "local_folder_path": "C:\\Games\\WodiCon\\料理の達人",
      "play_status": "playing",
      "rating": 4,
      "review": "料理のミニゲームが楽しく、実際のレシピも学べて一石二鳥です。キャラクターも魅力的で続きが気になります。",
      "memo": "#料理 #育成 #ほのぼの ★フランス料理習得中 ★レシピメモ：ブイヤベース材料確認",
      "play_time": 180,
      "last_played": "2025-07-11T12:15:00.000Z",
      "created_at": "2025-07-04T09:45:00.000Z",
      "updated_at": "2025-07-11T12:15:00.000Z",
      "update_notification": true,
      "bbs_check": true,
      "last_update_check": "2025-07-11T08:00:00.000Z"
    }
  ],
  "settings": {
    "default_sort": "updated_at",
    "default_filter": "all",
    "list_view_mode": "grid",
    "items_per_page": 10,
    "enable_notifications": true
  },
  "metadata": {
    "version": "1.0.0",
    "last_backup": null,
    "total_games": 5,
    "storage_usage": 0
  }
}
```

## 📊 80作品対応設計

### 容量試算
- 1作品あたりのデータサイズ: 約1-2KB
- 80作品での総容量: 約80-160KB
- 感想・メモを含む実用容量: 約500KB-1MB
- chrome.storage.local制限（5MB）に対して十分な余裕

### パフォーマンス対策
- ページネーション（10-20件/ページ）
- 仮想スクロール（必要に応じて）
- インデックス化（ジャンル、作者別）
- 遅延読み込み（サムネイル等）

### データ管理戦略
- 一括データ取得の最適化
- 部分更新による効率化
- 定期的なデータ整合性チェック
- 自動バックアップ機能

## 🔧 データ操作API設計

```typescript
class GameDataManager {
  // 基本CRUD操作
  async getGames(): Promise<GameWork[]>
  async getGame(id: number): Promise<GameWork | null>
  async addGame(game: Omit<GameWork, 'id' | 'created_at' | 'updated_at'>): Promise<number>
  async updateGame(id: number, updates: Partial<GameWork>): Promise<boolean>
  async deleteGame(id: number): Promise<boolean>
  
  // 検索・フィルタ
  async searchGames(query: string): Promise<GameWork[]>
  async filterGames(status?: PlayStatus, genre?: string): Promise<GameWork[]>
  async sortGames(field: keyof GameWork, order: 'asc' | 'desc'): Promise<GameWork[]>
  
  // 統計・分析
  async getPlayStats(): Promise<PlayStatistics>
  async getStorageUsage(): Promise<StorageInfo>
  
  // バックアップ・復元
  async exportData(): Promise<string>
  async importData(jsonData: string): Promise<boolean>
}

interface PlayStatistics {
  total_games: number;
  completed_games: number;
  playing_games: number;
  not_played_games: number;
  dropped_games: number;
  total_play_time: number;
  average_rating: number;
}
```

## 🎯 実装優先順位

### Phase 1: 基本データ構造
1. GameWork インターフェース実装
2. chrome.storage.local 連携
3. 基本CRUD操作

### Phase 2: サンプルデータ
1. 5作品のサンプルデータ実装
2. データ初期化処理
3. データ検証・整合性チェック

### Phase 3: 拡張機能
1. 検索・フィルタ機能
2. ソート機能
3. 統計情報表示

この設計により、5作品での動作確認から80作品の実用運用まで、スケーラブルな実装が可能になります。