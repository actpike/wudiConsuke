# SOW: ローカライズ対応機能の実装

---
date: 2025-07-30
status: Todo
---

## 1. プロジェクト概要

### 1.1 プロジェクト名
ウディこん助 Chrome拡張機能 - ローカライズ対応機能の実装

### 1.2 背景・目的
現在の拡張機能は日本語のみに対応しており、国際的なユーザーの利用を想定していない。ウディコンコンテストの国際化対応や、日本国外のユーザーの利用促進を目的として、多言語対応機能を実装する。

### 1.3 対象言語
- 日本語（既存、デフォルト）
- English（新規追加）

## 2. 要件定義

### 2.1 機能要件

#### 2.1.1 言語選択機能
- オプション画面に言語選択UI（日本語|English）を追加
- 選択した言語設定をchrome.storage.localに永続化
- アプリケーション起動時に保存された言語設定を自動読み込み

#### 2.1.2 ローカライズ機能
- 専用のlocalizeフォルダを作成し、言語リソース管理を実装
- 以下の要素を多言語対応：
  - UI文言（ボタン、ラベル、メッセージ）
  - 評価指標テキスト
  - エラーメッセージ
  - 通知メッセージ
  - プレースホルダーテキスト

#### 2.1.3 自動言語判定機能
- 初回起動時にユーザーのブラウザ言語を自動判定
- 判定ロジック：
  1. `chrome.i18n.getAcceptLanguages()` で優先言語を取得
  2. `chrome.i18n.getUILanguage()` でブラウザUI言語を取得
  3. 上記のフォールバック処理
- 言語判定ルール：
  - 'ja' または 'ja-*'：日本語に設定
  - その他すべて：English に設定
- ユーザーが手動で言語設定した場合は自動判定を上書き

#### 2.1.4 動的言語切り替え
- 言語設定変更時のリアルタイム反映
- ページリロード不要での言語切り替え
- 既存データ（作品情報、感想等）の言語に依存しない保持

### 2.2 非機能要件

#### 2.2.1 パフォーマンス
- 言語リソース読み込み時間：100ms以内
- 言語切り替え処理時間：50ms以内

#### 2.2.2 保守性
- 新しい言語の追加が容易な設計
- 翻訳テキストの管理・更新が簡単

#### 2.2.3 互換性
- 既存のデータ構造との完全互換性
- 既存機能への影響なし

## 3. システム設計

### 3.1 アーキテクチャ設計

#### 3.1.1 フォルダ構造
```
wodicon_helper/
├── localize/
│   ├── localizer.js          # メインローカライズエンジン
│   ├── languages/
│   │   ├── ja.js             # 日本語リソース
│   │   └── en.js             # 英語リソース
│   └── utils/
│       ├── language-detector.js  # 言語検出ユーティリティ
│       └── dom-updater.js        # DOM更新ユーティリティ
├── js/
│   └── options.js            # オプション画面（言語選択追加）
└── options.html              # オプション画面HTML
```

#### 3.1.2 データ構造
```javascript
// 言語リソースファイル構造
const LanguageResource = {
  ui: {
    buttons: { save: "保存", cancel: "キャンセル" },
    labels: { rating: "評価", review: "感想" },
    messages: { saved: "保存しました", error: "エラーが発生しました" }
  },
  ratings: {
    categories: { heat: "熱中度", novelty: "斬新さ" },
    indicators: { /* 既存のRATING_INDICATORS構造 */ }
  },
  placeholders: {
    review: "感想を入力してください...",
    search: "検索..."
  }
};
```

### 3.2 技術設計

#### 3.2.1 ローカライザークラス
```javascript
class Localizer {
  constructor() {
    this.currentLanguage = 'ja';
    this.resources = {};
    this.isAutoDetected = false;
  }
  
  async initialize()           // 初期化・言語リソース読み込み
  async detectUserLanguage()   // ブラウザ言語自動判定
  setLanguage(lang, isManual)  // 言語設定変更
  getText(key)                // テキスト取得
  updateDOM()                 // DOM要素の一括更新
}
```

#### 3.2.2 自動言語判定システム
```javascript
// 言語判定アルゴリズム
async function detectUserLanguage() {
  try {
    // 1. ユーザー優先言語を取得
    const acceptLanguages = await chrome.i18n.getAcceptLanguages();
    
    // 2. ブラウザUI言語を取得
    const uiLanguage = chrome.i18n.getUILanguage();
    
    // 3. 判定ロジック
    const primaryLanguage = acceptLanguages[0] || uiLanguage || 'ja';
    
    // 4. 'ja'判定（ja, ja-JP等）
    return primaryLanguage.startsWith('ja') ? 'ja' : 'en';
  } catch (error) {
    return 'ja'; // フォールバック
  }
}
```

#### 3.2.3 言語設定管理
- chrome.storage.local.set/get での永続化
- 設定キー：
  - 'user_language': 'ja' | 'en'
  - 'language_auto_detected': boolean（自動判定されたかどうか）
- 初回起動時の自動判定処理
- 手動設定時の自動判定フラグ無効化

#### 3.2.4 DOM更新戦略
- data-i18n属性によるマーキング
- 動的要素の自動更新メカニズム
- パフォーマンス最適化（差分更新）

## 4. 実装計画

### 4.1 Phase 1: インフラ構築（工数：4時間）
- localizeフォルダ作成
- Localizerクラス実装
- 基本的な言語リソース構造作成

### 4.2 Phase 2: 言語リソース作成（工数：6時間）
- 日本語リソースファイル（ja.js）作成
- 英語リソースファイル（en.js）作成
- 評価指標の英語翻訳

### 4.3 Phase 3: UI統合（工数：4時間）
- オプション画面に言語選択機能追加
- 既存UI要素のdata-i18n属性追加
- DOM更新機能の統合

### 4.4 Phase 4: テスト・品質保証（工数：2時間）
- 言語切り替えテスト
- 既存機能への影響確認
- エラーハンドリング確認

### 総工数：16時間

## 5. 成果物

### 5.1 実装ファイル
- `/localize/localizer.js` - メインローカライズエンジン
- `/localize/languages/ja.js` - 日本語リソース
- `/localize/languages/en.js` - 英語リソース
- `/localize/utils/language-detector.js` - 言語検出
- `/localize/utils/dom-updater.js` - DOM更新
- `/options.html` - 更新されたオプション画面
- `/js/options.js` - 言語選択機能

### 5.2 更新ファイル
- `/popup.html` - data-i18n属性追加
- `/js/popup.js` - ローカライザー統合
- `/js/navigation.js` - 多言語対応
- `/js/constants.js` - 言語リソース統合

## 6. テスト計画

### 6.1 機能テスト
- 自動言語判定機能の動作確認
  - 日本語ブラウザでの'ja'判定テスト
  - 英語ブラウザでの'en'判定テスト
  - その他言語での'en'フォールバックテスト
- 言語選択UIの動作確認
- 言語切り替え時のUI更新確認
- 設定の永続化確認
- 手動設定による自動判定上書き確認
- 既存機能の正常動作確認

### 6.2 多言語テスト
- 日本語表示の正確性確認
- 英語表示の正確性確認
- レイアウト崩れの確認
- 文字化けの確認

### 6.3 パフォーマンステスト
- 言語リソース読み込み時間測定
- 言語切り替え処理時間測定
- メモリ使用量の確認

## 7. リスク管理

### 7.1 技術リスク
- **リスク**: 既存のconstants.jsとの競合
- **対策**: 段階的移行とフォールバック機能の実装

- **リスク**: Chrome拡張機能のサイズ制限
- **対策**: 言語リソースの最適化と動的読み込み

### 7.2 運用リスク
- **リスク**: 翻訳品質の問題
- **対策**: ネイティブスピーカーによるレビュー

- **リスク**: 既存ユーザーへの影響
- **対策**: デフォルト言語を日本語に設定し、既存動作を保持

## 8. 承認・次ステップ

### 8.1 承認項目
- [ ] 要件定義の承認
- [ ] 技術設計の承認
- [ ] 実装計画の承認
- [ ] テスト計画の承認

### 8.2 次ステップ
1. SOW承認
2. Phase 1: インフラ構築開始
3. 定期的な進捗確認
4. 各Phaseでの動作確認

---

**作成者**: Claude Code  
**作成日**: 2025-07-30  
**バージョン**: 1.0