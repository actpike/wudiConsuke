# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「ウディこん助 (WodiConsuke)」- WOLF RPGエディターコンテスト用Chrome拡張機能の開発プロジェクト。作品プレイ体験を向上させる完全ローカル動作の拡張機能を目指している。

## Claude言語設定
- 作業やドキュメント類は英語
- Claude回答や、ユーザとのコミュニケーションは日本語で行う

## 関連資料
- 機能追加・修正等が完了し、git操作を行う際VERSION.mdに従う
	`VERSION.md`
- ユーザから配布準備の依頼を受けた場合、下記資料を参照する
	'UdiConsuke\documents\chromeStore\releaseReference(配布指南書).md'
- 自動化スクリプトの詳細は下記を参照
	`scripts/README.md`
- 今後もバージョンアップの度に、READMEの更新履歴を3行で要約して追記する
- 紹介ページ（website/release/index.html）の更新履歴セクションも同時に更新する

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
- **ローカル連携**: フォルダ参照（file://制約あり）
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
- **最新リリース**: v0.0.4
- **主な新機能**: 
  - 新規登録時の評価表示改善（全項目「-」表示で直感的な未評価状態）
  - 詳細画面の更新日クリーンアップ（「→ご意見/バグ報告BBS」等の不要文言自動除去）
  - コードベース最適化（データ処理の重複削除・updateManager.jsへの統一）
  - 不要なテストコード・設定項目の整理
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
- **自動保存**: 3秒間隔でのdebounced自動保存（navigation.js）
- **モジュール初期化**: popup.htmlで順次読み込み、windowオブジェクトにインスタンス作成
