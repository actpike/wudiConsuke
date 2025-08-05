# ウディこん助 ローカライズガイド

## 概要

ウディこん助（WodiConsuke）Chrome拡張機能の多言語対応（国際化・i18n）に関する開発ガイドラインです。現在、日本語と英語の2言語をサポートしています。

## サポート言語

- **日本語 (ja)**: プライマリ言語、フォールバック言語
- **英語 (en)**: セカンダリ言語

## ローカライズシステム構成

### ファイル構成

```
wodicon_helper/
├── _locales/                     # Chrome拡張機能標準i18n
│   ├── ja/messages.json         # 日本語メッセージ（Chrome API用）
│   └── en/messages.json         # 英語メッセージ（Chrome API用）
├── localize/                     # 独自ローカライザーシステム
│   ├── localizer.js             # メインローカライザー
│   ├── languages/
│   │   ├── ja.js               # 日本語リソース（独自システム用）
│   │   └── en.js               # 英語リソース（独自システム用）
│   └── utils/
│       ├── language-detector.js # 言語検出ユーティリティ
│       └── dom-updater.js       # DOM更新ユーティリティ
└── manifest.json
    └── "default_locale": "ja"   # デフォルト言語設定
```

### システム構成

1. **Chrome標準i18nシステム** (`_locales/`)
   - Chrome拡張機能の標準的な国際化機能
   - `chrome.i18n.getMessage()` で利用
   - 主にmanifest.jsonの基本情報に使用

2. **独自ローカライザーシステム** (`localize/`)
   - 高機能な多言語対応システム
   - `window.localizer.getText()` で利用
   - 動的言語切り替え、DOM自動更新対応

## 開発ルール

### 1. 言語検出・切り替え

**✅ 推奨方法（統一されたローカライザーシステム）:**
```javascript
const currentLanguage = window.localizer ? window.localizer.getCurrentLanguage() : 'ja';
const isEnglish = currentLanguage === 'en';

const message = isEnglish ? 'English message' : '日本語メッセージ';
```

**❌ 非推奨方法:**
```javascript
// chrome.i18n.getUILanguage()は正確でない場合がある
const uiLanguage = chrome.i18n.getUILanguage();
const isEnglish = uiLanguage.startsWith('en');
```

### 2. 通知メッセージのローカライズ

**Chrome通知の実装パターン:**
```javascript
async function sendNotification() {
  const currentLanguage = window.localizer ? window.localizer.getCurrentLanguage() : 'ja';
  const isEnglish = currentLanguage === 'en';
  
  const title = isEnglish ? 
    'English Notification Title' : 
    '日本語通知タイトル';
    
  const message = isEnglish ?
    'English notification message' :
    '日本語通知メッセージ';
  
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title,
    message: message
  });
}
```

### 3. UI要素のローカライズ

**HTML要素の多言語対応:**
```html
<!-- data-i18n属性を使用 -->
<button data-i18n="ui.buttons.save">保存</button>
<span data-i18n="ui.labels.gameTitle">作品名</span>
```

**JavaScript動的生成要素:**
```javascript
// ローカライザーシステムを使用
const saveButtonText = (window.localizer && window.localizer.getText) ? 
  window.localizer.getText('ui.buttons.save') : '保存';

button.textContent = saveButtonText;
```

### 4. エラーメッセージ・確認ダイアログ

**確認ダイアログの実装パターン:**
```javascript
const currentLanguage = window.localizer ? window.localizer.getCurrentLanguage() : 'ja';
const isEnglish = currentLanguage === 'en';

const confirmMessage = isEnglish ? 
  'Are you sure you want to delete this item?' : 
  'この項目を削除してもよろしいですか？';

if (confirm(confirmMessage)) {
  // 削除処理
}
```

## リソース管理

### 1. メッセージキーの命名規則

**階層構造:**
```javascript
// 良い例
ui.buttons.save
ui.labels.gameTitle
ui.status.loadComplete
notifications.autoMonitor.title
settings.language.japanese

// 悪い例
saveButton
gameTitle
loadComplete
```

**命名原則:**
- 小文字とドット記法を使用
- 機能別・コンテキスト別にグループ化
- 具体的で分かりやすい名前を使用

### 2. パラメータ化メッセージ

**プレースホルダーの使用:**
```javascript
// リソースファイル
"newWorksFound": "🎮 {count} new games found"
"updateComplete": "📊 Found {newCount} new, {updateCount} updated"

// 使用例
const template = window.localizer.getText('notifications.newWorksFound');
const message = template.replace('{count}', actualCount);
```

**パラメータ命名規則:**
- `{count}`, `{newCount}`, `{updateCount}` など具体的な名前を使用
- 単純な`{0}`, `{1}`は避ける

### 3. 長文メッセージの処理

**改行を含むメッセージ:**
```javascript
// 英語
"systemErrorMessage": "Monitor system has encountered consecutive errors ({count} times)\\nPlease check the settings page for details"

// 日本語  
"systemErrorMessage": "監視システムでエラーが続いています (連続{count}回)\\n詳細は設定画面でご確認ください"
```

## 品質保証

### 1. テストパターン

**言語切り替えテスト:**
1. 日本語環境での全機能テスト
2. 英語環境での全機能テスト
3. 言語設定変更時の動的更新テスト

**メッセージ表示テスト:**
1. 通知メッセージの言語確認
2. エラーメッセージの言語確認
3. UI要素の言語確認

### 2. フォールバック処理

**必須フォールバック:**
```javascript
// 常にフォールバックを提供
const message = (window.localizer && window.localizer.getText) ? 
  window.localizer.getText('ui.messages.example') : 
  'デフォルト日本語メッセージ';
```

**エラー時の安全な処理:**
```javascript
try {
  const localizedMessage = window.localizer.getText('key');
  return localizedMessage;
} catch (error) {
  console.warn('Localization failed, using fallback:', error);
  return 'フォールバックメッセージ';
}
```

## 新機能追加時のチェックリスト

### 開発時
- [ ] 新しいユーザー向けメッセージを特定
- [ ] 日本語・英語両方のリソースを追加
- [ ] 適切なキー名を設定（命名規則準拠）
- [ ] フォールバック処理を実装

### テスト時
- [ ] 日本語環境での動作確認
- [ ] 英語環境での動作確認
- [ ] 言語切り替え時の動作確認
- [ ] エラー時のフォールバック確認

### リリース前
- [ ] 全ての新規メッセージが翻訳済み
- [ ] リソースファイルの構文チェック
- [ ] 実際のユーザー環境でのテスト

## よくある問題と解決策

### 1. `chrome.i18n.getMessage()`が期待通りに動作しない

**問題**: `default_locale: "ja"`の影響で英語環境でも日本語が返される

**解決策**: 独自ローカライザーシステムを使用
```javascript
// ❌ 問題のあるコード
const message = chrome.i18n.getMessage('key') || 'fallback';

// ✅ 修正後のコード
const currentLanguage = window.localizer ? window.localizer.getCurrentLanguage() : 'ja';
const isEnglish = currentLanguage === 'en';
const message = isEnglish ? 'English message' : '日本語メッセージ';
```

### 2. 動的に生成される要素のローカライズ漏れ

**問題**: JavaScript で動的作成した要素が日本語固定

**解決策**: 作成時にローカライザーを適用
```javascript
// ❌ 問題のあるコード
cell.textContent = '検索結果がありません';

// ✅ 修正後のコード
const message = (window.localizer && window.localizer.getText) ?
  window.localizer.getText('ui.messages.noSearchResults') : '検索結果がありません';
cell.textContent = message;
```

### 3. 通知メッセージのローカライズ漏れ

**問題**: `chrome.notifications.create()`で日本語が直接指定されている

**解決策**: 言語検出を使用した条件分岐
```javascript
// ❌ 問題のあるコード
chrome.notifications.create({
  title: '新規作品が見つかりました',
  message: `${count}件の新規作品を発見`
});

// ✅ 修正後のコード
const currentLanguage = window.localizer ? window.localizer.getCurrentLanguage() : 'ja';
const isEnglish = currentLanguage === 'en';

const title = isEnglish ? 'New games found' : '新規作品が見つかりました';
const message = isEnglish ? 
  `Found ${count} new games` : 
  `${count}件の新規作品を発見`;

chrome.notifications.create({ title, message });
```

## 関連ファイル

### 実装ファイル
- [`localize/localizer.js`](../wodicon_helper/localize/localizer.js) - メインローカライザー
- [`localize/languages/ja.js`](../wodicon_helper/localize/languages/ja.js) - 日本語リソース
- [`localize/languages/en.js`](../wodicon_helper/localize/languages/en.js) - 英語リソース

### 設定ファイル
- [`_locales/ja/messages.json`](../wodicon_helper/_locales/ja/messages.json) - Chrome標準i18n（日本語）
- [`_locales/en/messages.json`](../wodicon_helper/_locales/en/messages.json) - Chrome標準i18n（英語）
- [`manifest.json`](../wodicon_helper/manifest.json) - Chrome拡張機能設定

### ドキュメント
- [`CLAUDE.md`](../CLAUDE.md) - プロジェクト全体指示書
- [`documents/architecture/README.md`](./architecture/README.md) - アーキテクチャ概要

---

**最終更新**: 2025年8月5日  
**対象バージョン**: v1.0.3+  
**作成者**: Claude Code による自動生成  
**メンテナンス**: ローカライズ機能追加・修正時に随時更新