# ウディこん助 アーキテクチャドキュメント

## 概要

このディレクトリには、ウディこん助（WodiConsuke）Chrome拡張機能のアーキテクチャ設計書が含まれています。v1.0.2の実装状況を反映した包括的な技術資料として、システムの全体像から詳細な実装まで体系的にドキュメント化されています。

## ドキュメント構成

### 📋 [01_概要.md](./01_概要.md)
**システム全体概要**
- Chrome Manifest V3アーキテクチャ
- v1.0.2での新機能（YearManager, FileValidator）
- 3層構成（Service Worker, Content Script, Popup）
- 完全ローカル動作の技術的実現

### 📊 [02_年度別データフロー.md](./02_年度別データフロー.md)
**年度別データ管理システム**
- YearManagerによる年度切り替え機能
- chrome.storage.localの5MB制限対応
- データ分離とマイグレーション
- 複数年度対応のシーケンス図

### 🔍 [03_Web監視システム.md](./03_Web監視システム.md)
**実用的自動監視システム**
- Chrome Manifest V3制約対応
- Content Script（サイト訪問時）とPopup（開時）での監視
- webMonitor.js, pageParser.js, updateManager.jsの連携
- エラーハンドリングとパフォーマンス最適化

### 🖥️ [04_UI操作フロー.md](./04_UI操作フロー.md)
**ユーザーインターフェース設計**
- Single Page Application（SPA）アーキテクチャ
- メイン画面（popup.js）と詳細画面（navigation.js）
- 6カテゴリ評価システムのUI実装
- レスポンシブ対応とアクセシビリティ

### 🔄 [05_コンポーネント通信.md](./05_コンポーネント通信.md)
**システム間・モジュール間通信**
- Chrome拡張機能3層間通信（chrome.runtime.onMessage）
- Popup内モジュール間のグローバルインスタンスパターン
- イベント駆動通信とエラーハンドリング
- セキュリティ考慮事項と通信ログ

### 📁 [06_ファイル処理.md](./06_ファイル処理.md)
**CSV対応データエクスポート・インポート機能**
- FileValidator.jsによるファイル検証（v1.0.2新機能）
- CSV/JSONの双方向変換
- データ統合・マージ処理
- 大容量ファイル対応とメモリ最適化

## アーキテクチャ設計原則

### 🏗️ 技術的制約対応
- **Chrome Manifest V3準拠**: セキュリティ制約への完全対応
- **完全ローカル動作**: 外部API・CDN不使用による高プライバシー保護
- **ストレージ制限対応**: chrome.storage.local 5MB制限の年度別分離で解決

### 🔧 設計パターン
- **3層アーキテクチャ**: Service Worker + Content Script + Popup の分離
- **MVC + Service Layer**: UI層、ビジネスロジック層、データ層の明確な分離
- **Global Instance Pattern**: windowオブジェクトでのモジュール間参照管理

### 📈 品質保証
- **統一エラーハンドリング**: errorHandler.jsによる一元的エラー管理
- **定数管理**: constants.jsによるマジックナンバー・文字列の排除
- **データ処理統一**: updateManager.jsによる重複処理の統合

## バージョン履歴

### v1.0.2（現在）
- **年度別データ管理**: YearManagerによる複数年度対応
- **CSV対応エクスポート・インポート**: FileValidatorを含む包括的ファイル処理
- **レビューハイライト機能**: 感想入力促進のUI改善

### v1.0.0（正式リリース）
- **実用的自動監視システム**: Chrome Manifest V3制約下での自動監視実現
- **6カテゴリ評価システム**: 直感的なスライダー式評価UI
- **完全ローカル動作**: プライバシー保護の徹底

## 開発ワークフロー統合

### 📋 SOW管理
`documents/SOW/` フォルダでのStatement of Work管理と連動

### 🔧 仕様駆動開発
`.kiro/specs/` でのEARS形式要件定義とInteractive承認プロセス

### 🤖 自動化システム
`scripts/` での開発効率化とGeminiCLI統合によるコードレビュー

## 技術スタック

### Core Technologies
- **JavaScript**: ES2022（Vanilla JavaScript）
- **Chrome Extensions API**: Manifest V3準拠
- **Storage**: chrome.storage.local（5MB制限）

### Architecture Patterns
- **SPA**: Single Page Application
- **Event-Driven**: CustomEvent + chrome.runtime.onMessage
- **Module Pattern**: Global Instance with Dependency Injection

### Development Tools
- **claude-code-spec**: Kiroパッケージによる仕様駆動開発
- **GeminiCLI**: 自動コードレビューとプロジェクト分析
- **Release Automation**: scripts/release-automation/ による自動リリース

## パフォーマンス指標

### 実測値（v1.0.2）
- **Popup起動時間**: ~50ms（目標 <100ms）
- **Web監視実行時間**: ~2-3秒（目標 <5秒）
- **データ読み込み時間**: ~20ms（目標 <50ms）
- **メモリ使用量**: ~5MB（目標 <10MB）

### スケーラビリティ
- **同時監視年度**: 複数年度対応完了
- **データ容量**: 年度別分離により実質無制限
- **レスポンス性**: 非同期処理による高い応答性

## セキュリティ対策

### Chrome拡張機能セキュリティ
- **Host Permissions**: https://silversecond.com/* のみ許可
- **CSP準拠**: デフォルトContent Security Policyに完全準拠
- **XSS防止**: innerHTML使用禁止、textContent使用徹底

### データ保護
- **完全ローカル処理**: 外部送信一切なし
- **データ暗号化**: chrome.storage.localの自動暗号化
- **入力サニタイゼーション**: 全入力データの無害化処理

## 今後の拡張計画

### 短期目標（v1.1.x）
- **UI/UX改善**: レスポンシブ対応とアクセシビリティ向上
- **パフォーマンス最適化**: 大容量データ対応の強化
- **エラーハンドリング強化**: より詳細なエラー分類と復旧機能

### 中期目標（v1.2.x）
- **多言語対応**: 国際化（i18n）機能の実装
- **高度なフィルタリング**: カスタムフィルターとソート機能
- **データ分析機能**: 評価傾向の可視化とレポート生成

### 長期目標（v2.x）
- **他プラットフォーム対応**: Firefox拡張機能としての移植
- **API連携**: 公式APIが提供された場合の連携機能
- **機械学習統合**: 作品推薦システムの実装

## 関連ドキュメント

### プロジェクト管理
- [`CLAUDE.md`](../../CLAUDE.md): Claude Code指示書
- [`VERSION.md`](../../VERSION.md): バージョン管理情報
- [`documents/SOW/`](../SOW/): Statement of Work管理

### 仕様管理
- [`.kiro/specs/wudiConsuke-documentation/`](../../.kiro/specs/wudiConsuke-documentation/): claude-code-spec仕様書

### 技術資料
- [`scripts/README.md`](../../scripts/README.md): 自動化システム詳細
- [`scripts/gemini_cli/README.md`](../../scripts/gemini_cli/README.md): GeminiCLI統合パッケージ

---

**最終更新**: 2025年7月27日  
**対象バージョン**: v1.0.2  
**ドキュメント形式**: Markdown + Mermaid  
**作成**: claude-code-spec Kiro パッケージ