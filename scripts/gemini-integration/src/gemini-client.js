import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig } from '../config/gemini-config.js';
import { conversationLogger } from '../utils/conversation-logger.js';

/**
 * GeminiAPIクライアントクラス
 */
export class GeminiClient {
  constructor(config = geminiConfig) {
    this.config = config;
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }

  /**
   * クライアント初期化
   */
  async initialize() {
    try {
      // 設定の検証
      const validation = this.config.validate();
      if (!validation.isValid) {
        throw new Error(`設定エラー: ${validation.errors.join(', ')}`);
      }

      // GoogleGenerativeAIインスタンスを作成
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      
      // モデルを初期化
      this.model = this.genAI.getGenerativeModel({
        model: this.config.model,
        generationConfig: this.config.getGenerationConfig(),
        safetySettings: this.config.getSafetySettings(),
      });

      this.initialized = true;
      
      if (this.config.debug) {
        console.log('✅ GeminiAPIクライアントが初期化されました');
        this.config.displayConfig();
      }

    } catch (error) {
      console.error('❌ GeminiAPIクライアントの初期化に失敗しました:', error.message);
      throw error;
    }
  }

  /**
   * 初期化チェック
   */
  checkInitialized() {
    if (!this.initialized) {
      throw new Error('GeminiClientが初期化されていません。initialize()を実行してください。');
    }
  }

  /**
   * 単一メッセージでのチャット
   */
  async sendMessage(message) {
    this.checkInitialized();

    const startTime = Date.now();

    try {
      if (this.config.debug) {
        console.log('📤 送信メッセージ:', message);
      }

      const result = await this.model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (this.config.debug) {
        console.log('📥 受信レスポンス:', text);
      }

      const responseData = {
        success: true,
        response: text,
        usage: response.usageMetadata || {},
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      };

      // 会話ログに記録
      conversationLogger.logMessage(message, text, {
        responseTime: responseTime,
        usage: response.usageMetadata || {},
        timestamp: new Date().toISOString()
      });

      return responseData;

    } catch (error) {
      console.error('❌ メッセージ送信でエラーが発生しました:', error.message);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // エラーログに記録
      conversationLogger.logError(error, {
        message: message,
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      };
    }
  }

  /**
   * 会話セッションの開始
   */
  async startChat(history = []) {
    this.checkInitialized();

    try {
      const chat = this.model.startChat({
        history: history,
        generationConfig: this.config.getGenerationConfig(),
        safetySettings: this.config.getSafetySettings(),
      });

      if (this.config.debug) {
        console.log('🗣️  チャットセッションが開始されました');
      }

      // 新しいセッションを開始
      const sessionId = conversationLogger.startNewSession();

      return new GeminiChatSession(chat, this.config, sessionId);

    } catch (error) {
      console.error('❌ チャットセッションの開始に失敗しました:', error.message);
      
      // エラーログに記録
      conversationLogger.logError(error, {
        context: 'startChat',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * 接続テスト
   */
  async testConnection() {
    this.checkInitialized();

    try {
      const testMessage = 'こんにちは。接続テストです。';
      const result = await this.sendMessage(testMessage);
      
      if (result.success) {
        console.log('✅ GeminiAPI接続テスト成功');
        return true;
      } else {
        console.log('❌ GeminiAPI接続テスト失敗:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ 接続テストでエラーが発生しました:', error.message);
      return false;
    }
  }

  /**
   * モデル情報の取得
   */
  async getModelInfo() {
    this.checkInitialized();

    try {
      const model = await this.genAI.getGenerativeModel({ model: this.config.model });
      
      return {
        modelName: this.config.model,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        safetySettings: this.config.getSafetySettings(),
        generationConfig: this.config.getGenerationConfig()
      };

    } catch (error) {
      console.error('❌ モデル情報の取得に失敗しました:', error.message);
      throw error;
    }
  }
}

/**
 * チャットセッションクラス
 */
export class GeminiChatSession {
  constructor(chat, config, sessionId) {
    this.chat = chat;
    this.config = config;
    this.sessionId = sessionId;
    this.history = [];
  }

  /**
   * メッセージ送信
   */
  async sendMessage(message) {
    const startTime = Date.now();

    try {
      if (this.config.debug) {
        console.log('📤 チャットメッセージ:', message);
      }

      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 履歴に追加
      this.history.push({
        role: 'user',
        parts: [{ text: message }],
        timestamp: new Date().toISOString()
      });
      
      this.history.push({
        role: 'model',
        parts: [{ text: text }],
        timestamp: new Date().toISOString()
      });

      if (this.config.debug) {
        console.log('📥 チャットレスポンス:', text);
      }

      const responseData = {
        success: true,
        response: text,
        usage: response.usageMetadata || {},
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      };

      // 会話ログに記録
      conversationLogger.logMessage(message, text, {
        responseTime: responseTime,
        usage: response.usageMetadata || {},
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      });

      return responseData;

    } catch (error) {
      console.error('❌ チャットメッセージ送信でエラーが発生しました:', error.message);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // エラーログに記録
      conversationLogger.logError(error, {
        message: message,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        context: 'chatSession'
      });

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      };
    }
  }

  /**
   * 履歴の取得
   */
  getHistory() {
    return this.history;
  }

  /**
   * 履歴のクリア
   */
  clearHistory() {
    this.history = [];
  }
}

// デフォルトクライアントをエクスポート
export const geminiClient = new GeminiClient();