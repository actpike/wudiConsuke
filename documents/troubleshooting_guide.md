# 🛠️ ウディこん助 トラブルシューティングガイド

## 🔧 よくある問題と解決策

### 1. Web監視機能が動作しない

#### 症状
- 手動監視を実行してもエラーが発生する
- 新規作品が検出されない
- 通知が届かない

#### 解決方法
1. **権限確認**
   - Chrome拡張機能設定で「https://silversecond.com/*」への権限が有効か確認
   - 通知権限が許可されているか確認

2. **設定確認**
   - 設定画面で監視モードが「無効」になっていないか確認
   - 監視間隔が0分（監視しない）になっていないか確認

3. **ネットワーク確認**
   - ウディコン公式サイト（https://silversecond.com/WolfRPGEditor/Contest/）にアクセス可能か確認
   - プロキシやファイアウォールが接続を妨げていないか確認

4. **統合テスト実行**
   - ポップアップの「🧪 統合テスト実行」ボタンで問題箇所を特定

### 2. パフォーマンスの問題

#### 症状
- 拡張機能が重い・遅い
- ブラウザが不安定になる
- メモリ使用量が多い

#### 解決方法
1. **メモリ最適化**
   - 設定画面のパフォーマンス情報でメモリ使用量を確認
   - メモリ使用率が80%を超えている場合は監視間隔を延長
   - 古い監視履歴・更新マーカーをクリア

2. **監視間隔調整**
   - 監視間隔を1時間以上に設定
   - 注目作品のみ監視に変更

3. **データクリーンアップ**
   - 設定画面で「全マーカークリア」実行
   - 不要な作品データを削除

### 3. 設定が保存されない

#### 症状
- 設定画面で変更した内容が反映されない
- ブラウザ再起動で設定が元に戻る

#### 解決方法
1. **ストレージ権限確認**
   - Chrome拡張機能設定で「storage」権限が有効か確認

2. **ストレージ容量確認**
   - 設定画面のパフォーマンス情報でストレージ使用量を確認
   - 制限に近い場合は古いデータを削除

3. **同期設定確認**
   - Chromeの同期設定が有効で競合していないか確認

### 4. 通知が表示されない

#### 症状
- 新規作品が検出されても通知されない
- テスト通知も表示されない

#### 解決方法
1. **通知権限確認**
   ```
   Chrome設定 → プライバシーとセキュリティ → サイトの設定 → 通知
   ```

2. **システム通知確認**
   - OS（Windows/Mac/Linux）の通知設定が有効か確認
   - 集中モードやサイレントモードが無効か確認

3. **拡張機能通知設定確認**
   - 設定画面で通知設定がすべて有効か確認

### 5. 作品リストが表示されない

#### 症状
- ポップアップを開いても作品が表示されない
- 「読み込み中...」から変わらない

#### 解決方法
1. **データ初期化確認**
   - 初回起動時はサンプルデータの読み込みに時間がかかる場合がある
   - ブラウザを再起動して再試行

2. **ストレージ確認**
   - DevToolsでconsoleエラーを確認
   - `chrome.storage.local`のアクセス権限を確認

3. **拡張機能再読み込み**
   - Chrome拡張機能設定で「再読み込み」実行

## 🚨 エラーコード別対処法

### ERR_NETWORK_FAILED
- **原因**: ネットワーク接続問題
- **対処**: インターネット接続を確認、プロキシ設定確認

### ERR_PERMISSION_DENIED
- **原因**: 権限不足
- **対処**: Chrome拡張機能設定で必要な権限を有効化

### ERR_STORAGE_QUOTA_EXCEEDED
- **原因**: ストレージ容量不足
- **対処**: 古いデータ削除、データエクスポート後にリセット

### ERR_PARSE_FAILED
- **原因**: HTMLページ構造変更
- **対処**: 拡張機能アップデートを確認、開発者に報告

## 📊 パフォーマンス最適化ガイド

### 推奨設定値
- **監視間隔**: 30分～2時間
- **監視モード**: 注目作品のみ（作品数が多い場合）
- **通知件数**: 3～5件

### メモリ使用量基準
- **正常**: 10～30MB
- **注意**: 30～50MB
- **警告**: 50MB以上

### 定期メンテナンス
1. **週1回**: 更新マーカークリア
2. **月1回**: 監視履歴クリア
3. **必要時**: データエクスポート・インポート

## 🔍 診断手順

### 基本診断
1. 統合テスト実行
2. パフォーマンス情報確認
3. 監視状態確認
4. エラーログ確認（DevTools Console）

### 詳細診断
1. **Network タブ**: 通信状況確認
2. **Application タブ**: ストレージ確認
3. **Performance タブ**: CPU・メモリ使用量確認

## 📧 サポート情報

### 問題報告時の情報
1. Chrome バージョン
2. 拡張機能バージョン
3. エラーメッセージ（完全な内容）
4. 再現手順
5. 統合テスト結果
6. パフォーマンス情報

### ログ取得方法
```
1. F12でDevToolsを開く
2. Consoleタブを選択
3. エラー発生操作を実行
4. 表示されたエラーメッセージをコピー
```

---

**注意**: このガイドで解決しない問題については、統合テスト結果とエラーログを添えて開発者にご報告ください。