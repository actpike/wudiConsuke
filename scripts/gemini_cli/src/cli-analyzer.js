#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { geminiCLI } from './cli-wrapper.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GeminiCLI分析ツール
 */
class CLIAnalyzer {
  constructor() {
    this.outputDir = path.join(__dirname, '../output');
    this.ensureOutputDir();
  }

  /**
   * 出力ディレクトリの確保
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * ファイル分析
   */
  async analyzeFile(filePath, options = {}) {
    const prompt = options.prompt || 'このファイルの構造、機能、問題点、改善案を詳細に分析してください。';
    
    try {
      console.log(`🔍 ファイル分析開始: ${filePath}`);
      
      const result = await geminiCLI.analyzeFile(filePath, prompt);
      
      const analysis = {
        filePath: path.resolve(filePath),
        prompt: prompt,
        analysis: result.response,
        responseTime: result.responseTime,
        timestamp: result.timestamp,
        success: result.success
      };

      // 結果を保存
      await this.saveAnalysis(analysis, 'file');
      
      console.log(`✅ ファイル分析完了 (${result.responseTime}ms)`);
      console.log(`📁 結果保存先: ${this.getAnalysisPath(analysis, 'file')}`);
      
      return analysis;

    } catch (error) {
      console.error(`❌ ファイル分析エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * プロジェクト分析
   */
  async analyzeProject(projectPath = '.', options = {}) {
    const prompt = options.prompt || `
このプロジェクトを包括的に分析してください。以下の観点から詳細に分析してください：

1. **プロジェクト構造**: フォルダ構成、ファイル組織
2. **技術スタック**: 使用している言語、フレームワーク、ライブラリ
3. **アーキテクチャ**: 設計パターン、コンポーネント構成
4. **コード品質**: 可読性、保守性、一貫性
5. **セキュリティ**: 潜在的なセキュリティ問題
6. **パフォーマンス**: 最適化の余地
7. **依存関係**: 外部ライブラリの管理状況
8. **テスト**: テストカバレッジ、テスト戦略
9. **ドキュメント**: README、コメント、API文書
10. **改善提案**: 具体的な改善アクション

各項目について具体例を挙げて説明してください。
`;

    try {
      console.log(`🔍 プロジェクト分析開始: ${projectPath}`);
      
      const result = await geminiCLI.analyzeProject(projectPath, prompt);
      
      const analysis = {
        projectPath: path.resolve(projectPath),
        prompt: prompt,
        analysis: result.response,
        responseTime: result.responseTime,
        timestamp: result.timestamp,
        success: result.success
      };

      // 結果を保存
      await this.saveAnalysis(analysis, 'project');
      
      console.log(`✅ プロジェクト分析完了 (${result.responseTime}ms)`);
      console.log(`📁 結果保存先: ${this.getAnalysisPath(analysis, 'project')}`);
      
      return analysis;

    } catch (error) {
      console.error(`❌ プロジェクト分析エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * コード比較分析
   */
  async compareFiles(file1, file2, options = {}) {
    const prompt = options.prompt || `
以下の2つのファイルを比較分析してください：

1. **構造の違い**: クラス、関数、モジュール構成の違い
2. **機能の違い**: 実装されている機能の差異
3. **品質の違い**: コード品質、エラーハンドリングの差
4. **パフォーマンス**: 実行効率の違い
5. **保守性**: 拡張性、可読性の比較
6. **推奨事項**: どちらのアプローチが良いか、統合案

具体的なコード例を示して説明してください。
`;

    try {
      console.log(`🔍 ファイル比較分析開始: ${file1} vs ${file2}`);
      
      const fullPrompt = `@${file1} @${file2} ${prompt}`;
      const result = await geminiCLI.executeCommand(fullPrompt);
      
      const analysis = {
        file1: path.resolve(file1),
        file2: path.resolve(file2),
        prompt: prompt,
        analysis: result.response,
        responseTime: result.responseTime,
        timestamp: result.timestamp,
        success: result.success
      };

      // 結果を保存
      await this.saveAnalysis(analysis, 'comparison');
      
      console.log(`✅ ファイル比較分析完了 (${result.responseTime}ms)`);
      console.log(`📁 結果保存先: ${this.getAnalysisPath(analysis, 'comparison')}`);
      
      return analysis;

    } catch (error) {
      console.error(`❌ ファイル比較分析エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * コードレビュー
   */
  async reviewCode(filePath, options = {}) {
    const prompt = options.prompt || `
このコードを詳細にレビューしてください：

**良い点**:
- 優れた設計パターンの使用
- 可読性の高いコード
- 適切なエラーハンドリング

**改善点**:
- パフォーマンス最適化の余地
- セキュリティの懸念事項
- 保守性向上のための提案

**具体的な修正提案**:
- コード例を示した改善案
- リファクタリング案
- 追加すべき機能

レビューは建設的で実用的な内容にしてください。
`;

    try {
      console.log(`🔍 コードレビュー開始: ${filePath}`);
      
      const result = await geminiCLI.analyzeFile(filePath, prompt);
      
      const review = {
        filePath: path.resolve(filePath),
        prompt: prompt,
        review: result.response,
        responseTime: result.responseTime,
        timestamp: result.timestamp,
        success: result.success
      };

      // 結果を保存
      await this.saveAnalysis(review, 'review');
      
      console.log(`✅ コードレビュー完了 (${result.responseTime}ms)`);
      console.log(`📁 結果保存先: ${this.getAnalysisPath(review, 'review')}`);
      
      return review;

    } catch (error) {
      console.error(`❌ コードレビューエラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分析結果の保存
   */
  async saveAnalysis(analysis, type) {
    const filename = this.getAnalysisPath(analysis, type);
    const content = this.formatAnalysisOutput(analysis, type);
    
    fs.writeFileSync(filename, content);
    return filename;
  }

  /**
   * 分析結果パスの生成
   */
  getAnalysisPath(analysis, type) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${type}_analysis_${timestamp}.md`;
    return path.join(this.outputDir, filename);
  }

  /**
   * 分析結果のフォーマット
   */
  formatAnalysisOutput(analysis, type) {
    const typeNames = {
      file: 'ファイル分析',
      project: 'プロジェクト分析',
      comparison: 'ファイル比較分析',
      review: 'コードレビュー'
    };

    let content = `# ${typeNames[type]} 結果

**実行日時**: ${new Date(analysis.timestamp).toLocaleString('ja-JP')}  
**レスポンス時間**: ${analysis.responseTime}ms  
**ステータス**: ${analysis.success ? '成功' : '失敗'}  

`;

    if (analysis.filePath) {
      content += `**分析対象ファイル**: ${analysis.filePath}  \n`;
    }
    if (analysis.projectPath) {
      content += `**分析対象プロジェクト**: ${analysis.projectPath}  \n`;
    }
    if (analysis.file1 && analysis.file2) {
      content += `**比較ファイル1**: ${analysis.file1}  \n`;
      content += `**比較ファイル2**: ${analysis.file2}  \n`;
    }

    content += `
---

## プロンプト

\`\`\`
${analysis.prompt}
\`\`\`

---

## 分析結果

${analysis.analysis || analysis.review}

---

*Generated by GeminiCLI Integration*
`;

    return content;
  }
}

/**
 * コマンドライン引数の処理
 */
async function main() {
  const analyzer = new CLIAnalyzer();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔍 GeminiCLI分析ツール

使用方法:
  node cli-analyzer.js file <ファイルパス>           # ファイル分析
  node cli-analyzer.js project [プロジェクトパス]     # プロジェクト分析
  node cli-analyzer.js compare <ファイル1> <ファイル2> # ファイル比較
  node cli-analyzer.js review <ファイルパス>          # コードレビュー

例:
  node cli-analyzer.js file ./src/app.js
  node cli-analyzer.js project ./my-project
  node cli-analyzer.js compare ./old.js ./new.js
  node cli-analyzer.js review ./src/component.tsx
`);
    return;
  }

  const command = args[0];

  try {
    // GeminiCLI利用可能性チェック
    const availability = await geminiCLI.checkAvailability();
    if (!availability.available) {
      console.error(availability.error);
      process.exit(1);
    }

    switch (command) {
      case 'file':
        if (args.length < 2) {
          console.error('❌ ファイルパスが必要です');
          process.exit(1);
        }
        await analyzer.analyzeFile(args[1]);
        break;

      case 'project':
        const projectPath = args[1] || '.';
        await analyzer.analyzeProject(projectPath);
        break;

      case 'compare':
        if (args.length < 3) {
          console.error('❌ 2つのファイルパスが必要です');
          process.exit(1);
        }
        await analyzer.compareFiles(args[1], args[2]);
        break;

      case 'review':
        if (args.length < 2) {
          console.error('❌ ファイルパスが必要です');
          process.exit(1);
        }
        await analyzer.reviewCode(args[1]);
        break;

      default:
        console.error(`❌ 不明なコマンド: ${command}`);
        process.exit(1);
    }

  } catch (error) {
    console.error(`❌ 実行エラー: ${error.message}`);
    process.exit(1);
  }
}

// コマンドライン実行時
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CLIAnalyzer };