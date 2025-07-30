/**
 * DOM Updater - DOM更新ユーティリティ
 * 
 * data-i18n属性を持つ要素の効率的な更新を行う
 * パフォーマンス最適化と差分更新機能を提供
 */

class DOMUpdater {
  constructor() {
    this.observedElements = new Map(); // 監視対象要素のキャッシュ
    this.mutationObserver = null;
    this.isObserving = false;
  }

  /**
   * DOM要素の一括更新
   * @param {Function} getTextFunction - テキスト取得関数
   * @param {string} selector - セレクタ（デフォルト: '[data-i18n]'）
   */
  updateDOM(getTextFunction, selector = '[data-i18n]') {
    try {
      const elements = document.querySelectorAll(selector);
      let updatedCount = 0;

      elements.forEach(element => {
        const updated = this.updateElement(element, getTextFunction);
        if (updated) updatedCount++;
      });

      console.log(`DOM updated: ${updatedCount}/${elements.length} elements`);
      return updatedCount;

    } catch (error) {
      console.error('DOM update failed:', error);
      return 0;
    }
  }

  /**
   * 単一要素の更新
   * @param {HTMLElement} element - 更新対象要素
   * @param {Function} getTextFunction - テキスト取得関数
   * @returns {boolean} 更新されたかどうか
   */
  updateElement(element, getTextFunction) {
    try {
      const key = element.getAttribute('data-i18n');
      if (!key) return false;

      const newText = getTextFunction(key);
      const elementInfo = this.getElementInfo(element);
      
      // 現在のテキストと比較（差分更新）
      if (elementInfo.currentText === newText) {
        return false; // 変更なし
      }

      // 要素タイプに応じて更新
      this.applyTextToElement(element, newText, elementInfo.type);
      
      // キャッシュを更新
      this.observedElements.set(element, {
        key,
        text: newText,
        type: elementInfo.type
      });

      return true;

    } catch (error) {
      console.error('Element update failed:', error);
      return false;
    }
  }

  /**
   * 要素情報の取得
   * @param {HTMLElement} element - 対象要素
   * @returns {Object} 要素情報
   */
  getElementInfo(element) {
    const tagName = element.tagName.toLowerCase();
    let type = 'text';
    let currentText = '';

    if (tagName === 'input' || tagName === 'textarea') {
      if (element.hasAttribute('placeholder')) {
        type = 'placeholder';
        currentText = element.placeholder;
      } else {
        type = 'value';
        currentText = element.value;
      }
    } else if (element.hasAttribute('title')) {
      type = 'title';
      currentText = element.title;
    } else if (element.hasAttribute('aria-label')) {
      type = 'aria-label';
      currentText = element.getAttribute('aria-label');
    } else {
      type = 'text';
      currentText = element.textContent;
    }

    return { type, currentText };
  }

  /**
   * 要素への テキスト適用
   * @param {HTMLElement} element - 対象要素
   * @param {string} text - 適用するテキスト
   * @param {string} type - 適用タイプ
   */
  applyTextToElement(element, text, type) {
    switch (type) {
      case 'placeholder':
        element.placeholder = text;
        break;
      case 'value':
        element.value = text;
        break;
      case 'title':
        element.title = text;
        break;
      case 'aria-label':
        element.setAttribute('aria-label', text);
        break;
      case 'text':
      default:
        // HTMLを含む場合の対応
        if (text.includes('<') && text.includes('>')) {
          element.innerHTML = text;
        } else {
          element.textContent = text;
        }
        break;
    }
  }

  /**
   * 動的要素の監視開始
   * MutationObserverを使用して新しく追加される要素を監視
   * @param {Function} getTextFunction - テキスト取得関数
   */
  startObserving(getTextFunction) {
    if (this.isObserving) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 追加された要素自体をチェック
              if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                this.updateElement(node, getTextFunction);
              }
              
              // 追加された要素の子要素をチェック
              const childElements = node.querySelectorAll && node.querySelectorAll('[data-i18n]');
              if (childElements) {
                childElements.forEach(child => {
                  this.updateElement(child, getTextFunction);
                });
              }
            }
          });
        }
      });
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.isObserving = true;
    console.log('DOM observation started');
  }

  /**
   * 動的要素の監視停止
   */
  stopObserving() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.isObserving = false;
    console.log('DOM observation stopped');
  }

  /**
   * 特定の要素のみを更新
   * @param {string} selector - セレクタ
   * @param {Function} getTextFunction - テキスト取得関数
   * @returns {number} 更新された要素数
   */
  updateSpecificElements(selector, getTextFunction) {
    try {
      const elements = document.querySelectorAll(selector);
      let updatedCount = 0;

      elements.forEach(element => {
        if (element.hasAttribute('data-i18n')) {
          const updated = this.updateElement(element, getTextFunction);
          if (updated) updatedCount++;
        }
      });

      return updatedCount;

    } catch (error) {
      console.error('Specific elements update failed:', error);
      return 0;
    }
  }

  /**
   * キャッシュのクリア
   */
  clearCache() {
    this.observedElements.clear();
    console.log('DOM updater cache cleared');
  }

  /**
   * デバッグ情報の取得
   * @returns {Object} デバッグ情報
   */
  getDebugInfo() {
    return {
      cachedElements: this.observedElements.size,
      isObserving: this.isObserving,
      totalElements: document.querySelectorAll('[data-i18n]').length
    };
  }
}

// グローバルインスタンスを作成
window.domUpdater = new DOMUpdater();

export default DOMUpdater;