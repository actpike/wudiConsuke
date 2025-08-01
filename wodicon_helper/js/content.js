// ウディこん助 コンテンツスクリプト

console.log('🌊 ウディこん助 content script loaded on:', window.location.href);


// 統合メッセージリスナー（全てのメッセージを処理）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 メッセージ受信:', request.action, request);
  console.log('📡 送信者情報:', sender);
  
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

    case 'fillVoteForm':
      try {
        const result = fillVoteForm(request.data);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'fillAllVoteForms':
      try {
        const result = fillAllVoteForms(request.data);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'debug_status':
      try {
        console.log('🔍 debug_status メッセージ処理中');
        sendResponse({
          success: true,
          status: 'active',
          url: window.location.href,
          timestamp: new Date().toISOString(),
          isWodiconPage: isWodiconPage(),
          contentScriptVersion: 'loaded'
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;

      
    default:
      console.warn('⚠️ 未知のアクション:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }

  // 非同期レスポンスを有効にする
  return true;
});

// ウディコン関連ページかチェック
function isWodiconPage() {
  const url = window.location.href;
  const title = document.title;
  
  return url.includes('silversecond.com') && 
         (url.includes('Contest') || title.includes('コンテスト') || title.includes('ウディタ'));
}

// ページ読み込み完了後の処理（エラーセーフ）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initContentScript();
    } catch (error) {
      console.error('❌ DOM読み込み後の初期化エラー:', error);
    }
  });
} else {
  try {
    initContentScript();
  } catch (error) {
    console.error('❌ 即座初期化エラー:', error);
  }
}

function initContentScript() {
  if (isWodiconPage()) {
    console.log('📋 ウディコン関連ページを検出しました');

    // 各初期化処理をtry-catchで囲み、一部の処理が失敗しても全体が停止しないようにする
    try {
      // ページ解析とデータ抽出
      analyzeWodiconPage();
    } catch (e) {
      console.error('❌ analyzeWodiconPage failed:', e);
    }
    try {
      // 自動監視実行
      performAutoMonitoring();
    } catch (e) {
      console.error('❌ performAutoMonitoring failed:', e);
    }
    try {
      // ページ監視開始
      startPageMonitoring();
    } catch (e) {
      console.error('❌ startPageMonitoring failed:', e);
    }
    try {
      // デバッグパネル初期化
      initDebugPanel();
    } catch (e) {
      console.error('❌ initDebugPanel failed:', e);
    }
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
      
      // ページから作品リスト抽出（webMonitor.jsのロジックを使用）
      console.log('🔄 webMonitor.jsの抽出ロジックを使用');
      let works = [];
      
      try {
        // webMonitor.jsのインスタンスを作成して監視実行
        if (typeof WebMonitor !== 'undefined') {
          const webMonitor = new WebMonitor();
          const monitorResult = await webMonitor.performMonitoring();
          
          if (monitorResult && monitorResult.works) {
            works = monitorResult.works;
            console.log(`✅ webMonitor経由で${works.length}件の作品を検出`);
          } else {
            console.log('⚠️ webMonitor結果が空でした');
          }
        } else {
          console.log('⚠️ WebMonitorクラスが利用できません、フォールバック使用');
        }
      } catch (webMonitorError) {
        console.log('⚠️ webMonitor実行エラー:', webMonitorError);
      }
      
      // webMonitorで取得できなかった場合のフォールバック
      if (works.length === 0) {
        console.log('🔄 フォールバック: 従来のextractWorksListを使用');
        works = extractWorksList();
      }
      
      if (works.length > 0) {
        console.log(`✅ ${works.length}件の作品を検出、背景スクリプトに通知`);
        
        // 背景スクリプトに監視データを送信
        chrome.runtime.sendMessage({
          action: 'auto_monitor_detected',
          source: 'content_script_via_webmonitor',
          data: {
            works: works,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            detectedCount: works.length
          }
        }).catch(error => {
          console.log('Background script通信エラー:', error);
          // Background script通信失敗時も新しい通知システムを使用
          // ただし差分情報がないため、検出した作品数を新規として扱う
          console.log('🔄 Background script通信失敗のため、検出作品を新規として通知表示');
          showAutoMonitorNoticeWithChanges(works.length, 0);
        });
        
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
    console.warn('⚠️ 古いshowAutoMonitorFeedback関数が呼ばれました！workCount=', workCount);
    console.trace('📍 呼び出し元のスタックトレース:');
    
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
    // Extension context invalidated は無視（拡張機能リロード時の正常な動作）
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.log('🔄 拡張機能がリロードされました（正常）');
      return;
    }
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
          // 配列（複数作品）か単一作品かを判定
          if (Array.isArray(workData)) {
            console.log(`抽出データ（複数）: ${workData.length}件`);
            workData.forEach(work => {
              if (work.title && work.title !== '不明') {
                console.log(`✅ 作品抽出成功: No.${work.no} ${work.title}`);
                works.push(work);
              }
            });
          } else {
            console.log(`抽出データ（単一）:`, workData);
            if (workData.title && workData.title !== '不明') {
              console.log(`✅ 作品抽出成功: No.${workData.no} ${workData.title}`);
              works.push(workData);
            } else {
              console.log(`❌ タイトル無効: "${workData.title}"`);
            }
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
    
    // パターン1: 改行区切りの作品リストを個別処理
    console.log(`パターン1解析開始`);
    
    // 作品リストが改行区切りで含まれている場合の処理
    if (fullText.includes('\n') && /\d+\./.test(fullText)) {
      console.log('📝 改行区切り作品リストを検出');
      console.log(`全文長: ${fullText.length}文字, 改行数: ${(fullText.match(/\n/g) || []).length}`);
      const lines = fullText.split('\n').filter(line => line.trim());
      const extractedWorks = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        console.log(`行解析: "${trimmedLine}"`);
        
        // 作品エントリーのパターンマッチ（タイトル部分を正確に抽出）
        const workPattern = /^(\d+)\.([^[\]]+?)(?:\[(.+?)\])?$/;
        const match = trimmedLine.match(workPattern);
        
        if (match) {
          const workNo = match[1];
          const workTitle = match[2]?.trim();
          const workUpdate = match[3]?.trim() || '';
          
          console.log(`✅ 作品発見: No.${workNo} "${workTitle}" [${workUpdate}]`);
          
          const workData = {
            no: workNo,
            title: workTitle,
            author: '不明',
            version: workUpdate,
            lastUpdate: workUpdate,
            url: window.location.href,
            extractedAt: new Date().toISOString()
          };
          
          extractedWorks.push(workData);
        }
      }
      
      if (extractedWorks.length > 0) {
        console.log(`🎉 改行区切り処理で${extractedWorks.length}件抽出成功`);
        return extractedWorks; // 複数の作品を返す
      }
    }
    
    // フォールバック: 従来の単一マッチ処理
    console.log(`単一マッチ処理にフォールバック`);
    
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

function fillAllVoteForms(games) {
  console.log(`📝 ${games.length}件の作品を一括入力開始`);
  let successCount = 0;
  let skippedCount = 0;
  const skippedGames = [];

  for (const gameData of games) {
    // 評価データがない作品はスキップ
    if (!gameData.rating) continue;

    const result = fillVoteForm(gameData);
    if (result.success) {
      successCount++;
    } else {
      skippedCount++;
      skippedGames.push({ no: gameData.no, title: gameData.title, error: result.error });
    }
  }

  console.log(`📝 一括入力完了: 成功 ${successCount}件, スキップ ${skippedCount}件`);
  console.log('スキップされた作品:', skippedGames);

  return { success: true, successCount, skippedCount, skippedGames };
}

function fillVoteForm(gameData) {
  console.log('📝 投票フォーム入力開始:', gameData);

  try {
    const gameId = gameData.no;
    if (!gameId) {
        return { success: false, error: '作品番号がデータにありません。' };
    }

    // Check if at least one element for this game exists to validate gameId
    const voteCheckbox = document.querySelector(`input[name="Game_${gameId}_FLAG"]`);
    if (!voteCheckbox) {
        console.error(`作品番号 ${gameId} のフォーム要素が見つかりません。`);
        return { success: false, error: `作品番号「${gameId}」の作品がページに見つかりません。` };
    }

    // 評価入力
    if (gameData.rating) {
      const ratingMap = {
        '熱中度': `Game_${gameId}_PT1`,
        '斬新さ': `Game_${gameId}_PT2`,
        '物語性': `Game_${gameId}_PT3`,
        '画像音声': `Game_${gameId}_PT4`,
        '遊びやすさ': `Game_${gameId}_PT5`,
        'その他': `Game_${gameId}_PT6`,
      };

      for (const [key, name] of Object.entries(ratingMap)) {
        const select = document.querySelector(`select[name="${name}"]`);
        if (select && gameData.rating[key] != null) {
          select.value = gameData.rating[key];
          console.log(`  -> ${key}: ${gameData.rating[key]}点に設定`);
        }
      }
    }

    // 感想入力
    const commentArea = document.querySelector(`textarea[name="Game_${gameId}_Com"]`);
    if (commentArea && gameData.review) {
      commentArea.value = gameData.review;
      console.log(`  -> 感想を入力しました`);
    }

    // 投票チェック
    voteCheckbox.checked = true;
    console.log(`  -> 投票チェックをONにしました`);
    // changebgを呼び出して背景色を変更
    if (typeof changebg === 'function') {
      changebg(voteCheckbox.id);
    }
    
    return { success: true };

  } catch (error) {
    console.error('投票フォーム入力処理中にエラー:', error);
    return { success: false, error: 'フォーム入力中に予期せぬエラーが発生しました。' };
  }
}

// ページアンロード時の処理
window.addEventListener('beforeunload', () => {
  console.log('🌊 ウディこん助 content script unloading');
});

// 重複するメッセージリスナーを削除済み（上の統合リスナーで処理）

// 新規・更新件数付きの自動監視通知表示
function showAutoMonitorNoticeWithChanges(newCount, updatedCount) {
  try {
    console.log(`🎨 showAutoMonitorNoticeWithChanges 実行開始: newCount=${newCount}, updatedCount=${updatedCount}`);
    
    // 既存の通知があれば削除
    const existingNotice = document.getElementById('wodicon-auto-monitor-notice');
    if (existingNotice) {
      existingNotice.remove();
      console.log('🗑️ 既存通知削除完了');
    }
    
    // 変更内容のメッセージを作成
    let changeMessage = '';
    if (newCount > 0 && updatedCount > 0) {
      changeMessage = `新規${newCount}件、更新${updatedCount}件`;
    } else if (newCount > 0) {
      changeMessage = `新規${newCount}件`;
    } else if (updatedCount > 0) {
      changeMessage = `更新${updatedCount}件`;
    }
    
    console.log(`📝 作成予定メッセージ: "${changeMessage}"`);
    
    if (!changeMessage) {
      console.warn('⚠️ changeMessage が空です！newCount/updatedCount を確認してください');
      return;
    }
    
    // 通知バーを作成
    const notice = document.createElement('div');
    notice.id = 'wodicon-auto-monitor-notice';
    notice.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInFade 0.4s ease-out;
      max-width: 320px;
      border: 1px solid rgba(255,255,255,0.2);
    `;
    
    const finalMessage = `🌊 ウディこん助: ${changeMessage}を検出しました`;
    notice.innerHTML = finalMessage;
    
    console.log(`🎯 最終表示メッセージ: "${finalMessage}"`);
    
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
    
    // 5秒後に自動削除
    setTimeout(() => {
      if (notice && notice.parentNode) {
        notice.style.animation = 'slideOutFade 0.3s ease-in';
        setTimeout(() => {
          if (notice.parentNode) {
            notice.remove();
          }
        }, 300);
      }
    }, 5000);
    
    console.log(`✅ 自動監視通知表示: ${changeMessage}`);
    
  } catch (error) {
    console.error('❌ 自動監視通知表示エラー:', error);
  }
}

// デバッグパネル初期化
function initDebugPanel() {
  // デバッグパネルは常に非表示（ローカル開発時のみ手動で有効化）
  // リリース版（開発版・本番版問わず）では表示しない
  const manifest = chrome.runtime.getManifest();
  const isLocalDev = manifest.name.includes('(LocalDev)');
  
  if (!isLocalDev) {
    console.log('🔧 リリース版のためデバッグパネルをスキップ');
    return;
  }
  
  console.log('🔧 デバッグパネル初期化開始（ローカル開発モード）');
  
  // 既存のパネルがあれば削除
  const existingPanel = document.getElementById('wodicon-debug-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // デバッグパネルのHTML構造を作成
  const debugPanel = document.createElement('div');
  debugPanel.id = 'wodicon-debug-panel';
  debugPanel.innerHTML = `
    <div id="debug-header">
      🌊 ウディこん助 デバッグ
      <button id="debug-toggle">▼</button>
    </div>
    <div id="debug-content" style="display: none;">
      <div class="debug-section">
        <h4>クールタイム管理</h4>
        <button id="debug-clear-cooltime" class="debug-btn">クールタイム削除</button>
        <div id="cooltime-status"></div>
      </div>
      <div class="debug-section">
        <h4>通知テスト</h4>
        <button id="debug-test-new" class="debug-btn">新規2件</button>
        <button id="debug-test-updated" class="debug-btn">更新1件</button>
        <button id="debug-test-mixed" class="debug-btn">新規3件+更新2件</button>
      </div>
      <div class="debug-section">
        <h4>監視状態</h4>
        <button id="debug-check-status" class="debug-btn">状態確認</button>
        <button id="debug-test-background" class="debug-btn">Background通信テスト</button>
        <div id="monitor-status"></div>
      </div>
      <div class="debug-section">
        <h4>ページ構造解析</h4>
        <button id="debug-scan-dom" class="debug-btn">DOM構造スキャン</button>
        <button id="debug-extract-works" class="debug-btn">作品データ抽出テスト</button>
        <div id="page-analysis"></div>
      </div>
      <div id="debug-log"></div>
    </div>
  `;
  
  // CSSスタイルを追加
  const debugStyles = document.createElement('style');
  debugStyles.id = 'wodicon-debug-styles';
  debugStyles.textContent = `
    #wodicon-debug-panel {
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border: 2px solid #667eea;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 10000;
      min-width: 280px;
      max-width: 400px;
    }
    
    #debug-header {
      background: #667eea;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: bold;
    }
    
    #debug-toggle {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
    }
    
    #debug-content {
      padding: 12px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .debug-section {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #444;
    }
    
    .debug-section:last-child {
      border-bottom: none;
    }
    
    .debug-section h4 {
      margin: 0 0 8px 0;
      color: #90CAF9;
      font-size: 13px;
    }
    
    .debug-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 6px 12px;
      margin: 2px 4px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      transition: background 0.2s;
    }
    
    .debug-btn:hover {
      background: #45a049;
    }
    
    .debug-btn.danger {
      background: #f44336;
    }
    
    .debug-btn.danger:hover {
      background: #da190b;
    }
    
    #debug-log {
      margin-top: 10px;
      background: #1e1e1e;
      padding: 8px;
      border-radius: 4px;
      font-size: 10px;
      max-height: 120px;
      overflow-y: auto;
      display: none;
    }
    
    #cooltime-status, #monitor-status, #page-analysis {
      margin-top: 8px;
      padding: 6px 8px;
      background: #2e2e2e;
      border-radius: 4px;
      font-size: 10px;
      color: #bbb;
      line-height: 1.4;
    }
  `;
  
  // スタイルとパネルを追加
  if (!document.getElementById('wodicon-debug-styles')) {
    document.head.appendChild(debugStyles);
  }
  document.body.appendChild(debugPanel);
  
  // イベントリスナーを設定
  setupDebugPanelEvents();
  
  // 初期状態更新
  updateDebugStatus();
  
  console.log('✅ デバッグパネル初期化完了');
}

// デバッグパネルのイベントリスナー設定
function setupDebugPanelEvents() {
  // パネルの展開/折りたたみ
  const header = document.getElementById('debug-header');
  const toggle = document.getElementById('debug-toggle');
  const content = document.getElementById('debug-content');
  
  header.addEventListener('click', () => {
    const isExpanded = content.style.display !== 'none';
    content.style.display = isExpanded ? 'none' : 'block';
    toggle.textContent = isExpanded ? '▼' : '▲';
  });
  
  // クールタイムクリア
  document.getElementById('debug-clear-cooltime').addEventListener('click', async () => {
    debugLog('🧹 クールタイムクリア実行...');
    try {
      await chrome.storage.local.remove('last_auto_monitor_time');
      debugLog('✅ クールタイムクリア完了');
      updateDebugStatus();
    } catch (error) {
      debugLog(`❌ クールタイムクリアエラー: ${error.message}`);
    }
  });
  
  // 新規作品テスト
  document.getElementById('debug-test-new').addEventListener('click', () => {
    debugLog('🧪 新規2件テスト実行...');
    showAutoMonitorNoticeWithChanges(2, 0);
    debugLog('✅ 新規2件通知表示完了');
  });
  
  // 更新作品テスト
  document.getElementById('debug-test-updated').addEventListener('click', () => {
    debugLog('🧪 更新1件テスト実行...');
    showAutoMonitorNoticeWithChanges(0, 1);
    debugLog('✅ 更新1件通知表示完了');
  });
  
  // 混合テスト
  document.getElementById('debug-test-mixed').addEventListener('click', () => {
    debugLog('🧪 新規3件+更新2件テスト実行...');
    showAutoMonitorNoticeWithChanges(3, 2);
    debugLog('✅ 混合通知表示完了');
  });
  
  // 状態確認
  document.getElementById('debug-check-status').addEventListener('click', () => {
    debugLog('🔍 監視状態確認...');
    updateDebugStatus();
  });
  
  // Background Script通信テスト
  document.getElementById('debug-test-background').addEventListener('click', async () => {
    debugLog('📡 Background Script通信テスト...');
    try {
      const testData = {
        action: 'auto_monitor_detected',
        source: 'debug_test',
        data: {
          works: [
            { no: '1', title: 'テスト作品1', lastUpdate: '[6/24]', author: 'テスト作者1' },
            { no: '2', title: 'テスト作品2', lastUpdate: '[6/25]', author: 'テスト作者2' }
          ],
          url: window.location.href,
          timestamp: new Date().toISOString(),
          detectedCount: 2
        }
      };
      
      const response = await chrome.runtime.sendMessage(testData);
      debugLog(`✅ Background通信成功: ${JSON.stringify(response)}`);
      
      // 実際の通知も表示されるはず
      if (response && response.result) {
        const { newCount, updatedCount } = response.result;
        debugLog(`📊 差分結果: 新規${newCount}件、更新${updatedCount}件`);
      }
      
    } catch (error) {
      debugLog(`❌ Background通信失敗: ${error.message}`);
      debugLog('🔄 フォールバック通知を表示します');
      showAutoMonitorNoticeWithChanges(2, 0); // フォールバック動作をテスト
    }
  });
  
  // DOM構造スキャン
  document.getElementById('debug-scan-dom').addEventListener('click', () => {
    debugLog('🔍 DOM構造スキャン開始...');
    const pageAnalysis = document.getElementById('page-analysis');
    
    const tables = document.querySelectorAll('table');
    const divs = document.querySelectorAll('div');
    const paragraphs = document.querySelectorAll('p');
    
    const analysis = `
      <strong>基本情報:</strong><br>
      URL: ${window.location.href}<br>
      Title: ${document.title}<br>
      <br>
      <strong>DOM要素数:</strong><br>
      テーブル: ${tables.length}個<br>
      div要素: ${divs.length}個<br>
      p要素: ${paragraphs.length}個<br>
      <br>
      <strong>テーブル詳細:</strong><br>
      ${Array.from(tables).map((table, i) => {
        const rows = table.querySelectorAll('tr');
        return `テーブル${i+1}: ${rows.length}行`;
      }).join('<br>')}
    `;
    
    pageAnalysis.innerHTML = analysis;
    debugLog('✅ DOM構造スキャン完了');
  });
  
  // 作品データ抽出テスト
  document.getElementById('debug-extract-works').addEventListener('click', () => {
    debugLog('🎯 作品データ抽出テスト開始...');
    const works = extractWorksList();
    debugLog(`📊 抽出結果: ${works.length}件`);
    
    const pageAnalysis = document.getElementById('page-analysis');
    if (works.length > 0) {
      const worksList = works.slice(0, 5).map(work => 
        `No.${work.no} ${work.title} (${work.author})`
      ).join('<br>');
      
      pageAnalysis.innerHTML = `
        <strong>抽出成功:</strong><br>
        総件数: ${works.length}件<br>
        <br>
        <strong>サンプル（最初の5件）:</strong><br>
        ${worksList}
        ${works.length > 5 ? '<br>...' : ''}
      `;
    } else {
      pageAnalysis.innerHTML = `
        <strong style="color: #ff6b6b;">抽出失敗</strong><br>
        作品データが見つかりませんでした。<br>
        コンソールで詳細ログを確認してください。
      `;
    }
  });
}

// デバッグログ表示
function debugLog(message) {
  const logDiv = document.getElementById('debug-log');
  const timestamp = new Date().toLocaleTimeString();
  
  logDiv.style.display = 'block';
  logDiv.innerHTML += `<div>[${timestamp}] ${message}</div>`;
  logDiv.scrollTop = logDiv.scrollHeight;
  
  // ログが多くなったら古いものを削除
  const logs = logDiv.children;
  if (logs.length > 20) {
    logDiv.removeChild(logs[0]);
  }
}

// デバッグ状態更新
async function updateDebugStatus() {
  try {
    // クールタイム状態チェック
    const result = await chrome.storage.local.get('last_auto_monitor_time');
    const lastTime = result.last_auto_monitor_time;
    const cooltimeStatus = document.getElementById('cooltime-status');
    
    if (lastTime) {
      const lastDate = new Date(lastTime);
      const now = new Date();
      const diff = Math.floor((now - lastDate) / 1000 / 60); // 分
      const remainingCooltime = Math.max(0, 30 - diff);
      
      cooltimeStatus.innerHTML = `
        最終実行: ${lastDate.toLocaleTimeString()}<br>
        経過時間: ${diff}分<br>
        残りクールタイム: ${remainingCooltime}分
      `;
    } else {
      cooltimeStatus.innerHTML = 'クールタイムなし（実行可能）';
    }
    
    // 監視状態チェック
    const monitorStatus = document.getElementById('monitor-status');
    const isWodicon = isWodiconPage();
    const works = extractWorksList();
    
    monitorStatus.innerHTML = `
      ウディコンページ: ${isWodicon ? '✅' : '❌'}<br>
      検出作品数: ${works.length}件<br>
      URL: ${window.location.pathname}
    `;
    
  } catch (error) {
    debugLog(`❌ 状態更新エラー: ${error.message}`);
  }
}

// 初期化完了ログ
setTimeout(() => {
  console.log('🌊 ウディこん助 content script initialization completed');
  console.log('🔧 メッセージリスナー登録状況:', chrome.runtime.onMessage.hasListeners());
}, 1000);