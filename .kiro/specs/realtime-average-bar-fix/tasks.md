# Implementation Tasks

## Task Overview
個別詳細画面の平均バーリアルタイム反映機能の実装タスクです。技術設計に基づき、3つのフェーズで段階的に実装します。

## Phase 1: Core Methods Implementation

### Task 1.1: getCurrentFormRating() メソッド実装
**優先度**: High  
**見積時間**: 30分  
**担当領域**: navigation.js  

**実装内容**:
```javascript
// フォームから現在の評価値を取得
getCurrentFormRating() {
  const categories = window.constants.RATING_CATEGORIES;
  const rating = {};
  
  categories.forEach(category => {
    const slider = document.querySelector(`[data-category="${category}"]`);
    const valueSpan = slider.parentElement.querySelector('.rating-value');
    
    // null値処理（Requirement 3対応）
    if (valueSpan.textContent === '-') {
      rating[category] = null;
    } else {
      rating[category] = parseInt(slider.value);
    }
  });
  
  return rating;
}
```

**テスト項目**:
- [ ] 6カテゴリすべてのスライダー値取得確認
- [ ] null値（'-'表示）の正確な判定
- [ ] 数値変換の正確性確認
- [ ] window.constants.RATING_CATEGORIES準拠確認

**完了条件**:
- メソッドがnavigation.jsに追加される
- 全テスト項目が通る
- エラーハンドリングが適切に動作する

### Task 1.2: calculateAveragesWithCurrent() メソッド実装
**優先度**: High  
**見積時間**: 60分  
**担当領域**: navigation.js  

**実装内容**:
```javascript
// 現在の評価を含めた平均計算（最適化版）
async calculateAveragesWithCurrent(currentRating) {
  try {
    // キャッシュ最適化: 初回のみ全データ取得
    if (!this.allGamesCache || this.cacheExpired) {
      const games = await window.gameDataManager.getGames();
      this.allGamesCache = games.filter(game => game.is_played && game.rating);
      this.cacheTimestamp = Date.now();
    }
    
    const playedGames = [...this.allGamesCache];
    
    // 現在編集中ゲームが既存の場合は置き換え、新規の場合は追加
    const currentGameIndex = playedGames.findIndex(g => g.id === this.editingGameId);
    const currentGameData = {
      id: this.editingGameId,
      rating: currentRating,
      is_played: window.gameDataManager.isRatingComplete(currentRating)
    };
    
    if (currentGameIndex >= 0) {
      playedGames[currentGameIndex] = currentGameData;
    } else if (currentGameData.is_played) {
      playedGames.push(currentGameData);
    }
    
    // 平均計算（既存ロジック流用）
    const categories = window.constants.RATING_CATEGORIES;
    const averages = {};
    
    categories.forEach(category => {
      const validRatings = playedGames
        .map(game => game.rating[category])
        .filter(rating => rating !== null && rating !== undefined && rating > 0);
      
      if (validRatings.length > 0) {
        const total = validRatings.reduce((sum, rating) => sum + rating, 0);
        averages[category] = total / validRatings.length;
      } else {
        averages[category] = 0;
      }
    });
    
    return averages;
    
  } catch (error) {
    throw error; // 上位でキャッチ
  }
}
```

**テスト項目**:
- [ ] 既存ゲームデータの正確な取得
- [ ] キャッシュシステムの動作確認
- [ ] 現在編集中ゲームの正確な統合
- [ ] null値除外ロジックの確認
- [ ] 平均計算の精度確認

**完了条件**:
- メソッドがnavigation.jsに追加される
- キャッシュが正常に動作する
- 平均計算が正確に実行される
- エラー時に適切にthrowされる

### Task 1.3: updateAverageBarRealtime() メソッド実装
**優先度**: High  
**見積時間**: 45分  
**担当領域**: navigation.js  

**実装内容**:
```javascript
// リアルタイム平均バー更新（軽量版）
async updateAverageBarRealtime() {
  try {
    // 💡 最適化: 現在編集中ゲームの評価値をリアルタイムで取得
    const currentRating = this.getCurrentFormRating();
    
    // 既存データから平均計算（50ms目標）
    const averages = await this.calculateAveragesWithCurrent(currentRating);
    
    // 既存メソッドで平均線を更新
    this.updateAverageIndicators(averages);
    
  } catch (error) {
    // 統一エラーハンドリング（Requirement 4対応）
    window.errorHandler.handleError(error, 'realtime-average-update');
    console.warn('平均バー更新エラー - 前回表示を維持します');
  }
}
```

**テスト項目**:
- [ ] getCurrentFormRating()との連携確認
- [ ] calculateAveragesWithCurrent()との連携確認
- [ ] updateAverageIndicators()の正常実行確認
- [ ] エラーハンドリングの動作確認
- [ ] 50ms以内の実行時間確認

**完了条件**:
- メソッドがnavigation.jsに追加される
- 他のメソッドとの連携が正常動作する
- エラー時にユーザー操作が阻害されない
- パフォーマンス目標を達成する

## Phase 2: Event Integration

### Task 2.1: キャッシュ管理プロパティ追加
**優先度**: High  
**見積時間**: 20分  
**担当領域**: navigation.js constructor  

**実装内容**:
```javascript
constructor() {
  // 既存プロパティ...
  this.allGamesCache = null;
  this.cacheTimestamp = 0;
  this.CACHE_DURATION = 60000; // 1分
}

// キャッシュ有効性チェック
get cacheExpired() {
  return !this.cacheTimestamp || 
         (Date.now() - this.cacheTimestamp) > this.CACHE_DURATION;
}

// キャッシュクリア（保存時）
clearCache() {
  this.allGamesCache = null;
  this.cacheTimestamp = 0;
}
```

**テスト項目**:
- [ ] プロパティが正しく初期化される
- [ ] cacheExpiredプロパティの動作確認
- [ ] clearCache()メソッドの動作確認

**完了条件**:
- constructorに新プロパティが追加される
- ゲッタープロパティが正常動作する
- キャッシュクリアが正常実行される

### Task 2.2: inputイベントリスナー修正
**優先度**: High  
**見積時間**: 30分  
**担当領域**: navigation.js:78-89  

**実装内容**:
```javascript
// 既存のinputイベントリスナーを修正
document.addEventListener('input', (e) => {
  if (e.target.matches('.rating-slider, #review-textarea')) {
    if (e.target.matches('.rating-slider')) {
      const valueSpan = e.target.parentElement.querySelector('.rating-value');
      valueSpan.textContent = e.target.value;
      this.updateTotalRating();
      
      // 🔄 NEW: リアルタイム平均バー更新
      this.updateAverageBarRealtime();
    }
    this.markAsChanged();
  }
});
```

**テスト項目**:
- [ ] 既存の動作が維持される
- [ ] updateAverageBarRealtime()が正常に呼び出される
- [ ] スライダー操作時のレスポンス確認
- [ ] エラー時に他の処理が停止しない確認

**完了条件**:
- inputイベントリスナーが修正される
- 既存機能に影響がない
- 新機能が正常に動作する

## Phase 3: System Integration

### Task 3.1: 保存処理にキャッシュクリア追加
**優先度**: Medium  
**見積時間**: 20分  
**担当領域**: navigation.js saveCurrentEdit()  

**実装内容**:
```javascript
// 既存のsaveCurrentEdit()メソッドにキャッシュクリア追加
async saveCurrentEdit() {
  // 既存処理...
  const success = await window.gameDataManager.updateGame(this.editingGameId, updates);
  
  if (success) {
    // 🔄 NEW: キャッシュクリアでデータ整合性確保
    this.clearCache();
    // 既存処理...
  }
  
  // 既存のreturn文...
}
```

**テスト項目**:
- [ ] 保存成功時にキャッシュがクリアされる
- [ ] 保存失敗時にキャッシュが維持される
- [ ] 既存の保存処理に影響がない

**完了条件**:
- saveCurrentEdit()にキャッシュクリアが追加される
- 保存後に新しいデータが正確に反映される

### Task 3.2: 画面遷移時のキャッシュクリア追加
**優先度**: Medium  
**見積時間**: 15分  
**担当領域**: navigation.js showDetailView()  

**実装内容**:
```javascript
// 既存のshowDetailView()メソッドにキャッシュクリア追加
async showDetailView(gameId) {
  // 🔄 NEW: 画面遷移時にキャッシュをクリア
  this.clearCache();
  
  // 既存処理...
}
```

**テスト項目**:
- [ ] 詳細画面表示時にキャッシュがクリアされる
- [ ] 画面遷移後に正確なデータが表示される
- [ ] 既存の画面遷移処理に影響がない

**完了条件**:
- showDetailView()にキャッシュクリアが追加される
- 画面遷移後のデータ整合性が確保される

### Task 3.3: パフォーマンステスト・調整
**優先度**: Medium  
**見積時間**: 60分  
**担当領域**: 全体  

**テスト内容**:
1. **レスポンス時間測定**:
   - スライダー操作から平均バー更新まで50ms以内確認
   - キャッシュ利用時20ms以内確認
   - 初回キャッシュ構築200ms以内確認

2. **メモリ使用量測定**:
   - キャッシュサイズ1MB以内確認
   - メモリリーク検出
   - 長時間使用での安定性確認

3. **ユーザーシナリオテスト**:
   - 連続スライダー操作時の追従性
   - 複数項目変更時の正確性
   - エラー時のフォールバック動作

**調整項目**:
- キャッシュ有効期限の最適化
- DOM操作の最適化
- エラーハンドリングの改善

**完了条件**:
- 全パフォーマンス目標達成
- ユーザーシナリオテスト通過
- メモリリークなし

## Quality Assurance

### Code Review Checklist
- [ ] **コード品質**: 単一責任原則遵守、適切な命名
- [ ] **エラーハンドリング**: window.errorHandler統合、適切な例外処理
- [ ] **パフォーマンス**: 50ms以内のレスポンス時間
- [ ] **データ整合性**: null値処理、6カテゴリ対応
- [ ] **既存機能**: 自動保存、画面遷移との互換性

### Integration Testing
- [ ] **単体テスト**: 各メソッドの個別テスト
- [ ] **結合テスト**: メソッド間連携テスト
- [ ] **E2Eテスト**: ユーザー操作からUI更新まで
- [ ] **ストレステスト**: 連続操作、大量データでの動作確認

### User Acceptance Testing
- [ ] **基本操作**: スライダー操作で即座に平均バー更新
- [ ] **複数操作**: 連続変更時の追従性
- [ ] **エラー処理**: 異常時でも操作継続可能
- [ ] **データ保存**: 画面遷移後のデータ保持確認

## Risk Management

### 高リスク項目
1. **パフォーマンス**: 50ms目標達成が困難な場合
   - **対策**: キャッシュ戦略見直し、DOM操作最適化
   
2. **既存機能影響**: 自動保存・画面遷移への悪影響
   - **対策**: 段階的実装、既存テストの実行
   
3. **メモリリーク**: キャッシュによるメモリ使用量増大
   - **対策**: 適切なクリア処理、有効期限設定

### 中リスク項目
1. **Chrome拡張制約**: Manifest V3での動作制限
   - **対策**: 標準API使用、CSP準拠
   
2. **エラーハンドリング**: 想定外エラーでの動作停止
   - **対策**: 包括的try-catch、フォールバック処理

## Delivery Plan

### Phase 1 (3時間)
- Task 1.1: getCurrentFormRating() 実装
- Task 1.2: calculateAveragesWithCurrent() 実装  
- Task 1.3: updateAverageBarRealtime() 実装

### Phase 2 (1.5時間)
- Task 2.1: キャッシュ管理プロパティ追加
- Task 2.2: inputイベントリスナー修正

### Phase 3 (2時間)
- Task 3.1: 保存処理修正
- Task 3.2: 画面遷移処理修正
- Task 3.3: パフォーマンステスト・調整

### 総見積時間: 6.5時間

## Success Criteria

### 必須要件
- ✅ 評価スライダー操作時に平均バーがリアルタイム更新される
- ✅ 50ms以内のレスポンス時間を達成する
- ✅ null値処理が正確に動作する
- ✅ 既存機能に影響を与えない
- ✅ エラー時にユーザー操作が阻害されない

### 望ましい要件
- ✅ キャッシュ利用時20ms以内のレスポンス
- ✅ メモリリークなしの長時間動作
- ✅ 直感的で滑らかなユーザー体験
- ✅ デバッグログによる保守性向上

この実装計画により、要件定義で定めた5つの要件すべてを満たし、Chrome拡張機能として安定したリアルタイム平均バー更新機能を実現します。