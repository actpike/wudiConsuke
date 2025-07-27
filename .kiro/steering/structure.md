# Project Structure

## Root Directory Organization
```
UdiConsuke/
├── .claude/                    # Claude Code設定・Kiroコマンド
├── .kiro/                     # claude-code-spec仕様管理
├── documents/                 # プロジェクトドキュメント
├── scripts/                   # 自動化スクリプト・ツール
├── technical_validation/      # 技術検証用テストコード
├── website/                   # 紹介ページ・配布サイト
├── wodicon_helper/           # Chrome拡張機能メインコード
├── CLAUDE.md                 # Claude Code指示書
└── VERSION.md                # バージョン管理
```

## Subdirectory Structures

### Chrome拡張機能コア（wodicon_helper/）
```
wodicon_helper/
├── manifest.json             # Chrome拡張機能定義
├── popup.html               # メインUI
├── options.html             # 設定画面
├── background.js            # Service Worker
├── css/popup.css           # スタイルシート
├── icons/                  # アイコンファイル
└── js/                     # JavaScriptモジュール
    ├── popup.js            # GameListManager - メイン画面管理
    ├── navigation.js       # Navigation - 画面遷移・詳細表示
    ├── dataManager.js      # GameDataManager - データCRUD操作
    ├── yearManager.js      # YearManager - 年度別データ管理
    ├── content.js          # Content Script - 自動監視
    ├── webMonitor.js       # WebMonitor - Web監視実行
    ├── pageParser.js       # PageParser - HTML解析
    ├── updateManager.js    # UpdateManager - 更新検知処理
    ├── constants.js        # Constants - 定数管理
    ├── errorHandler.js     # ErrorHandler - 統一エラーハンドリング
    └── options.js          # Options - 設定画面処理
```

### ドキュメント管理（documents/）
```
documents/
├── SOW/                    # SOW（Statement of Work）管理
│   ├── SOW_Reference.md    # SOWテンプレート
│   ├── backlog/           # 新規作成SOW（未着手）
│   ├── working/           # 進行中SOW
│   ├── done/              # 完了SOW
│   └── etc/               # その他・アーカイブ
├── chromeStore/           # Chrome Web Store配布関連
└── memo/                  # プロジェクトメモ
```

### 自動化システム（scripts/）
```
scripts/
├── release-automation/     # リリース自動化
│   ├── create-release.js   # メインリリーススクリプト
│   ├── modules/           # モジュール分割
│   └── config/            # 設定ファイル
├── gemini-integration/    # GeminiAPI統合（補助ツール）
├── gemini_cli/           # GeminiCLI統合（実用分析ツール）
└── mcp/                  # MCP（Model Context Protocol）実験
```

### 仕様管理（.kiro/）
```
.kiro/
├── steering/              # プロジェクト舵取りドキュメント
│   ├── product.md         # プロダクト概要
│   ├── tech.md           # 技術スタック
│   └── structure.md      # プロジェクト構造（本ファイル）
└── specs/                # 機能仕様管理
    └── [feature-name]/   # 機能別仕様フォルダ
        ├── spec.json     # メタデータ・承認状況
        ├── requirements.md # EARS形式要件定義
        ├── design.md     # 技術設計
        └── tasks.md      # 実装タスク
```

## Code Organization Patterns

### Chrome拡張機能アーキテクチャ
- **3層構成**: Service Worker（background.js） + Content Script（content.js） + Popup（popup.js）
- **MVC + Service Layer**: UI層、ビジネスロジック層、データ層の分離
- **Global Instance Pattern**: windowオブジェクトでのインスタンス管理

### モジュール依存関係
```
popup.html → [順次読み込み]
├── constants.js (共通定数)
├── errorHandler.js (エラーハンドリング)
├── dataManager.js (データ管理) → yearManager.js
├── navigation.js (画面遷移)
├── popup.js (メイン処理) → GameListManager
└── options.js (設定画面)

background.js → [Service Worker]
├── webMonitor.js → pageParser.js → updateManager.js
├── constants.js (共通定数)
└── errorHandler.js (エラーハンドリング)
```

## File Naming Conventions
- **JavaScript**: camelCase（例：gameDataManager.js）
- **HTML**: lowercase（例：popup.html, options.html）
- **CSS**: lowercase with hyphens（例：popup.css）
- **Documentation**: PascalCase or lowercase（例：CLAUDE.md, VERSION.md）
- **SOW**: prefix with SOW_（例：SOW_feature_name.md）

## Import Organization
Chrome拡張機能の制約により、ES6 importではなく順次スクリプト読み込み：

```html
<!-- popup.html での読み込み順序 -->
<script src="js/constants.js"></script>
<script src="js/errorHandler.js"></script>
<script src="js/yearManager.js"></script>
<script src="js/dataManager.js"></script>
<script src="js/navigation.js"></script>
<script src="js/popup.js"></script>
<script src="js/options.js"></script>
```

### グローバルインスタンス作成パターン
```javascript
// 各モジュールでのインスタンス作成
window.constants = new Constants();
window.errorHandler = new ErrorHandler();
window.gameDataManager = new GameDataManager();
window.yearManager = new YearManager();
```

## Key Architectural Principles

### 完全ローカル動作
- 外部API・CDN一切不使用
- chrome.storage.localによるデータ永続化
- HTMLクローリングベースのデータ取得

### Chrome Manifest V3準拠
- Service Workerベースのバックグラウンド処理
- Content Security Policy準拠
- 最小権限のpermissions設定

### データ中心設計
- chrome.storage.localを唯一の永続化層
- 年度別データ分離による5MB制限対応
- 統一データ処理（updateManager.js）による一貫性確保

### モジュラー設計
- 単一責任原則に基づくクラス分割
- 依存関係の明確化
- 共通サービス（constants.js, errorHandler.js）の活用

### エラーハンドリング統一
- 全モジュールからwindow.errorHandlerを利用
- エラー分類・通知・履歴管理の統一化
- デバッグ・保守性の向上

## Development Workflow Integration
- **SOWワークフロー**: documents/SOW/ での作業管理
- **仕様駆動開発**: .kiro/specs/ でのEARS形式要件定義
- **自動化システム**: scripts/ での開発効率化
- **品質保証**: GeminiCLI統合による自動コードレビュー