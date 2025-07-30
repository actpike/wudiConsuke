/**
 * Localizer - ウディこん助 多言語対応システム
 * 
 * Chrome拡張機能の全UI要素を多言語対応するメインクラス
 * 自動言語判定、リアルタイム言語切り替え、DOM更新を管理
 */

class Localizer {
  constructor() {
    this.currentLanguage = 'ja';
    this.resources = {};
    this.isAutoDetected = false;
    this.supportedLanguages = ['ja', 'en'];
    this.storageKeys = {
      language: 'user_language',
      autoDetected: 'language_auto_detected'
    };
  }

  /**
   * 初期化処理
   * 保存された言語設定を読み込み、必要に応じて自動判定を実行
   */
  async initialize() {
    try {
      // 保存された設定を取得
      const result = await chrome.storage.local.get([
        this.storageKeys.language,
        this.storageKeys.autoDetected
      ]);

      // 初回起動または自動判定された言語の場合
      if (!result[this.storageKeys.language] || result[this.storageKeys.autoDetected]) {
        this.currentLanguage = await this.detectUserLanguage();
        this.isAutoDetected = true;
        
        // 自動判定結果を保存
        await this.saveLanguageSettings(this.currentLanguage, true);
      } else {
        // 手動設定された言語を使用
        this.currentLanguage = result[this.storageKeys.language];
        this.isAutoDetected = false;
      }

      // 言語リソースを読み込み
      await this.loadLanguageResources();
      
      console.log(`Localizer initialized: language=${this.currentLanguage}, autoDetected=${this.isAutoDetected}`);
      
    } catch (error) {
      console.error('Localizer initialization failed:', error);
      // フォールバック：日本語で初期化
      this.currentLanguage = 'ja';
      await this.loadLanguageResources();
    }
  }

  /**
   * ブラウザ言語自動判定
   * Chrome拡張機能APIを使用してユーザーの優先言語を判定
   */
  async detectUserLanguage() {
    try {
      // 1. ユーザー優先言語を取得
      const acceptLanguages = await chrome.i18n.getAcceptLanguages();
      
      // 2. ブラウザUI言語を取得
      const uiLanguage = chrome.i18n.getUILanguage();
      
      // 3. 判定ロジック
      const primaryLanguage = acceptLanguages[0] || uiLanguage || 'ja';
      
      // 4. 'ja'判定（ja, ja-JP等）
      const detectedLanguage = primaryLanguage.startsWith('ja') ? 'ja' : 'en';
      
      console.log(`Language detection: acceptLanguages=${acceptLanguages}, uiLanguage=${uiLanguage}, detected=${detectedLanguage}`);
      
      return detectedLanguage;
      
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'ja'; // フォールバック
    }
  }

  /**
   * 言語設定変更
   * @param {string} language - 言語コード ('ja' | 'en')
   * @param {boolean} isManual - 手動設定かどうか
   */
  async setLanguage(language, isManual = false) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported language: ${language}`);
      return;
    }

    try {
      this.currentLanguage = language;
      this.isAutoDetected = !isManual;

      // 設定を保存
      await this.saveLanguageSettings(language, !isManual);

      // 言語リソースを読み込み直し
      await this.loadLanguageResources();

      // DOM を更新
      this.updateDOM();

      console.log(`Language changed: ${language} (manual: ${isManual})`);

    } catch (error) {
      console.error('Language change failed:', error);
    }
  }

  /**
   * 言語設定の保存
   * @param {string} language - 言語コード
   * @param {boolean} isAutoDetected - 自動判定かどうか
   */
  async saveLanguageSettings(language, isAutoDetected) {
    await chrome.storage.local.set({
      [this.storageKeys.language]: language,
      [this.storageKeys.autoDetected]: isAutoDetected
    });
  }

  /**
   * 言語リソースの読み込み
   */
  async loadLanguageResources() {
    try {
      // 動的インポートで言語リソースを読み込み
      const module = await import(`./languages/${this.currentLanguage}.js`);
      this.resources = module.default || module;
      
      console.log(`Language resources loaded: ${this.currentLanguage}`);
      
    } catch (error) {
      console.error(`Failed to load language resources for ${this.currentLanguage}:`, error);
      
      // フォールバック：日本語リソースを読み込み
      if (this.currentLanguage !== 'ja') {
        try {
          const fallbackModule = await import('./languages/ja.js');
          this.resources = fallbackModule.default || fallbackModule;
          console.log('Fallback to Japanese resources');
        } catch (fallbackError) {
          console.error('Fallback resource loading failed:', fallbackError);
          this.resources = {}; // 空のリソース
        }
      }
    }
  }

  /**
   * テキスト取得
   * @param {string} key - リソースキー（例: 'ui.buttons.save'）
   * @param {Object} params - 置換パラメータ
   * @returns {string} ローカライズされたテキスト
   */
  getText(key, params = {}) {
    try {
      const keys = key.split('.');
      let value = this.resources;

      // ネストされたキーを辿る
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Localization key not found: ${key}`);
          return key; // キーをそのまま返す
        }
      }

      // パラメータ置換
      if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }

      return value || key;

    } catch (error) {
      console.error(`getText failed for key: ${key}`, error);
      return key;
    }
  }

  /**
   * DOM要素の一括更新
   * data-i18n属性を持つ要素を自動更新
   */
  updateDOM() {
    try {
      // data-i18n属性を持つ要素を取得
      const elements = document.querySelectorAll('[data-i18n]');
      
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = this.getText(key);
        
        // テキスト要素の更新
        if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
          // プレースホルダーの場合
          if (element.hasAttribute('placeholder')) {
            element.placeholder = text;
          } else {
            element.value = text;
          }
        } else {
          // 通常のテキスト要素
          element.textContent = text;
        }
      });

      console.log(`DOM updated with ${elements.length} elements`);

    } catch (error) {
      console.error('DOM update failed:', error);
    }
  }

  /**
   * 現在の言語コードを取得
   * @returns {string} 現在の言語コード
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * サポートされている言語の一覧を取得
   * @returns {Array<string>} サポート言語一覧
   */
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  /**
   * 言語が自動判定されたかどうかを取得
   * @returns {boolean} 自動判定かどうか
   */
  isLanguageAutoDetected() {
    return this.isAutoDetected;
  }
}

// グローバルインスタンスを作成
window.localizer = new Localizer();

export default Localizer;