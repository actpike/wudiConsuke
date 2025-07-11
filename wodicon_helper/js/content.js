// ウディこん助 コンテンツスクリプト

console.log('🌊 ウディこん助 content script loaded on:', window.location.href);

// ウディコン関連ページかチェック
function isWodiconPage() {
  const url = window.location.href;
  const title = document.title;
  
  return url.includes('silversecond.com') && 
         (url.includes('Contest') || title.includes('コンテスト') || title.includes('ウディタ'));
}

// ページ読み込み完了後の処理
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}

function initContentScript() {
  if (isWodiconPage()) {
    console.log('📋 ウディコン関連ページを検出しました');
    
    // 将来実装: ページ解析とデータ抽出
    analyzeWodiconPage();
    
    // 将来実装: ページ監視開始
    startPageMonitoring();
  }
}

// ウディコンページ解析（将来実装用スケルトン）
function analyzeWodiconPage() {
  try {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    };
    
    // 作品一覧ページの場合
    if (window.location.href.includes('Contest')) {
      const worksList = extractWorksList();
      if (worksList.length > 0) {
        pageInfo.worksList = worksList;
        console.log(`📊 ${worksList.length}件の作品を検出しました`);
      }
    }
    
    // 作品詳細ページの場合
    if (window.location.href.includes('entry.shtml')) {
      const workDetail = extractWorkDetail();
      if (workDetail) {
        pageInfo.workDetail = workDetail;
        console.log('📄 作品詳細を検出しました:', workDetail.title);
      }
    }
    
    // 結果をバックグラウンドスクリプトに送信
    chrome.runtime.sendMessage({
      action: 'pageAnalyzed',
      data: pageInfo
    }).catch(error => {
      console.log('Background script not available:', error);
    });
    
  } catch (error) {
    console.error('ページ解析中にエラーが発生しました:', error);
  }
}

// 作品一覧抽出（将来実装用スケルトン）
function extractWorksList() {
  const works = [];
  
  try {
    // 複数のセレクタパターンを試行
    const selectors = [
      'table tr',           // テーブル形式
      '.work-item',         // 作品アイテムクラス
      '[class*="entry"]',   // entry含むクラス
      'a[href*="entry"]'    // 作品詳細へのリンク
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`セレクタ "${selector}" で ${elements.length} 件の要素を検出`);
        
        elements.forEach((element, index) => {
          const workData = extractWorkFromElement(element, index);
          if (workData && workData.title) {
            works.push(workData);
          }
        });
        
        if (works.length > 0) {
          break; // 有効なデータが取得できたらループを抜ける
        }
      }
    }
    
  } catch (error) {
    console.error('作品一覧抽出エラー:', error);
  }
  
  return works;
}

// 要素から作品データ抽出
function extractWorkFromElement(element, index) {
  try {
    // タイトル抽出
    const titleSelectors = ['a', '.title', '[class*="title"]', 'td:nth-child(2)'];
    let title = '';
    
    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
        title = titleElement.textContent?.trim();
        if (title && title.length > 2) break;
      }
    }
    
    if (!title) return null;
    
    // URL抽出
    const linkElement = element.querySelector('a[href*="entry"]');
    const url = linkElement ? linkElement.href : '';
    
    // 作品番号抽出
    let no = '';
    if (url) {
      const match = url.match(/#(\d+)/);
      if (match) {
        no = match[1].padStart(3, '0');
      }
    }
    
    // 作者名抽出（可能な場合）
    let author = '';
    const authorSelectors = ['.author', '[class*="author"]', 'td:nth-child(3)'];
    for (const selector of authorSelectors) {
      const authorElement = element.querySelector(selector);
      if (authorElement) {
        author = authorElement.textContent?.trim();
        if (author) break;
      }
    }
    
    return {
      no: no || String(index + 1).padStart(3, '0'),
      title: title,
      author: author || '不明',
      url: url,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('要素からの作品データ抽出エラー:', error);
    return null;
  }
}

// 作品詳細抽出（将来実装用スケルトン）
function extractWorkDetail() {
  try {
    const title = document.querySelector('h1, .title, [class*="title"]')?.textContent?.trim();
    if (!title) return null;
    
    // 作品番号抽出
    const match = window.location.href.match(/#(\d+)/);
    const no = match ? match[1].padStart(3, '0') : '';
    
    // 作者名抽出
    const authorSelectors = ['.author', '[class*="author"]', 'td:contains("作者")', 'th:contains("作者")'];
    let author = '';
    for (const selector of authorSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          author = element.textContent?.trim();
          if (author && !author.includes('作者')) break;
        }
      } catch (e) {
        // セレクタエラーは無視
      }
    }
    
    // 説明文抽出
    const descriptionSelectors = ['.description', '[class*="desc"]', 'p'];
    let description = '';
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.length > 20) {
        description = element.textContent.trim().substring(0, 200);
        break;
      }
    }
    
    return {
      no: no,
      title: title,
      author: author || '不明',
      description: description,
      url: window.location.href,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('作品詳細抽出エラー:', error);
    return null;
  }
}

// ページ監視開始（将来実装用スケルトン）
function startPageMonitoring() {
  // DOM変更監視
  const observer = new MutationObserver((mutations) => {
    let hasSignificantChange = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 新しいコンテンツが追加された場合
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const text = node.textContent || '';
            if (text.includes('作品') || text.includes('更新') || text.includes('新着')) {
              hasSignificantChange = true;
            }
          }
        });
      }
    });
    
    if (hasSignificantChange) {
      console.log('📢 ページに重要な変更を検出しました');
      // 少し遅延してから再解析
      setTimeout(() => {
        analyzeWodiconPage();
      }, 1000);
    }
  });
  
  // 監視開始
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false
  });
  
  console.log('👁️ ページ監視を開始しました');
  
  // 10分後に監視停止（パフォーマンス配慮）
  setTimeout(() => {
    observer.disconnect();
    console.log('👁️ ページ監視を停止しました');
  }, 10 * 60 * 1000);
}

// バックグラウンドスクリプトからのメッセージ受信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'extractPageData':
      const data = analyzeWodiconPage();
      sendResponse({ success: true, data: data });
      break;
      
    case 'checkPageType':
      sendResponse({ 
        success: true, 
        isWodiconPage: isWodiconPage(),
        url: window.location.href,
        title: document.title
      });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// ページアンロード時の処理
window.addEventListener('beforeunload', () => {
  console.log('🌊 ウディこん助 content script unloading');
});

// 初期化完了ログ
setTimeout(() => {
  console.log('🌊 ウディこん助 content script initialization completed');
}, 1000);