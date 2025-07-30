/**
 * Language Detector - 言語検知ユーティリティ
 * 
 * Chrome拡張機能APIを使用してユーザーの言語環境を検知
 * Localizerクラスで使用される専用ユーティリティ
 */

class LanguageDetector {
  constructor() {
    this.supportedLanguages = ['ja', 'en'];
    this.defaultLanguage = 'ja';
  }

  /**
   * ユーザー言語の自動判定
   * @returns {Promise<string>} 判定された言語コード
   */
  async detectUserLanguage() {
    try {
      // 複数の手法で言語判定を試行
      const detectionMethods = [
        this.detectFromAcceptLanguages.bind(this),
        this.detectFromUILanguage.bind(this),
        this.detectFromNavigator.bind(this)
      ];

      for (const method of detectionMethods) {
        const language = await method();
        if (language && this.isLanguageSupported(language)) {
          console.log(`Language detected by ${method.name}: ${language}`);
          return this.normalizeLanguageCode(language);
        }
      }

      // すべての判定方法が失敗した場合のフォールバック
      console.log(`Language detection failed, using default: ${this.defaultLanguage}`);
      return this.defaultLanguage;

    } catch (error) {
      console.error('Language detection error:', error);
      return this.defaultLanguage;
    }
  }

  /**
   * chrome.i18n.getAcceptLanguages() による判定
   * @returns {Promise<string|null>} 判定された言語コード
   */
  async detectFromAcceptLanguages() {
    try {
      const languages = await chrome.i18n.getAcceptLanguages();
      
      if (languages && languages.length > 0) {
        // 最優先言語を取得
        const primaryLanguage = languages[0];
        console.log(`Accept-Languages: ${languages}, primary: ${primaryLanguage}`);
        return primaryLanguage;
      }

      return null;
    } catch (error) {
      console.warn('getAcceptLanguages failed:', error);
      return null;
    }
  }

  /**
   * chrome.i18n.getUILanguage() による判定
   * @returns {Promise<string|null>} 判定された言語コード
   */
  async detectFromUILanguage() {
    try {
      const uiLanguage = chrome.i18n.getUILanguage();
      
      if (uiLanguage) {
        console.log(`UI Language: ${uiLanguage}`);
        return uiLanguage;
      }

      return null;
    } catch (error) {
      console.warn('getUILanguage failed:', error);
      return null;
    }
  }

  /**
   * navigator.language による判定（フォールバック）
   * @returns {Promise<string|null>} 判定された言語コード
   */
  async detectFromNavigator() {
    try {
      // navigator.languages（優先）
      if (navigator.languages && navigator.languages.length > 0) {
        const primaryLanguage = navigator.languages[0];
        console.log(`Navigator languages: ${navigator.languages}, primary: ${primaryLanguage}`);
        return primaryLanguage;
      }

      // navigator.language（フォールバック）
      if (navigator.language) {
        console.log(`Navigator language: ${navigator.language}`);
        return navigator.language;
      }

      return null;
    } catch (error) {
      console.warn('Navigator language detection failed:', error);
      return null;
    }
  }

  /**
   * 言語コードの正規化
   * @param {string} languageCode - 原始言語コード
   * @returns {string} 正規化された言語コード
   */
  normalizeLanguageCode(languageCode) {
    if (!languageCode) return this.defaultLanguage;

    // 小文字に変換
    const normalized = languageCode.toLowerCase();

    // 日本語判定（ja, ja-jp, ja-jpなど）
    if (normalized.startsWith('ja')) {
      return 'ja';
    }

    // 英語判定（en, en-us, en-gb など）
    if (normalized.startsWith('en')) {
      return 'en';
    }

    // その他の場合は英語にフォールバック
    console.log(`Unsupported language ${languageCode}, falling back to English`);
    return 'en';
  }

  /**
   * 言語がサポートされているかチェック
   * @param {string} languageCode - 言語コード
   * @returns {boolean} サポートされているかどうか
   */
  isLanguageSupported(languageCode) {
    const normalized = this.normalizeLanguageCode(languageCode);
    return this.supportedLanguages.includes(normalized);
  }

  /**
   * 言語判定の詳細情報を取得（デバッグ用）
   * @returns {Promise<Object>} 言語判定の詳細情報
   */
  async getDetectionDetails() {
    try {
      const details = {
        acceptLanguages: null,
        uiLanguage: null,
        navigatorLanguages: null,
        navigatorLanguage: null,
        detected: null,
        normalized: null
      };

      // Accept Languages
      try {
        details.acceptLanguages = await chrome.i18n.getAcceptLanguages();
      } catch (error) {
        details.acceptLanguages = `Error: ${error.message}`;
      }

      // UI Language
      try {
        details.uiLanguage = chrome.i18n.getUILanguage();
      } catch (error) {
        details.uiLanguage = `Error: ${error.message}`;
      }

      // Navigator Languages
      details.navigatorLanguages = navigator.languages || null;
      details.navigatorLanguage = navigator.language || null;

      // 自動判定結果
      details.detected = await this.detectUserLanguage();
      details.normalized = this.normalizeLanguageCode(details.detected);

      return details;

    } catch (error) {
      console.error('Failed to get detection details:', error);
      return { error: error.message };
    }
  }
}

// グローバルインスタンスを作成
window.languageDetector = new LanguageDetector();

export default LanguageDetector;