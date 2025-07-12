// ウディこん助 ページ解析エンジン

class PageParser {
  constructor() {
    this.targetUrls = [
      'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml'
    ];
    this.parsePatterns = {
      // entry.shtml専用パターン（ウディコンページ対応）
      entryPage: {
        listSelector: 'body *',  // 全体をスキャン
        titleSelector: '',       // 正規表現でパース
        noSelector: '',          // 正規表現でパース
        updateSelector: '',      // 正規表現でパース
        versionSelector: '',     // 正規表現でパース
        linkSelector: ''         // 正規表現でパース
      },
      // テキストベースの直接解析（フォールバック）
      textBased: {
        useRegex: true  // 正規表現使用フラグ
      }
    };
  }

  // メインの解析メソッド（強化版）
  async parseContestPage(html, sourceUrl = '') {
    try {
      console.log('🔍 ウディコンページ解析開始:', sourceUrl);
      console.log('📄 HTML サイズ:', html.length, 'chars');
      console.log('📄 HTML プレビュー:', html.substring(0, 200));
      
      // 文字エンコーディングクリーニング
      const cleanedHtml = this.checkAndFixEncoding(html);
      
      // DOMParserを使用してHTMLを解析
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedHtml, 'text/html');
      
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
      const diagnosis = await this.diagnoseParsingIssues(cleanedHtml);
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
      if (patternName === 'entryPage') {
        // ウディコンページ専用の正規表現ベース解析
        //return this.parseEntryPageWithRegex(doc.body.textContent || doc.body.innerHTML);
        //return this.parseEntryPageWithRegex(doc.body.innerHTML);
        //return this.parseEntryPageWithRegex(doc.documentElement.outerHTML);
        return this.parseEntryPageWithRegex(doc.body.textContent);

      } else if (patternName === 'textBased') {
        // テキストベースの直接解析
        return this.parseWithDirectText(doc.body.textContent || doc.body.innerHTML);
      }
      
      // 従来のDOMベース解析（フォールバック）
      const entries = doc.querySelectorAll('*');
      console.log(`📊 ${patternName}: ${entries.length}個の要素を検出`);
      
      entries.forEach((entry, index) => {
        try {
          const text = entry.textContent?.trim();
          if (text && text.length > 10 && text.includes('作品') && text.includes('作者')) {
            const work = this.extractWorkDataFromText(text, index);
            if (work && work.title && work.title.length > 2) {
              works.push(work);
            }
          }
        } catch (error) {
          // エラーは静かに処理
        }
      });
      
    } catch (error) {
      console.error(`❌ パターン${patternName}解析エラー:`, error);
    }
    
    return works;
  }

  // ウディコンページの正規表現ベース解析
  parseEntryPageWithRegex(htmlText) {
    const works = [];
    const seenTitles = new Set(); // 重複防止
    // console.log("🧪 正規表現対象HTML冒頭:", htmlText.slice(0, 10000));

    try {
      console.log('🔍 正規表現ベース解析開始 (プレーンテキストモード)');

      // プレーンテキストからエントリー情報を抽出する正規表現
      // 各エントリーの固まりを捉え、コメント欄などから誤って情報を取得するのを防ぐ
      // 作者名の終わりを「プレイ時間」や「コメント:」で判断する
      const entryPattern = /エントリー番号【(\d+)】\s*『(.*?)』\s*【ダウンロード】\s*(.*?)\s*作者\s*:\s*(.*?)(?=\s*プレイ時間|\s*コメント:|$)/gs;

      let match;
      let foundCount = 0;

      while ((match = entryPattern.exec(htmlText)) !== null && foundCount < 100) { // 念のため上限
        try {
          const work = {
            no: match[1],                                 // グループ1: エントリー番号
            title: this.cleanText(match[2]),              // グループ2: タイトル
            lastUpdate: this.cleanText(match[3]),         // グループ3: バージョン・日付
            author: this.cleanText(match[4]),             // グループ4: 作者名
            tempId: `regex_entry_${foundCount}`,
            extractedAt: new Date().toISOString()
          };

          // 品質チェックと重複防止
          if (work && work.title && work.no && !seenTitles.has(work.title)) {
            seenTitles.add(work.title);
            work.url = `https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#${work.no}`;
            work.updateTimestamp = this.parseUpdateDate(work.lastUpdate);
            works.push(work);
            foundCount++;

            console.log(`✅ 正規表現作品登録: No.${work.no} 『${work.title}』 [${work.lastUpdate}] 作者：${work.author}`);
          } else if (seenTitles.has(work.title)) {
            console.log(`🔄 重複タイトルでスキップ: 『${work.title}』`);
          }

        } catch (error) {
          console.warn('⚠️ 作品データ処理エラー:', error.message, match);
        }
      }

      if (foundCount > 0) {
        console.log(`✨ 正規表現で${foundCount}件検出`);
      }
      
    } catch (error) {
      console.error('❌ 正規表現解析エラー:', error);
    }
    
    return works;
  }
  
  // テキストベースの直接解析（フォールバック）
  parseWithDirectText(htmlText) {
    const works = [];
    console.log("🧪 1正規表現対象HTML冒頭:", htmlText.slice(0, 1000));

    
    try {
      console.log('🔍 テキストベース直接解析開始');
      
      // シンプルなテキストパターン
      const lines = htmlText.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 数字で始まって日本語を含む行を探す
        const match = line.match(/^(\d+)*(.+)/m);
        if (match && match[2].length > 5) {
          const work = {
            no: match[1],
            title: this.cleanText(match[2]),
            tempId: `text_${i}`,
            extractedAt: new Date().toISOString(),
            url: `https://silversecond.com/WolfRPGEditor/Contest/entry.shtml#${match[1]}`
          };
          
          if (work.title.length > 2) {
            works.push(work);
            console.log(`✅ テキスト解析: No.${work.no} "${work.title}"`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ テキスト解析エラー:', error);
    }
    
    return works;
  }
  
  // テキストから作品データ抽出（既存コードとの互換性）
  extractWorkDataFromText(text, index) {
    const work = {
      tempId: `text_extract_${Date.now()}_${index}`,
      extractedAt: new Date().toISOString()
    };
    
    // シンプルなパターンマッチング
    const patterns = [
      /(々々)\s*(.+?)\s*作者.*?(.+?)\s*\[(.+?)\]/i,
      /(\d+)\s*(.+?)\s*\[(.+?)\]/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        work.no = match[1];
        work.title = this.cleanText(match[2]);
        if (match[4]) {
          work.lastUpdate = this.cleanText(match[4]);
        } else if (match[3]) {
          work.lastUpdate = this.cleanText(match[3]);
        }
        break;
      }
    }
    
    return work.title && work.title.length > 2 ? work : null;
  }

  // テキストサニタイズ（既存）
  sanitizeText(text) {
    if (!text) return '';
    return text.trim()
               .replace(/\s+/g, ' ')
               .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u002D\u0028-\u0029]/g, '')
               .substring(0, 200);
  }
  
  // テキストクリーニング（新規・文字化け対応）
  cleanText(text) {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // 制御文字削除
      .replace(/\s+/g, ' ') // 連続空白正規化
      .replace(/^[\s\u3000]*/, '') // 先頭空白削除
      .replace(/[\s\u3000]*$/, '') // 末尾空白削除
      .substring(0, 100); // 長さ制限
  }

  // 作品番号抽出（URL）
  extractWorkNumber(url) {
    if (!url) return null;
    
    // #1, entry.shtml?id=1 などのパターンに対応
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
      /^(\d+)$/,          // 1（数字のみ）
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

  // 更新日時パース（強化版）
  parseUpdateDate(dateText) {
    if (!dateText) return null;
    
    try {
      // ウディコン形式: [6/24] 等のパターンに対応
      const patterns = [
        /\[(\d{1,2})\/(\d{1,2})\]/, // [6/24] 形式
        /\[(\d{1,2})-(\d{1,2})\]/, // [6-24] 形式
        /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,  // 2025-01-01, 2025/1/1
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,  // 01-01-2025, 1/1/2025
        /(\d{4})年(\d{1,2})月(\d{1,2})日/       // 2025年1月1日
      ];
      
      for (const pattern of patterns) {
        const match = dateText.match(pattern);
        if (match) {
          let year, month, day;
          
          if (pattern.source.includes('\\[')) {
            // [6/24] 形式の場合、現在の年を使用
            year = new Date().getFullYear();
            month = parseInt(match[1]);
            day = parseInt(match[2]);
          } else if (pattern.source.startsWith('(\\d{4})')) {
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

  // シフトJISエンコーディングチェック・修正
  checkAndFixEncoding(html) {
    try {
      // 文字化けの一般的なパターンを検出
      const garbledPatterns = [
        /[\ufffd\u0080-\u009f]/g, // 置換文字や制御文字
        /[ -]/g, // NULL文字等
      ];
      
      let cleanedHtml = html;
      
      for (const pattern of garbledPatterns) {
        cleanedHtml = cleanedHtml.replace(pattern, '');
      }
      
      console.log('🧽 文字エンコーディングクリーニング完了');
      return cleanedHtml;
      
    } catch (error) {
      console.warn('⚠️ エンコーディングクリーニング失敗:', error);
      return html;
    }
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

      // ウディコン固有のパターンチェック
      const wodIconSelectors = [
        'エントリー番号', // ウディコン特有テキスト
        '作者', // 作者情報
        'WolfRPGEditor', // サイト名
        'Contest' // コンテスト情報
      ];
      
      diagnosis.info.wodIconElements = {};
      wodIconSelectors.forEach(keyword => {
        const found = html.includes(keyword);
        diagnosis.info.wodIconElements[keyword] = found;
        if (!found) {
          diagnosis.issues.push(`ウディコンキーワードが見つかりません: ${keyword}`);
        }
      });
      
      // 文字化けチェック
      const garbledChars = html.match(/[\ufffd\u0080-\u009f]/g);
      if (garbledChars) {
        diagnosis.issues.push(`文字化けを検出: ${garbledChars.length}文字`);
        diagnosis.suggestions.push('シフトJISエンコーディングの見直しが必要');
      }
      
      if (diagnosis.issues.length === 0) {
        diagnosis.suggestions.push('ページ構造は正常、解析ロジックを確認してください');
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

console.log('🔍 PageParser 強化版読み込み完了 - ウディコンページ対応');