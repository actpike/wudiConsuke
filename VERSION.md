# ウディこん助 バージョン管理

## 現在のバージョン: v1.0.2

### バージョニングルール
- **第一要素**: 本番リリース（1.0.0で正式リリース完了）
- **第二要素**: 機能追加・大きな変更
- **第三要素**: バグ修正・微調整

### バージョン更新時の作業手順
1. **VERSION.md**: 現在のバージョン番号を更新
2. **VERSION.md**: 変更履歴に新バージョンの内容を記載
3. **フッター表示**: GUI上のフッターにて、バージョンを明記（更新）
4. git commit & push

### 変更履歴

#### v1.0.3 (2025-01-24) - CSV対応データエクスポート・インポート機能
- **📊 CSVエクスポート機能**: 作品評価データをCSV形式で出力（Excel対応）
- **📥 CSVインポート機能**: CSV形式での作品データ取り込み
- **🔄 複数形式対応**: JSONとCSVの形式選択プルダウン追加
- **📅 年度別対応**: CSVファイル名・ヘッダーに年度情報を明記
- **🎯 評価項目対応**: 6項目評価（熱中度、斬新さ、物語性、画像音響、遊びやすさ、その他）+ 感想

#### v1.0.2 (2025-01-24) - 複数年度対応機能追加
- **📅 複数年度対応システム**: 年度別データ管理、年度選択UI、自動データ移行機能
- **🗓️ YearManagerクラス**: 年度別データ操作、テスト年度サポート(2025, 2026)
- **🔄 年度切り替え機能**: オプションページでの年度選択、独立したデータ管理
- **🗑️ 年度データ削除機能**: 安全な削除処理、確認ダイアログ、自動切り替え、復活防止機能
- **🔧 Web監視年度別対応**: URL動的生成、投票ページ年度別対応
- **🛡️ データ移行機能**: 既存データの安全な新構造移行、バックアップ機能
- **🐛 削除バグ修正**: 年度削除後の復活問題解決、削除済み年度履歴管理

#### v1.0.1 (2025-01-23) - 開発版リリース
- バグ修正と微調整

#### v1.0.0 (2025-01-20) - 正式リリース
- 本番環境対応完了

#### v0.0.1 (2025-01-13) - 初回開発版リリース
- **🎯 実用的自動監視システム**: サイト訪問時・ポップアップ開時の自動新規/更新チェック機能
- **📊 作品プレイ補助機能**: 6カテゴリ評価システム、感想記録、既プレイチェックリスト
- **🔧 UI改善**: 設定画面文言統一、全選択機能、状態表示改善、バージョン表示修正
- **🛡️ セキュリティ対応**: Chrome Manifest V3完全対応、完全ローカル動作
- **📱 Web紹介ページ**: 一般利用者向け機能説明ページ実装
- **🗂️ データ管理**: エクスポート/インポート機能、chrome.storage.local活用