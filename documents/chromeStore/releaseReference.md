#### releaseReference(配布指南書).md
## 配布フォルダ
- 配布に必要なファイル群は下記へ格納する
	<root:UdiConsuke>\documents\chromeStore\WudiConsuke_release_v0.0.1
- 末尾のバージョンは適宜修正
- 圧縮後、下記へ格納する
	<root:UdiConsuke>\documents\chromeStore\versions

## プライバシー情報 - 実装状況に応じて適切な文言に要修正
- storage:			外部サイト（https://silversecond.com/WolfRPGEditor/Contest/）から取得した情報を保持し、また評価・メモ機能を保持する必要があるため
- alarms:			定期監視による更新通知を行うため
- notifications:	未使用の認識だが、もし使われているならば削除する
- activeTab:		未使用の認識だが、もし使われているならば削除する
- downloads:		メモ機能や設定内容をエクスポート/インポートする
- scripting:		評価内容を画面入力する予定（現時点では未実装）
- ホスト権限:		未使用の認識だが、もし使われているならば削除する
- リモートコードを使用していますか？: いいえ

## バージョン
- バージョニングルールは、<root:UdiConsuke>\VERSION.md に従う




# 以下、メモ


調査結果：
● プライバシー権限の正確な状況

  実際に使用している権限:

  ✅ storage: chrome.storage.local で作品データ・設定を保存✅ alarms: chrome.alarms
  で定期監視スケジュール✅ notifications:
  新規/更新作品の通知、エラー通知、テスト通知に使用✅ downloads:
  データエクスポート機能で使用✅ host_permissions: https://silversecond.com/* -
  ウディコンページの監視に必要

  使用していない権限:

  ❌ activeTab: 使用していません - 削除推奨❌ scripting: 使用していません - 削除推奨

  修正されたプライバシー申告:

  - storage: ✅ 正しい
  - alarms: ✅ 正しい
  - notifications: ✅ 使用しています - 新規作品・更新通知に必要
  - activeTab: ❌ 削除する
  - downloads: ✅ 正しい
  - scripting: ❌ 削除する
  - ホスト権限: ✅ 使用しています - https://silversecond.com/* でウディコンページ監視
  - リモートコード: ❌ いいえ

  重要: ホスト権限(https://silversecond.com/*)を使用しているため、詳しい審査が必要になりま
  す。これはウディコンページの監視機能に不可欠です。