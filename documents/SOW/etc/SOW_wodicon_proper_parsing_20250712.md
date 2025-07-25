# SOW: ウディコンページ正式解析機能実装

---
date: 2025-07-12
status: Todo
category: Web監視機能
priority: High
estimated_effort: 3-4時間
---

## 概要
正しいウディコンページURL「https://silversecond.com/WolfRPGEditor/Contest/entry.shtml」からの適切な作品情報解析機能を実装する。現在のページ解析システムは誤ったURL構造を想定しており、実際のページ構造に対応した解析パターンの実装が必要。

## 背景・経緯
- 現在のPageParserは古いURL構造を想定（https://silversecond.com/WolfRPGEditor/Contest/）
- 実際の正しいURLは「https://silversecond.com/WolfRPGEditor/Contest/entry.shtml」
- 作品番号の誤った3桁ゼロパディング実装（"001"→"1"に修正要）
- ページ解析が失敗し、自動監視機能が機能していない状態

## 要件定義

### 機能要件
1. **URL設定修正**
   - PageParserのtargetUrlsを正しいURLに修正
   - WebMonitorのfetchContestPage()メソッドの対象URL更新

2. **作品番号正規化処理修正**
   - 3桁ゼロパディング処理を削除
   - 作品番号は"1", "2", "3"の形式で保持
   - 既存データの作品番号を正規化（"001"→"1"）

3. **ページ解析パターン実装**
   - entry.shtmlの実際のHTML構造に対応した解析パターン作成
   - 作品リストの要素セレクタ特定
   - タイトル、作者、更新日時の正確な抽出ロジック

4. **診断機能強化**
   - 実際のページ構造診断機能
   - 解析失敗時の詳細エラー情報出力
   - HTML構造変更検出機能

### 非機能要件
- 既存の監視機能との完全互換性維持
- Chrome拡張セキュリティ制約への対応
- エラー耐性とフォールバック機能

## 技術仕様

### 修正対象ファイル
1. **js/pageParser.js**
   - targetUrls配列の修正
   - 解析パターンの実装・修正
   - 作品番号抽出ロジック修正

2. **js/webMonitor.js**
   - fetchContestPage()の対象URL修正
   - addNewWork()の作品番号処理修正

3. **js/dataManager.js**
   - 既存データの作品番号正規化処理

### 実装手順
1. **Phase 1: URL・データ構造修正**
   - PageParserのtargetUrls修正
   - 作品番号ゼロパディング処理削除
   - 既存データの作品番号正規化

2. **Phase 2: 解析パターン実装**
   - 実際のentry.shtmlページ構造調査
   - 適切な解析パターン実装
   - テスト・検証

3. **Phase 3: 診断機能強化**
   - 詳細診断情報出力機能
   - エラー処理・フォールバック強化

## 成果物

### 必須成果物
- 修正されたPageParserクラス（正しいURL、解析パターン）
- 修正されたWebMonitorクラス（作品番号処理修正）
- 既存データ正規化スクリプト
- 動作確認テスト結果

### 検証基準
- 正しいURLからの作品情報取得成功
- 作品番号が"1", "2", "3"形式で正しく処理される
- 手動監視実行で解析情報が正常表示される
- 既存データとの互換性維持

## リスク・注意事項

### 技術リスク
- 実際のページ構造が想定と異なる可能性
- HTML構造の動的変更による解析失敗
- 既存データ移行時の整合性問題

### 対応策
- 複数解析パターンによるフォールバック
- 詳細な診断機能による問題特定
- データバックアップ・ロールバック機能

### 取得が必要な項目
- No
- 作品名
- 更新日時
- バージョン（存在しない場合は不要）

## スケジュール
- 設計・URL修正: 0.5時間
- 解析パターン実装: 1.5時間
- 既存データ正規化: 0.5時間
- テスト・検証: 0.5時間
- 統合・動作確認: 0.5時間

**合計見積工数: 3.5時間**

## 補足事項
- 明日からは実際のウディコンページが利用可能予定
- 現在はサンプルページでの検証のみ可能
- 実装完了後、実際のページでの再検証が必要