# 🧭 ウディこん助 画面遷移フロー設計書

## 📱 画面構成

### 1. メイン画面（作品一覧）
```
┌───────────────────────────────────────────────────────────┐
│ 🌊 ウディこん助                          [⚙️][📤][?] │
├───────────────────────────────────────────────────────────┤
│ [全表示][評価済み][未評価][新着] 検索:[_______] [🔍]    │
├─┬────┬────────────────┬────┬────┬──────────────────┤
│☑│No  │作品名             │📁  │Ver│評価(熱/斬/物/画/遊/他) │
├─┼────┼────────────────┼────┼────┼──────────────────┤
│☑│001 │魔法少女アリスの冒険 │📁  │✅ │10/9/10/8/9/8     │ ← クリック可能
│□│002 │謎解きカフェ事件簿   │📁  │🔔 │8/7/9/7/8/6       │ ← クリック可能
│☑│003 │スチームパンク大戦   │📁  │🔔 │6/9/7/9/5/7       │ ← クリック可能
│□│004 │放課後の怪談話      │   │✅ │-/-/-/-/-/-       │ ← クリック可能
│☑│005 │料理の達人への道    │📁  │✅ │8/6/8/8/9/7       │ ← クリック可能
│□│006 │新作ファンタジーRPG │   │🆕 │-/-/-/-/-/-       │ ← クリック可能
├─┴────┴────────────────┴────┴────┴──────────────────┤
│ 📊 評価済み: 3/6作品 | 合計: 165/180点 | 平均: 55点    │
└───────────────────────────────────────────────────────────┘
```

### 2. 詳細画面（作品編集）
```
┌───────────────────────────────────────────────────────────┐
│ 👈戻る  No.001 魔法少女アリスの冒険              [×] │ ← 戻るボタン
├───────────────────────────────────────────────────────────┤
│ 作者: MagicCoder                 ジャンル: RPG        │
├───────────────────────────────────────────────────────────┤
│ ■ リンク設定                                       │
│ ウディコン公式: [https://silversecond.com/...] [🔗開く]│
│ ローカルフォルダ: [C:\Games\WodiCon\アリス] [📁][編集] │
├───────────────────────────────────────────────────────────┤
│ ■ 評価 (ウディコン公式準拠)                         │
│ 熱中度    : [■■■■■■■■■■] 10/10               │
│ 斬新さ    : [■■■■■■■■■□] 9/10                │
│ 物語性    : [■■■■■■■■■■] 10/10               │
│ 画像音声  : [■■■■■■■■□□] 8/10                │
│ 遊びやすさ: [■■■■■■■■■□] 9/10                │
│ その他    : [■■■■■■■■□□] 8/10                │
│ 合計: 54/60点 ⭐⭐⭐⭐⭐                           │
├───────────────────────────────────────────────────────────┤
│ ■ 感想 (2000字以内 / 40字幅)                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │素晴らしいストーリー展開でした。特にラス        │   │
│ │トの展開は涙なしには見られませんでした。        │   │
│ │キャラクター同士の関係性も丁寧に描かれて        │   │
│ │おり、RPGとしても非常に完成度が高いです。       │   │
│ │...                                          │   │
│ └─────────────────────────────────────────────────┘   │
│ 文字数: 198/2000 字                               │
├───────────────────────────────────────────────────────────┤
│ 💾 自動保存中... [手動保存] [リセット]              │
└───────────────────────────────────────────────────────────┘
```

## 🔄 画面遷移フロー

### 遷移パターン
```
メイン画面 ←→ 詳細画面
     ↓         ↑
   [作品行クリック] [👈戻るボタン]
     ↓         ↑
   詳細画面 → [自動保存実行]
```

### 状態管理
1. **メイン画面状態保持**
   - フィルタ選択状態
   - 検索キーワード
   - スクロール位置

2. **詳細画面状態管理**
   - 編集中データの一時保存
   - 自動保存タイマー
   - 変更検知フラグ

## 🔧 実装仕様

### HTML構造
```html
<div id="app">
  <!-- メイン画面 -->
  <div id="main-view" class="view active">
    <div class="header">...</div>
    <div class="filter-bar">...</div>
    <div class="game-list">...</div>
    <div class="status-bar">...</div>
  </div>
  
  <!-- 詳細画面 -->
  <div id="detail-view" class="view hidden">
    <div class="detail-header">
      <button id="back-btn">👈戻る</button>
      <h2 id="game-title"></h2>
    </div>
    <div class="detail-content">
      <div class="links-section">...</div>
      <div class="rating-section">...</div>
      <div class="review-section">...</div>
    </div>
    <div class="save-status">...</div>
  </div>
</div>
```

### JavaScript実装
```javascript
class NavigationController {
  constructor() {
    this.currentView = 'main';
    this.editingGameId = null;
    this.autoSaveTimer = null;
  }
  
  // 詳細画面への遷移
  showDetailView(gameId) {
    this.saveMainViewState();
    this.editingGameId = gameId;
    this.loadGameData(gameId);
    this.switchView('detail');
    this.startAutoSave();
  }
  
  // メイン画面への復帰
  showMainView() {
    this.saveCurrentEdit();
    this.stopAutoSave();
    this.restoreMainViewState();
    this.switchView('main');
    this.editingGameId = null;
  }
  
  // 自動保存機能
  startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveCurrentEdit();
    }, 3000); // 3秒間隔
  }
  
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
```

### 自動保存仕様
- **保存タイミング**: 3秒間隔 + フィールドのblurイベント
- **保存対象**: 評価スライダー、感想テキスト、フォルダパス
- **保存表示**: "💾 自動保存中..." → "✅ 保存完了"
- **エラー処理**: 保存失敗時の警告表示

### イベントハンドリング
```javascript
// 作品行クリックイベント
document.addEventListener('click', (e) => {
  const gameRow = e.target.closest('.game-row');
  if (gameRow) {
    const gameId = gameRow.dataset.gameId;
    navigationController.showDetailView(gameId);
  }
});

// 戻るボタンイベント
document.getElementById('back-btn').addEventListener('click', () => {
  navigationController.showMainView();
});

// フォーム変更検知
document.addEventListener('input', (e) => {
  if (e.target.matches('.rating-slider, .review-textarea, .folder-input')) {
    navigationController.markAsChanged();
  }
});
```

## 📊 データ同期

### 画面間データ共有
1. **メイン画面更新**: 詳細画面での変更をリストに即座反映
2. **評価表示同期**: 詳細画面の評価変更をメイン画面の評価列に反映
3. **既プレイフラグ同期**: 評価完了時の自動フラグ更新

### 永続化戦略
- **chrome.storage.local**: 全データの永続保存
- **sessionStorage**: 画面状態の一時保存
- **localStorage**: ユーザー設定の保存

この設計により、直感的な画面遷移と確実なデータ保存を実現できます。