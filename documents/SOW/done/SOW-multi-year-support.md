---
project_name: "ウディこん助 複数年度対応機能"
status: "Done"
owner: "Claude Code Assistant"
created_at: "2025-07-24"
updated_at: "2025-01-24"
---

- **Project Name:** `ウディこん助 複数年度対応機能`
- **Creation Date:** `2025-07-24`
- **Revision History:**
  - `v1.0 (2025-07-24): Initial draft`

#### 1. Project Purpose & Background

現在のウディこん助は第17回（2025年）ウディコンを前提として設計・実装されています。ウディコンは毎年開催されるため、既存データを保持しつつ次回以降の開催でも継続使用できるよう、複数年度に対応する必要があります。

**解決すべき課題：**
- 現状は2025年データのみに特化した設計
- 来年（第18回）開催時に既存データが使用できない
- 年度ごとのデータ分離・管理機能が未実装

#### 2. Scope of Work

以下の機能を実装します：

- **年度選択機能**
  - オプションページ先頭にプルダウンメニューを配置
  - 有効な年（データが存在する年）のみを選択肢として表示
  - デフォルトは最新年度を選択
  
- **データ分離機能**
  - 年度ごとにデータを独立して管理
  - chrome.storage.localの構造を年度別に変更
  - 既存2025年データの移行処理を実装
  
- **年度切り替え機能**
  - プルダウン変更時に全データを対象年度に切り替え
  - 作品リスト、評価、感想データの年度別表示
  - Web監視機能の年度別URLパターン対応
  
- **データマイグレーション**
  - 既存データを新しい年度別構造に移行
  - バックアップ機能付きの安全な移行処理
  - 移行エラー時の復旧機能

#### 3. Out of Scope

以下は本プロジェクトでは実装しません：

- 年度をまたいだデータの統合表示機能
- 過去年度データの自動削除機能
- 複数年度間でのデータ比較・分析機能
- ウディコン公式サイトの年度別URL自動検出機能
- 年度別のUIテーマ変更機能

#### 4. Deliverables

**Design-related:**
- 複数年度対応設計書 (design-document.md)
- データ構造移行仕様書 (migration-spec.md)

**Implementation-related:**
- オプションページUI改修 (options.html, options.js)
- 年度選択機能 (year-selector.js)
- データ管理層改修 (dataManager.js)
- Web監視機能改修 (webMonitor.js, pageParser.js)
- データ移行スクリプト (migration.js)

**Other:**
- 機能テスト結果報告書 (test-report.md)
- ユーザー向け操作ガイド更新

#### 5. Assumptions & Constraints

**Assumptions:**
- ウディコンの基本的な開催形式は継続される
- chrome.storage.localの容量制限（5MB）内で複数年度データを管理可能
- 既存ユーザーのデータ保護が最優先事項

**Constraints:**
- Chrome拡張機能のManifest V3制約
- 既存コードベースとの互換性維持
- パフォーマンス劣化を最小限に抑制
- 既存ユーザーのデータ損失は絶対に避ける

#### 6. Team & Roles

**Client-side:**
- Project Lead: `ユーザー（プロダクトオーナー）`

**Vendor/Developer-side:**
- Assigned to: `Claude Code Assistant`
- Technical Reviewer: `Claude Code Assistant`

#### 7. Schedule

- **Kick-off:** `2025-07-24`
- **設計・仕様策定完了:** `2025-07-25`
- **プロトタイプ実装完了:** `2025-07-26`
- **テスト・デバッグ完了:** `2025-07-27`
- **Final Delivery:** `2025-07-28`

#### 8. Acceptance Criteria

以下の条件を満たした場合に完了とします：

- オプションページで年度選択プルダウンが正常に表示される
- 年度切り替え時に該当年度のデータのみが表示される
- 既存2025年データが新構造に正常に移行される
- データ損失が発生しない（移行前後でデータ整合性確認）
- Web監視機能が選択年度のウディコンサイトを正常に監視する
- 複数年度データが存在する状態で全機能が正常動作する
- Chrome拡張機能のリロード後も年度選択状態が保持される

#### 9. Change Log

*今後の変更はここに記録予定*

---