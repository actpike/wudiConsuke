// ウディこん助 - エラーハンドリングユーティリティ
// 統一されたエラー処理とユーザーフレンドリーなメッセージ表示

// ERROR_MESSAGES は constants.js から読み込み（グローバルアクセス）

/**
 * エラーハンドリングユーティリティクラス
 */
class ErrorHandler {
  constructor() {
    this.errorHistory = [];
    this.maxErrorHistory = 50;
  }

  /**
   * エラーを記録し、適切な処理を実行
   * @param {Error} error - エラーオブジェクト
   * @param {string} context - エラーが発生したコンテキスト
   * @param {Object} options - オプション設定
   */
  handleError(error, context = 'unknown', options = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack,
      type: this.categorizeError(error),
      ...options
    };

    // エラー履歴に記録
    this.errorHistory.unshift(errorRecord);
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(0, this.maxErrorHistory);
    }

    // コンソールログ
    console.error(`❌ [${context}] ${error.message}`, error);

    // ユーザー向けメッセージ表示
    if (options.showToUser !== false) {
      this.showUserFriendlyMessage(errorRecord);
    }

    // 必要に応じて追加処理
    if (options.notifyUser) {
      this.createErrorNotification(errorRecord);
    }

    return errorRecord;
  }

  /**
   * エラーの種類を分類
   * @param {Error} error - エラーオブジェクト
   * @returns {string} エラー種別
   */
  categorizeError(error) {
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'network';
    }
    if (error.name === 'QuotaExceededError' || error.message.includes('storage')) {
      return 'storage';
    }
    if (error.name === 'SyntaxError' || error.message.includes('parse')) {
      return 'parse';
    }
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return 'timeout';
    }
    if (error.message.includes('permission')) {
      return 'permission';
    }
    return 'unknown';
  }

  /**
   * ユーザーフレンドリーなメッセージを表示
   * @param {Object} errorRecord - エラー記録
   */
  showUserFriendlyMessage(errorRecord) {
    let userMessage = '';
    let actionMessage = '';

    switch (errorRecord.type) {
      case 'network':
        userMessage = ERROR_MESSAGES.NETWORK_ERROR;
        actionMessage = 'インターネット接続を確認してから再試行してください。';
        break;
      case 'storage':
        userMessage = ERROR_MESSAGES.STORAGE_FULL;
        actionMessage = 'データをエクスポートして古いデータを削除してください。';
        break;
      case 'parse':
        userMessage = ERROR_MESSAGES.PARSE_ERROR;
        actionMessage = 'ページの構造が変更された可能性があります。時間をおいて再試行してください。';
        break;
      case 'timeout':
        userMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
        actionMessage = '時間をおいて再試行してください。';
        break;
      case 'permission':
        userMessage = ERROR_MESSAGES.PERMISSION_ERROR;
        actionMessage = 'Chrome拡張機能の設定を確認してください。';
        break;
      default:
        userMessage = '予期しないエラーが発生しました。';
        actionMessage = '時間をおいて再試行してください。';
    }

    // UIエラー表示（存在する場合）
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-alert">
          <strong>${userMessage}</strong><br>
          <small>${actionMessage}</small>
        </div>
      `;
      errorContainer.style.display = 'block';
    }
  }

  /**
   * エラー通知を作成
   * @param {Object} errorRecord - エラー記録
   */
  async createErrorNotification(errorRecord) {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: chrome.i18n.getMessage('errorNotificationTitle') || 'ウディこん助 - エラー',
        message: this.getNotificationMessage(errorRecord),
        buttons: [{ title: chrome.i18n.getMessage('confirm') || '確認' }]
      });
    } catch (notificationError) {
      console.error('通知作成エラー:', notificationError);
    }
  }

  /**
   * 通知用メッセージを取得
   * @param {Object} errorRecord - エラー記録
   * @returns {string} 通知メッセージ
   */
  getNotificationMessage(errorRecord) {
    switch (errorRecord.type) {
      case 'network':
        return 'ネットワークエラーが発生しました。接続を確認してください。';
      case 'storage':
        return 'ストレージ容量が不足しています。';
      case 'parse':
        return 'データの解析に失敗しました。';
      default:
        return 'エラーが発生しました。詳細はポップアップをご確認ください。';
    }
  }

  /**
   * エラー履歴を取得
   * @param {number} limit - 取得件数上限
   * @returns {Array} エラー履歴
   */
  getErrorHistory(limit = 10) {
    return this.errorHistory.slice(0, limit);
  }

  /**
   * エラー履歴をクリア
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }

  /**
   * 非同期処理をエラーハンドリングでラップ
   * @param {Function} asyncFunction - 非同期関数
   * @param {string} context - コンテキスト
   * @param {Object} options - オプション
   * @returns {Function} ラップされた関数
   */
  wrapAsync(asyncFunction, context, options = {}) {
    return async (...args) => {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        this.handleError(error, context, options);
        if (options.rethrow !== false) {
          throw error;
        }
      }
    };
  }

  /**
   * Promise をエラーハンドリング付きで実行
   * @param {Promise} promise - Promise
   * @param {string} context - コンテキスト
   * @param {Object} options - オプション
   * @returns {Promise} 結果
   */
  async executeWithErrorHandling(promise, context, options = {}) {
    try {
      const result = await promise;
      return { success: true, data: result };
    } catch (error) {
      this.handleError(error, context, options);
      return { success: false, error: error.message };
    }
  }
}

// グローバルインスタンス作成
window.errorHandler = new ErrorHandler();

// ErrorHandler クラスはwindowオブジェクトで公開済み