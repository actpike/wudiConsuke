# 🌊 ウディこん助 (WodiConsuke)

ウディコン（WOLF RPGエディターコンテスト）の作品プレイ体験をより快適・便利にするChrome拡張機能です。

## ✨ 主な機能

### 🎮 作品プレイ補助
- **作品一覧管理**: 最大80作品の効率的なリスト表示
- **ウディコン公式準拠評価**: 6項目×10点制の詳細評価システム
- **感想記録**: 2000字以内の詳細な感想・レビュー機能
- **既プレイ管理**: 評価完了時の自動既プレイフラグ更新
- **ローカルフォルダ連携**: file://プロトコルでのゲーム起動

### 🖥️ 直感的なUI
- **2画面構成**: メイン画面（一覧）↔ 詳細画面（編集）
- **自動保存**: 3秒間隔での自動データ保存
- **レスポンシブ**: 550px×500pxの最適化されたレイアウト
- **リスト表示**: 効率的なテーブル形式での作品管理

### 💾 データ管理
- **完全ローカル**: chrome.storage.localでの安全な保存
- **インポート/エクスポート**: JSONファイルでのデータ移行
- **統計情報**: プレイ状況の可視化

## 🚀 インストール方法

### 開発版（推奨）
1. このリポジトリをダウンロード
2. Chrome で `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `WudiConsuke` フォルダを選択

### 権限設定
**ウディこん助が使用する権限とその用途:**
- **storage**: 作品の評価・感想・プレイ状況をローカル保存
- **notifications**: 新規・更新作品のデスクトップ通知
- **activeTab**: アクティブタブの情報取得、手動監視時のページ解析
- **host_permissions**: ウディコン公式サイト(silversecond.com)からの情報取得

**監視機能**: サイト訪問時・ポップアップ開時・手動実行で新作品チェック

**完全ローカル動作**: データ送信・追跡・広告なし

**ローカルフォルダ機能を使用する場合:**
1. 拡張機能の「詳細」をクリック
2. 「ファイルのURLへのアクセスを許可する」を有効にする

## 📖 使い方

### 基本操作
1. **作品追加**: サンプルデータが自動で読み込まれます
2. **評価入力**: 作品行をクリック → 詳細画面で6項目評価
3. **感想記録**: 詳細画面で最大2000字の感想入力
4. **フォルダ設定**: ローカルゲームフォルダのパス登録

### 画面遷移
- **メイン → 詳細**: 作品行をクリック
- **詳細 → メイン**: 👈戻るボタンまたは×ボタン
- **自動保存**: 編集内容は自動的に保存されます

## 🔧 技術仕様

### 対応環境
- Google Chrome（Manifest V3）
- Windows / macOS / Linux

### 使用技術
- **フロントエンド**: Vanilla JavaScript, CSS3, HTML5
- **ストレージ**: chrome.storage.local（5MB制限）
- **権限**: storage, notifications, activeTab, host_permissions

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 連絡

バグ報告や機能要望がありましたら、X（旧Twitter）@act_pike までご連絡ください。

# 仕様と責任について

- 本ツール（拡張機能）は、「あったら便利かも！」という思いから個人の趣味で制作した非公式のツールです。
　利益の獲得や個人情報の収集を目的としたものではありません。

- 入力されたデータは原則として外部に送信されません。
　すべてのデータはローカル（ブラウザのキャッシュ領域）に保存されます。

- 下記の操作を行った場合、保存されたデータは削除されます：
　- 拡張機能の削除
　- オプション画面の「全データ削除」ボタンを押す
　- 各作品ページで「削除」ボタンを押す
　- ブラウザのキャッシュをクリアする（※環境によります）

- なお、以下の操作ではデータは削除されません：
　- 拡張機能のON/OFFの切り替え
　- 拡張フォルダの再配置・上書き（zip再インストールなど）

- 入力した評価・感想などを大切に保存しておきたい場合は、設定画面から「データエクスポート」を行っておくことをおすすめします。

- 本ツールの使用により発生したいかなるトラブル・損害についても、制作者は一切の責任を負いません。ご了承ください。

---

**開発者**: ぴけ
**バージョン**: 1.0.2
**最終更新**: 2025-07-30

### v1.0.2 (2025/07/30)
- 年度別データ保持機能の追加
- CSV対応データエクスポート・インポート機能の追加
- 個別作品画面にて、平均バーのリアルタイム更新
- 『その他』>0かつ『感想』未記入時、それを薄橙色にて明示化
- 新規・更新通知に関する不具合修正（実際よりも少なく表示されるケースがある）
- その他、細かな修正（オプションにリンク追加、UI調整等）

### v1.0.1 (2025/7/23)
- 個別画面の各評価項目にて、目盛り化と"平均"文言位置の調整
- 投票ページ一括入力ボタン押下時、Webページが開くように修正
- 更新アイコンクリアボタンを新設（ボタン[ 新着 ]押下時に表示）

### v1.0.0 (2025/7/20)
- 投票ページへの入力ボタンを追加（一括/個別）
- 通知：作品Noを表記する様に修正

### v0.0.6 (2025/7/17)
- Chromeストア審査完了！
- プライバシー情報周りの見直し。alarms,scripts権限の削除

### v0.0.5 (2025/7/15)
- 評価『その他』の下限を0に設定
- 評価の目盛りを追加等の細かな修正

### v0.0.4 (2025/7/14)
- 新規登録時の通知アイコン変更
- バージョン更新時の通知を追加
