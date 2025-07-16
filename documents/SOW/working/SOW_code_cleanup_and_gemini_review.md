---
project_name: "alarms権限削除後のコードクリーンアップとGeminiCLIレビュー"
status: "In Progress"
owner: "act_pike"
created_at: "2025-07-16"
updated_at: "2025-07-16"
---

### SOW (Statement of Work)

- **Project Name:** `alarms権限削除後のコードクリーンアップとGeminiCLIレビュー`
- **Creation Date:** `2025-07-16`
- **Revision History:**
  - `v1.0 (2025-07-16): Initial draft`

#### 1. Project Purpose & Background

v0.0.6でChrome alarms権限削除を実施した後、wodicon_helper内に不要な処理やデッドコードが残存していないかを包括的にチェックし、GeminiCLIを活用した外部レビューで品質を保証する。既存機能を維持しながらコードベースを最適化し、Chrome Web Store審査に向けた最終準備を完了する。

#### 2. Scope of Work

- wodicon_helper内の全ファイルの不要処理検出・削除
- alarms権限削除に関連する残存コード・コメント・設定の洗い出し
- 未使用変数・関数・インポートの特定・削除
- デッドコード（到達不可能コード）の検出・削除
- コンソールログの不要出力の整理
- 設定ファイル・JSONファイルの不要エントリ削除
- GeminiCLI設定の最適化（timeout、除外パターン等）
- GeminiCLIによる包括的コードレビュー実行
- レビュー結果の分析と重要な指摘事項への対応
- 最終的な動作確認テスト実行

#### 3. Out of Scope

- 新機能の追加開発
- 既存機能のロジック変更・改修
- UI/UXの変更・改善
- パフォーマンス最適化（コードクリーンアップの範囲を超える改修）
- Chrome Web Storeへの実際の申請作業
- GeminiCLI以外のツールによるコードレビュー
- テストコードの新規作成
- ドキュメント新規作成（既存文書の更新は含む）

#### 4. Deliverables

- **クリーンアップ関連:**
  - 不要処理削除済みのwodicon_helperディレクトリ
  - 削除した不要コードの一覧レポート
  - コードクリーンアップ前後の比較サマリー
- **GeminiCLIレビュー関連:**
  - 最適化されたGeminiCLI設定ファイル
  - GeminiCLIレビュー実行結果レポート
  - 重要な指摘事項とその対応記録
- **検証関連:**
  - 既存機能動作確認テスト結果
  - Chrome拡張機能のリロード・エラーチェック結果
- **ドキュメント関連:**
  - 更新されたCLAUDE.md（クリーンアップ内容反映）

#### 5. Assumptions & Constraints

- **Assumptions:** 
  - v0.0.6のalarms権限削除は正常に完了している
  - 既存の3つの監視パターン（サイト訪問時・ポップアップ開時・手動実行）は正常に動作している
  - GeminiCLI統合パッケージが正常に機能している
  - 不要処理削除により既存機能に影響が出ないことを前提とする
- **Constraints:** 
  - 既存機能の動作を維持する必要がある
  - Chrome Manifest V3の制約に準拠する必要がある
  - GeminiCLIのタイムアウト制限（120秒）内でレビューを完了する必要がある
  - コードクリーンアップは保守的に実施し、動作確認を必須とする

#### 6. Team & Roles

- **Client-side:**
  - Project Lead: `act_pike`
- **Vendor/Developer-side:**
  - Assigned to: `Claude Code`

#### 7. Schedule

- **Kick-off:** `2025-07-16`
- **コードクリーンアップ完了:** `2025-07-16`
- **GeminiCLI設定最適化完了:** `2025-07-16`
- **GeminiCLIレビュー実行完了:** `2025-07-16`
- **指摘事項対応完了:** `2025-07-16`
- **Final Delivery:** `2025-07-16`

#### 8. Acceptance Criteria

- wodicon_helper内にalarms関連の残存コード・コメントが存在しない
- 未使用変数・関数・インポートが特定・削除されている
- デッドコードが検出・削除されている
- GeminiCLIレビューが正常に実行され、結果レポートが生成されている
- GeminiCLIの重要な指摘事項（セキュリティ・品質・保守性）が適切に対応されている
- 既存の3つの監視パターンが正常に動作することが確認されている
- Chrome拡張機能のリロード時にエラーが発生しない
- クリーンアップ前後で機能に差異がないことが確認されている
- CLAUDE.mdにクリーンアップ内容が適切に反映されている

#### 9. Change Log

*初回作成時点のため変更履歴なし*

---