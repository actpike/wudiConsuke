# SOW: manifest.json・README.md国際化対応

---
project_name: "manifest.json・README.md国際化対応"
status: "Todo"
owner: "Claude Code"
created_at: "2025-08-02"
updated_at: "2025-08-02"
---

- **Project Name:** `manifest.json・README.md国際化対応`
- **Creation Date:** `2025-08-02`
- **Revision History:**
  - `v1.0 (2025-08-02): Initial draft`

## 1. Project Purpose & Background

ウディこん助Chrome拡張機能の国際展開において、Chrome Web Storeでの多言語対応に必要な基本ファイルの国際化が未完了の状態である。

**現状課題:**
- manifest.jsonが日本語ハードコードのため、Chrome Web Storeで言語別表示ができない
- README.mdが日本語版のみで、英語圏ユーザーがプロジェクト理解困難
- Chrome拡張機能の標準的なi18n構造（_locales/）が未実装

Chrome Web Storeでの言語別ストア表示と、GitHub上での国際ユーザー向け情報提供を実現するため、これらの基本ファイルの多言語化を完成させる。

## 2. Scope of Work

### 2.1 manifest.json国際化対応
- **_localesディレクトリ構造の構築**
  - `_locales/ja/messages.json` - 日本語メッセージファイル作成
  - `_locales/en/messages.json` - 英語メッセージファイル作成
- **manifest.jsonのi18n対応**
  - `name`フィールドを`__MSG_appName__`形式に変更
  - `description`フィールドを`__MSG_appDesc__`形式に変更
  - `default_title`フィールドを`__MSG_appTitle__`形式に変更
  - `default_locale`フィールドを"ja"に設定
- **Chrome Web Store対応確認**
  - Developer Dashboardでの言語別表示検証
  - 拡張機能名・説明文の言語切り替え確認

### 2.2 README.md英語版作成
- **README.en.md新規作成**
  - 日本語版README.mdの内容を英語翻訳
  - Chrome拡張機能の機能説明、インストール方法、使用方法を英語化
  - スクリーンショット説明文の英語対応
- **言語切り替えリンクの追加**
  - 日本語版・英語版相互リンク実装
  - `[English](README.en.md) | [日本語](README.md)` 形式
- **英語技術用語の適切な表記**
  - "WOLF RPG Editor Contest" → "Wodicon"の併記
  - Chrome拡張機能特有の用語統一

## 3. Out of Scope

以下の項目は本SOWの対象外とする：
- Chrome拡張機能のUI多言語化（既に完了済み）
- 紹介ページ(website/release/)の多言語化（既に完了済み）
- 日本語・英語以外の言語対応
- Chrome Web Storeへの実際の申請・公開作業
- スクリーンショット画像の英語版作成
- 開発用ドキュメント（CLAUDE.md等）の英語化
- package.jsonやその他設定ファイルの国際化

## 4. Deliverables

### 4.1 Chrome拡張機能関連
- **新規ファイル:**
  - `/wodicon_helper/_locales/ja/messages.json` - 日本語メッセージファイル
  - `/wodicon_helper/_locales/en/messages.json` - 英語メッセージファイル
- **更新ファイル:**
  - `/wodicon_helper/manifest.json` - i18n対応版（`__MSG_*__`形式）

### 4.2 ドキュメント関連
- **新規ファイル:**
  - `/wodicon_helper/README.en.md` - 英語版README
- **更新ファイル:**
  - `/wodicon_helper/README.md` - 言語切り替えリンク追加

### 4.3 検証関連
- **機能検証レポート**
  - Chrome拡張機能での言語別表示確認
  - Chrome Web Store Developer Dashboardでの多言語表示確認
  - GitHub上でのREADME表示確認

## 5. Assumptions & Constraints

### 5.1 Assumptions
- Chrome拡張機能の既存機能に影響を与えない実装
- 既存のローカライゼーションシステム（Chrome拡張機能UI）との整合性維持
- Chrome Web Store Developer Dashboardへのアクセス権限あり

### 5.2 Constraints
- Chrome拡張機能の標準的なi18n仕様に準拠すること
- 既存のmanifest.jsonの他の設定を変更しないこと
- README.mdの構成・スタイルを大幅に変更しないこと
- 翻訳品質は既存UI翻訳と同等レベルを維持

## 6. Team & Roles

- **開発担当:** Claude Code
- **レビュー担当:** ユーザー
- **テスト担当:** ユーザー
- **Chrome Web Store検証担当:** ユーザー

## 7. Schedule

- **要件確認完了:** 2025-08-02
- **manifest.json国際化完了:** 2025-08-02
- **README.en.md作成完了:** 2025-08-02
- **検証・最終確認完了:** 2025-08-02

## 8. Acceptance Criteria

### 8.1 manifest.json関連
- [ ] `_locales/ja/messages.json`にappName, appDesc, appTitleが定義されている
- [ ] `_locales/en/messages.json`にappName, appDesc, appTitleが定義されている
- [ ] manifest.jsonで`__MSG_*__`形式が正しく設定されている
- [ ] `default_locale`が"ja"に設定されている
- [ ] Chrome拡張機能が正常にロード・動作する
- [ ] 拡張機能名・説明がブラウザ言語に応じて表示される

### 8.2 README.md関連
- [ ] README.en.mdが作成され、日本語版と同等の情報を含む
- [ ] 両ファイルに言語切り替えリンクが設置されている
- [ ] 英語版の技術用語・説明が適切である
- [ ] GitHubでの表示が正常である

### 8.3 Chrome Web Store関連
- [ ] Developer Dashboardで日本語・英語の言語選択が可能
- [ ] 各言語で拡張機能名・説明文が正しく表示される
- [ ] Store Listingで言語別コンテンツ設定が可能

### 8.4 全体
- [ ] 既存機能に悪影響がない
- [ ] ローカライゼーションシステムとの整合性が保たれている
- [ ] Chrome拡張機能の標準仕様に準拠している

## 9. Change Log

*初版のため変更履歴なし*

---

**備考**
- manifest.json国際化は Chrome Web Store 多言語対応の必須要件
- README.md英語版は GitHub での国際ユーザー向け情報提供に必要
- 実装完了後は Chrome Web Store での言語別ストア表示が可能になる