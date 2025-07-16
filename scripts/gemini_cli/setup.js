#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

/**
 * GeminiCLI統合セットアップスクリプト
 */
class GeminiCLISetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.configPath = path.join(__dirname, 'config', 'cli-config.json');
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
    console.log('🚀 GeminiCLI統合セットアップを開始します\n');

    try {
      // Node.jsバージョンチェック
      await this.checkNodeVersion();

      // GeminiCLIのインストール確認
      await this.checkGeminiCLI();

      // 設定ファイルの作成
      await this.createConfig();

      // 接続テスト
      await this.testConnection();

      console.log('\n✅ GeminiCLI統合のセットアップが完了しました！');
      console.log('\n次のステップ:');
      console.log('1. npm run test でテストを実行');
      console.log('2. node src/cli-analyzer.js でファイル分析を開始');

    } catch (error) {
      console.error('❌ セットアップでエラーが発生しました:', error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Node.jsバージョンチェック
   */
  async checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    console.log(`📋 Node.js バージョン: ${version}`);
    
    if (majorVersion < 18) {
      throw new Error('Node.js 18以上が必要です。現在のバージョン: ' + version);
    }
    
    console.log('✅ Node.jsバージョンチェック完了');
  }

  /**
   * GeminiCLIインストール確認
   */
  async checkGeminiCLI() {
    console.log('\n🔍 GeminiCLIのインストール状況を確認中...');

    try {
      const { stdout } = await execAsync('gemini --version');
      console.log('✅ GeminiCLIが既にインストールされています');
      console.log(`バージョン: ${stdout.trim()}`);
    } catch (error) {
      console.log('⚠️  GeminiCLIが見つかりません。インストールを開始します...');
      
      const installChoice = await this.question('GeminiCLIをインストールしますか？ (y/N): ');
      
      if (installChoice.toLowerCase() === 'y') {
        await this.installGeminiCLI();
      } else {
        throw new Error('GeminiCLIのインストールが必要です。手動でインストールしてください: npm install -g https://github.com/google-gemini/gemini-cli');
      }
    }
  }

  /**
   * GeminiCLIインストール
   */
  async installGeminiCLI() {
    console.log('📦 GeminiCLIをインストール中...');
    
    try {
      const { stdout, stderr } = await execAsync('npm install -g https://github.com/google-gemini/gemini-cli');
      console.log('✅ GeminiCLIのインストールが完了しました');
      
      // インストール確認
      const { stdout: versionOutput } = await execAsync('gemini --version');
      console.log(`バージョン: ${versionOutput.trim()}`);
      
    } catch (error) {
      console.error('❌ インストールに失敗しました:', error.message);
      throw new Error('GeminiCLIのインストールに失敗しました。手動でインストールしてください。');
    }
  }

  /**
   * 設定ファイル作成
   */
  async createConfig() {
    console.log('\n⚙️  設定ファイルを作成中...');

    // configディレクトリ作成
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const defaultPath = await this.question('デフォルトの分析対象パス (現在のディレクトリ): ') || process.cwd();
    const maxFileSize = await this.question('最大ファイルサイズ (KB) (1000): ') || '1000';
    const excludePatterns = await this.question('除外パターン（カンマ区切り）(node_modules,dist,.git): ') || 'node_modules,dist,.git';

    const config = {
      defaultPath: defaultPath,
      maxFileSize: parseInt(maxFileSize) * 1024, // KB to bytes
      excludePatterns: excludePatterns.split(',').map(p => p.trim()),
      timeout: 60000, // 60秒
      retryCount: 3,
      debug: false,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    console.log(`✅ 設定ファイルを作成しました: ${this.configPath}`);
  }

  /**
   * 接続テスト
   */
  async testConnection() {
    console.log('\n🧪 GeminiCLI接続テストを実行中...');

    try {
      const testCommand = 'echo "Hello, this is a connection test" | gemini --timeout 30';
      const { stdout, stderr } = await execAsync(testCommand);
      
      if (stdout && stdout.trim()) {
        console.log('✅ GeminiCLI接続テスト成功');
        console.log('レスポンス:', stdout.substring(0, 100) + '...');
      } else {
        console.log('⚠️  レスポンスが空です。認証設定を確認してください。');
      }
      
    } catch (error) {
      console.log('❌ 接続テストに失敗しました:', error.message);
      console.log('\n🔧 解決方法:');
      console.log('1. GeminiCLIの認証設定を確認してください');
      console.log('2. インターネット接続を確認してください');
      console.log('3. 手動で `gemini` コマンドを実行して認証を完了してください');
    }
  }
}

// セットアップを実行
const setup = new GeminiCLISetup();
setup.start();