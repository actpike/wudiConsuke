# 📦 インストールガイド

## 🚀 簡単インストール

他のプロジェクトでGeminiAPI統合を使用する場合の手順です。

### 1. フォルダをコピー

```bash
# このフォルダを任意のプロジェクトにコピー
cp -r gemini-integration /path/to/your/project/
```

### 2. 依存関係をインストール

```bash
cd /path/to/your/project/gemini-integration
npm install
```

### 3. APIキーを設定

```bash
# 対話形式でAPIキーを設定
npm run setup
```

### 4. 接続テスト

```bash
# 接続テストを実行
npm test
```

### 5. 使用開始

```bash
# 対話型チャットを開始
npm run chat
```

## ✅ 動作確認

すべて正常に動作している場合：

```bash
npm test
```

実行結果:
```
🚀 GeminiAPI接続テストを開始します
✅ 初期化テスト 成功
✅ 基本接続テスト 成功
✅ 単一メッセージテスト 成功
✅ チャットセッションテスト 成功
✅ モデル情報取得テスト 成功
✅ 日本語対応テスト 成功
🎊 すべてのテストが成功しました！
```

## 📁 コピー後のファイル構造

```
your-project/
├── gemini-integration/        # コピーしたフォルダ
│   ├── config/
│   ├── src/
│   ├── test/
│   ├── utils/
│   ├── package.json
│   ├── setup.js
│   └── .env                   # セットアップで作成
├── your-app-files...
└── ...
```

## 🔧 プロジェクトへの統合

### Node.jsプロジェクトの場合

```javascript
// your-project/app.js
import { geminiClient } from './gemini-integration/src/gemini-client.js';

async function main() {
  await geminiClient.initialize();
  const result = await geminiClient.sendMessage('Hello!');
  console.log(result.response);
}

main();
```

### Expressアプリケーションの場合

```javascript
// your-project/server.js
import express from 'express';
import { geminiClient } from './gemini-integration/src/gemini-client.js';

const app = express();
app.use(express.json());

// 初期化
await geminiClient.initialize();

app.post('/api/chat', async (req, res) => {
  const result = await geminiClient.sendMessage(req.body.message);
  res.json(result);
});

app.listen(3000);
```

## 🛠️ 設定のカスタマイズ

### 環境変数の変更

```bash
# .envファイルを直接編集
nano gemini-integration/.env
```

### よく使用される設定

```bash
# .env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=4000
DEBUG=false
```

## 📝 ログの確認

セットアップ完了後、以下の場所にログが記録されます：

```
gemini-integration/logs/
├── conversations/    # 会話ログ
├── sessions/        # セッション情報
└── errors/          # エラーログ
```

## 🔍 トラブルシューティング

### 問題1: npm installが失敗する

**解決方法:**
```bash
# Node.jsのバージョンを確認（18以上推奨）
node --version

# npm キャッシュをクリア
npm cache clean --force

# 再インストール
npm install
```

### 問題2: APIキーエラー

**解決方法:**
```bash
# セットアップを再実行
npm run setup

# .envファイルを直接確認
cat .env
```

### 問題3: 接続テストが失敗する

**解決方法:**
```bash
# デバッグモードでテスト実行
DEBUG=true npm test

# インターネット接続を確認
ping google.com
```

## 📞 サポート

問題が解決しない場合：

1. `DEBUG=true npm test` でデバッグ実行
2. `logs/errors/` フォルダのエラーログを確認
3. README.mdの詳細なトラブルシューティング参照

---

**🎉 インストール完了！GeminiAPIを活用した開発を始めましょう！**