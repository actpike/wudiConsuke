---
project_name: "Chrome拡張機能alarms権限削除とChrome審査対応"
status: "Todo"
owner: "act_pike"
created_at: "2025-07-16"
updated_at: "2025-07-16"
---

### SOW (Statement of Work)

- **Project Name:** `Chrome拡張機能alarms権限削除とChrome審査対応`
- **Creation Date:** `2025-07-16`
- **Revision History:**
  - `v1.0 (2025-07-16): Initial draft`

#### 1. Project Purpose & Background

Chrome Web Store審査時の権限説明を簡素化し、審査通過率を向上させるため、実用的に不要なchrome.alarms権限を削除する。現在の実装では、アクティブタブが通常ウディコンページでない場合、バックグラウンド定期監視は実質的に待機状態となっており、3つの主要監視パターン（ウディコンサイトアクセス時・ポップアップ開時・手動実行）で十分カバー可能であることが判明した。

#### 2. Scope of Work

- Chrome拡張機能のmanifest.jsonから"alarms"権限を削除
- background.jsのchrome.alarms関連コード全体を削除
- webMonitor.jsのchrome.alarms関連コード全体を削除
- options.htmlの定期監視設定UI要素を削除
- options.jsの定期監視設定処理コードを削除
- プライバシー情報文書の更新（alarms権限削除を反映）
- README.mdの権限説明セクション更新（alarms権限削除を反映）
- 削除後の動作確認テスト実行
- Chrome拡張機能のリロードテスト実行
- 3つの監視パターン（サイトアクセス時・ポップアップ開時・手動実行）の動作確認

#### 3. Out of Scope

- 新しい監視機能の追加開発
- content.jsの既存監視ロジック変更
- popup.jsの既存監視ロジック変更
- UI デザインの大幅変更
- 設定データのマイグレーション処理
- Chrome Web Storeへの実際の申請作業
- 他の権限（storage、notifications、activeTab、downloads、host_permissions）の変更

#### 4. Deliverables

- **実装関連:**
  - 更新されたmanifest.json（alarms権限削除済み）
  - 更新されたbackground.js（alarms関連コード削除済み）
  - 更新されたwebMonitor.js（alarms関連コード削除済み）
  - 更新されたoptions.html（定期監視UI削除済み）
  - 更新されたoptions.js（定期監視設定削除済み）
- **ドキュメント関連:**
  - 更新されたプライバシー情報.md
  - 更新されたREADME.md（権限説明セクション）
- **検証関連:**
  - 動作確認テスト結果レポート
  - 削除前後の権限比較表

#### 5. Assumptions & Constraints

- **Assumptions:** 
  - ユーザーは主にウディコンサイト訪問時またはポップアップ開時に監視機能を使用する
  - 定期的なバックグラウンド監視機能の削除はユーザビリティに重大な影響を与えない
  - 既存のcontent.jsとpopup.jsの監視機能は正常に動作している
- **Constraints:** 
  - Chrome Manifest V3の制約に準拠する必要がある
  - 既存のユーザーデータとの互換性を維持する必要がある
  - 3つの代替監視パターンで機能要件を満たす必要がある

#### 6. Team & Roles

- **Client-side:**
  - Project Lead: `act_pike`
- **Vendor/Developer-side:**
  - Assigned to: `Claude Code`

#### 7. Schedule

- **Kick-off:** `2025-07-16`
- **実装完了:** `2025-07-16`
- **テスト完了:** `2025-07-16`
- **Final Delivery:** `2025-07-16`

#### 8. Acceptance Criteria

- manifest.jsonから"alarms"権限が完全に削除されている
- Chrome拡張機能のリロード時にエラーが発生しない
- ウディコンサイトアクセス時の自動監視が正常に動作する
- ポップアップ開時の自動監視が正常に動作する
- 手動監視ボタンが正常に動作する
- options.htmlに定期監視関連の設定項目が表示されない
- プライバシー情報文書にalarms権限の記述が存在しない
- README.mdの権限一覧にalarms権限の記述が存在しない
- コンソールログにalarms関連のエラーが出力されない

#### 9. Change Log

*初回作成時点のため変更履歴なし*

---