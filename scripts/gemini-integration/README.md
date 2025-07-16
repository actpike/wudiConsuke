# 🤖 GeminiAPI統合パッケージ

任意のプロジェクトで使用可能なGeminiAPI統合モジュール

## 📋 概要

このパッケージは、GoogleのGeminiAPIとの統合を提供する汎用的なモジュールです。どのプロジェクトでも簡単に組み込んで使用できます。

### 主な機能

- **🔧 簡単セットアップ**: 対話形式でAPIキーを設定
- **💬 対話機能**: 単発メッセージ送信とチャットセッション
- **📝 自動ログ記録**: 全ての会話を詳細に記録
- **🛡️ エラーハンドリング**: 堅牢なエラー処理とリトライ機能
- **⚙️ 設定管理**: 環境変数による柔軟な設定管理
- **🧪 テスト機能**: 接続テストとデバッグ機能

## 🚀 クイックスタート

### 1. プロジェクトに追加

```bash
# このフォルダを任意のプロジェクトにコピー
cp -r gemini-integration /path/to/your/project/

# フォルダに移動
cd /path/to/your/project/gemini-integration

# 依存関係をインストール
npm install
```

### 2. 初期設定

```bash
# 対話形式でAPIキーを設定
npm run setup
```

### 3. 接続テスト

```bash
# 接続テストを実行
npm test
```

### 4. 使用開始

```bash
# 対話型チャットを開始
npm run chat
```

## 📁 フォルダ構造

```
gemini-integration/
├── config/
│   └── gemini-config.js     # 設定管理
├── src/
│   ├── gemini-client.js     # メインクライアント
│   └── chat-cli.js          # 対話型CLI
├── test/
│   └── test-gemini-connection.js  # 接続テスト
├── utils/
│   ├── conversation-logger.js     # 会話ログ記録
│   └── logger.js                  # ログユーティリティ
├── package.json
├── setup.js                 # セットアップスクリプト
├── .env.example             # 環境変数テンプレート
├── .gitignore
└── README.md
```

## ⚙️ 設定

### 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `GEMINI_API_KEY` | GeminiAPIキー | 必須 |
| `GEMINI_MODEL` | 使用するモデル | `gemini-2.5-flash` |
| `GEMINI_TEMPERATURE` | 生成温度 | `0.7` |
| `GEMINI_MAX_TOKENS` | 最大トークン数 | `4000` |
| `GEMINI_TIMEOUT` | タイムアウト時間 | `30000` |
| `GEMINI_RETRY_COUNT` | リトライ回数 | `3` |
| `DEBUG` | デバッグモード | `false` |
| `LOG_LEVEL` | ログレベル | `info` |

## 🛠️ 使用方法

### プログラム内での使用

```javascript
import { geminiClient } from './src/gemini-client.js';

// 初期化
await geminiClient.initialize();

// 単発メッセージ送信
const result = await geminiClient.sendMessage('こんにちは');
console.log(result.response);

// チャットセッション開始
const chatSession = await geminiClient.startChat();
const chatResult = await chatSession.sendMessage('質問内容');
console.log(chatResult.response);
```

### コマンドライン使用

```bash
# 対話型チャット
npm run chat

# 接続テスト
npm test

# セットアップ
npm run setup
```

## 📊 ログ機能

### 自動記録される情報

- **会話ログ**: 全ての入力・出力を詳細に記録
- **セッション情報**: 統計データとメタデータ
- **エラーログ**: 発生したエラーの詳細記録

### ログファイル

```
logs/
├── conversations/    # 会話ログ（テキストファイル）
├── sessions/        # セッション情報（JSONファイル）
└── errors/          # エラーログ
```

### ログ形式

```
[2025/7/16 0:48:50] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 INPUT:
質問内容

🤖 OUTPUT:
回答内容

📊 METADATA:
- レスポンス時間: 1234ms
- 入力トークン: 10
- 出力トークン: 150
- 総トークン: 160
- 文字数: 200文字
```

## 🧪 テスト

### 自動テスト実行

```bash
npm test
```

### テスト項目

1. **初期化テスト** - クライアントの初期化
2. **基本接続テスト** - APIとの接続確認
3. **単一メッセージテスト** - メッセージ送信
4. **チャットセッションテスト** - 会話セッション
5. **モデル情報取得テスト** - モデル情報の取得
6. **日本語対応テスト** - 日本語での通信

## 🔧 カスタマイズ

### 設定のカスタマイズ

```javascript
// config/gemini-config.js を編集
export class GeminiConfig {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    // ... 他の設定
  }
}
```

### ログ設定のカスタマイズ

```javascript
// utils/conversation-logger.js を編集
export class ConversationLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    // ... カスタムログ設定
  }
}
```

## 📚 API リファレンス

### GeminiClient

#### `initialize()`
クライアントを初期化します。

#### `sendMessage(message)`
単一メッセージを送信します。

**戻り値:**
```javascript
{
  success: true,
  response: "回答内容",
  usage: { /* トークン使用量 */ },
  timestamp: "2025-07-16T00:00:00.000Z",
  responseTime: 1234
}
```

#### `startChat(history)`
チャットセッションを開始します。

### GeminiChatSession

#### `sendMessage(message)`
チャットセッションでメッセージを送信します。

#### `getHistory()`
会話履歴を取得します。

#### `clearHistory()`
会話履歴をクリアします。

## 🐛 トラブルシューティング

### よくある問題

#### APIキーエラー
```
Error: GEMINI_API_KEY is required
```
**解決方法**: `npm run setup` でAPIキーを設定

#### 接続エラー
```
Error: Failed to connect to Gemini API
```
**解決方法**: インターネット接続とAPIキーを確認

#### 使用制限エラー
```
Error: 429 Too Many Requests
```
**解決方法**: 時間をおいて再実行、または軽量モデルに変更

### デバッグモード

```bash
# 詳細ログを有効にして実行
DEBUG=true npm test
```

## 🔒 セキュリティ

### APIキー管理

- APIキーは`.env`ファイルで管理
- `.env`ファイルは`.gitignore`に追加済み
- 本番環境では環境変数として設定

### セーフティ設定

- ハラスメント防止
- ヘイトスピーチ防止
- 性的な内容の防止
- 危険な内容の防止

## 📦 他のプロジェクトでの使用

### 1. フォルダをコピー

```bash
cp -r gemini-integration /path/to/your/project/
```

### 2. 依存関係をインストール

```bash
cd /path/to/your/project/gemini-integration
npm install
```

### 3. APIキーを設定

```bash
npm run setup
```

### 4. 使用開始

```bash
# テスト
npm test

# チャット開始
npm run chat
```

## 🤝 プロジェクトへの統合例

### Node.jsプロジェクト

```javascript
// your-project/app.js
import { geminiClient } from './gemini-integration/src/gemini-client.js';

async function main() {
  await geminiClient.initialize();
  const result = await geminiClient.sendMessage('Hello, Gemini!');
  console.log(result.response);
}

main();
```

### Webアプリケーション

```javascript
// your-project/server.js
import express from 'express';
import { geminiClient } from './gemini-integration/src/gemini-client.js';

const app = express();
await geminiClient.initialize();

app.post('/api/chat', async (req, res) => {
  const result = await geminiClient.sendMessage(req.body.message);
  res.json(result);
});
```

## 📈 統計情報

### セッション統計

```javascript
import { conversationLogger } from './utils/conversation-logger.js';

const stats = conversationLogger.getSessionStats();
console.log(`総セッション数: ${stats.totalSessions}`);
console.log(`総メッセージ数: ${stats.totalMessages}`);
console.log(`総トークン数: ${stats.totalTokens}`);
```

### 履歴取得

```javascript
const recentConversations = conversationLogger.getRecentConversations(10);
recentConversations.forEach(conv => {
  console.log(`${conv.filename} - ${conv.lastModified}`);
});
```

## 📝 ライセンス

MIT License

## 🆘 サポート

問題が発生した場合：

1. [トラブルシューティング](#-トラブルシューティング)を確認
2. `npm test`でテストを実行
3. `DEBUG=true`でデバッグモードを有効化
4. ログファイルを確認

---

**🚀 GeminiAPIを使った開発を加速させましょう！**