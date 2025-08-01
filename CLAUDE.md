# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「ウディこん助 (WodiConsuke)」- WOLF RPGエディターコンテスト用Chrome拡張機能の開発プロジェクト。作品プレイ体験を向上させる完全ローカル動作の拡張機能を目指している。

## Claude言語設定
- 作業やドキュメント類は英語
- Claude回答や、ユーザとのコミュニケーションは日本語で行う

## 重要なプロジェクト指針

### プロジェクト成熟度
このプロジェクトは**正式リリース完了済み**（v1.0.0）の実用プロダクトです。現在は微調整・改善フェーズにあり、大幅な機能追加よりも品質向上と保守性を重視します。

### 関連資料
- バージョン管理: `VERSION.md` - git操作時は必ずバージョン情報を確認
- リリース自動化: `scripts/README.md` - 自動化システムの詳細仕様
- 配布指南書: `documents/chromeStore/releaseReference(配布指南書).md`
- 紹介ページ更新: `website/release/index.html` - バージョンアップ時は必ず更新

## プロジェクト構造

### ドキュメント管理
- `documents/wodicon_helper_requirements.md` - メイン要件定義書
- `documents/SOW/` - SOW管理フォルダ
  - `SOW_Reference.md` - SOWテンプレートとガイドライン
  - `backlog/` - 新規作成SOW（未着手）
  - `working/` - 進行中SOW
  - `done/` - 完了SOW
- `documents/memo/` - プロジェクトメモ

### SOWワークフロー
- 新規SOWは必ず`backlog/`フォルダに配置
- フォルダ移動時はYAMLフロントマターのstatusも更新（Todo/In Progress/Done）
- 日付は`date`コマンドで正確に入力

## Chrome拡張機能アーキテクチャ

### 主要機能モジュール
- **プレイ補助**: 既プレイチェックリスト、感想記録（✅完了）
- **実用的自動監視**: サイト訪問時・ポップアップ開時の自動監視（✅完了）
- **ローカル連携**: フォルダ参照（未実装・検証済み、file://制約により困難）
- **データ管理**: chrome.storage.local（5MB制限）

### 実装済みコンポーネント
- **基本UI**: SPA構成、6カテゴリ評価システム、自動保存
- **Web監視基盤**: pageParser.js, webMonitor.js, updateManager.js
- **実用的自動監視**: content.js（サイト訪問時）、popup.js（ポップアップ開時）
- **手動監視機能**: 従来通りの手動監視、状態確認ボタン
- **紹介ページ**: website/release/ 実用的自動監視対応済み

### 技術制約
- 完全ローカル動作（外部API不使用）
- HTMLクローリングベース（公式サイト構造変更リスク）
- Chrome拡張セキュリティ制約への対応必須

### 開発完了項目
- **作品プレイ補助機能**（評価・感想・管理システム）
- **実用的自動監視システム**（Chrome Manifest V3制約対応）
- **紹介ページリニューアル**（一般利用者向け説明、ブラウザ判定機能付き）
- **個別作品削除機能**（確認ダイアログ付き安全削除）
- **バージョン表示機能**（Chrome拡張・紹介ページ両方）
- **平均バー初期化バグ修正**（新規作品表示時の正しい平均値表示）
- **新規登録時評価表示改善**（null値を「-」表示で直感的な未評価状態）
- **コードベース最適化**（データ処理統一化・重複削除）

### 現在のバージョン
- **最新本番リリース**: v1.0.2（複数年度対応・CSV対応データエクスポート・インポート機能）
- **最新開発版**: v1.0.2-pre（Web監視通知システム修正とデバッグパネル実装）
- **プロジェクト状況**: 主要機能実装完了、現在は微調整・改善フェーズ
- **v1.0.0の主な成果**: 
  - 正式リリース達成（Chrome Web Store準拠）
  - 統一エラーハンドリング・定数管理システム
  - GeminiCLI統合による品質向上
  - 完全自動化リリースシステム
- **配布URL**: https://wudi-consuke.vercel.app/

### リリース管理・zip圧縮ルール
#### 重要なファイル命名規則
```python
# zip作成時の厳密なルール
zip内容: WudiConsuke/ (バージョン表記なし)
zipファイル名: WudiConsuke_release_v[version].zip

# 例: v0.0.3リリースの場合
# フォルダ名: WudiConsuke (固定)
# zipファイル名: WudiConsuke_release_v0.0.3.zip
```

#### 理由・背景
- **上書きインストールの利便性**: ユーザーが常に同じフォルダ名「WudiConsuke」に解凍することで、データ保持しながらアップグレード可能
- **バージョン管理**: zipファイル名にバージョンを含めることで、開発者側でのバージョン追跡が容易

## Claude Code Spec-Driven Development

**仕様駆動開発**: claude-code-specのKiroパッケージを活用した体系的開発プロセス

### 導入済みコンポーネント
- **Kiroパッケージ**: `.claude/commands/kiro/` - 仕様駆動開発のSlash Commands
- **プロジェクト舵取り**: `.kiro/steering/` - プロジェクト知識の体系化
- **仕様管理**: `.kiro/specs/` - 機能仕様の段階的管理
- **インタラクティブ承認**: 各フェーズでのユーザー確認プロセス

### 開発ワークフロー

#### Phase 0: プロジェクト舵取り（推奨）
```bash
/kiro:steering          # 舵取りドキュメント自動生成・更新
/kiro:steering-custom   # 専門コンテキスト用カスタム舵取り
```
**目的**: プロジェクト知識の体系化（product.md, tech.md, structure.md）

#### Phase 1: 仕様作成（段階的承認プロセス）
```bash
/kiro:spec-init [project-description]    # 詳細なプロジェクト説明から仕様構造初期化
/kiro:spec-requirements [feature-name]   # EARS形式要件定義生成
/kiro:spec-design [feature-name]         # 技術設計生成（インタラクティブ承認）
/kiro:spec-tasks [feature-name]          # 実装タスク生成（インタラクティブ承認）
```
**特徴**: 
- **EARS形式**: "WHEN/IF/WHILE/WHERE... THEN system SHALL..." 構文
- **インタラクティブ承認**: 手動spec.json編集不要、確認プロンプトで自動進行
- **日本語対応**: spec.jsonのlanguage設定に基づく多言語対応

#### Phase 2: 進捗追跡
```bash
/kiro:spec-status [feature-name]         # 現在の進捗とフェーズ確認
```

### 重要原則
- **段階的承認**: 各フェーズで人間による確認・承認が必要
- **インタラクティブ承認**: "requirements.mdをレビューしましたか？ [y/N]" 形式
- **品質重視**: 仕様の完成度を高めてから実装に進む
- **文書化**: `.kiro/specs/` および `.kiro/steering/` で管理
- **セキュリティ**: 機密情報を舵取りドキュメントに含めない原則

### アクティブな仕様
- **wodicon-architecture-documentation**: ウディこん助Chrome拡張機能のアーキテクチャドキュメント作成（シーケンス図、データフロー可視化）
- **wudiConsuke-documentation**: ウディこん助Chrome拡張機能のアーキテクチャドキュメント作成（主要コンポーネント間相互作用、Web監視システム、UI操作フロー）
- **realtime-average-bar-fix**: 個別詳細画面の平均バーリアルタイム反映機能の修正（navigation.js バグ修正）

## SOW作成ガイドライン

**役割:** 経験豊富なプロジェクトマネージャーとして、明確で包括的なSOWを作成

**基本原則:**
- **明確性**: 一意に解釈可能な言語使用
- **具体性**: 曖昧な表現（「等」「など」）を避ける
- **包括性**: 全セクション記入（該当なしの場合は明記）

**作成プロセス:**
1. `documents/SOW/SOW_Reference.md`のテンプレートに厳密に従う
2. SOWに記載のない事は無断で行わない
3. 不明点は項目化してリスト形式で質問
4. 新規SOWは`documents/SOW/backlog/`に配置
5. 出力はMarkdown形式（YAMLフロントマター含む）

## 開発コマンド

### Chrome拡張機能の開発・テスト
Chrome拡張機能には伝統的なbuild/lint/testコマンドはありません。以下の手順で開発します：

1. **拡張機能のロード**
   ```bash
   # Chrome でchrome://extensions/ を開く
   # 開発者モードを有効化
   # 「パッケージ化されていない拡張機能を読み込む」で wodicon_helper/ フォルダを選択
   ```

2. **リロード・デバッグ**
   ```bash
   # 拡張機能ページで「リロード」ボタンをクリック
   # ポップアップを右クリック → 「検証」でDevToolsを開く
   # background.js のデバッグは chrome://extensions/ → 「service worker」リンク
   ```

3. **Web監視機能のテスト**
   ```bash
   # ポップアップ内の「🔍 手動監視実行」ボタンで基盤機能をテスト
   # 「📊 監視状態確認」ボタンで設定・履歴を確認
   ```

4. **Git操作・リリース管理**
   ```bash
   git add .                    # 変更をステージング
   git commit -m "説明"         # コミット
   git push origin main         # リモートプッシュ
   ```
   
   **⚠️ Git管理の重要な注意点:**
   - **zipファイルコミット漏れ防止**: ワーキングディレクトリが `wodicon_helper/` の場合、上位の `website/` フォルダの変更（新しいzipファイル等）が `git add .` に含まれない
   - **対策**: `git status` で全変更ファイルを確認してから `git add` を実行
   - **リリース手順**: 
     1. Chrome拡張機能のバージョン更新（manifest.json, popup.html）
     2. 新zipファイル作成・配置（website/release/versions/）
     3. 紹介ページ更新（ダウンロードリンク、バージョン表示）
     4. **全ファイルの存在確認後**にgit操作

### 🔄 ユーザーからpush指示を受けた場合の対応

**基本方針**: 手動git操作ではなく、自動化システムを活用する

#### パターン1: 開発中のコード変更をpushしたい場合
```bash
npm run create-release
```
- `-pre.zip` 作成
- Webサイト更新なし（開発用）
- 開発版コミットメッセージで自動push

#### パターン2: 本番リリースしたい場合  
```bash
npm run create-release:production
```
- 本番用zip作成
- 紹介ページ自動更新
- pre版削除
- 本番リリースコミットメッセージで自動push

#### パターン3: 通常のコード変更のみの場合
従来通りの手動git操作
```bash
git add .
git commit -m "適切なメッセージ"
git push origin main
```

**判断基準**: 
- Chrome拡張機能のファイル変更あり → 自動化システム使用
- ドキュメントやscript変更のみ → 手動git操作でも可

## アーキテクチャ

### 全体設計
Chrome Manifest V3ベースのSingle Page Application。Service Worker + Content Script + Popup の3層構成で完全ローカル動作を実現。

### データフロー（実用的自動監視システム）
1. **content.js** がウディコンサイト訪問時に自動監視実行（30分間隔制限）
2. **popup.js** が拡張機能開時に定期監視実行（1時間以上経過時）
3. **pageParser.js** がsilversecond.comをfetchしてHTML解析、新規/更新作品を検出
4. **updateManager.js** が検出結果を処理し、chrome.storage.localに保存、chrome.notifications.create()で通知
5. **popup.js** がUI表示とユーザー操作を処理、dataManager.jsでCRUD操作

**注意**: 従来のbackground.js定期監視はChrome Manifest V3制約により廃止済み

### 重要な相互依存
- 全モジュールはwindowオブジェクトにグローバルインスタンスを作成（例：window.gameDataManager）
- popup.htmlで全JSファイルを順次読み込み、依存関係を解決
- chrome.storage.localが唯一の永続化層（5MB制限）
- Web監視系はService Workerとポップアップ間でchrome.runtime.onMessage通信

### 主要クラス構造
- **GameListManager** (popup.js): メイン画面のゲーム一覧管理・UI制御
- **GameDataManager** (dataManager.js): chrome.storage.local操作・データCRUD
- **Navigation** (navigation.js): 詳細画面・画面遷移管理
- **WebMonitor** (webMonitor.js): Web監視実行・ページ取得
- **UpdateManager** (updateManager.js): 更新検知・新規作品処理（統一データ処理）
- **PageParser** (pageParser.js): HTML解析・差分検出
- **ErrorHandler** (errorHandler.js): 統一エラーハンドリング・通知システム
- **Constants** (constants.js): 定数管理・マジックナンバー排除

### データ処理の統一化
- v0.0.4で重複処理を統一：全てのデータ処理はupdateManager.jsに集約
- webMonitor.jsは監視実行のみ、実際のデータ処理はupdateManagerに委譲
- 新規作品・更新作品の処理フローが統一され、データ不整合を防止

### セキュリティ考慮
- Host permissions: https://silversecond.com/* のみ
- 外部API一切不使用、完全ローカル動作
- HTMLクローリングのため、サイト構造変更リスクあり（複数パターンで対応）

### 重要な設計パターン
- **評価システム**: 新規作品は全項目null初期値、UI上「-」表示
- **null値処理**: 詳細画面・一覧画面・平均計算でnull値を適切に除外
- **データ統一**: updateManager.jsがすべてのデータ処理を担当（重複防止）
- **自動保存**: イベント駆動型保存（画面遷移時・拡張機能終了時、navigation.js）
- **モジュール初期化**: popup.htmlで順次読み込み、windowオブジェクトにインスタンス作成
- **統一エラーハンドリング**: window.errorHandlerによる分類・通知・履歴管理（v0.0.6追加）
- **定数管理**: window.constantsによるマジックナンバー・文字列の統一管理（v0.0.6追加）

## GeminiAPI統合パッケージ

### 概要
`scripts/gemini-integration/` - 汎用的なGeminiAPI統合モジュール。どのプロジェクトでも簡単に組み込み可能な独立したパッケージ。

### 主要機能
- **対話形式セットアップ**: APIキーの安全な設定管理
- **チャットセッション**: 単発メッセージ送信と継続的な会話
- **自動ログ記録**: 全会話を詳細にログ記録（conversations/, sessions/, errors/）
- **堅牢なエラーハンドリング**: リトライ機能付きエラー処理
- **テスト機能**: 接続テスト、日本語対応テスト等の包括的テスト

### 使用方法
```bash
# セットアップ
cd scripts/gemini-integration
npm install
npm run setup

# 接続テスト
npm test

# 対話型チャット
npm run chat
```

### 重要な設定
- **モデル**: gemini-2.5-flash（デフォルト）
- **温度**: 0.7（デフォルト）
- **最大トークン**: 4000（デフォルト）
- **ログ**: 会話履歴、セッション統計、エラーログの自動記録

### アーキテクチャ
- **GeminiClient**: メインクライアント（src/gemini-client.js）
- **GeminiChatSession**: チャットセッション管理
- **ConversationLogger**: 会話ログ記録（utils/conversation-logger.js）
- **GeminiConfig**: 設定管理（config/gemini-config.js）

### 統合例
```javascript
import { geminiClient } from './scripts/gemini-integration/src/gemini-client.js';

await geminiClient.initialize();
const result = await geminiClient.sendMessage('Hello, Gemini!');
console.log(result.response);
```

### 重要な制約
- **ファイルシステムアクセス不可**: GeminiAPIは直接ファイルを読み取れない
- **外部ツール実行不可**: bashコマンドやgit操作などは実行できない
- **リアルタイム情報取得不可**: 最新情報を自分で取得することはできない
- **実用性**: 現状では補助的な対話ツールとしての位置づけ

### セキュリティ
- APIキーは.envファイルで管理（.gitignore済み）
- セーフティ設定でハラスメント/危険内容を防止
- 本番環境では環境変数として設定推奨

## 重要な実装詳細

### Web監視通知システム修正（v1.0.2-pre）
- **通知件数表示問題の根本解決**: Background Script通信失敗時に古い `showAutoMonitorFeedback` 関数が呼ばれていた問題を修正
- **統一通知システム**: 全通知処理を `showAutoMonitorNoticeWithChanges` 関数に統一
- **データ抽出精度向上**: content.jsで59件中1文字タイトル問題を解決、webMonitor.jsの正常なロジックを統合
- **デバッグパネル実装**: ウディコンページ左上に開発時のみ表示される診断ツール（DOM構造スキャン、通知テスト、クールタイムクリア）

### ローカライズシステム（v1.0.2-pre）
- **紹介ページ多言語化**: 日本語・英語対応、ブラウザ言語自動検出、言語選択UI
- **動的メッセージ対応**: オプション画面でのリアルタイム言語切り替え
- **ファイルバリデーター多言語化**: CSVインポートエラーメッセージの多言語対応

### 評価スライダーの目盛り機能
- **実装場所**: navigation.js の `addTickMarks()` メソッド
- **仕組み**: 平均バーと同じz-index (4) で動的にdiv要素として目盛りを生成
- **分割**: 通常項目は9等分（1-10）、「その他」項目は10等分（0-10）
- **スタイル**: `rgba(102, 126, 234, 0.3)` の薄い青色縦線

### 新着フィルター機能
- **対象**: `version_status === 'new'` と `version_status === 'updated'` の両方
- **自動更新**: 詳細画面を開くとNEWステータス（🆕）とベルアイコン（🔔）が自動的に✅に変更
- **実装場所**: navigation.js の `resetUpdateNotification()` メソッド

### クリック可能領域の拡張
- **対象列**: No、作品名、更新、評価列（熱、斬、物、画、遊、他）すべて
- **実装**: navigation.js でクリック検知、popup.css でホバー効果
- **効果**: 任意の列クリックで詳細画面へ遷移可能

### 統一エラーハンドリングシステム
- **実装場所**: errorHandler.js の `window.errorHandler` グローバルインスタンス
- **機能**: エラー分類（network, storage, parse, timeout, permission）、通知作成、履歴追跡
- **使用方法**: `window.errorHandler.handleError(error, context)` で統一的なエラー処理

### 定数管理システム
- **実装場所**: constants.js の `window.constants` グローバルインスタンス
- **内容**: STORAGE_KEYS, FILTER_TYPES, SORT_TYPES, LIMITS, URLs, ERROR_MESSAGES
- **目的**: マジックナンバー・文字列の排除、保守性向上

## GeminiCLI統合パッケージ

### 概要
`scripts/gemini_cli/` - GeminiCLIを使用したコード分析とプロジェクト分析機能。従来のGeminiAPI統合とは異なり、CLI経由でファイルやプロジェクト全体を分析可能。

### 主要機能
- **📁 ファイル分析**: 個別ファイルの詳細分析
- **📊 プロジェクト分析**: プロジェクト全体の包括的分析  
- **🔍 コードレビュー**: 品質とセキュリティの評価
- **⚖️ ファイル比較**: 2つのファイルの比較分析
- **📋 結果保存**: Markdown形式での分析結果保存

### 使用方法
```bash
# セットアップ（ワンコマンド）
cd scripts/gemini_cli
npm run quick-start

# ファイル分析
node src/cli-analyzer.js file ./src/app.js

# プロジェクト分析
node src/cli-analyzer.js project ./my-project

# コードレビュー
node src/cli-analyzer.js review ./src/component.tsx

# 並列マルチ観点レビュー（NEW）
node multi-review.js ./project-path chrome_extension
node multi-review.js ./project-path chrome_extension architecture,security
```

### 前提条件
- **GeminiCLI**: `npm install -g https://github.com/google-gemini/gemini-cli`
- **認証**: `gemini` コマンドで初回認証が必要
- **Node.js**: 18以上

### アーキテクチャ
- **GeminiCLIWrapper** (cli-wrapper.js): CLI実行とエラーハンドリング
- **CLIAnalyzer** (cli-analyzer.js): 分析機能とファイル出力
- **設定管理**: config/cli-config.json で動作設定
- **結果出力**: output/ フォルダにMarkdown形式で保存

### GeminiAPIとの違い
| 機能 | GeminiAPI統合 | GeminiCLI統合 |
|------|--------------|--------------|
| ファイル読み取り | 不可（手動コピペ必要） | 可能（CLI経由） |
| プロジェクト分析 | 不可 | 可能 |
| 結果保存 | 手動 | 自動（Markdown） |
| 実用性 | 補助的対話 | 実用的分析ツール |

### 重要な制約
- **GeminiCLI依存**: 外部CLIツールのインストールが必要
- **認証要件**: Google認証プロセスが必要
- **ネットワーク依存**: インターネット接続必須
- **実行時間**: 大きなファイル・プロジェクトは時間がかかる（並列実行で改善）
- **タイムアウト**: 180秒/観点（コード量考慮済み）

### 開発フロー統合
詳細は `scripts/gemini_cli/README.md` の「🔄 推奨開発フロー」を参照：
1. **SOW作成** → 2. **改修** → 3. **テスト** → 4. **Geminiレビュー** → 5. **改修対応**

**マルチ観点レビュー**: Promise.allSettledによる真の並列処理で複数観点を同時実行
