#!/usr/bin/env node

import { geminiClient } from '../src/gemini-client.js';

/**
 * GeminiAPI接続テストスクリプト
 */
class GeminiConnectionTest {
  constructor() {
    this.testResults = [];
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
    console.log('🚀 GeminiAPI接続テストを開始します\n');

    try {
      // 1. 初期化テスト
      await this.runTest('初期化テスト', async () => {
        await geminiClient.initialize();
        return '初期化完了';
      });

      // 2. 基本接続テスト
      await this.runTest('基本接続テスト', async () => {
        const connected = await geminiClient.testConnection();
        if (!connected) {
          throw new Error('接続に失敗しました');
        }
        return '接続成功';
      });

      // 3. 単一メッセージテスト
      await this.runTest('単一メッセージテスト', async () => {
        const result = await geminiClient.sendMessage('こんにちは');
        if (!result.success) {
          throw new Error(`メッセージ送信失敗: ${result.error}`);
        }
        return `レスポンス: ${result.response.substring(0, 50)}...`;
      });

      // 4. チャットセッションテスト
      await this.runTest('チャットセッションテスト', async () => {
        const chatSession = await geminiClient.startChat();
        const result = await chatSession.sendMessage('簡単な質問です。1+1は？');
        if (!result.success) {
          throw new Error(`チャットセッション失敗: ${result.error}`);
        }
        return `チャットレスポンス: ${result.response.substring(0, 50)}...`;
      });

      // 5. モデル情報取得テスト
      await this.runTest('モデル情報取得テスト', async () => {
        const modelInfo = await geminiClient.getModelInfo();
        return `モデル: ${modelInfo.modelName}, 温度: ${modelInfo.temperature}`;
      });

      // 6. 日本語対応テスト
      await this.runTest('日本語対応テスト', async () => {
        const result = await geminiClient.sendMessage('「こんにちは」を英語で言ってください。');
        if (!result.success) {
          throw new Error(`日本語テスト失敗: ${result.error}`);
        }
        return `日本語レスポンス: ${result.response.substring(0, 50)}...`;
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
    } else {
      console.log('⚠️  一部のテストが失敗しました。');
    }
  }
}

// テストを実行
const test = new GeminiConnectionTest();
test.runAllTests().catch(console.error);