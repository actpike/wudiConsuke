# 🤖 GeminiCLI統合

GeminiCLIを使用したコード分析とプロジェクト分析機能

## 📋 概要

この統合モジュールは、GoogleのGeminiCLIを使用して以下の機能を提供します：

- **📁 ファイル分析**: 個別ファイルの詳細分析
- **📊 プロジェクト分析**: プロジェクト全体の包括的分析
- **🔍 コードレビュー**: 品質とセキュリティの評価
- **⚖️ ファイル比較**: 2つのファイルの比較分析
- **🛡️ エラーハンドリング**: 堅牢なエラー処理

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- インターネット接続

### 新規インストール

```bash
# 1. ワンコマンドセットアップ（推奨）
npm run quick-start

# 2. 手動セットアップ
npm run copy-config
node setup.js
npm test
```

### 別プロジェクトでの使用

詳細は **[INSTALL.md](./INSTALL.md)** を参照してください。

```bash
# フォルダをコピーして即座に使用可能
cp -r gemini_cli /path/to/your-project/
cd /path/to/your-project/gemini_cli
npm run quick-start
```

### 手動インストール

```bash
# GeminiCLIのインストール
npm install -g https://github.com/google-gemini/gemini-cli

# 認証設定（コマンドラインで）
gemini
```

## 🛠️ 使用方法

### コマンドライン使用

```bash
# ファイル分析
node src/cli-analyzer.js file ./src/app.js

# プロジェクト分析
node src/cli-analyzer.js project ./my-project

# コードレビュー
node src/cli-analyzer.js review ./src/component.tsx

# ファイル比較
node src/cli-analyzer.js compare ./old.js ./new.js
```

### プログラムから使用

```javascript
import { geminiCLI } from './src/cli-wrapper.js';
import { CLIAnalyzer } from './src/cli-analyzer.js';

// 基本的な使用
const result = await geminiCLI.analyzeFile('./src/app.js');
console.log(result.response);

// 詳細分析
const analyzer = new CLIAnalyzer();
const analysis = await analyzer.analyzeFile('./src/app.js');
console.log(analysis.analysis);
```

## 📁 フォルダ構造

```
gemini_cli/
├── config/
│   ├── cli-config.json         # 設定ファイル
│   └── cli-config.example.json # 設定テンプレート
├── src/
│   ├── cli-wrapper.js          # GeminiCLIラッパー
│   └── cli-analyzer.js         # 分析ツール
├── test/
│   ├── test-gemini-cli.js      # テストスクリプト
│   └── test-files/             # テスト用ファイル
├── output/                     # 分析結果出力先
├── package.json
├── setup.js                    # セットアップスクリプト
└── README.md
```

## ⚙️ 設定

### 基本設定 (config/cli-config.json)

```json
{
  "defaultPath": ".",
  "maxFileSize": 1024000,
  "excludePatterns": ["node_modules", "dist", ".git"],
  "timeout": 60000,
  "retryCount": 3,
  "debug": false
}
```

### 設定項目

| 項目 | 説明 | デフォルト値 |
|------|------|-------------|
| `defaultPath` | デフォルト分析パス | `"."` |
| `maxFileSize` | 最大ファイルサイズ (bytes) | `1024000` |
| `excludePatterns` | 除外パターン | `["node_modules", "dist", ".git"]` |
| `timeout` | タイムアウト時間 (ms) | `180000` |
| `retryCount` | リトライ回数 | `3` |
| `debug` | デバッグモード | `false` |

## 🔧 API リファレンス

### GeminiCLIWrapper

#### `checkAvailability()`
GeminiCLIの利用可能性をチェック

```javascript
const availability = await geminiCLI.checkAvailability();
console.log(availability.available); // true/false
```

#### `executeCommand(prompt, options)`
単一コマンドの実行

```javascript
const result = await geminiCLI.executeCommand('コードを分析して');
console.log(result.response);
```

#### `analyzeFile(filePath, prompt)`
ファイル分析

```javascript
const result = await geminiCLI.analyzeFile('./app.js', 'このファイルを分析して');
console.log(result.response);
```

#### `analyzeProject(projectPath, prompt)`
プロジェクト分析

```javascript
const result = await geminiCLI.analyzeProject('.', 'プロジェクトを分析して');
console.log(result.response);
```

### CLIAnalyzer

#### `analyzeFile(filePath, options)`
詳細ファイル分析（結果を保存）

```javascript
const analyzer = new CLIAnalyzer();
const analysis = await analyzer.analyzeFile('./app.js');
console.log(analysis.analysis);
```

#### `analyzeProject(projectPath, options)`
詳細プロジェクト分析（結果を保存）

```javascript
const analysis = await analyzer.analyzeProject('./my-project');
console.log(analysis.analysis);
```

#### `reviewCode(filePath, options)`
コードレビュー

```javascript
const review = await analyzer.reviewCode('./app.js');
console.log(review.review);
```

#### `compareFiles(file1, file2, options)`
ファイル比較

```javascript
const comparison = await analyzer.compareFiles('./old.js', './new.js');
console.log(comparison.analysis);
```

## 📊 出力形式

分析結果は`output/`フォルダにMarkdown形式で保存されます：

```markdown
# ファイル分析 結果

**実行日時**: 2025/7/16 1:00:00  
**レスポンス時間**: 1234ms  
**ステータス**: 成功  
**分析対象ファイル**: /path/to/file.js  

---

## 分析結果

[GeminiCLIからの詳細な分析結果...]
```

## 🧪 テスト

### 自動テスト実行

```bash
node test/test-gemini-cli.js
```

### テスト項目

1. **GeminiCLI利用可能性チェック** - インストール確認
2. **基本コマンド実行テスト** - コマンド実行
3. **ファイル分析テスト** - ファイル分析機能
4. **プロジェクト分析テスト** - プロジェクト分析機能
5. **CLIAnalyzer統合テスト** - 分析ツール統合
6. **エラーハンドリングテスト** - エラー処理

## 🔍 使用例

### 1. TypeScriptプロジェクトの分析

```bash
node src/cli-analyzer.js project ./my-typescript-project
```

### 2. Reactコンポーネントのレビュー

```bash
node src/cli-analyzer.js review ./src/components/Button.tsx
```

### 3. API実装の比較

```bash
node src/cli-analyzer.js compare ./api-v1.js ./api-v2.js
```

### 4. セキュリティチェック

```javascript
const analyzer = new CLIAnalyzer();
const review = await analyzer.reviewCode('./src/auth.js', {
  prompt: 'セキュリティの観点からこのコードを詳細にレビューしてください'
});
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. GeminiCLIが見つからない

```
Error: GeminiCLIが見つかりません
```

**解決方法**:
```bash
npm install -g https://github.com/google-gemini/gemini-cli
```

#### 2. 認証エラー

```
Error: Authentication failed
```

**解決方法**:
```bash
# 手動認証
gemini
# ブラウザで認証を完了
```

#### 3. タイムアウトエラー

```
Error: コマンドがタイムアウトしました
```

**解決方法**:
- `config/cli-config.json`の`timeout`を増加（デフォルト: 180秒）
- ファイルサイズを確認（`maxFileSize`以下に）

### デバッグモード

```javascript
// 設定でデバッグモードを有効化
{
  "debug": true
}
```

## 🔒 セキュリティ

### セキュリティ考慮事項

- **ファイルサイズ制限**: 大きなファイルの処理を制限
- **除外パターン**: 機密ファイルを除外設定
- **タイムアウト**: 長時間実行の防止
- **エラーハンドリング**: 例外処理による安全性確保

### 推奨設定

```json
{
  "maxFileSize": 512000,
  "excludePatterns": [
    "node_modules", ".env", "*.key", "*.pem", 
    ".git", "dist", "coverage", "*.log"
  ],
  "timeout": 180000
}
```

## 📈 パフォーマンス

### 最適化のヒント

1. **ファイルサイズ制限**: 大きなファイルは分割して分析
2. **除外パターン**: 不要なファイルを除外
3. **並列処理**: 複数ファイルの並列分析
4. **キャッシュ**: 分析結果の再利用

### ベンチマーク目安

- **小さなファイル** (< 10KB): 5-15秒
- **中程度のファイル** (10-100KB): 15-45秒
- **プロジェクト分析**: 30-120秒

## 🔄 推奨開発フロー

### 基本開発サイクル

```bash
1. SOW作成 → 2. 改修 → 3. テスト → 4. Geminiレビュー → 5. 改修対応（必要時）
```

### 1. SOW作成
```bash
# SOW作成（documents/SOW/backlog/に配置）
# - 明確な要件定義
# - 具体的な作業項目
# - 完了条件の明記
```

### 2. 改修・実装
```bash
# 通常の開発作業
# - コード実装
# - 既存機能のテスト確認
# - 基本的な動作検証
```

### 3. テスト
```bash
# Chrome拡張機能の場合
# - chrome://extensions/ での拡張機能リロード
# - 基本機能の手動テスト
# - ポップアップ・オプション画面の動作確認
```

### 4. Geminiレビュー
```bash
# 軽量個別分析（推奨）
node src/cli-analyzer.js file ./path/to/modified-file.js

# プロジェクト全体分析（時間がかかる）
node src/cli-analyzer.js project ./project-path

# マルチ観点レビュー（並列実行・高負荷）
node multi-review.js ./project-path chrome_extension
```

### 5. 改修対応
```bash
# Geminiレビュー結果の確認
ls -la output/

# 指摘事項への対応
# - セキュリティ・パフォーマンス問題（高優先度）
# - コード品質改善（中優先度）
# - アーキテクチャ最適化（低優先度）
```

### 📊 マルチ観点レビュー（実験的機能）

複数の観点から並列でレビューを実行する高度な機能：

```bash
# Chrome拡張機能用テンプレート
node multi-review.js ./project chrome_extension

# 観点別実行
node multi-review.js ./project chrome_extension architecture,security
```

**利用可能テンプレート:**
- `chrome_extension`: architecture, code_quality, security, performance, maintenance
- `webapp`: architecture, code_quality, security  
- `general`: comprehensive, quick_review

**注意事項:**
- 並列実行により高負荷（CPU・ネットワーク）
- レビュー時間: 5-15分（観点数により変動）
- タイムアウト制限: 180秒/観点（コード量考慮）

### 🎯 効率化のヒント

1. **段階的レビュー**: 個別ファイル → プロジェクト全体
2. **問題特化**: セキュリティやパフォーマンスなど特定観点に絞る
3. **軽量優先**: quick_reviewで概要把握後、詳細分析
4. **結果活用**: output/フォルダの分析結果を改修に活用

---

**🚀 GeminiCLIでコード分析を効率化しましょう！**