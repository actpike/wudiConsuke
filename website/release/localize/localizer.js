/**
 * 軽量ローカライザー for 紹介ページ
 * Chrome拡張機能APIを使用せず、静的Webページで動作する独立したローカライゼーションシステム
 */

class WebsiteLocalizer {
  constructor() {
    this.currentLanguage = 'ja';
    this.resources = {};
    this.defaultLanguage = 'ja';
    this.initialized = false;
  }

  /**
   * ローカライザーを初期化
   */
  async initialize() {
    try {
      console.log('🌐 Website Localizer initializing...');
      
      // 言語リソースを読み込み
      await this.loadLanguageResources();
      
      // 保存された言語設定を復元、なければブラウザ言語を自動判定
      const savedLanguage = this.getSavedLanguage();
      const browserLanguage = this.detectBrowserLanguage();
      
      this.currentLanguage = savedLanguage || browserLanguage;
      console.log(`Language set to: ${this.currentLanguage}`);
      
      this.initialized = true;
      console.log('✅ Website Localizer initialized successfully');
      
    } catch (error) {
      console.error('❌ Website Localizer initialization failed:', error);
      // フォールバック: デフォルト言語で継続
      this.currentLanguage = this.defaultLanguage;
      this.initialized = true;
    }
  }

  /**
   * 言語リソースを読み込み
   */
  async loadLanguageResources() {
    // グローバルに読み込まれた言語リソースを使用
    if (window.jaWebsiteResources) {
      this.resources['ja'] = window.jaWebsiteResources;
      console.log('✅ Language resource loaded: ja');
    } else {
      console.error('❌ Failed to load language resource: ja');
    }

    if (window.enWebsiteResources) {
      this.resources['en'] = window.enWebsiteResources;
      console.log('✅ Language resource loaded: en');
    } else {
      console.error('❌ Failed to load language resource: en');
    }
  }

  /**
   * ブラウザの言語設定を自動判定
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    console.log(`Browser language detected: ${browserLang}`);
    
    // 日本語の場合は 'ja'、それ以外は 'en'
    return browserLang.startsWith('ja') ? 'ja' : 'en';
  }

  /**
   * 保存された言語設定を取得
   */
  getSavedLanguage() {
    try {
      return localStorage.getItem('website_language');
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
      return null;
    }
  }

  /**
   * 言語設定を保存
   */
  saveLanguage(language) {
    try {
      localStorage.setItem('website_language', language);
      console.log(`Language saved to localStorage: ${language}`);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }

  /**
   * 言語を変更
   */
  async setLanguage(language, userInitiated = false) {
    if (!this.initialized) {
      console.warn('Localizer not initialized yet');
      return;
    }

    if (!this.resources[language]) {
      console.error(`Language resource not found: ${language}`);
      return;
    }

    this.currentLanguage = language;
    
    if (userInitiated) {
      this.saveLanguage(language);
    }

    // DOM要素を更新
    this.updateDOM();
    
    // メタ情報も更新
    this.updateMetaInfo();
    
    console.log(`Language changed to: ${language}`);
  }

  /**
   * 現在の言語を取得
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * テキストリソースを取得
   */
  getText(key, params = {}) {
    if (!this.initialized || !this.resources[this.currentLanguage]) {
      // 初期化前またはリソースなしの場合はキーをそのまま返す
      return key;
    }

    const keys = key.split('.');
    let value = this.resources[this.currentLanguage];

    // ネストしたオブジェクトのキーを辿る
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // キーが見つからない場合はデフォルト言語を試す
        value = this.resources[this.defaultLanguage];
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key; // キーをそのまま返す
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // パラメータ置換
    return this.replaceParameters(value, params);
  }

  /**
   * パラメータ置換処理
   */
  replaceParameters(text, params) {
    return text.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  }

  /**
   * DOM要素を多言語化
   */
  updateDOM() {
    if (!this.initialized) return;

    // data-i18n属性を持つ要素のテキストを更新
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const text = this.getText(key);
        element.textContent = text;
      }
    });

    // data-i18n-html属性を持つ要素のHTMLを更新
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      if (key) {
        const text = this.getText(key);
        element.innerHTML = text;
      }
    });

    // data-i18n-title属性を持つ要素のtitleを更新
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      if (key) {
        const text = this.getText(key);
        element.title = text;
      }
    });

    // data-i18n-placeholder属性を持つ要素のplaceholderを更新
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key) {
        const text = this.getText(key);
        element.placeholder = text;
      }
    });

    // data-i18n-alt属性を持つ要素のaltを更新
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      if (key) {
        const text = this.getText(key);
        element.alt = text;
      }
    });

    console.log(`DOM elements updated for language: ${this.currentLanguage}`);
  }

  /**
   * メタ情報を言語に応じて更新
   */
  updateMetaInfo() {
    if (!this.initialized) return;

    // HTML lang属性を更新
    document.documentElement.lang = this.currentLanguage;

    // メタタグを更新
    this.updateMetaTag('title', this.getText('meta.title'));
    this.updateMetaTag('description', this.getText('meta.description'));
    this.updateMetaTag('keywords', this.getText('meta.keywords'));
    
    // Open Graph
    this.updateMetaProperty('og:title', this.getText('meta.ogTitle'));
    this.updateMetaProperty('og:description', this.getText('meta.ogDescription'));
    this.updateMetaProperty('og:locale', this.currentLanguage === 'ja' ? 'ja_JP' : 'en_US');
    
    // Twitter Card
    this.updateMetaName('twitter:title', this.getText('meta.twitterTitle'));
    this.updateMetaName('twitter:description', this.getText('meta.twitterDescription'));

    console.log(`Meta information updated for language: ${this.currentLanguage}`);
  }

  /**
   * メタタグを更新（name属性）
   */
  updateMetaName(name, content) {
    const metaTag = document.querySelector(`meta[name="${name}"]`);
    if (metaTag) {
      metaTag.content = content;
    }
  }

  /**
   * メタタグを更新（property属性）
   */
  updateMetaProperty(property, content) {
    const metaTag = document.querySelector(`meta[property="${property}"]`);
    if (metaTag) {
      metaTag.content = content;
    }
  }

  /**
   * メタタグを更新（汎用）
   */
  updateMetaTag(selector, content) {
    if (selector === 'title') {
      document.title = content;
    } else {
      const metaTag = document.querySelector(`meta[name="${selector}"]`);
      if (metaTag) {
        metaTag.content = content;
      }
    }
  }

  /**
   * Schema.org構造化データを更新
   */
  updateStructuredData() {
    const script = document.querySelector('script[type="application/ld+json"]');
    if (script) {
      try {
        const data = JSON.parse(script.textContent);
        data.name = this.getText('meta.title');
        data.description = this.getText('meta.description');
        script.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        console.warn('Failed to update structured data:', error);
      }
    }
  }

  /**
   * 利用可能な言語一覧を取得
   */
  getAvailableLanguages() {
    return Object.keys(this.resources);
  }

  /**
   * デバッグ情報を取得
   */
  getDebugInfo() {
    return {
      initialized: this.initialized,
      currentLanguage: this.currentLanguage,
      availableLanguages: this.getAvailableLanguages(),
      resourcesLoaded: Object.keys(this.resources).length
    };
  }
}

// WebsiteLocalizer をグローバルに公開
window.WebsiteLocalizer = WebsiteLocalizer;