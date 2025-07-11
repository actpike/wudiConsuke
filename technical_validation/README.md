# 🌊 ウディこん助 Chrome拡張機能 技術検証

## 📋 概要

「ウディこん助（WodiConsuke）」Chrome拡張機能の技術的実現可能性を検証するためのプロトタイプと検証環境です。

## 🎯 検証目的

要件定義書に記載された以下の機能について、Chrome拡張機能として実装可能かを検証します：

- **Web監視系**: ウディコン公式サイトへのアクセス、CORS制約、HTML解析
- **ストレージ機能**: chrome.storage.local の容量制限、データ永続化
- **ローカルファイル連携**: file://プロトコルアクセス、権限制約
- **通知・アラーム**: chrome.notifications、chrome.alarms の動作
- **データ管理**: インポート/エクスポート機能

## 📁 フォルダ構成

```
technical_validation/
├── chrome_extension/          # Chrome拡張機能プロトタイプ
│   ├── manifest.json         # 拡張機能設定
│   ├── background.js         # バックグラウンドスクリプト
│   ├── content.js           # コンテンツスクリプト
│   ├── popup.html           # ポップアップUI
│   ├── popup.js             # ポップアップスクリプト
│   ├── options.html         # 設定ページ
│   └── options.js           # 設定ページスクリプト
├── test_results/             # 検証結果保存フォルダ
├── prototypes/              # 個別機能プロトタイプ
├── VALIDATION_INSTRUCTIONS.md # 検証手順書
└── README.md                # このファイル
```

## 🚀 クイックスタート

### 1. 拡張機能のインストール
```bash
1. Chrome を開く
2. chrome://extensions/ にアクセス
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. chrome_extension フォルダを選択
```

### 2. 権限設定
```bash
1. 拡張機能の「詳細」をクリック
2. 「ファイルのURLへのアクセスを許可する」を有効にする
```

### 3. 検証実行
```bash
1. ウディコン公式サイト（https://silversecond.com/WolfRPGEditor/Contest/）を開く
2. 拡張機能アイコンをクリック
3. 「全テスト実行」ボタンをクリック
4. 結果を確認
```

## 🔍 検証項目

### ✅ 実装可能性が確認できる機能
- chrome.storage.local でのデータ保存・読み込み
- chrome.notifications でのデスクトップ通知
- chrome.alarms での定期実行
- データのインポート/エクスポート（JSON形式）
- ポップアップUI・設定画面の実装

### ⚠️ 制約のある機能
- **外部サイトアクセス**: CORS制約、manifest.json での host_permissions 設定必須
- **file://アクセス**: ユーザーが手動で権限設定する必要あり
- **容量制限**: chrome.storage.local は5MB制限

### 🔴 高リスク項目
- **サイト構造依存**: ウディコン公式サイトのHTML構造変更で機能停止リスク
- **権限設定**: 一般ユーザーが権限設定を正しく行えるかが課題

## 📊 検証結果の確認方法

### 自動検証
- ポップアップから「全テスト実行」で一括検証
- 設定ページでリアルタイム結果確認

### 手動検証
- 各機能の個別テストボタン
- 詳細ログの確認
- 結果のエクスポート（JSON形式）

## 🛠 開発用情報

### 主要API
- `chrome.storage.local` - データ保存
- `chrome.alarms` - 定期実行
- `chrome.notifications` - 通知
- `chrome.downloads` - ファイルダウンロード
- `chrome.tabs` - タブ管理

### 権限（manifest.json）
```json
{
  "permissions": [
    "storage", "alarms", "notifications", "activeTab", "downloads"
  ],
  "host_permissions": [
    "https://silversecond.com/*"
  ]
}
```

## 🚨 既知の問題

### 1. CORS制約
- **問題**: 外部サイトへのfetch()リクエストが制限される
- **解決**: manifest.json の host_permissions で明示的に許可

### 2. file://アクセス制限
- **問題**: デフォルトでは file:// プロトコルにアクセスできない
- **解決**: ユーザーが拡張機能設定で権限を有効化する必要

### 3. 容量制限
- **問題**: chrome.storage.local は5MB制限
- **解決**: データ圧縮、古いデータの自動削除、使用量監視

## 📝 次のステップ

この技術検証の結果を基に、以下の作業を進めることができます：

1. **詳細設計**: 検証結果を踏まえた実装仕様の策定
2. **プロトタイプ拡張**: より実用的な機能の実装
3. **ユーザビリティ改善**: 権限設定等の案内UI改善
4. **エラーハンドリング**: 各種制約に対する適切な処理

## 🔗 関連ドキュメント

- [検証手順書](VALIDATION_INSTRUCTIONS.md) - 詳細な検証手順
- [要件定義書](../documents/wodicon_helper_requirements.md) - 元の要件
- [実現可能性チェックリスト](../documents/SOW/backlog/feasibility_checklist.md) - 機能別評価

## 💡 技術的推奨事項

### 実装優先度
1. **高**: Web監視、データ保存、通知機能
2. **中**: データインポート/エクスポート、設定画面
3. **低**: file://アクセス（ユーザー設定依存のため）

### 代替案検討
- **file://アクセス**: 代替としてクリップボードコピー機能
- **容量制限**: 重要データのみ保存、定期的なデータ整理機能
- **サイト構造依存**: 複数のセレクタパターンに対応

---

⚠️ **注意**: この技術検証は概念実証（PoC）レベルです。実際の製品開発では、セキュリティ、パフォーマンス、ユーザビリティの観点からさらなる検討が必要です。