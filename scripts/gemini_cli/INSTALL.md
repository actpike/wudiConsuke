# 🚀 別プロジェクトでの使用方法

## 📋 クイックスタート

### 1. フォルダをコピー
```bash
# このgemini_cliフォルダを別プロジェクトにコピー
cp -r gemini_cli /path/to/your-project/
cd /path/to/your-project/gemini_cli
```

### 2. ワンコマンドセットアップ
```bash
npm run quick-start
```

これで以下が自動実行されます：
- 設定ファイルのコピー
- GeminiCLIのインストール確認
- テスト実行

### 3. プロジェクト名の設定
```bash
# config/cli-config.jsonを編集
{
  "projectName": "your-project-name",
  "geminiModel": "gemini-2.5-flash"
}
```

## 🔧 手動セットアップ

### ステップ1: 設定ファイルの作成
```bash
cp config/cli-config.example.json config/cli-config.json
```

### ステップ2: GeminiCLIのインストール
```bash
npm run install-cli
# または手動で
npm install -g https://github.com/google-gemini/gemini-cli
```

### ステップ3: 認証設定
```bash
gemini
# ブラウザで認証を完了
```

### ステップ4: テスト実行
```bash
npm test
```

## 📁 使用例

### ファイル分析
```bash
# あなたのプロジェクトのファイルを分析
node src/cli-analyzer.js file ../src/main.js
node src/cli-analyzer.js file ../components/Button.tsx
```

### プロジェクト分析
```bash
# プロジェクト全体を分析
node src/cli-analyzer.js project ..
node src/cli-analyzer.js project ../frontend
```

### コードレビュー
```bash
# 特定ファイルのレビュー
node src/cli-analyzer.js review ../src/api.js
```

### ファイル比較
```bash
# 2つのファイルを比較
node src/cli-analyzer.js compare ../old-version.js ../new-version.js
```

## ⚙️ 設定カスタマイズ

### config/cli-config.json
```json
{
  "geminiModel": "gemini-2.5-flash",
  "projectName": "my-awesome-project",
  "defaultPath": "..",
  "maxFileSize": 2048000,
  "timeout": 120000,
  "debug": true
}
```

## 📊 出力について

- 分析結果は`output/`フォルダにMarkdown形式で保存
- ファイル名には実行日時が含まれ、重複しません
- プロジェクト固有の分析結果として保存されます

## 🔄 複数プロジェクトでの管理

### 方法1: 各プロジェクトにコピー
```bash
# プロジェクトAで使用
/project-a/gemini_cli/

# プロジェクトBで使用  
/project-b/gemini_cli/
```

### 方法2: 共通フォルダから使用
```bash
# 共通ツールとして配置
/tools/gemini_cli/

# 各プロジェクトから呼び出し
cd /project-a && /tools/gemini_cli/src/cli-analyzer.js file src/main.js
cd /project-b && /tools/gemini_cli/src/cli-analyzer.js project .
```

## 🐛 トラブルシューティング

### よくある問題と解決策

1. **Permission denied**
   ```bash
   chmod +x src/cli-analyzer.js
   ```

2. **GeminiCLI not found**
   ```bash
   npm run install-cli
   ```

3. **Authentication error**
   ```bash
   gemini
   # ブラウザで再認証
   ```

4. **Config file not found**
   ```bash
   npm run copy-config
   ```

---

**これで任意のプロジェクトでGeminiCLI統合を使用できます！**