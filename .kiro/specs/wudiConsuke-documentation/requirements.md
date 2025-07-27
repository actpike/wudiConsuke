# Requirements Document

## Introduction
ウディこん助Chrome拡張機能の包括的なアーキテクチャドキュメント作成プロジェクトです。現在実装済みの全コンポーネント間の相互作用をシーケンス図として可視化し、開発者と保守担当者が システム全体の動作フローを理解できる技術ドキュメントを提供します。Chrome Manifest V3対応の実用的自動監視システム、複数年度対応機能、CSV対応データ管理システムなど、v1.0.3時点の実装状況を正確に反映したドキュメントを作成します。

## Requirements

### Requirement 1: アーキテクチャ概要ドキュメント作成
**User Story:** 開発者として、ウディこん助Chrome拡張機能の全体アーキテクチャを理解できるよう、システム概要と主要コンポーネントの役割を記載したドキュメントが欲しい。

#### Acceptance Criteria
1. **WHEN** ドキュメントを読む **THEN** システム **SHALL** Chrome Manifest V3アーキテクチャの3層構成（Service Worker、Content Script、Popup）を明記する
2. **WHEN** コンポーネント一覧を確認する **THEN** システム **SHALL** 全JSモジュール（popup.js、background.js、content.js、dataManager.js、navigation.js、webMonitor.js、pageParser.js、updateManager.js、yearManager.js、constants.js、errorHandler.js）の役割を説明する
3. **IF** v1.0.3時点のアーキテクチャを参照する **THEN** システム **SHALL** 複数年度対応システム、CSV対応データ管理、実用的自動監視システムの実装状況を反映する
4. **WHERE** 技術制約セクション **THE SYSTEM SHALL** 完全ローカル動作、chrome.storage.local制限（5MB）、Chrome拡張セキュリティ制約を記載する

### Requirement 2: データフロー可視化ドキュメント
**User Story:** システム保守担当者として、データがどのように流れ、変換され、保存されるかを追跡できるよう、データフローの詳細な図と説明が欲しい。

#### Acceptance Criteria
1. **WHEN** データフロー図を参照する **THEN** システム **SHALL** chrome.storage.localを中心としたデータ永続化フローを図示する
2. **WHEN** 年度別データ管理を確認する **THEN** システム **SHALL** YearManagerクラスによる年度別データ分離とデータ移行フローを説明する
3. **IF** CSV対応機能を参照する **THEN** システム **SHALL** エクスポート/インポート処理におけるデータ変換フロー（JSON↔CSV）を記載する
4. **WHERE** 評価データ処理 **THE SYSTEM SHALL** 6カテゴリ評価システム（熱中度、斬新さ、物語性、画像音響、遊びやすさ、その他）のデータ構造と処理フローを詳述する
5. **WHEN** null値処理を確認する **THEN** システム **SHALL** 新規作品登録時のnull初期値から評価入力、平均計算における除外処理までのフローを説明する

### Requirement 3: Web監視システムシーケンス図
**User Story:** 機能拡張担当者として、Web監視システムがどのタイミングで動作し、どのような処理フローで新規作品検出や更新検知を行うかを理解できるシーケンス図が欲しい。

#### Acceptance Criteria
1. **WHEN** 実用的自動監視フローを参照する **THEN** システム **SHALL** content.jsによるサイト訪問時監視（30分間隔制限）とpopup.jsによる定期監視（1時間以上経過時）のシーケンスを図示する
2. **WHEN** Web監視実行プロセスを確認する **THEN** システム **SHALL** webMonitor.js → pageParser.js → updateManager.js の処理連携をシーケンス図で表現する
3. **IF** 新規作品検出時の処理を参照する **THEN** システム **SHALL** HTML解析、データ抽出、chrome.storage.local保存、chrome.notifications.create通知のフローを記載する
4. **WHERE** 更新作品検知処理 **THE SYSTEM SHALL** 既存作品との差分検出ロジックとバージョンステータス更新フローを説明する
5. **WHEN** エラーハンドリングを確認する **THEN** システム **SHALL** 統一エラーハンドリング（errorHandler.js）による分類・通知・履歴管理の処理フローを含める

### Requirement 4: UI操作フローシーケンス図  
**User Story:** UI設計担当者として、ユーザーの操作がシステム内でどのような処理を引き起こし、画面がどのように更新されるかを追跡できるシーケンス図が欲しい。

#### Acceptance Criteria
1. **WHEN** ポップアップ開時の処理を参照する **THEN** システム **SHALL** popup.js初期化、GameListManager起動、年度選択UI表示、自動監視チェックのフローを図示する
2. **WHEN** 作品詳細画面遷移を確認する **THEN** システム **SHALL** navigation.jsによる画面切り替え、データ読み込み、評価スライダー表示、自動保存機能のシーケンスを記載する
3. **IF** 年度切り替え操作を参照する **THEN** システム **SHALL** オプションページでの年度選択、yearManager.jsによるデータ切り替え、UI更新のフローを説明する
4. **WHERE** 評価入力処理 **THE SYSTEM SHALL** スライダー操作イベント、リアルタイム平均計算、画面遷移時自動保存のフローを詳述する
5. **WHEN** データエクスポート/インポート操作を確認する **THEN** システム **SHALL** ファイル選択、形式選択（JSON/CSV）、データ変換、ダウンロード/アップロード処理のシーケンスを記載する

### Requirement 5: コンポーネント間通信ドキュメント
**User Story:** アーキテクト担当者として、各コンポーネントがどのような方法で通信し、依存関係がどのように構成されているかを理解できるドキュメントが欲しい。

#### Acceptance Criteria
1. **WHEN** Service Worker通信を参照する **THEN** システム **SHALL** chrome.runtime.onMessage通信によるpopup.js ↔ background.js間のメッセージパッシングフローを記載する
2. **WHEN** グローバルインスタンス管理を確認する **THEN** システム **SHALL** windowオブジェクトに作成される全インスタンス（gameDataManager、errorHandler、constants等）の依存関係図を提供する
3. **IF** モジュール初期化順序を参照する **THEN** システム **SHALL** popup.htmlでの順次JSファイル読み込みと依存関係解決プロセスを説明する
4. **WHERE** データマネージャー連携 **THE SYSTEM SHALL** GameDataManager、YearManager、UpdateManagerの相互作用とデータ整合性確保メカニズムを詳述する
5. **WHEN** 統一サービス利用を確認する **THEN** システム **SHALL** 全モジュールから利用される共通サービス（constants.js、errorHandler.js）のアクセスパターンを図示する