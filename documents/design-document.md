# ウディこん助 複数年度対応機能 設計書

## 1. 現在のデータ構造分析

### 現在のchrome.storage.localキー構造
```javascript
{
  "wodicon_games": [...],           // ゲームデータ
  "wodicon_settings": {...},        // 基本設定
  "wodicon_metadata": {...},        // メタデータ
  "web_monitor_settings": {...},    // Web監視設定
  "auto_monitor_settings": {...},   // 自動監視設定
  "last_auto_monitor_time": "...",  // 最終監視時刻
  "monitor_history": [...],         // 監視履歴
  "ratings": {...},                 // 評価データ（未使用の可能性）
  "reviews": {...}                  // 感想データ（未使用の可能性）
}
```

### 課題
- 年度情報が含まれていない
- 2025年データとして固定されている
- 年度切り替え機能が存在しない

## 2. 新しいデータ構造設計

### 年度別データ構造
```javascript
{
  // 共通設定（年度に依存しない）
  "app_settings": {
    "current_year": 2025,
    "available_years": [2025],
    "version": "0.0.6"
  },
  
  // 年度別データ（例：2025年）
  "wodicon_data_2025": {
    "games": [...],
    "web_monitor_settings": {...},
    "auto_monitor_settings": {...},
    "last_auto_monitor_time": "...",
    "monitor_history": [...],
    "metadata": {...}
  },
  
  // 将来の年度データ（例：2026年）
  "wodicon_data_2026": {
    // 同様の構造
  }
}
```

## 3. 年度選択UI設計

### オプションページレイアウト
```html
<div class="section" id="year-selection">
  <h2>📅 年度選択</h2>
  <div class="setting-item">
    <label for="year-selector">対象年度:</label>
    <select id="year-selector">
      <option value="2025">第17回 (2025年)</option>
      <!-- 動的に追加 -->
    </select>
    <p class="help-text">
      年度を変更すると、該当年度のデータのみが表示されます。
      各年度のデータは独立して管理されます。
    </p>
  </div>
</div>
```

## 4. データ移行戦略

### 段階的移行アプローチ
1. **既存データのバックアップ**
   - 現在のデータをバックアップキーに保存
   
2. **新構造への変換**
   - `wodicon_games` → `wodicon_data_2025.games`
   - 他のキーも同様に移行
   
3. **アプリ設定の初期化**
   - `app_settings` の作成
   - `current_year: 2025` の設定

## 5. API設計

### YearManager クラス
```javascript
class YearManager {
  async getCurrentYear()           // 現在選択中の年度を取得
  async setCurrentYear(year)       // 年度を変更
  async getAvailableYears()        // 利用可能な年度一覧を取得
  async initializeYear(year)       // 新年度データを初期化
  async migrateExistingData()      // 既存データを新構造に移行
}
```

### 改修対象クラス
- **GameDataManager**: 年度別データアクセス
- **WebMonitor**: 年度別URL処理
- **PageParser**: 年度別サイト構造対応

## 6. 実装優先順位

### Phase 1: 基盤実装
1. YearManager クラス作成
2. データ移行機能実装
3. 年度選択UI実装

### Phase 2: 既存機能改修
1. GameDataManager改修
2. WebMonitor改修
3. PageParser改修

### Phase 3: テスト・統合
1. 機能テスト
2. データ整合性確認
3. パフォーマンス検証

## 7. エラーハンドリング

### 移行エラー対策
- 移行前の自動バックアップ
- 移行失敗時の復旧機能
- データ破損チェック機能

### 年度切り替えエラー対策
- 不正な年度指定の防止
- データ不整合時の自動修復
- フォールバック機能

## 8. パフォーマンス考慮

### ストレージ容量管理
- 5MB制限内での複数年度データ管理
- 古い年度データの圧縮機能（将来実装）
- データサイズ監視機能

### 読み込み性能
- 選択年度データのみロード
- 年度切り替え時の高速化
- キャッシュ機能の活用