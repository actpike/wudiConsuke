/**
 * ログ出力ユーティリティ
 */
export class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  /**
   * ログレベルの設定
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * ログ出力の判定
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  /**
   * タイムスタンプの取得
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * デバッグログ
   */
  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.log(`[${this.getTimestamp()}] 🐛 DEBUG: ${message}`, ...args);
    }
  }

  /**
   * 情報ログ
   */
  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.log(`[${this.getTimestamp()}] ℹ️  INFO: ${message}`, ...args);
    }
  }

  /**
   * 警告ログ
   */
  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.getTimestamp()}] ⚠️  WARN: ${message}`, ...args);
    }
  }

  /**
   * エラーログ
   */
  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(`[${this.getTimestamp()}] ❌ ERROR: ${message}`, ...args);
    }
  }

  /**
   * 成功ログ
   */
  success(message, ...args) {
    if (this.shouldLog('info')) {
      console.log(`[${this.getTimestamp()}] ✅ SUCCESS: ${message}`, ...args);
    }
  }
}

// デフォルトロガーをエクスポート
export const logger = new Logger(process.env.LOG_LEVEL || 'info');