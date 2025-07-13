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
    
    // ページ解析とデータ抽出
    analyzeWodiconPage();
    
    // 自動監視実行
    performAutoMonitoring();
    
    // ページ監視開始
    startPageMonitoring();
  }
}

// 自動監視実行
async function performAutoMonitoring() {
  try {
    console.log('🔍 コンテンツスクリプトから自動監視実行開始');
    
    // 自動監視設定確認
    const settings = await chrome.storage.local.get(['web_monitor_settings', 'auto_monitor_settings']);
    const autoMonitorSettings = settings.auto_monitor_settings || { enabled: true };
    
    if (!autoMonitorSettings.enabled) {
      console.log('📴 自動監視が無効に設定されています');
      return;
    }
    
    // ウディコンページでの自動監視実行
    if (window.location.href.includes('Contest/entry.shtml')) {
      console.log('🎯 ウディコン作品ページで自動監視実行');
      
      // 前回実行からの経過時間確認（重複実行防止）
      const lastAutoCheck = await chrome.storage.local.get('last_auto_monitor_time');
      const lastTime = lastAutoCheck.last_auto_monitor_time;
      const now = Date.now();
      
      // 30分以内の重複実行を防止
      if (lastTime && (now - new Date(lastTime).getTime()) < 30 * 60 * 1000) {
        console.log('⏰ 30分以内に自動監視実行済み、スキップします');
        return;
      }
      
      // 自動監視実行時刻を記録
      await chrome.storage.local.set({
        last_auto_monitor_time: new Date().toISOString()
      });
      
      // ページから作品リスト抽出
      const works = extractWorksList();
      
      if (works.length > 0) {
        console.log(`✅ ${works.length}件の作品を検出、背景スクリプトに通知`);
        
        // 背景スクリプトに監視データを送信
        chrome.runtime.sendMessage({
          action: 'auto_monitor_detected',
          source: 'content_script',
          data: {
            works: works,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            detectedCount: works.length
          }
        }).catch(error => {
          console.log('Background script通信エラー:', error);
        });
        
        // 視覚的フィードバック（控えめな通知）
        showAutoMonitorFeedback(works.length);
        
      } else {
        console.log('ℹ️ 作品情報を検出できませんでした');
      }
    }
    
  } catch (error) {
    console.error('❌ 自動監視実行エラー:', error);
  }
}

// 自動監視のフィードバック表示
function showAutoMonitorFeedback(workCount) {
  try {
    // 既存の通知があれば削除
    const existingNotice = document.getElementById('wodicon-auto-monitor-notice');
    if (existingNotice) {
      existingNotice.remove();
    }
    
    // 控えめな通知バーを表示
    const notice = document.createElement('div');
    notice.id = 'wodicon-auto-monitor-notice';
    notice.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideInFade 0.3s ease-out;
    `;
    
    notice.innerHTML = `
      🌊 ウディこん助: ${workCount}件の作品を自動確認しました
    `;
    
    // アニメーション用CSS追加
    if (!document.getElementById('wodicon-auto-monitor-styles')) {
      const styles = document.createElement('style');
      styles.id = 'wodicon-auto-monitor-styles';
      styles.textContent = `
        @keyframes slideInFade {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutFade {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(notice);
    
    // 3秒後にフェードアウト
    setTimeout(() => {
      notice.style.animation = 'slideOutFade 0.3s ease-out';
      setTimeout(() => {
        notice.remove();
      }, 300);
    }, 3000);
    
  } catch (error) {
    console.error('フィードバック表示エラー:', error);
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

// 作品一覧抽出
function extractWorksList() {
  const works = [];
  
  try {
    console.log('🔍 作品一覧抽出開始');
    
    // entry.shtml専用の解析
    const tables = document.querySelectorAll('table');
    console.log(`テーブル数: ${tables.length}`);
    
    if (tables.length > 0) {
      // メインテーブルを特定（最も行数が多いテーブル）
      let mainTable = tables[0];
      let maxRows = 0;
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        if (rows.length > maxRows) {
          maxRows = rows.length;
          mainTable = table;
        }
      });
      
      console.log(`メインテーブル選択: ${maxRows}行`);
      
      // テーブル行を解析
      const rows = mainTable.querySelectorAll('tr');
      console.log('🔍 テーブル行の詳細解析:');
      
      rows.forEach((row, index) => {
        const rowText = row.textContent?.trim();
        console.log(`行${index}: "${rowText}"`);
        
        const workData = extractWorkFromElement(row, index);
        if (workData) {
          console.log(`抽出データ:`, workData);
          
          if (workData.title && workData.title !== '不明') {
            console.log(`✅ 作品抽出成功: No.${workData.no} ${workData.title}`);
            works.push(workData);
          } else {
            console.log(`❌ タイトル無効: "${workData.title}"`);
          }
        } else {
          console.log(`❌ データ抽出失敗`);
        }
      });
    }
    
    // フォールバック: 他のセレクタも試行
    if (works.length === 0) {
      console.log('📋 フォールバック解析を実行');
      
      const fallbackSelectors = [
        '.work-item',
        '[class*="entry"]',
        'div:contains("No.")',
        'p:contains("No.")'
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`フォールバック "${selector}": ${elements.length}件`);
            
            elements.forEach((element, index) => {
              const workData = extractWorkFromElement(element, index);
              if (workData && workData.title) {
                works.push(workData);
              }
            });
            
            if (works.length > 0) break;
          }
        } catch (e) {
          // セレクタエラーは無視
        }
      }
    }
    
    console.log(`📊 最終結果: ${works.length}件の作品を抽出`);
    
  } catch (error) {
    console.error('❌ 作品一覧抽出エラー:', error);
  }
  
  return works;
}

// 要素から作品データ抽出
function extractWorkFromElement(element, index) {
  try {
    // 全てのテキスト内容を取得
    const fullText = element.textContent?.trim() || '';
    
    // 除外対象パターン（応募作品リストなど）
    const excludePatterns = [
      /【応募作品リスト】/,
      /クリックでジャンプできます/,
      /^\s*No\.\d+\s*$/,  // 番号のみ
      /^[\s\d\.]*$/       // 数字と記号のみ
    ];
    
    for (const pattern of excludePatterns) {
      if (pattern.test(fullText)) {
        console.log('除外対象:', fullText);
        return null;
      }
    }
    
    // 作品番号とタイトルを解析
    let no = '';
    let title = '';
    let author = '';
    let version = '';
    let lastUpdate = '';
    
    // パターン1: "No.2 1.片道勇者（ｴﾝﾄﾘｰ見本）" 形式
    console.log(`パターン1解析: "${fullText}"`);
    
    // 複数のパターンを試行
    const patterns = [
      // ウディコン専用パターン
      /エントリー番号【(\d+)】[\s\S]*?『(.+?)』[\s\S]*?【ダウンロード】\s*(.+?)[\s\S]*?作者\s*:\s*(.+?)(?:\n|$)/,
      // テーブル行パターン  
      /(\d+)\.(.+?)(?:\[(.+?)\])?$/,
      // 従来パターン
      /No\.(\d+)\s+(\d+)\.(.+?)(?:\s*\((.+?)\))?.*$/,
      /No\.(\d+)\s+(\d+)\.(.+)/
    ];
    
    let titleMatch = null;
    patterns.forEach((pattern, i) => {
      if (!titleMatch) {
        const match = fullText.match(pattern);
        if (match) {
          console.log(`パターン1-${i+1}マッチ:`, match);
          titleMatch = match;
          
          switch (i) {
            case 0: // ウディコン専用パターン
              no = match[1];
              title = match[2]?.trim();
              lastUpdate = match[3]?.trim(); // 【ダウンロード】後の日付
              author = match[4]?.trim();
              version = lastUpdate; // 更新日付兼バージョン
              break;
              
            case 1: // テーブル行パターン  
              no = match[1];
              title = match[2]?.trim();
              if (match[3]) {
                lastUpdate = match[3];
                version = match[3]; // [6/24] 形式
              }
              break;
              
            case 2: // 従来パターン1
              const workNo2 = parseInt(match[2]);
              no = String(workNo2 - 1);
              title = match[3]?.trim();
              if (match[4]) version = match[4];
              break;
              
            case 3: // 従来パターン2
              const workNo3 = parseInt(match[2]);
              no = String(workNo3 - 1);
              title = match[3]?.trim();
              break;
          }
        }
      }
    });
    
    if (titleMatch) {
      console.log(`パターン1結果: No.${no}, Title: "${title}", Author: "${author}", Version: "${version}", Update: "${lastUpdate}"`);
    } else {
      console.log('パターン1全て不一致');
    }
    
    // パターン2: テーブル形式での詳細抽出
    const cells = element.querySelectorAll('td');
    if (cells.length >= 2 && !title) {
      // 1列目から作品番号、2列目からタイトル
      const noCell = cells[0]?.textContent?.trim();
      const titleCell = cells[1]?.textContent?.trim();
      
      if (noCell && titleCell) {
        const noMatch = noCell.match(/No\.(\d+)/);
        if (noMatch) {
          const cellNo = parseInt(noMatch[1]);
          if (cellNo >= 2) { // No.2以降が実際の作品
            no = String(cellNo - 1);
            title = titleCell;
          }
        }
      }
      
      // 3列目以降から作者、更新日時などを抽出
      if (cells.length >= 3) {
        author = cells[2]?.textContent?.trim() || '';
      }
      if (cells.length >= 4) {
        lastUpdate = cells[3]?.textContent?.trim() || '';
      }
      if (cells.length >= 5) {
        version = cells[4]?.textContent?.trim() || '';
      }
    }
    
    // タイトルが取得できない場合は除外
    if (!title || title.length < 2) {
      return null;
    }
    
    // URL抽出
    const linkElement = element.querySelector('a[href*="#"]');
    const url = linkElement ? linkElement.href : '';
    
    // URLから作品番号を再確認
    if (url && !no) {
      const urlMatch = url.match(/#(\d+)/);
      if (urlMatch) {
        no = urlMatch[1];
      }
    }
    
    // 最終結果の整理
    const result = {
      no: no || String(index),
      title: title,
      author: author || '不明',
      version: version || '',
      lastUpdate: lastUpdate || '',
      url: url,
      extractedAt: new Date().toISOString()
    };
    
    console.log('最終抽出結果:', result);
    return result;
    
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
    const no = match ? match[1] : ''; // ゼロパディングなし
    
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

    case 'parse_current_page':
      // ページ解析情報表示機能対応
      try {
        const pageInfo = {
          url: window.location.href,
          title: document.title,
          isWodiconPage: isWodiconPage(),
          timestamp: new Date().toISOString()
        };

        if (isWodiconPage()) {
          const works = extractWorksList();
          pageInfo.works = works;
          pageInfo.success = works.length > 0;
          
          // 診断情報追加
          const diagnosis = {
            info: {
              tables: document.querySelectorAll('table').length,
              tableRows: document.querySelectorAll('table tr').length,
              links: document.querySelectorAll('a').length,
              entryLinks: document.querySelectorAll('a[href*="entry"]').length
            }
          };
          pageInfo.diagnosis = diagnosis;
        } else {
          pageInfo.success = false;
          pageInfo.error = 'Not a Wodicon page';
        }

        sendResponse(pageInfo);
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }

  // 非同期レスポンスを有効にする
  return true;
});

// ページアンロード時の処理
window.addEventListener('beforeunload', () => {
  console.log('🌊 ウディこん助 content script unloading');
});

// 初期化完了ログ
setTimeout(() => {
  console.log('🌊 ウディこん助 content script initialization completed');
}, 1000);