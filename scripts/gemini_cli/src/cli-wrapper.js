import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

/**
 * GeminiCLIラッパークラス
 * シェル経由でGeminiCLIを呼び出し、結果を返す
 */
export class GeminiCLIWrapper {
  constructor() {
    this.configPath = path.join(__dirname, '../config/cli-config.json');
    this.config = this.loadConfig();
  }

  /**
   * 設定ファイルを読み込み
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(configData);
      }
      
      // デフォルト設定
      return {
        geminiModel: 'gemini-2.5-flash',
        defaultPath: process.cwd(),
        maxFileSize: 1024000,
        excludePatterns: ['node_modules', 'dist', '.git'],
        timeout: 60000,
        retryCount: 3,
        debug: false,
        projectName: 'gemini-cli-integration'
      };
    } catch (error) {
      console.error('設定ファイルの読み込みエラー:', error.message);
      return {};
    }
  }

  /**
   * GeminiCLIが利用可能かチェック
   */
  async checkAvailability() {
    try {
      const { stdout } = await execAsync('gemini --version');
      return {
        available: true,
        version: stdout.trim()
      };
    } catch (error) {
      return {
        available: false,
        error: 'GeminiCLIが見つかりません。npm install -g https://github.com/google-gemini/gemini-cli でインストールしてください。'
      };
    }
  }

  /**
   * 単一コマンドの実行
   */
  async executeCommand(prompt, options = {}) {
    const availability = await this.checkAvailability();
    if (!availability.available) {
      throw new Error(availability.error);
    }

    const timeout = options.timeout || this.config.timeout || 60000;
    const retryCount = options.retryCount || this.config.retryCount || 3;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        if (this.config.debug) {
          console.log(`🔄 試行 ${attempt}/${retryCount}: ${prompt.substring(0, 50)}...`);
        }

        const result = await this.runCommand(prompt, timeout);
        
        if (this.config.debug) {
          console.log(`✅ 成功: ${result.response.substring(0, 100)}...`);
        }

        return result;

      } catch (error) {
        if (attempt === retryCount) {
          throw error;
        }
        
        if (this.config.debug) {
          console.log(`❌ 試行 ${attempt} 失敗: ${error.message}`);
        }

        // 指数バックオフで待機
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  /**
   * 実際のコマンド実行
   */
  async runCommand(prompt, timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // エスケープして安全なコマンドを作成
      const escapedPrompt = this.escapeShellString(prompt);
      const modelFlag = this.config.geminiModel ? `--model ${this.config.geminiModel}` : '';
      const command = `echo ${escapedPrompt} | gemini ${modelFlag}`.trim();
      
      if (this.config.debug) {
        console.log('実行コマンド:', command);
      }

      const childProcess = exec(command, {
        timeout: timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB
      }, (error, stdout, stderr) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (error) {
          reject(new Error(`GeminiCLI実行エラー: ${error.message}`));
          return;
        }

        if (stderr && stderr.trim()) {
          console.warn('GeminiCLI警告:', stderr.trim());
        }

        resolve({
          success: true,
          response: stdout.trim(),
          responseTime: responseTime,
          timestamp: new Date().toISOString()
        });
      });

      // タイムアウト処理
      setTimeout(() => {
        childProcess.kill('SIGTERM');
        reject(new Error(`コマンドがタイムアウトしました (${timeout}ms)`));
      }, timeout);
    });
  }

  /**
   * 対話型セッションの開始
   */
  async startInteractiveSession() {
    return new Promise((resolve, reject) => {
      const geminiProcess = spawn('gemini', [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const session = new InteractiveSession(geminiProcess, this.config);
      
      geminiProcess.on('error', (error) => {
        reject(new Error(`対話セッション開始エラー: ${error.message}`));
      });

      geminiProcess.on('spawn', () => {
        resolve(session);
      });
    });
  }

  /**
   * ファイル分析
   */
  async analyzeFile(filePath, prompt = 'このファイルを分析してください') {
    const absolutePath = path.resolve(filePath);
    
    // ファイル存在チェック
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`ファイルが見つかりません: ${absolutePath}`);
    }

    // ファイルサイズチェック
    const stats = fs.statSync(absolutePath);
    if (stats.size > this.config.maxFileSize) {
      throw new Error(`ファイルサイズが大きすぎます: ${stats.size} bytes (制限: ${this.config.maxFileSize} bytes)`);
    }

    const command = `@${absolutePath} ${prompt}`;
    return await this.executeCommand(command);
  }

  /**
   * プロジェクト分析
   */
  async analyzeProject(projectPath = '.', prompt = 'このプロジェクトの構造と主要な機能を分析してください') {
    const absolutePath = path.resolve(projectPath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`プロジェクトパスが見つかりません: ${absolutePath}`);
    }

    const command = `@${absolutePath} ${prompt}`;
    return await this.executeCommand(command, { timeout: 120000 }); // プロジェクト分析は2分
  }

  /**
   * シェル文字列のエスケープ
   */
  escapeShellString(str) {
    return '"' + str.replace(/(["\$`\\])/g, '\\$1') + '"';
  }

  /**
   * 待機
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 対話型セッションクラス
 */
class InteractiveSession {
  constructor(process, config) {
    this.process = process;
    this.config = config;
    this.isActive = true;
  }

  /**
   * メッセージ送信
   */
  async sendMessage(message) {
    if (!this.isActive) {
      throw new Error('セッションが非アクティブです');
    }

    return new Promise((resolve, reject) => {
      let output = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('レスポンスタイムアウト'));
      }, this.config.timeout);

      this.process.stdout.on('data', (data) => {
        output += data.toString();
        
        // レスポンス完了の判定（簡易版）
        if (output.includes('\n> ') || output.endsWith('> ')) {
          clearTimeout(timeout);
          resolve({
            success: true,
            response: output.trim(),
            timestamp: new Date().toISOString()
          });
        }
      });

      this.process.stderr.on('data', (data) => {
        console.warn('GeminiCLIエラー出力:', data.toString());
      });

      // メッセージ送信
      this.process.stdin.write(message + '\n');
    });
  }

  /**
   * ファイル読み込み
   */
  async loadFile(filePath) {
    return await this.sendMessage(`@${filePath}`);
  }

  /**
   * セッション終了
   */
  close() {
    if (this.isActive) {
      this.process.stdin.write('exit\n');
      this.process.kill();
      this.isActive = false;
    }
  }
}

// デフォルトインスタンスをエクスポート
export const geminiCLI = new GeminiCLIWrapper();