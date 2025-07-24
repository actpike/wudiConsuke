---
project_name: "ウディこん助 評価項目定数統一・アーキテクチャ整合性修正"
status: "Todo"
owner: "Claude Code Assistant"
created_at: "2025-01-24"
updated_at: "2025-01-24"
---

- **Project Name:** `ウディこん助 評価項目定数統一・アーキテクチャ整合性修正`
- **Creation Date:** `2025-01-24`
- **Revision History:**
  - `v1.0 (2025-01-24): Initial draft based on Gemini code review #2`

#### 1. Project Purpose & Background

**目的**: Geminiコードレビュー指摘事項に基づき、評価項目の定数不整合とアーキテクチャの過渡期問題を解決し、データ管理の一貫性を確保する。

**背景**: 
- constants.jsの`RATING_CATEGORIES`が英語定義だが、実装では日本語文字列を直接使用（二重管理）
- `SORT_TYPES`の定義が実装と不一致（'no'のみ定義、実際は複数のソート実装済み）
- yearManager.js導入により年度別アーキテクチャに移行中だが、dataManager.jsが古いストレージキーを使用

#### 2. Project Scope

**対象範囲**:
- constants.js: 評価項目定数を実装に合わせて修正
- navigation.js, popup.js: ハードコーディングされた評価項目を定数参照に変更
- constants.js: SORT_TYPESを実装済みソート項目に合わせて拡張
- dataManager.js: yearManager.jsとの連携によるデータアクセス統一

**対象外**:
- 既存の評価項目名の変更（UI互換性維持）
- 大規模なアーキテクチャ変更（段階的修正のみ）

#### 3. Specific Requirements

##### 3.1 評価項目定数統一（最高優先度）

**要件**: RATING_CATEGORIESの実装統一
- constants.jsの英語定義を日本語配列に変更
- navigation.js, popup.jsでハードコーディングされた評価項目を定数参照に変更
- 評価項目の一元管理を実現

**修正対象**:
```javascript
// constants.js - 現在の問題
const RATING_CATEGORIES = {
  STORY: 'story',      // 使用されていない英語定義
  GRAPHICS: 'graphics',
  // ...
};

// 修正後
const RATING_CATEGORIES = [
  '熱中度',
  '斬新さ', 
  '物語性',
  '画像音声',
  '遊びやすさ',
  'その他'
];
```

**対象ファイル**:
- navigation.js L:XX: `const categories = ['熱中度', '斬新さ', ...]` → `window.constants.RATING_CATEGORIES`
- popup.js: 評価項目のハードコーディング箇所を定数参照に変更

##### 3.2 ソート定数拡張

**要件**: SORT_TYPESの実装同期
- popup.jsのsortGamesメソッドで実装済みのソート項目をすべて定数化
- 実装と定義の完全一致を実現

**追加項目**:
```javascript
const SORT_TYPES = {
  NO: 'no',
  TITLE: 'title',
  RATING_ENTHUSIASM: '熱中度',
  RATING_NOVELTY: '斬新さ',
  RATING_STORY: '物語性', 
  RATING_GRAPHICS_AUDIO: '画像音声',
  RATING_USABILITY: '遊びやすさ',
  RATING_OTHER: 'その他',
  UPDATED_AT: 'updated_at'
};
```

##### 3.3 年度別ストレージ統一

**要件**: dataManager.jsとyearManager.jsの連携統一
- 古い`STORAGE_KEYS.GAMES`の削除
- `DATA_PREFIX`による動的ストレージキー生成
- yearManagerとの連携によるデータアクセス統一

**実装方針**:
```javascript
// constants.js
const STORAGE_KEYS = {
  DATA_PREFIX: 'wodicon_data_',  // 'wodicon_games'を削除
  // ...
};

// dataManager.js
const currentYear = window.yearManager.getCurrentYear();
const storageKey = window.constants.STORAGE_KEYS.DATA_PREFIX + currentYear;
```

#### 4. Technical Approach

##### 4.1 段階的修正手法
- Phase 1: 評価項目定数統一（影響範囲限定）
- Phase 2: ソート定数拡張（機能追加なし）
- Phase 3: ストレージアーキテクチャ統一（慎重な変更）

##### 4.2 互換性維持
- 既存UIの評価項目名は変更しない
- データ移行スクリプトは作成しない（yearManager.jsが対応済み）
- 段階的リファクタリングで動作確認を重視

#### 5. Deliverables

**成果物**:
1. **修正済みconstants.js** - 実装同期された定数定義
2. **修正済みnavigation.js** - 定数参照による評価項目処理
3. **修正済みpopup.js** - ソート・評価項目の定数参照
4. **修正済みdataManager.js** - yearManager連携統一
5. **動作確認レポート** - 既存機能の正常動作確認

#### 6. Success Criteria

**成功基準**:
- 評価項目のハードコーディング完全撤廃
- SORT_TYPESと実装の100%一致
- dataManager.jsの年度別ストレージ対応完了
- 既存機能の動作に影響なし
- 定数変更による一元管理の実現

#### 7. Timeline

**予定期間**: 1日（6時間）

**タスク分解**:
1. **評価項目定数統一** (2時間): constants.js修正、navigation.js/popup.js更新
2. **ソート定数拡張** (1時間): SORT_TYPES完全定義
3. **ストレージ統一** (2時間): dataManager.js年度別対応
4. **動作確認** (1時間): 全機能テスト

#### 8. Risk Management

**リスク要因**:
- 評価項目変更による既存データとの不整合
- ストレージアーキテクチャ変更による予期しない動作
- 定数参照でのnull/undefined例外

**対策**:
- 段階的修正と各段階での動作確認
- yearManager.jsの既存データ移行機能を活用
- 定数アクセス時の安全な参照パターン実装

#### 9. Dependencies & Constraints

**依存関係**: 
- yearManager.js (年度管理機能)
- 既存のconstants.js, navigation.js, popup.js, dataManager.js

**制約事項**: 
- 既存UIの評価項目表示は変更しない
- データ互換性を維持する

#### 10. Stakeholder Communication

**報告対象**: プロジェクト責任者
**報告内容**: 定数統一完了報告、アーキテクチャ整合性改善効果、動作確認結果