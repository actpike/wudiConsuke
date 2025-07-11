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
