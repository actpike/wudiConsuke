# SOW: ウディコンページ正確解析システム実装

---
date: 2025-07-12
status: Todo
category: Web監視機能フェーズ2
priority: High
estimated_effort: 2-3時間
---

## 概要
正しいウディコンURL「https://silversecond.com/WolfRPGEditor/Contest/entry.shtml」からの作品情報解析を可能にするシステムを実装する。現在の解析処理が文字化けやパターンマッチング失敗により機能していないため、根本的な解析ロジックの見直しと実装を行う。

## 背景・経緯
- **現状問題**: pageParser.jsでの解析が文字化けで失敗（Shift_JIS対応不完全）
- **URL認識**: 正しいウディコンURLは「https://silversecond.com/WolfRPGEditor/Contest/entry.shtml」
- **番号形式**: 作品番号は「1」「2」「3」（3桁ゼロパディング「001」は不要）
- **解析失敗例**: 「1Eij」「wEijx」等の文字化けで正常な作品情報取得不可
- **ユーザー明確化**: 3桁ゼロパディングは元から要求されておらず、削除が必要

## 要件定義

### 機能要件
1. **正確なページ解析システム**
   - https://silversecond.com/WolfRPGEditor/Contest/entry.shtml からの作品情報抽出
   - Shift_JISエンコーディング完全対応
   - 作品タイトル、作者名、更新日時の正確な取得

2. **文字エンコーディング対応**
   - Shift_JIS→UTF-8変換の完全実装
   - 文字化け防止・品質保証
   - 日本語文字の正確な処理

3. **作品番号正規化**
   - 3桁ゼロパディング処理の完全削除
   - 作品番号「1」「2」「3」での正確な管理
   - URL生成時の正しい番号形式使用

4. **解析パターン最適化**
   - 実際のウディコンページ構造に適合した解析ロジック
   - HTMLパターンマッチングの精度向上
   - エラー時の適切な診断情報出力

### 非機能要件
- 解析成功率: 95%以上
- レスポンス時間: 3秒以内
- エラー時の適切な診断情報提供
- 既存機能との完全な互換性維持

## 技術仕様

### 現在の問題分析
```
解析失敗結果:
- 作品1: {no: '1', title: '1Eij', author: undefined}
- 作品2: {no: undefined, title: 'wEijx', author: undefined}

原因:
1. Shift_JISデコーディング不完全
2. HTMLパターンマッチングロジック不適切
3. 3桁ゼロパディング処理が不要なのに実装されている
```

### 修正対象ファイル・メソッド
1. **js/pageParser.js**
   - parseContestPage(): エンコーディング処理強化
   - parseEntryPage(): HTMLパターン完全見直し
   - getTargetUrls(): 正しいURL設定
   - 3桁ゼロパディング処理の完全削除

2. **js/webMonitor.js**
   - fetchContestPage(): Shift_JIS対応強化
   - addNewWork(): 番号正規化処理修正

3. **js/dataManager.js**
   - getGameByNo(): 3桁パディング処理削除

### 実装仕様

#### 1. 正確なURL設定
```javascript
getTargetUrls() {
  return [
    'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml'
    // 他のフォールバックURLは削除
  ];
}
```

#### 2. Shift_JISデコーディング強化
```javascript
// TextDecoder設定最適化
const decoder = new TextDecoder('shift_jis', { 
  fatal: false, 
  ignoreBOM: true 
});
```

#### 3. 作品番号正規化（ゼロパディング削除）
```javascript
// 修正前（誤り）
workData.no = String(work.no).padStart(3, '0'); // 削除

// 修正後（正しい）
workData.no = String(work.no); // 「1」「2」「3」のまま
```

## 実装手順

### Phase 1: 基盤修正（90分）
- pageParser.jsの根本的リファクタリング
- Shift_JISエンコーディング処理完全実装
- HTMLパターンマッチング精度向上

### Phase 2: 番号正規化修正（45分）
- 全ファイルから3桁ゼロパディング処理削除
- 作品番号「1」「2」「3」での統一管理
- URL生成ロジック修正

### Phase 3: 統合テスト・検証（45分）
- 実際のウディコンページでの解析テスト
- 文字化け解消確認
- 作品情報の正確性検証

## 成果物

### 必須成果物
- 正確なウディコンページ解析機能
- Shift_JIS文字化け完全解消
- 3桁ゼロパディング処理の完全削除
- 作品情報（タイトル、作者、更新日時）の正確取得

### 検証基準
```
成功基準:
✅ https://silversecond.com/WolfRPGEditor/Contest/entry.shtml から情報取得
✅ 文字化けなしでのタイトル・作者名取得
✅ 作品番号は「1」「2」「3」（001形式は削除）
✅ 解析情報表示で正確な診断情報出力
```

## リスク・対応策

### 技術リスク
- **Shift_JIS変換失敗**: TextDecoderオプション調整、フォールバック実装
- **HTMLパターン変更**: 複数パターン対応、エラー診断強化
- **既存データ互換性**: 段階的移行、バックアップ機能

### 運用リスク
- **サイト構造変更**: 定期的なパターン検証、アラート機能
- **文字エンコーディング変更**: 自動検出機能、複数エンコーディング対応

## 修正詳細

### 削除対象コード
```javascript
// 以下は全て削除
.padStart(3, '0')
String(workData.no).padStart(3, '0')
entry.shtml#001  // → entry.shtml#1
```

### 新規実装コード
```javascript
// HTMLパターンマッチング強化
const entryPattern = /エントリー番号【(\d+)】[\s\S]*?【(.+?)】[\s\S]*?作者\s*:\s*(.+?)[\s\S]*?\[([^\]]+)\]/g;

// Shift_JIS対応強化
const html = new TextDecoder('shift_jis', {
  fatal: false,
  ignoreBOM: true
}).decode(arrayBuffer);
```

## スケジュール
- 基盤修正: 1.5時間
- 番号正規化修正: 0.75時間
- 統合テスト・検証: 0.75時間

**合計見積工数: 3時間**

## 依存関係
- Chrome Extension Manifest V3制約への準拠
- 既存Web監視機能との互換性維持
- gameDataManagerとの連携保持

## 補足事項
- 本SOWは根本的な解析システムの見直しを含む
- 実装完了後、手動テスト機能での動作確認が重要
- 3桁ゼロパディング削除は全システムへの影響があるため注意深い実装が必要