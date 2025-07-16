#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { geminiCLI } from '../src/cli-wrapper.js';
import { CLIAnalyzer } from '../src/cli-analyzer.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GeminiCLI統合テストスクリプト
 */
class GeminiCLITest {
  constructor() {
    this.testResults = [];
    this.testDir = path.join(__dirname, 'test-files');
    this.ensureTestFiles();
  }

  /**
   * テストファイルの準備
   */
  ensureTestFiles() {
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }

    // サンプルJavaScriptファイル
    const sampleJS = `
// サンプルJavaScriptファイル
function calculateSum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('引数は数値である必要があります');
  }
  return a + b;
}

class Calculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    const result = calculateSum(a, b);
    this.history.push({ operation: 'add', a, b, result });
    return result;
  }

  getHistory() {
    return this.history;
  }
}

export { Calculator, calculateSum };
`;

    const sampleJSPath = path.join(this.testDir, 'sample.js');
    if (!fs.existsSync(sampleJSPath)) {
      fs.writeFileSync(sampleJSPath, sampleJS);
    }

    // サンプルpackage.json
    const samplePackage = {
      name: "test-project",
      version: "1.0.0",
      description: "GeminiCLI統合テスト用プロジェクト",
      main: "sample.js",
      scripts: {
        test: "echo 'テスト実行'"
      },
      dependencies: {
        lodash: "^4.17.21"
      }
    };

    const packagePath = path.join(this.testDir, 'package.json');
    if (!fs.existsSync(packagePath)) {
      fs.writeFileSync(packagePath, JSON.stringify(samplePackage, null, 2));
    }
  }

  /**
   * テスト実行
   */
  async runTest(testName, testFunction) {
    console.log(`🧪 ${testName}を実行中...`);
    
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.testResults.push({
        name: testName,
        success: true,
        duration: duration,
        result: result
      });

      console.log(`✅ ${testName} 成功 (${duration}ms)`);
      return result;

    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        error: error.message
      });

      console.log(`❌ ${testName} 失敗: ${error.message}`);
      throw error;
    }
  }

  /**
   * 全テストの実行
   */
  async runAllTests() {
    console.log('🚀 GeminiCLI統合テストを開始します\n');

    try {
      // 1. 利用可能性チェック
      await this.runTest('GeminiCLI利用可能性チェック', async () => {
        const availability = await geminiCLI.checkAvailability();
        if (!availability.available) {
          throw new Error(availability.error);
        }
        return `バージョン: ${availability.version}`;
      });

      // 2. 基本コマンド実行テスト
      await this.runTest('基本コマンド実行テスト', async () => {
        const result = await geminiCLI.executeCommand('こんにちは、簡単に自己紹介してください');
        if (!result.success) {
          throw new Error('コマンド実行に失敗しました');
        }
        return `レスポンス: ${result.response.substring(0, 100)}...`;
      });

      // 3. ファイル分析テスト
      await this.runTest('ファイル分析テスト', async () => {
        const sampleFile = path.join(this.testDir, 'sample.js');
        const result = await geminiCLI.analyzeFile(sampleFile, 'このJavaScriptファイルの構造を分析してください');
        if (!result.success) {
          throw new Error('ファイル分析に失敗しました');
        }
        return `分析結果: ${result.response.substring(0, 100)}...`;
      });

      // 4. プロジェクト分析テスト
      await this.runTest('プロジェクト分析テスト', async () => {
        const result = await geminiCLI.analyzeProject(this.testDir, 'このテストプロジェクトの構造を分析してください');
        if (!result.success) {
          throw new Error('プロジェクト分析に失敗しました');
        }
        return `分析結果: ${result.response.substring(0, 100)}...`;
      });

      // 5. CLIAnalyzer統合テスト
      await this.runTest('CLIAnalyzer統合テスト', async () => {
        const analyzer = new CLIAnalyzer();
        const sampleFile = path.join(this.testDir, 'sample.js');
        const analysis = await analyzer.analyzeFile(sampleFile, { 
          prompt: 'このファイルの品質を評価してください' 
        });
        if (!analysis.success) {
          throw new Error('CLIAnalyzer統合に失敗しました');
        }
        return `分析保存完了: ${analysis.analysis.substring(0, 100)}...`;
      });

      // 6. エラーハンドリングテスト
      await this.runTest('エラーハンドリングテスト', async () => {
        try {
          await geminiCLI.analyzeFile('存在しないファイル.js');
          throw new Error('エラーが発生すべきでした');
        } catch (error) {
          if (error.message.includes('ファイルが見つかりません')) {
            return 'エラーハンドリング正常';
          }
          throw error;
        }
      });

      console.log('\n🎉 全テストが完了しました！');
      this.displayResults();

    } catch (error) {
      console.log('\n❌ テストでエラーが発生しました');
      this.displayResults();
      process.exit(1);
    }
  }

  /**
   * テスト結果の表示
   */
  displayResults() {
    console.log('\n📊 テスト結果:');
    console.log('─'.repeat(60));

    const successCount = this.testResults.filter(t => t.success).length;
    const totalCount = this.testResults.length;

    this.testResults.forEach((test) => {
      const status = test.success ? '✅' : '❌';
      const duration = test.duration ? `(${test.duration}ms)` : '';
      const result = test.result || test.error || '';
      
      console.log(`${status} ${test.name} ${duration}`);
      if (result) {
        console.log(`   ${result}`);
      }
    });

    console.log('─'.repeat(60));
    console.log(`結果: ${successCount}/${totalCount} テスト成功`);

    if (successCount === totalCount) {
      console.log('🎊 すべてのテストが成功しました！');
      console.log('\n🚀 使用方法:');
      console.log('1. node src/cli-analyzer.js file <ファイルパス>');
      console.log('2. node src/cli-analyzer.js project [プロジェクトパス]');
      console.log('3. node src/cli-analyzer.js review <ファイルパス>');
    } else {
      console.log('⚠️  一部のテストが失敗しました。');
      console.log('\n🔧 解決方法:');
      console.log('1. GeminiCLIがインストールされているか確認してください');
      console.log('2. Gemini認証設定を確認してください');
      console.log('3. インターネット接続を確認してください');
    }
  }
}

// テストを実行
const test = new GeminiCLITest();
test.runAllTests().catch(console.error);