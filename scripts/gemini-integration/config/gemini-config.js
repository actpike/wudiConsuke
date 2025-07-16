import dotenv from 'dotenv';
import path from 'path';

// 環境変数を読み込み
dotenv.config();

/**
 * GeminiAPI設定クラス
 */
export class GeminiConfig {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7;
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 1000;
    this.timeout = parseInt(process.env.GEMINI_TIMEOUT) || 30000;
    this.retryCount = parseInt(process.env.GEMINI_RETRY_COUNT) || 3;
    this.debug = process.env.DEBUG === 'true';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  /**
   * 設定の検証
   */
  validate() {
    const errors = [];

    if (!this.apiKey) {
      errors.push('GEMINI_API_KEY is required');
    }

    if (this.apiKey && !this.apiKey.startsWith('AIza')) {
      errors.push('GEMINI_API_KEY appears to be invalid (should start with AIza)');
    }

    if (this.temperature < 0 || this.temperature > 1) {
      errors.push('GEMINI_TEMPERATURE must be between 0 and 1');
    }

    if (this.maxTokens < 1 || this.maxTokens > 4096) {
      errors.push('GEMINI_MAX_TOKENS must be between 1 and 4096');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gemini生成設定を取得
   */
  getGenerationConfig() {
    return {
      temperature: this.temperature,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: this.maxTokens,
      responseMimeType: 'text/plain',
    };
  }

  /**
   * 安全設定を取得
   */
  getSafetySettings() {
    return [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];
  }

  /**
   * 設定情報を表示（APIキーは隠す）
   */
  displayConfig() {
    console.log('🔧 Gemini設定:');
    console.log(`  モデル: ${this.model}`);
    console.log(`  温度: ${this.temperature}`);
    console.log(`  最大トークン数: ${this.maxTokens}`);
    console.log(`  タイムアウト: ${this.timeout}ms`);
    console.log(`  リトライ回数: ${this.retryCount}`);
    console.log(`  デバッグ: ${this.debug ? 'ON' : 'OFF'}`);
    console.log(`  APIキー: ${this.apiKey ? '設定済み' : '未設定'}`);
  }
}

// デフォルト設定をエクスポート
export const geminiConfig = new GeminiConfig();