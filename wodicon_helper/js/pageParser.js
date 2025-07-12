// ウディこん助 ページ解析エンジン

class PageParser {
  constructor() {
    this.targetUrls = [
      'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml'
    ];
    this.parsePatterns = {
      // entry.shtml専用パターン（No、作品名、更新日時、バージョン対応）
      entryPage: {
        listSelector: 'table tr, .entry-row, [class*="entry"]',
        titleSelector: 'a, .title, td:nth-child(2)',
        noSelector: 'a[href*="#"], td:nth-child(1), .number',
        updateSelector: 'td:nth-child(3), .date, .updated, [class*="update"]',
        versionSelector: 'td:nth-child(4), .version, [class*="version"]',
        linkSelector: 'a[href*="#"]'
      },
      // 従来パターン（フォールバック用）
      legacy1: {
        listSelector: 'table tr',
        titleSelector: 'a',
        authorSelector: 'td:nth-child(2)',
        updateSelector: 'td:nth-child(3)',
        linkSelector: 'a[href*="entry.shtml"]'
      },
      legacy2: {
        listSelector: '.work-entry, [class*="entry"]',
        titleSelector: '.title, a',
        authorSelector: '.author',
        updateSelector: '.updated, [class*="update"], [class*="date"]',
        linkSelector: 'a'
      }
    };
  }

  // メインの解析メソッド
  async parseContestPage(html, sourceUrl = '') {
    try {
      // DOMParserを使用してHTMLを解析
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      console.log('🔍 ページ解析開始:', sourceUrl);
      
      // 複数パターンで解析を試行
      for (const [patternName, pattern] of Object.entries(this.parsePatterns)) {
        console.log(`📋 パターン${patternName}で解析試行`);
        
        const works = await this.parseWithPattern(doc, pattern, patternName);
        if (works.length > 0) {
          console.log(`✅ パターン${patternName}で${works.length}件の作品を検出`);
          
          // 詳細情報出力
          console.group('📊 取得された作品情報詳細:');
          works.slice(0, 3).forEach((work, i) => {
            console.log(`作品${i+1}:`, {
              no: work.no,
              title: work.title,
              author: work.author,
              lastUpdate: work.lastUpdate,
              url: work.url,
              extractedAt: work.extractedAt
            });
          });
          if (works.length > 3) {
            console.log(`... 他${works.length - 3}件`);
          }
          console.groupEnd();
          
          return {
            success: true,
            works: works,
            pattern: patternName,
            timestamp: new Date().toISOString(),
            sourceUrl: sourceUrl
          };
        }
      }
      
      // 全パターンで失敗した場合
      console.warn('⚠️ 全ての解析パターンで作品を検出できませんでした');
      
      // 診断情報を出力
      const diagnosis = await this.diagnoseParsingIssues(html);
      console.group('🔍 ページ構造診断:');
      console.log('基本情報:', diagnosis.info);
      console.log('検出された問題:', diagnosis.issues);
      console.log('推奨対策:', diagnosis.suggestions);
      console.groupEnd();
      
      return {
        success: false,
        works: [],
        error: 'No works detected with any pattern',
        diagnosis: diagnosis,
        timestamp: new Date().toISOString(),
        sourceUrl: sourceUrl
      };
      
    } catch (error) {
      console.error('❌ ページ解析エラー:', error);
      return {
        success: false,
        works: [],
        error: error.message,
        timestamp: new Date().toISOString(),
        sourceUrl: sourceUrl
      };
    }
  }

  // 指定パターンでの解析
  async parseWithPattern(doc, pattern, patternName) {
    const works = [];
    
    try {
      const entries = doc.querySelectorAll(pattern.listSelector);
      console.log(`📊 ${patternName}: ${entries.length}個の要素を検出`);
      
      entries.forEach((entry, index) => {
        try {
          const work = this.extractWorkData(entry, pattern, index);
          if (work && work.title && work.title.length > 2) {
            works.push(work);
          }
        } catch (error) {
          console.warn(`⚠️ 作品データ抽出エラー (${index}):`, error.message);
        }
      });
      
    } catch (error) {
      console.error(`❌ パターン${patternName}解析エラー:`, error);
    }
    
    return works;
  }

  // 作品データ抽出
  extractWorkData(element, pattern, index) {
    const work = {
      tempId: `temp_${Date.now()}_${index}`,
      extractedAt: new Date().toISOString()
    };

    // 作品番号抽出（専用セレクタがある場合は優先）
    if (pattern.noSelector) {
      const noElement = element.querySelector(pattern.noSelector);
      if (noElement) {
        if (noElement.href) {
          work.no = this.extractWorkNumber(noElement.href);
        } else {
          work.no = this.extractWorkNumberFromText(noElement.textContent);
        }
      }
    }

    // タイトル抽出
    const titleElement = element.querySelector(pattern.titleSelector);
    if (titleElement) {
      work.title = this.sanitizeText(titleElement.textContent);
    }

    // 作者名抽出（存在する場合のみ）
    if (pattern.authorSelector) {
      const authorElement = element.querySelector(pattern.authorSelector);
      if (authorElement) {
        work.author = this.sanitizeText(authorElement.textContent);
      }
    }

    // 更新日時抽出
    const updateElement = element.querySelector(pattern.updateSelector);
    if (updateElement) {
      work.lastUpdate = this.sanitizeText(updateElement.textContent);
      work.updateTimestamp = this.parseUpdateDate(work.lastUpdate);
    }

    // バージョン抽出（存在する場合のみ）
    if (pattern.versionSelector) {
      const versionElement = element.querySelector(pattern.versionSelector);
      if (versionElement) {
        work.version = this.sanitizeText(versionElement.textContent);
      }
    }

    // リンクURL抽出（作品番号が未取得の場合）
    if (!work.no) {
      const linkElement = element.querySelector(pattern.linkSelector);
      if (linkElement && linkElement.href) {
        work.url = linkElement.href;
        work.no = this.extractWorkNumber(work.url);
      }
    }

    // 最低限の情報が揃っているかチェック（作品名は必須、作品番号は可能であれば）
    if (!work.title || work.title.length < 2) {
      return null;
    }

    // 作品番号を文字列として保持（ゼロパディングなし）
    if (work.no) {
      work.no = String(work.no);
    }

    return work;
  }

  // テキストサニタイズ
  sanitizeText(text) {
    if (!text) return '';
    return text.trim()
               .replace(/\s+/g, ' ')
               .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u002D\u0028-\u0029]/g, '')
               .substring(0, 200); // 長すぎるテキストを制限
  }

  // 作品番号抽出（URL）
  extractWorkNumber(url) {
    if (!url) return null;
    
    // #1, #001, entry.shtml?id=1 などのパターンに対応
    const patterns = [
      /#(\d+)/,           // #1
      /id=(\d+)/,         // ?id=1
      /entry(\d+)/,       // entry1
      /work(\d+)/         // work1
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return null;
  }

  // 作品番号抽出（テキスト）
  extractWorkNumberFromText(text) {
    if (!text) return null;
    
    // テキストから数字を抽出（No.1、1番、001など）
    const patterns = [
      /No\.?(\d+)/i,      // No.1, No1
      /(\d+)番/,          // 1番
      /^(\d+)$/,          // 001（数字のみ）
      /第(\d+)作/,        // 第1作
      /作品(\d+)/         // 作品1
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return null;
  }

  // 更新日時パース
  parseUpdateDate(dateText) {
    if (!dateText) return null;
    
    try {
      // 様々な日時フォーマットに対応
      const patterns = [
        /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,  // 2025-01-01, 2025/1/1
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,  // 01-01-2025, 1/1/2025
        /(\d{4})年(\d{1,2})月(\d{1,2})日/       // 2025年1月1日
      ];
      
      for (const pattern of patterns) {
        const match = dateText.match(pattern);
        if (match) {
          let year, month, day;
          
          if (pattern.source.startsWith('(\\d{4})')) {
            [, year, month, day] = match;
          } else if (pattern.source.includes('年')) {
            [, year, month, day] = match;
          } else {
            [, month, day, year] = match;
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
      }
      
      // ISO形式をそのまま試行
      const isoDate = new Date(dateText);
      if (!isNaN(isoDate.getTime())) {
        return isoDate.toISOString();
      }
      
    } catch (error) {
      console.warn('⚠️ 日付解析エラー:', dateText, error.message);
    }
    
    return null;
  }

  // 差分検出（既存データとの比較）
  async detectChanges(newWorks, existingWorks) {
    const changes = {
      newWorks: [],      // 新規作品
      updatedWorks: [],  // 更新作品
      unchangedWorks: [], // 変更なし
      timestamp: new Date().toISOString()
    };

    try {
      // 既存作品のマップを作成（作品番号をキー）
      const existingMap = new Map();
      existingWorks.forEach(work => {
        if (work.no) {
          existingMap.set(work.no, work);
        }
      });

      // 新しい作品データをチェック
      newWorks.forEach(newWork => {
        if (!newWork.no) return;

        const existing = existingMap.get(newWork.no);
        
        if (!existing) {
          // 新規作品
          changes.newWorks.push(newWork);
        } else {
          // 既存作品の更新チェック
          const hasChanges = this.checkWorkChanges(newWork, existing);
          
          if (hasChanges) {
            changes.updatedWorks.push({
              ...newWork,
              previousData: existing,
              changeType: hasChanges
            });
          } else {
            changes.unchangedWorks.push(newWork);
          }
        }
      });

      console.log(`📊 差分検出結果: 新規${changes.newWorks.length}件, 更新${changes.updatedWorks.length}件, 変更なし${changes.unchangedWorks.length}件`);
      
    } catch (error) {
      console.error('❌ 差分検出エラー:', error);
      changes.error = error.message;
    }

    return changes;
  }

  // 作品変更チェック
  checkWorkChanges(newWork, existingWork) {
    const changes = [];

    // タイトル変更
    if (newWork.title !== existingWork.title) {
      changes.push('title');
    }

    // 作者変更
    if (newWork.author !== existingWork.author) {
      changes.push('author');
    }

    // 更新日時変更
    if (newWork.updateTimestamp && existingWork.updateTimestamp) {
      const newDate = new Date(newWork.updateTimestamp);
      const existingDate = new Date(existingWork.updateTimestamp);
      if (newDate > existingDate) {
        changes.push('updated');
      }
    }

    return changes.length > 0 ? changes : null;
  }

  // エラー診断
  async diagnoseParsingIssues(html) {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      issues: [],
      suggestions: []
    };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // HTML構造の基本チェック
      if (!doc.body) {
        diagnosis.issues.push('HTML body not found');
        diagnosis.suggestions.push('Check if the response is valid HTML');
      }

      // テーブル構造チェック
      const tables = doc.querySelectorAll('table');
      const tableRows = doc.querySelectorAll('table tr');
      diagnosis.info = {
        tables: tables.length,
        tableRows: tableRows.length,
        links: doc.querySelectorAll('a').length,
        entryLinks: doc.querySelectorAll('a[href*="entry"]').length
      };

      // 一般的な要素の存在チェック
      const commonSelectors = [
        'table tr',
        '.work-entry',
        '[class*="entry"]',
        'a[href*="entry"]'
      ];

      commonSelectors.forEach(selector => {
        const elements = doc.querySelectorAll(selector);
        if (elements.length === 0) {
          diagnosis.issues.push(`No elements found for selector: ${selector}`);
        }
      });

      if (diagnosis.issues.length === 0) {
        diagnosis.suggestions.push('HTML structure seems valid, check parsing logic');
      }

    } catch (error) {
      diagnosis.issues.push(`HTML parsing failed: ${error.message}`);
      diagnosis.suggestions.push('Check if the response is valid HTML content');
    }

    return diagnosis;
  }

  // 設定取得
  getTargetUrls() {
    return [...this.targetUrls];
  }

  // 設定更新
  updateTargetUrls(urls) {
    if (Array.isArray(urls) && urls.length > 0) {
      this.targetUrls = urls.filter(url => typeof url === 'string' && url.trim().length > 0);
      return true;
    }
    return false;
  }
}

// グローバルインスタンス
window.pageParser = new PageParser();

console.log('🔍 PageParser loaded successfully');