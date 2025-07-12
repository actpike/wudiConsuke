// ウディこん助 メインスクリプト

class GameListManager {
  constructor() {
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.games = [];
    this.currentSort = 'no';
    this.sortDirection = 'asc';
  }

  // 初期化
  async initialize() {
    await window.gameDataManager.initialize();
    this.setupEventListeners();
    this.updateSortHeaders();
    await this.refreshList();
  }

  // イベントリスナー設定
  setupEventListeners() {
    // フィルタボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // 検索
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.setSearch(e.target.value);
    });

    document.getElementById('search-btn').addEventListener('click', () => {
      this.performSearch();
    });

    // 評価スライダー
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('rating-slider')) {
        window.navigationController.updateTotalRating();
        window.navigationController.markAsChanged();
      }
    });

    // 感想テキストエリア
    document.getElementById('review-textarea').addEventListener('input', () => {
      window.navigationController.updateCharacterCount();
      window.navigationController.markAsChanged();
    });

    // ヘッダーボタン
    document.getElementById('background-update-btn').addEventListener('click', () => {
      this.performBackgroundUpdate();
    });

    document.getElementById('settings-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('help-btn').addEventListener('click', () => {
      this.showHelp();
    });

    // ソート機能
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', (e) => {
        const sortKey = e.target.dataset.sort;
        this.toggleSort(sortKey);
      });
    });

    // Web監視テスト機能
    document.getElementById('manual-monitor-btn').addEventListener('click', () => {
      this.performManualMonitoring();
    });

    document.getElementById('monitor-status-btn').addEventListener('click', () => {
      this.showMonitoringStatus();
    });

    document.getElementById('parse-info-btn').addEventListener('click', () => {
      this.showParsingInfo();
    });

    document.getElementById('integration-test-btn').addEventListener('click', () => {
      this.performIntegrationTest();
    });

    document.getElementById('test-bg-update-btn').addEventListener('click', () => {
      this.performTestBackgroundUpdate();
    });

    document.getElementById('cleanup-test-data-btn').addEventListener('click', () => {
      this.cleanupTestData();
    });

    document.getElementById('show-html-btn').addEventListener('click', () => {
      this.showHtmlData();
    });

    // 監視チェックボックス
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('monitor-checkbox')) {
        this.handleMonitoringToggle(e.target);
      }
    });
  }

  // フィルタ設定
  async setFilter(filter) {
    this.currentFilter = filter;
    
    // ボタンのアクティブ状態更新
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });

    await this.refreshList();
  }

  // 検索設定
  setSearch(query) {
    this.currentSearch = query;
    this.debounceSearch();
  }

  // 検索実行（デバウンス）
  debounceSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  // 検索実行
  async performSearch() {
    await this.refreshList();
  }

  // ソート切り替え
  toggleSort(sortKey) {
    if (this.currentSort === sortKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = sortKey;
      this.sortDirection = 'desc'; // 最初のクリックは降順
    }
    this.updateSortHeaders();
    this.refreshList();
  }

  // ソートヘッダー更新
  updateSortHeaders() {
    document.querySelectorAll('.sortable').forEach(header => {
      header.classList.remove('asc', 'desc');
      const icon = header.querySelector('.sort-icon');
      if (icon) {
        icon.textContent = '↕';
      }
    });

    const activeHeader = document.querySelector(`[data-sort="${this.currentSort}"]`);
    if (activeHeader) {
      activeHeader.classList.add(this.sortDirection);
      const icon = activeHeader.querySelector('.sort-icon');
      if (icon) {
        icon.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
      }
    }
  }

  // リスト更新
  async refreshList() {
    try {
      this.showLoading(true);

      // データ取得
      let games = await window.gameDataManager.getGames();

      // フィルタ適用
      if (this.currentFilter !== 'all') {
        games = await window.gameDataManager.filterGames(this.currentFilter);
      }

      // 検索適用
      if (this.currentSearch.trim()) {
        games = games.filter(game => 
          game.title.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
          game.author.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
          game.genre.toLowerCase().includes(this.currentSearch.toLowerCase())
        );
      }

      // ソート適用
      games = this.sortGames(games);

      this.games = games;
      this.renderGameList(games);
      await this.updateStatusBar();

    } catch (error) {
      console.error('Failed to refresh list:', error);
      this.showError('リストの更新に失敗しました');
    } finally {
      this.showLoading(false);
    }
  }

  // ゲームソート
  sortGames(games) {
    return games.sort((a, b) => {
      let aValue, bValue;
      
      switch (this.currentSort) {
        case 'no':
          aValue = parseInt(a.no);
          bValue = parseInt(b.no);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case '熱中度':
        case '斬新さ':
        case '物語性':
        case '画像音声':
        case '遊びやすさ':
        case 'その他':
          aValue = a.rating ? (a.rating[this.currentSort] || 0) : 0;
          bValue = b.rating ? (b.rating[this.currentSort] || 0) : 0;
          break;
        default:
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  // ゲームリスト描画
  renderGameList(games) {
    const tbody = document.getElementById('game-list-body');
    
    if (games.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
            ${this.currentSearch ? '検索結果がありません' : 'ゲームが登録されていません'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = games.map(game => this.createGameRowHTML(game)).join('');
  }

  // ゲーム行HTML生成
  createGameRowHTML(game) {
    const monitoringChecked = game.web_monitoring_enabled ? 'checked' : '';
    const versionIcon = this.getVersionIcon(game.version_status);
    const ratingDisplay = this.formatRatingDisplay(game.rating);
    const rowClass = game.is_played ? 'game-row played' : 'game-row';

    return `
      <tr class="${rowClass}" data-game-id="${game.id}">
        <td class="col-check">
          <input type="checkbox" class="monitor-checkbox" data-game-id="${game.id}" ${monitoringChecked}>
        </td>
        <td class="col-no">${game.no}</td>
        <td class="col-title">
          <span class="game-title" title="${game.title}">${game.title}</span>
        </td>
        <td class="col-ver">
          <span class="version-status">${versionIcon}</span>
        </td>
        <td class="col-rating">${game.rating?.熱中度 || '-'}</td>
        <td class="col-rating">${game.rating?.斬新さ || '-'}</td>
        <td class="col-rating">${game.rating?.物語性 || '-'}</td>
        <td class="col-rating">${game.rating?.画像音声 || '-'}</td>
        <td class="col-rating">${game.rating?.遊びやすさ || '-'}</td>
        <td class="col-rating">${game.rating?.その他 || '-'}</td>
      </tr>
    `;
  }

  // バージョンアイコン取得
  getVersionIcon(status) {
    switch (status) {
      case 'new': return '🆕';
      case 'updated': return '🔔';
      case 'latest': return '✅';
      default: return '✅';
    }
  }

  // 評価表示フォーマット
  formatRatingDisplay(rating) {
    if (!rating || rating.total === 0) {
      return '-/-/-/-/-/-';
    }
    
    return `${rating.熱中度}/${rating.斬新さ}/${rating.物語性}/${rating.画像音声}/${rating.遊びやすさ}/${rating.その他}`;
  }

  // ステータスバー更新
  async updateStatusBar() {
    try {
      const stats = await window.gameDataManager.getStatistics();
      const filteredCount = this.games.length;
      const totalCount = stats.total_games;

      let statusText = '';
      if (this.currentSearch) {
        statusText = `📊 検索結果: ${filteredCount}件`;
      } else if (this.currentFilter === 'all') {
        statusText = `📊 評価済み: ${stats.played_games}/${totalCount}作品`;
      } else {
        statusText = `📊 ${this.getFilterName(this.currentFilter)}: ${filteredCount}作品`;
      }

      if (stats.played_games > 0) {
        statusText += ` | 平均: ${stats.average_score}点`;
      }

      document.getElementById('status-text').textContent = statusText;

    } catch (error) {
      console.error('Failed to update status bar:', error);
      document.getElementById('status-text').textContent = 'ステータス更新失敗';
    }
  }

  // フィルタ名取得
  getFilterName(filter) {
    const names = {
      'played': '評価済み',
      'unplayed': '未評価',
      'new': '新着',
      'updated': '更新あり'
    };
    return names[filter] || filter;
  }

  // データエクスポート
  async exportData() {
    try {
      const data = await window.gameDataManager.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const filename = `wodicon_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });

      this.showMessage('✅ データエクスポート完了');

    } catch (error) {
      console.error('Export failed:', error);
      this.showError('エクスポートに失敗しました');
    }
  }

  // ヘルプ表示
  showHelp() {
    const helpText = `
🌊 ウディこん助 使い方

【基本操作】
• 作品行をクリック → 詳細画面へ
• 👈戻るボタン → メイン画面に戻る

【評価システム】
• 6項目×10点制（ウディコン公式準拠）
• 評価完了で自動的に既プレイフラグON

【自動保存】
• 3秒間隔で自動保存
• 画面遷移時も自動保存

【ローカルフォルダ】
• file://アクセス権限の設定が必要
• Chrome拡張機能設定で有効化してください

【データ管理】
• 📤ボタンでデータエクスポート
• 設定画面でインポート可能
    `;
    
    alert(helpText);
  }

  // Web監視手動実行
  async performManualMonitoring() {
    const btn = document.getElementById('manual-monitor-btn');
    const resultDiv = document.getElementById('monitor-result');
    const contentDiv = document.getElementById('monitor-result-content');

    try {
      btn.disabled = true;
      btn.textContent = '🔄 監視実行中...';
      
      console.log('🔍 手動Web監視開始');
      
      // Web監視実行
      const result = await window.webMonitor.manualCheck();
      
      // 結果表示
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = this.formatMonitoringResult(result);
      
      // リスト更新
      await this.refreshList();
      
      console.log('✅ 手動Web監視完了:', result);
      
    } catch (error) {
      console.error('❌ 手動Web監視エラー:', error);
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = `エラー: ${error.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🔍 手動監視実行';
    }
  }

  // 監視状態表示
  async showMonitoringStatus() {
    const resultDiv = document.getElementById('monitor-result');
    const contentDiv = document.getElementById('monitor-result-content');

    try {
      // Web監視ステータス取得
      const webStatus = window.webMonitor.getStatus();
      const updateStatus = window.updateManager.getStatus();
      const diagnostics = await window.webMonitor.getDiagnostics();

      // ステータス情報をフォーマット
      const statusText = this.formatStatusInfo(webStatus, updateStatus, diagnostics);
      
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = statusText;
      
    } catch (error) {
      console.error('❌ 監視状態取得エラー:', error);
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = `ステータス取得エラー: ${error.message}`;
    }
  }

  // 監視結果フォーマット
  formatMonitoringResult(result) {
    if (!result) {
      return '監視結果が取得できませんでした';
    }

    if (!result.success) {
      return `監視エラー: ${result.error || '不明なエラー'}`;
    }

    const lines = [
      `✅ 監視完了 [${result.checkId}]`,
      `実行時間: ${new Date(result.timestamp).toLocaleString()}`,
      '',
      `🆕 新規作品: ${result.newWorks ? result.newWorks.length : 0}件`,
      `🔄 更新作品: ${result.updatedWorks ? result.updatedWorks.length : 0}件`
    ];

    if (result.newWorks && result.newWorks.length > 0) {
      lines.push('', '【新規作品】');
      result.newWorks.forEach(work => {
        lines.push(`• ${work.title} (No.${work.no})`);
      });
    }

    if (result.updatedWorks && result.updatedWorks.length > 0) {
      lines.push('', '【更新作品】');
      result.updatedWorks.forEach(work => {
        lines.push(`• ${work.title} (No.${work.no})`);
      });
    }

    return lines.join('\n');
  }

  // ステータス情報フォーマット
  formatStatusInfo(webStatus, updateStatus, diagnostics) {
    const lines = [
      '📊 Web監視ステータス',
      '',
      `監視状態: ${webStatus.isMonitoring ? '✅ 有効' : '❌ 無効'}`,
      `監視間隔: ${webStatus.monitoringInterval}分`,
      `監視モード: ${webStatus.monitoringMode}`,
      `注目作品数: ${webStatus.selectedWorksCount}件`,
      `最終チェック: ${webStatus.lastCheckTime ? new Date(webStatus.lastCheckTime).toLocaleString() : '未実行'}`,
      `連続エラー: ${webStatus.consecutiveErrors}回`,
      '',
      '📬 通知設定',
      `通知: ${updateStatus.notificationSettings.enabled ? '✅ 有効' : '❌ 無効'}`,
      `新規作品通知: ${updateStatus.notificationSettings.showNewWorks ? '✅' : '❌'}`,
      `更新作品通知: ${updateStatus.notificationSettings.showUpdatedWorks ? '✅' : '❌'}`,
      `更新マーカー数: ${updateStatus.updateMarkersCount}件`,
      ''
    ];

    if (diagnostics && diagnostics.recentHistory) {
      lines.push('📈 最近の監視履歴');
      if (diagnostics.recentHistory.length === 0) {
        lines.push('履歴なし');
      } else {
        diagnostics.recentHistory.slice(0, 3).forEach(history => {
          const time = new Date(history.timestamp).toLocaleTimeString();
          const newCount = history.newWorks ? history.newWorks.length : 0;
          const updateCount = history.updatedWorks ? history.updatedWorks.length : 0;
          lines.push(`${time}: 新規${newCount}件, 更新${updateCount}件`);
        });
      }
    }

    return lines.join('\n');
  }

  // ページ解析情報表示
  async showParsingInfo() {
    const resultDiv = document.getElementById('monitor-result');
    const contentDiv = document.getElementById('monitor-result-content');

    try {
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = '🔍 ページ解析情報を取得中...';

      // 現在のタブ情報取得
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      let parseInfo = {
        currentUrl: currentTab?.url || 'Unknown',
        title: currentTab?.title || 'Unknown',
        isWodiconPage: false,
        parseResult: null,
        error: null
      };

      // ウディコンページかチェック
      if (currentTab?.url?.includes('silversecond.com')) {
        parseInfo.isWodiconPage = true;
        
        try {
          // Content Scriptに解析を依頼
          const result = await chrome.tabs.sendMessage(currentTab.id, {
            action: 'parse_current_page'
          });
          
          parseInfo.parseResult = result;
          
        } catch (error) {
          parseInfo.error = error.message;
        }
      }

      // Web監視の最新結果も取得
      const lastResult = window.webMonitor?.lastResult;

      // 結果を表示
      contentDiv.innerHTML = this.formatParsingInfo(parseInfo, lastResult);
      
    } catch (error) {
      console.error('❌ 解析情報表示エラー:', error);
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = `解析情報取得エラー: ${error.message}`;
    }
  }

  // 解析情報フォーマット
  formatParsingInfo(parseInfo, lastResult) {
    const lines = [
      '📋 ページ解析情報',
      '',
      `現在のURL: ${parseInfo.currentUrl}`,
      `ページタイトル: ${parseInfo.title}`,
      `ウディコンページ: ${parseInfo.isWodiconPage ? '✅' : '❌'}`,
      ''
    ];

    if (parseInfo.error) {
      lines.push('❌ 解析エラー:', parseInfo.error);
    } else if (parseInfo.parseResult) {
      const result = parseInfo.parseResult;
      lines.push(
        `解析結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`,
        `検出作品数: ${result.works?.length || 0}件`,
        `解析時刻: ${result.timestamp ? new Date(result.timestamp).toLocaleString() : '不明'}`,
        ''
      );

      if (result.works && result.works.length > 0) {
        lines.push('📊 検出された作品 (最初の3件):');
        result.works.slice(0, 3).forEach((work, i) => {
          lines.push(
            `${i+1}. No.${work.no || '---'} ${work.title || '無題'}`,
            `   作者: ${work.author || '不明'}`,
            `   URL: ${work.url || 'なし'}`,
            ''
          );
        });
        
        if (result.works.length > 3) {
          lines.push(`... 他 ${result.works.length - 3} 件`);
        }
      }

      if (result.diagnosis) {
        lines.push('', '🔍 診断情報:');
        if (result.diagnosis.info) {
          lines.push(`テーブル数: ${result.diagnosis.info.tables || 0}`);
          lines.push(`テーブル行数: ${result.diagnosis.info.tableRows || 0}`);
          lines.push(`リンク数: ${result.diagnosis.info.links || 0}`);
          lines.push(`エントリーリンク数: ${result.diagnosis.info.entryLinks || 0}`);
        }
      }
    }

    if (lastResult) {
      lines.push('', '🔍 最新監視結果:', `最終チェック: ${lastResult.timestamp ? new Date(lastResult.timestamp).toLocaleString() : '不明'}`);
      lines.push(`新規: ${lastResult.newWorks?.length || 0}件, 更新: ${lastResult.updatedWorks?.length || 0}件`);
    }

    return `<pre style="white-space: pre-wrap; font-size: 11px;">${lines.join('\n')}</pre>`;
  }

  // 統合テスト実行
  async performIntegrationTest() {
    const btn = document.getElementById('integration-test-btn');
    const resultDiv = document.getElementById('monitor-result');
    const contentDiv = document.getElementById('monitor-result-content');

    try {
      btn.disabled = true;
      btn.textContent = '🧪 統合テスト実行中...';
      
      console.log('🧪 統合テスト開始');
      
      const testResults = await this.runIntegrationTests();
      
      // 結果表示
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = this.formatIntegrationTestResults(testResults);
      
      console.log('✅ 統合テスト完了:', testResults);
      
    } catch (error) {
      console.error('❌ 統合テストエラー:', error);
      resultDiv.classList.remove('hidden');
      contentDiv.textContent = `統合テストエラー: ${error.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🧪 統合テスト実行';
    }
  }

  // 統合テスト実行ロジック
  async runIntegrationTests() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0 }
    };

    // テスト1: データ管理機能
    results.tests.push(await this.testDataManagement());
    
    // テスト2: Web監視基盤
    results.tests.push(await this.testWebMonitoringSystem());
    
    // テスト3: 設定機能
    results.tests.push(await this.testSettingsSystem());
    
    // テスト4: 通知システム
    results.tests.push(await this.testNotificationSystem());
    
    // テスト5: UI統合
    results.tests.push(await this.testUIIntegration());

    // 集計
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'passed').length;
    results.summary.failed = results.tests.filter(t => t.status === 'failed').length;

    return results;
  }

  // データ管理テスト
  async testDataManagement() {
    try {
      // ゲームデータ取得テスト
      const games = await window.gameDataManager.getGames();
      if (!Array.isArray(games) || games.length === 0) {
        throw new Error('ゲームデータが取得できません');
      }

      // 監視フラグ更新テスト
      const testGame = games[0];
      const originalFlag = testGame.web_monitoring_enabled;
      
      await window.gameDataManager.updateWebMonitoringFlag(testGame.id, !originalFlag);
      const updatedGame = await window.gameDataManager.getGame(testGame.id);
      
      if (updatedGame.web_monitoring_enabled === originalFlag) {
        throw new Error('監視フラグ更新が反映されていません');
      }

      // 元に戻す
      await window.gameDataManager.updateWebMonitoringFlag(testGame.id, originalFlag);

      // 作品番号正規化テスト
      const normalizeResult = await window.gameDataManager.normalizeWorkNumbers();

      return {
        name: 'データ管理機能',
        status: 'passed',
        details: `ゲーム数: ${games.length}, フラグ更新: OK, 正規化: ${normalizeResult ? '実行' : 'スキップ'}`
      };
    } catch (error) {
      return {
        name: 'データ管理機能',
        status: 'failed',
        details: error.message
      };
    }
  }

  // Web監視システムテスト
  async testWebMonitoringSystem() {
    try {
      // 監視システムの初期化確認
      if (!window.webMonitor) {
        throw new Error('WebMonitorインスタンスが存在しません');
      }
      if (!window.pageParser) {
        throw new Error('PageParserインスタンスが存在しません');
      }
      if (!window.updateManager) {
        throw new Error('UpdateManagerインスタンスが存在しません');
      }

      // ステータス取得テスト
      const status = window.webMonitor.getStatus();
      if (!status || typeof status !== 'object') {
        throw new Error('監視ステータスが取得できません');
      }

      // 診断情報取得テスト
      const diagnostics = await window.webMonitor.getDiagnostics();
      if (!diagnostics) {
        throw new Error('診断情報が取得できません');
      }

      return {
        name: 'Web監視システム',
        status: 'passed',
        details: `監視状態: ${status.isMonitoring ? 'ON' : 'OFF'}, 診断: OK`
      };
    } catch (error) {
      return {
        name: 'Web監視システム',
        status: 'failed',
        details: error.message
      };
    }
  }

  // 設定システムテスト
  async testSettingsSystem() {
    try {
      // ストレージ読み込みテスト
      const result = await chrome.storage.local.get(['web_monitor_settings', 'update_manager_settings']);
      
      const webSettings = result.web_monitor_settings || {};
      const updateSettings = result.update_manager_settings || {};

      // デフォルト値テスト
      const expectedFields = ['mode', 'interval', 'checkOnStartup'];
      for (const field of expectedFields) {
        if (!(field in webSettings)) {
          console.warn(`設定フィールド不足: ${field}`);
        }
      }

      return {
        name: '設定システム',
        status: 'passed',
        details: `Web設定: ${Object.keys(webSettings).length}項目, 通知設定: ${Object.keys(updateSettings).length}項目`
      };
    } catch (error) {
      return {
        name: '設定システム',
        status: 'failed',
        details: error.message
      };
    }
  }

  // 通知システムテスト
  async testNotificationSystem() {
    try {
      // 通知権限確認
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('通知権限が許可されていません');
      }

      // UpdateManagerのステータス取得
      const status = window.updateManager.getStatus();
      if (!status || typeof status !== 'object') {
        throw new Error('UpdateManagerステータスが取得できません');
      }

      return {
        name: '通知システム',
        status: 'passed',
        details: `通知権限: ${permission}, 設定状態: OK`
      };
    } catch (error) {
      return {
        name: '通知システム',
        status: 'failed',
        details: error.message
      };
    }
  }

  // UI統合テスト
  async testUIIntegration() {
    try {
      // 必須UI要素の存在確認
      const requiredElements = [
        'manual-monitor-btn',
        'monitor-status-btn',
        'parse-info-btn',
        'integration-test-btn',
        'monitor-result'
      ];

      for (const id of requiredElements) {
        const element = document.getElementById(id);
        if (!element) {
          throw new Error(`UI要素が見つかりません: ${id}`);
        }
      }

      // 監視チェックボックスの存在確認
      const checkboxes = document.querySelectorAll('.monitor-checkbox');
      if (checkboxes.length === 0) {
        throw new Error('監視チェックボックスが見つかりません');
      }

      return {
        name: 'UI統合',
        status: 'passed',
        details: `UI要素: ${requiredElements.length}個, チェックボックス: ${checkboxes.length}個`
      };
    } catch (error) {
      return {
        name: 'UI統合',
        status: 'failed',
        details: error.message
      };
    }
  }

  // 統合テスト結果フォーマット
  formatIntegrationTestResults(results) {
    const lines = [
      `🧪 統合テスト結果 [${new Date(results.timestamp).toLocaleString()}]`,
      '',
      `📊 概要: ${results.summary.passed}/${results.summary.total} テスト成功`,
      `成功率: ${Math.round((results.summary.passed / results.summary.total) * 100)}%`,
      ''
    ];

    results.tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌';
      lines.push(`${status} ${test.name}: ${test.details}`);
    });

    if (results.summary.failed > 0) {
      lines.push('', '⚠️ 失敗したテストがあります。詳細をご確認ください。');
    } else {
      lines.push('', '🎉 全テストが成功しました！');
    }

    return lines.join('\n');
  }

  // 監視チェックボックス変更ハンドラー
  async handleMonitoringToggle(checkbox) {
    try {
      const gameId = parseInt(checkbox.dataset.gameId);
      const enabled = checkbox.checked;
      
      console.log(`🔄 監視設定変更: Game ${gameId} -> ${enabled}`);
      
      // データ更新
      const success = await window.gameDataManager.updateWebMonitoringFlag(gameId, enabled);
      
      if (success) {
        // 成功時の視覚的フィードバック
        const statusSpan = document.getElementById('status-text');
        const originalText = statusSpan.textContent;
        statusSpan.textContent = `📡 監視設定更新: ${enabled ? 'ON' : 'OFF'}`;
        statusSpan.style.color = enabled ? '#28a745' : '#6c757d';
        
        setTimeout(() => {
          statusSpan.textContent = originalText;
          statusSpan.style.color = '';
        }, 2000);
      } else {
        // 失敗時はチェックボックスを元に戻す
        checkbox.checked = !enabled;
        this.showError('監視設定の更新に失敗しました');
      }
      
    } catch (error) {
      console.error('❌ 監視設定変更エラー:', error);
      checkbox.checked = !checkbox.checked; // 元に戻す
      this.showError('監視設定の変更でエラーが発生しました');
    }
  }

  // ローディング表示
  showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }

  // メッセージ表示
  showMessage(message) {
    const statusText = document.getElementById('status-text');
    const originalText = statusText.textContent;
    
    statusText.textContent = message;
    statusText.style.color = '#4CAF50';
    
    setTimeout(() => {
      statusText.textContent = originalText;
      statusText.style.color = '#666';
    }, 3000);
  }

  // エラー表示
  showError(message) {
    const statusText = document.getElementById('status-text');
    const originalText = statusText.textContent;
    
    statusText.textContent = `❌ ${message}`;
    statusText.style.color = '#F44336';
    
    setTimeout(() => {
      statusText.textContent = originalText;
      statusText.style.color = '#666';
    }, 5000);
  }

  // バックグラウンド更新実行
  async performBackgroundUpdate() {
    const btn = document.getElementById('background-update-btn');
    const originalClass = btn.className;
    const statusText = document.getElementById('status-text');
    const originalStatusText = statusText.textContent;

    try {
      // 更新中の視覚的フィードバック
      btn.classList.add('updating');
      btn.disabled = true;
      statusText.textContent = '🔄 バックグラウンド更新中...';
      statusText.style.color = '#2196F3';

      console.log('🚀 バックグラウンド更新開始');

      // 依存関係チェック
      if (!window.webMonitor) {
        throw new Error('WebMonitor が初期化されていません');
      }
      if (!window.pageParser) {
        throw new Error('PageParser が初期化されていません');
      }

      // WebMonitorのバックグラウンド更新を実行
      const result = await window.webMonitor.executeBackgroundUpdate();

      if (result.success) {
        // 成功時の処理
        btn.className = originalClass;
        btn.classList.add('success');
        btn.disabled = false;

        const newWorksCount = result.newWorks?.length || 0;
        const updatedWorksCount = result.updatedWorks?.length || 0;

        statusText.textContent = `✅ 更新完了: 新規${newWorksCount}件, 更新${updatedWorksCount}件`;
        statusText.style.color = '#4CAF50';

        // リスト更新
        await this.refreshList();

        // 結果詳細を表示
        this.showUpdateResult(result);

        console.log('✅ バックグラウンド更新成功:', result);

      } else {
        throw new Error(result.error || 'バックグラウンド更新に失敗しました');
      }

    } catch (error) {
      // エラー時の処理
      console.error('❌ バックグラウンド更新エラー:', error);
      
      btn.className = originalClass;
      btn.classList.add('error');
      btn.disabled = false;

      statusText.textContent = `❌ 更新エラー: ${error.message}`;
      statusText.style.color = '#F44336';

      this.showUpdateError(error);

    } finally {
      // 3秒後にUIを元に戻す
      setTimeout(() => {
        btn.className = originalClass;
        statusText.textContent = originalStatusText;
        statusText.style.color = '#666';
      }, 3000);
    }
  }

  // テスト用バックグラウンド更新実行
  async performTestBackgroundUpdate() {
    const btn = document.getElementById('test-bg-update-btn');
    const originalClass = btn.className;
    const statusText = document.getElementById('status-text');
    const originalStatusText = statusText.textContent;

    try {
      // 依存関係チェック
      if (!window.webMonitor) {
        throw new Error('WebMonitor が初期化されていません');
      }

      // 更新中の視覚的フィードバック
      btn.classList.add('updating');
      btn.disabled = true;
      statusText.textContent = '🧪 テスト更新中(No.7登録)...';
      statusText.style.color = '#FF9800';

      console.log('🧪 テスト用バックグラウンド更新開始');

      // WebMonitorのテスト用バックグラウンド更新を実行
      const result = await window.webMonitor.executeTestBackgroundUpdate();

      if (result.success) {
        // 成功時の処理
        btn.className = originalClass;
        btn.classList.add('success');
        btn.disabled = false;

        const action = result.action || 'processed';
        statusText.textContent = `✅ テスト完了: No.7を${action === 'added' ? '新規登録' : '更新'}しました`;
        statusText.style.color = '#4CAF50';

        // リスト更新
        await this.refreshList();

        console.log('✅ テスト用バックグラウンド更新成功:', result);

      } else {
        throw new Error(result.error || 'テスト更新に失敗しました');
      }

    } catch (error) {
      // エラー時の処理
      console.error('❌ テスト用バックグラウンド更新エラー:', error);
      
      btn.className = originalClass;
      btn.classList.add('error');
      btn.disabled = false;

      statusText.textContent = `❌ テストエラー: ${error.message}`;
      statusText.style.color = '#F44336';

    } finally {
      // 3秒後にUIを元に戻す
      setTimeout(() => {
        btn.className = originalClass;
        statusText.textContent = originalStatusText;
        statusText.style.color = '#666';
      }, 3000);
    }
  }

  // HTMLデータ表示
  async showHtmlData() {
    const btn = document.getElementById('show-html-btn');
    const originalClass = btn.className;
    const statusText = document.getElementById('status-text');
    const originalStatusText = statusText.textContent;

    try {
      // 取得中の視覚的フィードバック
      btn.classList.add('updating');
      btn.disabled = true;
      statusText.textContent = '📡 HTMLデータ取得中...';
      statusText.style.color = '#2196F3';

      console.log('📄 HTMLデータ取得開始');

      // 依存関係チェック
      if (!window.webMonitor) {
        throw new Error('WebMonitor が初期化されていません');
      }

      // WebMonitorでページ取得
      const html = await window.webMonitor.fetchContestPage();

      // 新しいタブでHTMLを表示
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>ウディコンページ HTMLデータ</title>
              <style>
                body { font-family: monospace; margin: 20px; }
                .info { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                .content { white-space: pre-wrap; word-wrap: break-word; }
              </style>
            </head>
            <body>
              <div class="info">
                <h2>📄 ウディコンページ HTMLデータ</h2>
                <p><strong>取得時刻:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>データサイズ:</strong> ${html.length.toLocaleString()} 文字</p>
                <p><strong>URL:</strong> https://silversecond.com/WolfRPGEditor/Contest/entry.shtml</p>
              </div>
              <div class="content">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }

      // 成功時の処理
      btn.className = originalClass;
      btn.classList.add('success');
      btn.disabled = false;

      statusText.textContent = `✅ HTMLデータを新しいタブで表示しました (${html.length}文字)`;
      statusText.style.color = '#4CAF50';

      console.log(`✅ HTMLデータ表示完了: ${html.length}文字`);

    } catch (error) {
      // エラー時の処理
      console.error('❌ HTMLデータ取得エラー:', error);
      
      btn.className = originalClass;
      btn.classList.add('error');
      btn.disabled = false;

      statusText.textContent = `❌ HTML取得エラー: ${error.message}`;
      statusText.style.color = '#F44336';

    } finally {
      // 3秒後にUIを元に戻す
      setTimeout(() => {
        btn.className = originalClass;
        statusText.textContent = originalStatusText;
        statusText.style.color = '#666';
      }, 3000);
    }
  }

  // 更新結果表示
  showUpdateResult(result) {
    // 既存の結果表示を削除
    const existingResult = document.querySelector('.update-result');
    if (existingResult) {
      existingResult.remove();
    }

    // 新しい結果表示を作成
    const resultDiv = document.createElement('div');
    resultDiv.className = 'update-result success';
    
    const newWorksCount = result.newWorks?.length || 0;
    const updatedWorksCount = result.updatedWorks?.length || 0;
    const totalWorks = result.totalWorks || 0;

    let content = `📊 更新完了: 全${totalWorks}作品中、新規${newWorksCount}件・更新${updatedWorksCount}件を検出`;

    if (newWorksCount > 0) {
      content += '\n🆕 新規作品:';
      result.newWorks.slice(0, 3).forEach(work => {
        content += `\n• No.${work.no} ${work.title}`;
      });
      if (newWorksCount > 3) {
        content += `\n... 他${newWorksCount - 3}件`;
      }
    }

    if (updatedWorksCount > 0) {
      content += '\n🔄 更新作品:';
      result.updatedWorks.slice(0, 3).forEach(work => {
        content += `\n• No.${work.no} ${work.title}`;
      });
      if (updatedWorksCount > 3) {
        content += `\n... 他${updatedWorksCount - 3}件`;
      }
    }

    resultDiv.innerHTML = `<pre style="white-space: pre-wrap; margin: 0;">${content}</pre>`;

    // ステータスバーの上に挿入
    const statusBar = document.querySelector('.status-bar');
    statusBar.parentNode.insertBefore(resultDiv, statusBar);

    // 10秒後に自動削除
    setTimeout(() => {
      if (resultDiv.parentNode) {
        resultDiv.remove();
      }
    }, 10000);
  }

  // 更新エラー表示
  showUpdateError(error) {
    // 既存の結果表示を削除
    const existingResult = document.querySelector('.update-result');
    if (existingResult) {
      existingResult.remove();
    }

    // エラー表示を作成
    const resultDiv = document.createElement('div');
    resultDiv.className = 'update-result error';
    resultDiv.innerHTML = `
      <div>❌ バックグラウンド更新エラー</div>
      <div style="margin-top: 4px; font-size: 10px;">${error.message}</div>
    `;

    // ステータスバーの上に挿入
    const statusBar = document.querySelector('.status-bar');
    statusBar.parentNode.insertBefore(resultDiv, statusBar);

    // 8秒後に自動削除
    setTimeout(() => {
      if (resultDiv.parentNode) {
        resultDiv.remove();
      }
    }, 8000);
  }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 依存関係の待機（最大5秒）
    let retries = 0;
    const maxRetries = 50; // 100ms × 50 = 5秒
    
    while ((!window.pageParser || !window.webMonitor || !window.gameDataManager) && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!window.pageParser) {
      console.warn('⚠️ PageParser の初期化待機がタイムアウトしました');
    }
    if (!window.webMonitor) {
      console.warn('⚠️ WebMonitor の初期化待機がタイムアウトしました');
    }
    if (!window.gameDataManager) {
      throw new Error('GameDataManager の初期化に失敗しました');
    }
    
    // グローバルマネージャー初期化
    window.gameListManager = new GameListManager();
    
    // 初期化実行
    await window.gameListManager.initialize();
    window.navigationController.initialize();
    
    console.log('🌊 ウディこん助 initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    document.getElementById('status-text').textContent = '❌ 初期化失敗';
  }
});

// ウィンドウ終了時の処理
window.addEventListener('beforeunload', () => {
  if (window.navigationController) {
    window.navigationController.stopAutoSave();
    
    // 未保存の変更がある場合は保存
    if (window.navigationController.hasUnsavedChanges && window.navigationController.editingGameId) {
      window.navigationController.saveCurrentEdit();
    }
  }
});