// WodiConsuke Technical Validation - Content Script

console.log('🔍 WodiConsuke Content Script loaded on:', window.location.href);

// ページ読み込み完了後の処理
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidation);
} else {
  initValidation();
}

function initValidation() {
  console.log('📋 Starting content script validation...');
  
  // ウディコン関連ページの検出
  if (isWodiconPage()) {
    testWodiconPageAnalysis();
  }
  
  // DOM監視のテスト
  testDOMObserver();
}

// ウディコンページかどうかの判定
function isWodiconPage() {
  const url = window.location.href;
  const title = document.title;
  
  const isWodicon = url.includes('silversecond.com') && 
                   (url.includes('Contest') || title.includes('コンテスト'));
  
  console.log('🎯 Is Wodicon page:', isWodicon);
  return isWodicon;
}

// ウディコンページの解析テスト
function testWodiconPageAnalysis() {
  console.log('🔍 Testing Wodicon page analysis...');
  
  try {
    // 作品一覧の検出テスト
    const worksList = detectWorksList();
    
    // 更新情報の検出テスト
    const updateInfo = detectUpdateInfo();
    
    // HTMLの構造分析
    const structure = analyzePageStructure();
    
    const results = {
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
      worksList,
      updateInfo,
      structure
    };
    
    console.log('📊 Wodicon Analysis Results:', results);
    
    // 結果をストレージに保存
    chrome.runtime.sendMessage({
      action: 'save_analysis_results',
      data: results
    });
    
  } catch (error) {
    console.error('❌ Wodicon page analysis failed:', error);
  }
}

// 作品一覧の検出
function detectWorksList() {
  const selectors = [
    'table tr', // テーブル形式の作品一覧
    '.work-item', // 作品アイテムクラス
    '[id*="work"]', // work含むID
    'a[href*="download"]', // ダウンロードリンク
    'img[src*="thumb"]' // サムネイル画像
  ];
  
  const results = {};
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    results[selector] = {
      count: elements.length,
      found: elements.length > 0,
      firstElement: elements.length > 0 ? {
        tagName: elements[0].tagName,
        className: elements[0].className,
        textContent: elements[0].textContent?.substring(0, 100)
      } : null
    };
  });
  
  console.log('📋 Works list detection:', results);
  return results;
}

// 更新情報の検出
function detectUpdateInfo() {
  const updateSelectors = [
    '[class*="update"]',
    '[class*="new"]',
    '[id*="update"]',
    'time',
    '[datetime]'
  ];
  
  const results = {};
  
  updateSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    results[selector] = {
      count: elements.length,
      elements: Array.from(elements).slice(0, 3).map(el => ({
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent?.substring(0, 50),
        datetime: el.getAttribute('datetime')
      }))
    };
  });
  
  console.log('🆕 Update info detection:', results);
  return results;
}

// ページ構造の分析
function analyzePageStructure() {
  return {
    hasTable: document.querySelector('table') !== null,
    hasForm: document.querySelector('form') !== null,
    linkCount: document.querySelectorAll('a').length,
    imageCount: document.querySelectorAll('img').length,
    headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: h.tagName,
      text: h.textContent?.substring(0, 50)
    })),
    charset: document.characterSet,
    lang: document.documentElement.lang
  };
}

// DOM変更監視のテスト
function testDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        console.log('🔄 DOM changed:', mutation.addedNodes.length, 'nodes added');
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('👁️ DOM observer started');
  
  // 10秒後に停止
  setTimeout(() => {
    observer.disconnect();
    console.log('👁️ DOM observer stopped');
  }, 10000);
}

// 検証用UI要素の追加（デバッグ用）
function addValidationUI() {
  const validationPanel = document.createElement('div');
  validationPanel.id = 'wodicon-validation-panel';
  validationPanel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    background: #f0f0f0;
    border: 2px solid #333;
    padding: 10px;
    z-index: 10000;
    font-family: monospace;
    font-size: 12px;
  `;
  
  validationPanel.innerHTML = `
    <h3>🔍 WodiConsuke Validation</h3>
    <div id="validation-status">Analyzing...</div>
    <button id="test-file-protocol">Test file:// access</button>
    <button id="test-storage">Test storage capacity</button>
  `;
  
  document.body.appendChild(validationPanel);
  
  // ボタンイベント
  document.getElementById('test-file-protocol').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'test_file_protocol' }, (response) => {
      document.getElementById('validation-status').innerHTML = 
        `file:// test: ${response.success ? '✅' : '❌'} ${response.error || ''}`;
    });
  });
  
  document.getElementById('test-storage').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'test_storage_capacity' }, (response) => {
      document.getElementById('validation-status').innerHTML = 
        `Storage test: ${response.success ? '✅' : '❌'} Usage: ${response.usage || 'N/A'} bytes`;
    });
  });
}