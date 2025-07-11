# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「ウディこん助 (WodiConsuke)」- WOLF RPGエディターコンテスト用Chrome拡張機能の開発プロジェクト。作品プレイ体験を向上させる完全ローカル動作の拡張機能を目指している。

## Claude言語設定
- 作業やドキュメント類は英語
- Claude回答や、ユーザとのコミュニケーションは日本語で行う

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
- **Web監視系**: 作品更新通知、HTMLクローリング（✅フェーズ1完了）
- **ローカル連携**: フォルダ参照（file://制約あり）
- **データ管理**: chrome.storage.local（5MB制限）

### 実装済みコンポーネント
- **基本UI**: SPA構成、6カテゴリ評価システム、自動保存
- **Web監視基盤**: pageParser.js, webMonitor.js, updateManager.js
- **Background Service Worker**: 定期監視、アラーム管理
- **手動テスト機能**: 監視実行、状態確認ボタン

### 技術制約
- 完全ローカル動作（外部API不使用）
- HTMLクローリングベース（公式サイト構造変更リスク）
- Chrome拡張セキュリティ制約への対応必須

### 開発完了項目
- 作品プレイ補助機能（評価・感想・管理システム）
- Web監視機能フェーズ1（監視基盤・検出・通知システム）

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

4. **Git操作**
   ```bash
   git add .                    # 変更をステージング
   git commit -m "説明"         # コミット
   git push origin main         # リモートプッシュ
   ```

## アーキテクチャ

### 全体設計
Chrome Manifest V3ベースのSingle Page Application。Service Worker + Content Script + Popup の3層構成で完全ローカル動作を実現。

### データフロー
1. **background.js** (Service Worker) がChrome Alarms APIで定期監視をスケジュール
2. **pageParser.js** がsilversecond.comをfetchしてHTML解析、新規/更新作品を検出
3. **updateManager.js** が検出結果を処理し、chrome.storage.localに保存、chrome.notifications.create()で通知
4. **popup.js** がUI表示とユーザー操作を処理、dataManager.jsでCRUD操作

### 重要な相互依存
- 全モジュールはwindowオブジェクトにグローバルインスタンスを作成（例：window.gameDataManager）
- popup.htmlで全JSファイルを順次読み込み、依存関係を解決
- chrome.storage.localが唯一の永続化層（5MB制限）
- Web監視系はService Workerとポップアップ間でchrome.runtime.onMessage通信

### セキュリティ考慮
- Host permissions: https://silversecond.com/* のみ
- 外部API一切不使用、完全ローカル動作
- HTMLクローリングのため、サイト構造変更リスクあり（複数パターンで対応）
