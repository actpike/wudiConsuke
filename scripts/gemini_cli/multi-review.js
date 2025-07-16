#!/usr/bin/env node

/**
 * マルチ観点Geminiレビュー自動化スクリプト
 * 複数の観点から段階的にレビューを実行し、結果を統合
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiReviewer {
  constructor() {
    this.templatesPath = path.join(__dirname, 'templates/review-templates.json');
    this.outputDir = path.join(__dirname, 'output');
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    try {
      const content = fs.readFileSync(this.templatesPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ テンプレート読み込みエラー:', error.message);
      return {};
    }
  }

  async executeReview(projectPath, templateType, aspects = null) {
    const templates = this.templates[templateType];
    if (!templates) {
      throw new Error(`テンプレートタイプ "${templateType}" が見つかりません`);
    }

    const aspectsToReview = aspects || Object.keys(templates);
    const results = {};

    console.log(`🔍 ${templateType} レビュー開始: ${aspectsToReview.length}観点`);

    // 並列実行用のPromise配列を作成
    const reviewPromises = aspectsToReview.map(async (aspect) => {
      const prompt = templates[aspect];
      if (!prompt) {
        console.warn(`⚠️ 観点 "${aspect}" のテンプレートが見つかりません`);
        return { aspect, result: null };
      }

      console.log(`📋 ${aspect} 分析開始...`);
      
      try {
        const result = await this.runGeminiAnalysis(projectPath, prompt);
        console.log(`✅ ${aspect} 完了`);
        return {
          aspect,
          result: {
            prompt,
            result: result.stdout,
            timestamp: new Date().toISOString(),
            success: true
          }
        };
      } catch (error) {
        console.error(`❌ ${aspect} エラー:`, error.message);
        return {
          aspect,
          result: {
            prompt,
            error: error.message,
            timestamp: new Date().toISOString(),
            success: false
          }
        };
      }
    });

    // 全ての分析を並列実行
    console.log(`🚀 ${aspectsToReview.length}観点を並列実行中...`);
    const reviewResults = await Promise.allSettled(reviewPromises);
    
    // 結果をresultsオブジェクトにまとめる
    reviewResults.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled' && promiseResult.value.result) {
        results[promiseResult.value.aspect] = promiseResult.value.result;
      } else {
        const aspect = aspectsToReview[index];
        results[aspect] = {
          error: `Promise実行エラー: ${promiseResult.reason?.message || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          success: false
        };
      }
    });

    // 統合レポート生成
    const reportPath = await this.generateIntegratedReport(results, templateType, projectPath);
    console.log(`\n🎉 マルチレビュー完了!`);
    console.log(`📄 統合レポート: ${reportPath}`);

    return results;
  }

  runGeminiAnalysis(projectPath, prompt) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [
        path.join(__dirname, 'src/cli-analyzer.js'),
        'project',
        projectPath
      ], {
        env: { ...process.env, GEMINI_PROMPT: prompt }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`プロセス終了コード: ${code}\n${stderr}`));
        }
      });
    });
  }

  async generateIntegratedReport(results, templateType, projectPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.outputDir, `multi_review_${templateType}_${timestamp}.md`);

    let report = `# 🔍 マルチ観点レビューレポート\n\n`;
    report += `**プロジェクト**: ${projectPath}\n`;
    report += `**テンプレート**: ${templateType}\n`;
    report += `**実行日時**: ${new Date().toLocaleString('ja-JP')}\n`;
    report += `**観点数**: ${Object.keys(results).length}\n\n`;

    // サマリー
    const successCount = Object.values(results).filter(r => r.success).length;
    const failureCount = Object.values(results).filter(r => !r.success).length;
    
    report += `## 📊 実行サマリー\n\n`;
    report += `- ✅ 成功: ${successCount}観点\n`;
    report += `- ❌ 失敗: ${failureCount}観点\n\n`;

    // 各観点の結果
    for (const [aspect, data] of Object.entries(results)) {
      report += `## 📋 ${aspect.toUpperCase()} 分析\n\n`;
      
      if (data.success) {
        report += `**ステータス**: ✅ 成功\n\n`;
        report += `### プロンプト\n\n`;
        report += `\`\`\`\n${data.prompt}\n\`\`\`\n\n`;
        report += `### 分析結果\n\n`;
        report += `${data.result}\n\n`;
      } else {
        report += `**ステータス**: ❌ 失敗\n\n`;
        report += `**エラー**: ${data.error}\n\n`;
      }
      
      report += `---\n\n`;
    }

    // 統合的な改善提案
    report += `## 🎯 統合改善提案\n\n`;
    report += `複数観点の分析結果を統合し、優先度の高い改善項目:\n\n`;
    report += `1. **高優先度**: セキュリティ・パフォーマンス関連の指摘事項\n`;
    report += `2. **中優先度**: コード品質・保守性の改善\n`;
    report += `3. **低優先度**: アーキテクチャ・設計の最適化\n\n`;

    fs.writeFileSync(reportPath, report, 'utf8');
    return reportPath;
  }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
使用方法:
  node multi-review.js <プロジェクトパス> <テンプレートタイプ> [観点1,観点2,...]

例:
  node multi-review.js ./my-project chrome_extension
  node multi-review.js ./my-project chrome_extension architecture,security
  node multi-review.js ./my-project general comprehensive

利用可能なテンプレート:
  - chrome_extension: Chrome拡張機能専用
  - webapp: Webアプリケーション用
  - general: 汎用
`);
    process.exit(1);
  }

  const [projectPath, templateType, aspectsArg] = args;
  const aspects = aspectsArg ? aspectsArg.split(',') : null;

  const reviewer = new MultiReviewer();
  reviewer.executeReview(projectPath, templateType, aspects)
    .then(() => {
      console.log('\n🎉 全ての観点のレビューが完了しました!');
    })
    .catch((error) => {
      console.error('❌ レビュー実行エラー:', error.message);
      process.exit(1);
    });
}

export { MultiReviewer };