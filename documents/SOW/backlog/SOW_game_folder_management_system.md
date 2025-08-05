# SOW (Statement of Work)

---
project_name: "ゲームフォルダ管理システム実装"
status: "Todo"
owner: "Claude Code"
created_at: "2025-08-04"
updated_at: "2025-08-04"
---

- **Project Name:** `ゲームフォルダ管理システム実装`
- **Creation Date:** `2025-08-04`
- **Revision History:**
  - `v1.0 (2025-08-04): Initial draft`

#### 1. Project Purpose & Background
ウディこん助Chrome拡張機能において、ローカルフォルダ開機能のニーズが高まっている。現在の仕様では個別作品詳細画面でフォルダパスを直接管理する必要があるが、効率的な一元管理機能が存在しない。本プロジェクトは、作品のローカルフォルダパスを年度別に管理し、個別作品画面から直接アクセス可能な統合システムを構築することを目的とする。

#### 2. Scope of Work
*以下のタスクを実装する：*

**ゲームフォルダ管理ページ実装**
- 新規ページ「ゲームフォルダ管理」の作成（HTML, CSS, JavaScript）
- ルートパス設定機能（テキスト入力、バリデーション付き）
- 個別作品フォルダ名管理機能（60件程度の作品リスト表示・編集）
- 年度選択連携機能（既存の年度選択システムと連携）
- データ永続化機能（chrome.storage.localによる保存）
- ページ冒頭の機能説明セクション実装

**個別作品詳細画面の機能拡張**
- 右上[×]ボタンをフォルダアイコン（📁）に変更
- フォルダアイコンクリック時の条件分岐処理実装
  - 初期化未済の場合：確認メッセージ表示後、ゲームフォルダ管理ページを開く
  - 設定済みの場合：ローカルフォルダパスをクリップボードにコピー
- 設定状態の判定ロジック実装

**オプションページの機能拡張**
- 「ゲームフォルダ管理ページ」を開くボタンの追加
- 既存UIとの統合（セクション追加）

**データ管理システム**
- 年度別フォルダ管理データ構造の設計・実装
- 既存のyearManager.jsとの連携機能
- データインポート・エクスポート機能への対応

#### 3. Out of Scope
*以下のタスクは実装しない：*
- Native Messagingを使用したローカルフォルダの自動作成機能
- Directory Picker APIを使用したフォルダ選択機能
- ファイルの実際の読み書き機能
- 外部APIとの連携機能
- 既存データベース構造の大幅な変更
- 他のChrome拡張機能との連携機能

#### 4. Deliverables
*プロジェクト完了時に提供される成果物：*

**実装ファイル**
- `wodicon_helper/game_folder_management.html` - ゲームフォルダ管理ページ
- `wodicon_helper/js/gameFolderManager.js` - フォルダ管理ロジック
- `wodicon_helper/css/game_folder_management.css` - 専用スタイルシート（必要に応じて）

**機能拡張**
- `wodicon_helper/js/navigation.js` - 個別作品画面のフォルダアイコン機能
- `wodicon_helper/js/options.js` - オプションページボタン追加
- `wodicon_helper/options.html` - UI要素追加

**ドキュメント**
- 機能仕様書（本SOW内に記載）
- 実装完了報告書

#### 5. Assumptions & Constraints
**Assumptions（前提条件）:**
- Chrome拡張機能のManifest V3制約に準拠する
- 既存のchrome.storage.local構造を活用する
- 既存のyearManager.jsとdataManager.jsが正常に動作している
- ユーザーはローカルフォルダの存在確認を手動で行う

**Constraints（制約条件）:**
- Chrome拡張機能のセキュリティ制約により、ローカルファイルシステムへの直接アクセス不可
- chrome.storage.localの5MB容量制限
- フォルダパスのクリップボードコピー機能はHTTPS環境またはlocalhost環境でのみ動作
- 既存のUI/UXデザインとの整合性を保つ

#### 6. Team & Roles
**Client-side:**
- Project Lead: `ユーザー（actpike）`

**Vendor/Developer-side:**
- Assigned to: `Claude Code`

#### 7. Schedule
*主要マイルストーンとその期限：*
- **Kick-off:** `2025-08-04`
- **ゲームフォルダ管理ページ実装完了:** `2025-08-04`
- **個別作品画面機能拡張完了:** `2025-08-04`
- **オプションページ機能拡張完了:** `2025-08-04`
- **統合テスト・Final Delivery:** `2025-08-04`

#### 8. Acceptance Criteria
*成果物が「完了」として受け入れられるための具体的基準：*

**機能要件**
- ゲームフォルダ管理ページで60件程度の作品データを表示・編集可能
- 年度選択によるデータフィルタリングが正常に動作
- 個別作品画面のフォルダアイコンが条件に応じて適切に動作
- オプションページからゲームフォルダ管理ページへのナビゲーションが正常に動作
- 全てのデータがchrome.storage.localに正しく保存・復元される

**品質要件**
- 既存機能に影響を与えない（回帰テスト合格）
- Chrome DevToolsでエラーが発生しない
- 既存のUI/UXデザインと統合されている
- レスポンシブデザインに対応している

**データ整合性**
- 年度変更時にデータが正しく切り替わる
- データのインポート・エクスポート機能と整合性を保つ

#### 9. Change Log
*SOW初期承認後の変更記録：*
- **2025-08-04 (v1.0) by Claude Code:**
  - **Reason for Change:** 初期作成
  - **Details of Change:** SOW初期版作成完了

---