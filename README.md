# 🌊 ウディこん助 (WodiConsuke)

WOLF RPGエディターコンテスト用Chrome拡張機能

## 📋 概要

「ウディコン」の作品プレイ体験をより快適・便利にするGoogle Chrome拡張機能です。作品の更新監視、感想記録、既プレイ管理を一括でサポートし、完全ローカル動作でプライバシーを保護します。

## ✨ 主要機能

### 🎮 作品プレイ補助 (実装完了)
- **6カテゴリ評価システム**: ウディコン公式準拠の評価機能
- **感想記録**: 2000字制限の詳細レビュー機能
- **自動保存**: 3秒間隔での自動保存
- **データ管理**: エクスポート/インポート機能

### 🔍 Web監視機能 (フェーズ1完了)
- **新規作品検出**: ウディコン公式サイトの自動監視
- **更新通知**: 作品更新の即座な通知
- **差分検出**: HTML解析による変更検出
- **バックグラウンド監視**: Service Worker による定期チェック

## 🚀 インストール・使用方法

### インストール
1. このリポジトリをクローンまたはダウンロード
2. Chrome拡張機能の開発者モードを有効化
3. `wodicon_helper`フォルダを読み込み

### 基本使用方法
1. 拡張機能アイコンをクリックしてポップアップを開く
2. 作品一覧から気になる作品をクリック
3. 評価・感想を入力（自動保存されます）
4. 手動監視機能でWeb監視をテスト

## 🛠️ 技術仕様

- **Manifest Version**: V3 (最新Chrome拡張規格)
- **ストレージ**: chrome.storage.local (5MB上限)
- **UI**: Single Page Application
- **監視**: Chrome Alarms API + Background Service Worker
- **セキュリティ**: 完全ローカル動作、外部API不使用

## 📁 プロジェクト構成

```
UdiConsuke/
├── wodicon_helper/          # Chrome拡張機能本体
│   ├── manifest.json        # 拡張機能設定
│   ├── popup.html          # メインUI
│   ├── background.js       # Service Worker
│   ├── js/                 # JavaScript モジュール
│   │   ├── dataManager.js  # データ管理
│   │   ├── webMonitor.js   # Web監視
│   │   ├── pageParser.js   # HTML解析
│   │   └── updateManager.js # 更新管理
│   └── css/                # スタイルシート
├── documents/              # プロジェクトドキュメント
│   ├── wodicon_helper_requirements.md
│   └── SOW/               # 作業範囲記述書
└── README.md              # このファイル
```

## 🔧 開発状況

### ✅ 完了済み
- 作品プレイ補助機能 (100%)
- Web監視機能 フェーズ1 (100%)
- 手動テスト機能
- SOWベース開発プロセス

### 🔄 開発予定
- Web監視機能 フェーズ2-3 (設定UI、統合テスト)
- ローカルファイル連携機能
- パフォーマンス最適化

## 🤝 開発方針

- **SOW (Statement of Work)** による段階的開発
- **フェーズベース実装** で品質確保
- **完全ローカル動作** でプライバシー保護
- **ユーザーフレンドリー** なUI/UX

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🔗 関連リンク

- [WOLF RPGエディター公式](https://silversecond.com/WolfRPGEditor/)
- [ウディコン公式サイト](https://silversecond.com/WolfRPGEditor/Contest/)

---

**注意**: この拡張機能は非公式ツールです。ウディコン公式とは無関係です。