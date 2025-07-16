#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GeminiAPI統合セットアップスクリプト
 */
class GeminiSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.envPath = path.join(__dirname, '.env');
    this.examplePath = path.join(__dirname, '.env.example');
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
   * セットアップ開始
   */
  async start() {
    console.log('🚀 GeminiAPI統合セットアップを開始します\n');

    try {
      // 既存の.envファイルをチェック
      if (fs.existsSync(this.envPath)) {
        const overwrite = await this.question('既存の.envファイルが見つかりました。上書きしますか？ (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
          console.log('セットアップを終了します。');
          this.rl.close();
          return;
        }
      }

      // APIキーの入力
      const apiKey = await this.question('GeminiAPIキーを入力してください: ');
      
      if (!apiKey) {
        console.log('❌ APIキーが入力されませんでした。');
        this.rl.close();
        return;
      }

      // APIキーの簡単な検証
      if (!apiKey.startsWith('AIza')) {
        console.log('⚠️  警告: APIキーが無効な形式かもしれません（通常「AIza」で始まります）');
      }

      // 設定オプション
      const model = await this.question('使用するモデル (gemini-1.5-pro): ') || 'gemini-1.5-pro';
      const temperature = await this.question('温度設定 (0.7): ') || '0.7';
      const maxTokens = await this.question('最大トークン数 (1000): ') || '1000';
      const debug = await this.question('デバッグモードを有効にしますか？ (y/N): ');

      // .envファイルの作成
      const envContent = `# GeminiAPI設定
GEMINI_API_KEY=${apiKey}

# 設定オプション
GEMINI_MODEL=${model}
GEMINI_TEMPERATURE=${temperature}
GEMINI_MAX_TOKENS=${maxTokens}

# セキュリティ設定
GEMINI_TIMEOUT=30000
GEMINI_RETRY_COUNT=3

# デバッグ設定
DEBUG=${debug.toLowerCase() === 'y' ? 'true' : 'false'}
LOG_LEVEL=info
`;

      fs.writeFileSync(this.envPath, envContent);
      
      console.log('\n✅ セットアップが完了しました！');
      console.log(`📁 設定ファイル: ${this.envPath}`);
      console.log('\n次のステップ:');
      console.log('1. npm install で依存関係をインストール');
      console.log('2. npm run test で接続テストを実行');
      console.log('3. npm run chat でチャットを開始');

    } catch (error) {
      console.error('❌ セットアップでエラーが発生しました:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// セットアップを実行
const setup = new GeminiSetup();
setup.start();