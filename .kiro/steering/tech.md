# Technology Stack

## Architecture
Chrome Manifest V3ベースのSingle Page Application。Service Worker + Content Script + Popup の3層構成で完全ローカル動作を実現。

## Frontend
- **Language**: Vanilla JavaScript (ES2022)
- **UI Framework**: HTML5 + CSS3（フレームワークレス）
- **Module System**: ES6 Modules with Global Instance Pattern
- **Build Tools**: なし（Chrome拡張の軽量性重視）

## Backend
- **Service Worker**: background.js（Chrome Manifest V3対応）
- **Data Storage**: chrome.storage.local（5MB制限）
- **Communication**: chrome.runtime.onMessage API
- **External Integration**: Fetch API + HTML Parsing

## Development Environment
Chrome拡張機能には伝統的なbuild/lint/testコマンドはありません。以下の手順で開発：

### 拡張機能のロード・デバッグ
```bash
# Chrome でchrome://extensions/ を開く
# 開発者モードを有効化
# 「パッケージ化されていない拡張機能を読み込む」で wodicon_helper/ フォルダを選択

# リロード・デバッグ
# 拡張機能ページで「リロード」ボタンをクリック
# ポップアップを右クリック → 「検証」でDevToolsを開く
# background.js のデバッグは chrome://extensions/ → 「service worker」リンク
```

### 自動化システム活用
```bash
# 開発版リリース作成
npm run create-release
# → WudiConsuke_release_v[version]-pre.zip 作成、Webサイト更新なし

# 本番リリース作成  
npm run create-release:production
# → 本番用zip作成、紹介ページ自動更新、pre版削除
```

## Common Commands
### Chrome拡張機能開発
- **拡張機能テスト**: chrome://extensions/ での手動ロード・リロード
- **Web監視テスト**: ポップアップ内「🔍 手動監視実行」ボタン
- **状態確認**: 「📊 監視状態確認」ボタンで設定・履歴確認
- **構文チェック**: `node -c js/[filename].js` で各JSファイル検証

### Git・リリース管理
```bash
git add .                    # 変更をステージング
git commit -m "説明"         # コミット  
git push origin main         # リモートプッシュ

# ⚠️ 重要: ワーキングディレクトリが wodicon_helper/ の場合、
# 上位の website/ フォルダ変更が git add . に含まれない
# → git status で全変更ファイル確認してから git add 実行
```

## Environment Variables
Chrome拡張機能では環境変数は使用せず、constants.jsで定数管理：

```javascript
// constants.js での設定管理
const CONSTANTS = {
  STORAGE_KEYS: {
    GAMES_PREFIX: 'wodicon_games_',
    CURRENT_YEAR: 'current_year',
    MONITORING_STATE: 'monitoring_state'
  },
  LIMITS: {
    STORAGE_SIZE_MB: 5,
    AUTO_MONITOR_INTERVAL_MINUTES: 30,
    PERIODIC_MONITOR_INTERVAL_HOURS: 1
  },
  URLS: {
    WODICON_BASE: 'https://silversecond.com/WolfRPGEditor/Contest'
  }
};
```

## Port Configuration
Chrome拡張機能では固定ポートを使用せず、Chrome内部での動作：
- **開発**: chrome://extensions/ での拡張機能ロード
- **デバッグ**: Chrome DevTools統合
- **配布**: .zip形式でのパッケージ配布

## Key Technical Constraints
- **完全ローカル動作**: 外部API・CDN使用禁止
- **Chrome Manifest V3**: セキュリティ制約準拠
- **ストレージ制限**: chrome.storage.local 5MB制限
- **Host Permissions**: https://silversecond.com/* のみ許可

## Security Considerations
- **CSP準拠**: デフォルトContent Security Policyに準拠
- **XSS防止**: innerHTML使用禁止、textContent使用徹底
- **最小権限**: 必要最小限のpermissions設定
- **データ暗号化**: chrome.storage.localの暗号化はChrome側で自動処理

## Performance Targets
- **Popup起動時間**: < 100ms（実測 ~50ms）
- **Web監視実行時間**: < 5秒（実測 ~2-3秒）
- **データ読み込み時間**: < 50ms（実測 ~20ms）
- **メモリ使用量**: < 10MB（実測 ~5MB）