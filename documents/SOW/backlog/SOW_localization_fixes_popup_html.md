---
project_name: "popup.htmlローカライズ漏れ修正"
status: "Todo"
owner: "actpike"
created_at: "2025-08-05"
updated_at: "2025-08-05"
---

### SOW (Statement of Work)

- **Project Name:** `popup.htmlローカライズ漏れ修正`
- **Creation Date:** `2025-08-05`
- **Revision History:**
  - `v1.0 (2025-08-05): Initial draft`

#### 1. Project Purpose & Background
ウディこん助のv1.0.3でローカライズ対応（日本語/英語）を実装したが、popup.html関連において以下のローカライズ漏れが発見された：
1. 1件も作品が無い場合、「ゲームが登録されていません」と日本語表記になっている（English指定時）
2. 更新通知が日本語のまま表示される

これらの問題により、英語環境でのユーザー体験が一貫していない状態となっているため、完全なローカライズ対応を実現する必要がある。

#### 2. Scope of Work
- popup.html内の「ゲームが登録されていません」メッセージの多言語対応実装
- 更新通知メッセージの多言語対応実装
- ローカライズ対象メッセージの調査・特定
- 既存のローカライズシステム（messages.json）への適切な統合
- 英語環境での動作確認テスト
- 日本語環境での既存機能への影響確認テスト

#### 3. Out of Scope
- popup.html以外のファイルのローカライズ漏れ調査
- 新規ローカライズ言語の追加（スペイン語、フランス語等）
- options.html関連のローカライズ問題
- chrome.notifications API以外の通知システムの修正
- ローカライズシステムの根本的な再設計

#### 4. Deliverables
- **Implementation-related:**
  - 修正済みpopup.htmlファイル
  - 修正済みpopup.jsファイル（該当する場合）
  - 更新されたmessages.jsonファイル（新規メッセージエントリ追加）
- **Quality Assurance:**
  - 英語環境での動作確認テスト結果
  - 日本語環境での回帰テスト結果
- **Documentation:**
  - 修正内容の詳細記録
  - 発見されたローカライズ漏れ箇所のリスト

#### 5. Assumptions & Constraints
- **Assumptions:**
  - 既存のローカライズシステム（chrome.i18n API + messages.json）を継続使用
  - Chrome拡張機能の基本構造は変更しない
  - 英語と日本語の2言語対応のまま維持
- **Constraints:**
  - Chrome Manifest V3の制約に準拠
  - 既存機能への影響を最小限に抑制
  - パフォーマンスへの影響を避ける

#### 6. Team & Roles
- **Client-side:**
  - Project Lead: `actpike`
- **Vendor/Developer-side:**
  - Assigned to: `Claude Code`

#### 7. Schedule
- **Kick-off:** `2025-08-05`
- **調査・修正完了:** `2025-08-05`
- **テスト・検証完了:** `2025-08-05`
- **Final Delivery:** `2025-08-05`

#### 8. Acceptance Criteria
- 英語環境で「ゲームが登録されていません」が適切に英語表示される
- 英語環境で更新通知が英語で表示される
- 日本語環境で既存の日本語表示が正常に動作する
- ローカライズ切り替え機能が正常に動作する
- Chrome拡張機能のリロード・再起動テストに合格する
- 他のローカライズ済み機能に影響がない

#### 9. Change Log
*今後の変更はここに記録される*

---