#!/usr/bin/env node

import readline from 'readline';
import { geminiClient } from './gemini-client.js';
import { conversationLogger } from '../utils/conversation-logger.js';

/**
 * GeminiAPI対話型CLIツール
 */
class GeminiChatCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.chatSession = null;
    this.isRunning = false;
  }

  /**
   * 質問を投げかける
   */
  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  /**
   * CLIの開始
   */
  async start() {
    console.log('🤖 GeminiAPI対話型CLIツールを開始します\n');

    try {
      // GeminiClientを初期化
      await geminiClient.initialize();
      
      // 接続テスト
      console.log('🔗 接続テスト中...');
      const connected = await geminiClient.testConnection();
      
      if (!connected) {
        console.log('❌ GeminiAPIに接続できません。設定を確認してください。');
        this.rl.close();
        return;
      }

      console.log('✅ GeminiAPIに接続しました！');
      console.log('💬 チャットを開始します。終了するには「/quit」と入力してください。\n');

      // チャットセッションを開始
      this.chatSession = await geminiClient.startChat();
      this.isRunning = true;

      // メインループ
      await this.chatLoop();

    } catch (error) {
      console.error('❌ 初期化エラー:', error.message);
      this.rl.close();
    }
  }

  /**
   * チャットメインループ
   */
  async chatLoop() {
    let loopCount = 0;
    const maxLoops = 1000; // 安全な上限設定

    while (this.isRunning && loopCount < maxLoops) {
      try {
        loopCount++;
        
        // readline が閉じられているかチェック
        if (this.rl.closed) {
          console.log('📝 入力が終了しました。');
          this.isRunning = false;
          break;
        }

        const userInput = await this.question('あなた: ');

        // 空文字列や undefined の場合の処理
        if (!userInput || userInput.trim() === '') {
          console.log('📝 入力が空です。終了します。');
          this.isRunning = false;
          break;
        }

        // 終了コマンド
        if (userInput.toLowerCase() === '/quit' || userInput.toLowerCase() === '/q') {
          this.isRunning = false;
          break;
        }

        // ヘルプコマンド
        if (userInput.toLowerCase() === '/help' || userInput.toLowerCase() === '/h') {
          this.showHelp();
          continue;
        }

        // 履歴表示コマンド
        if (userInput.toLowerCase() === '/history') {
          this.showHistory();
          continue;
        }

        // 履歴クリアコマンド
        if (userInput.toLowerCase() === '/clear') {
          this.chatSession.clearHistory();
          console.log('🗑️  履歴をクリアしました。\n');
          continue;
        }

        // 空入力をスキップ
        if (!userInput.trim()) {
          continue;
        }

        // メッセージを送信
        console.log('🤔 考え中...');
        const result = await this.chatSession.sendMessage(userInput);

        if (result.success) {
          console.log(`\n🤖 Gemini: ${result.response}\n`);
        } else {
          console.log(`❌ エラー: ${result.error}\n`);
        }

      } catch (error) {
        console.error('❌ チャットループでエラーが発生しました:', error.message);
        // エラーが発生した場合は安全に終了
        this.isRunning = false;
        break;
      }
    }

    // ループ上限に達した場合の警告
    if (loopCount >= maxLoops) {
      console.log('⚠️  安全上限に達しました。チャットを終了します。');
    }

    console.log('👋 チャットを終了します。');
    
    // セッションを終了
    conversationLogger.endSession();
    
    this.rl.close();
  }

  /**
   * ヘルプ表示
   */
  showHelp() {
    console.log(`
📖 使用可能なコマンド:
  /help, /h     - このヘルプを表示
  /history      - 会話履歴を表示
  /clear        - 会話履歴をクリア
  /quit, /q     - チャットを終了
  
💬 その他のメッセージは全てGeminiに送信されます。
`);
  }

  /**
   * 履歴表示
   */
  showHistory() {
    const history = this.chatSession.getHistory();
    
    if (history.length === 0) {
      console.log('📝 会話履歴がありません。\n');
      return;
    }

    console.log('\n📝 会話履歴:');
    console.log('─'.repeat(50));
    
    history.forEach((item, index) => {
      const timestamp = new Date(item.timestamp).toLocaleTimeString();
      const role = item.role === 'user' ? '👤 あなた' : '🤖 Gemini';
      const content = item.parts[0].text;
      
      console.log(`[${timestamp}] ${role}: ${content}`);
      
      if (index < history.length - 1) {
        console.log('');
      }
    });
    
    console.log('─'.repeat(50));
    console.log('');
  }
}

// CLIツールを実行
const cli = new GeminiChatCLI();
cli.start().catch(console.error);