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
    // ローカライザーを初期化
    await this.initializeLocalizer();

    // バージョン情報を表示
    const manifest = chrome.runtime.getManifest();
    const versionBadge = document.querySelector('.version-badge');
    if (versionBadge) {
      versionBadge.textContent = `v${manifest.version}`;
    }

    // 年度・回数情報を表示
    await this.updateYearDisplay();

    await window.gameDataManager.initialize();
    
    // ポップアップ開時の自動監視チェック
    await this.performPopupAutoMonitoring();
    
    this.setupEventListeners();
    this.updateSortHeaders();
    await this.refreshList();
    
    // 初期化完了後にステータスバーのデフォルトテキストを設定
    this.setDefaultStatusText();
  }

  // ローカライザー初期化
  async initializeLocalizer() {
    try {
      // ローカライザーが利用可能になるまで待機
      if (!window.localizer) {
        console.warn('Localizer not available, waiting...');
        await new Promise(resolve => {
          const check = () => {
            if (window.localizer) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      }

      // ローカライザーを初期化
      await window.localizer.initialize();
      
      // DOM要素を更新
      window.localizer.updateDOM();

      console.log(`Localizer initialized: ${window.localizer.getCurrentLanguage()}`);

    } catch (error) {
      console.error('Localizer initialization failed:', error);
    }
  }

  // ポップアップ開時の自動監視実行
  async performPopupAutoMonitoring() {
    try {
      console.log('🔍 ポップアップ自動監視チェック開始');
      
      // 自動監視設定確認
      const settings = await chrome.storage.local.get(['auto_monitor_settings', 'last_auto_monitor_time']);
      const autoMonitorSettings = settings.auto_monitor_settings || { enabled: true, popupInterval: 1 };
      
      if (!autoMonitorSettings.enabled) {
        console.log('📴 自動監視が無効に設定されています');
        return;
      }
      
      // 前回実行からの経過時間確認
      const lastTime = settings.last_auto_monitor_time;
      const now = Date.now();
      const requiredInterval = (autoMonitorSettings.popupInterval || 1) * 60 * 60 * 1000; // 時間をミリ秒に変換
      
      if (lastTime && (now - new Date(lastTime).getTime()) < requiredInterval) {
        const nextCheck = new Date(new Date(lastTime).getTime() + requiredInterval);
        console.log(`⏰ まだ自動監視間隔内です。次回: ${nextCheck.toLocaleString()}`);
        return;
      }
      
      console.log('🎯 ポップアップ自動監視を実行します');
      
      // ステータス表示
      this.updateStatusBar('🔄 自動監視実行中...', 'processing', 0);
      
      // Web監視実行
      if (window.webMonitor) {
        const result = await window.webMonitor.executeBackgroundUpdate();
        
        // 実行時刻記録
        await chrome.storage.local.set({
          last_auto_monitor_time: new Date().toISOString()
        });
        
        if (result.success) {
          const newCount = result.newWorks?.length || 0;
          const updateCount = result.updatedWorks?.length || 0;
          
          if (newCount > 0 || updateCount > 0) {
            this.updateStatusBar(`🔔 自動監視完了: 新規${newCount}件、更新${updateCount}件`, 'success', 5000);
            
            // 通知表示
            if (chrome.notifications) {
              chrome.notifications.create('popup-auto-monitor', {
                type: 'basic',
                iconUrl: 'images/WudiConsuke_top.png',
                title: 'ウディこん助 自動監視',
                message: `新規${newCount}件、更新${updateCount}件の作品を検出しました`
              });
            }
          } else {
            this.updateStatusBar('✅ 自動監視完了: 更新なし', 'info', 3000);
          }
          
          console.log('✅ ポップアップ自動監視完了:', result);
        } else {
          this.updateStatusBar('❌ 自動監視でエラーが発生しました', 'error', 5000);
          console.error('❌ ポップアップ自動監視エラー:', result.error);
        }
      } else {
        console.warn('⚠️ WebMonitorが利用できません');
        this.updateStatusBar('⚠️ 監視システムが初期化されていません', 'warning', 3000);
      }
      
    } catch (error) {
      console.error('❌ ポップアップ自動監視処理エラー:', error);
      this.updateStatusBar('❌ 自動監視処理でエラーが発生しました', 'error', 5000);
    }
  }

  // デフォルトステータステキスト設定
  setDefaultStatusText() {
    const statusText = document.getElementById('status-text');
    const defaultText = (window.localizer && window.localizer.getText) ? 
      window.localizer.getText('ui.status.appReady') : 'ウディこん助 準備完了';
    
    statusText.textContent = defaultText;
    statusText.style.color = '#666';
    
    // デフォルトテキストとして保存
    statusText.dataset.originalText = defaultText;
  }

  // イベントリスナー設定
  setupEventListeners() {
    // フィルタボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // 更新クリアボタン
    document.getElementById('clear-updates-btn').addEventListener('click', () => {
      this.clearAllUpdates();
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



    // 監視チェックボックス
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('monitor-checkbox')) {
        this.handleMonitoringToggle(e.target);
      }
    });

    // 全選択機能
    document.getElementById('monitor-select-all').addEventListener('click', () => {
      this.handleSelectAllMonitoring();
    });

    // 投票フォーム入力ボタン
    document.getElementById('vote-form-btn').addEventListener('click', () => {
      this.handleVoteFormButtonClick();
    });

    // 評価済み作品一括入力ボタン
    document.getElementById('fill-all-forms-btn').addEventListener('click', () => {
      this.handleFillAllFormsClick();
    });
  }

  // 投票フォーム入力ボタンクリック時の処理
  async handleVoteFormButtonClick() {
    try {
      const editingGame = await window.navigationController.getCurrentGameDataWithFormValues();
      if (!editingGame) {
        this.showError('対象の作品データがありません。');
        return;
      }

      // 個別作品を配列に入れて共通処理を呼び出し
      await this.handleVoteFormInput([editingGame], false);

    } catch (error) {
      console.error('❌ 投票フォーム入力エラー:', error);
      this.showError(error.message);
    }
  }

  // 評価済み作品一括入力ボタンクリック時の処理
  async handleFillAllFormsClick() {
    try {
      const playedGames = await window.gameDataManager.filterGames('played');
      if (playedGames.length === 0) {
        this.showMessage('評価済みの作品がありません。', 'info');
        return;
      }

      // 一括入力の確認
      const confirmTemplate = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.confirmBulkInput') : 
        '{count}件の評価済み作品のデータをフォームに一括入力しますか？';
      const confirmMsg = confirmTemplate.replace('{count}', playedGames.length);
      if (!confirm(confirmMsg)) {
        return;
      }

      // 共通処理を呼び出し
      await this.handleVoteFormInput(playedGames, true);

    } catch (error) {
      console.error('❌ 一括入力エラー:', error);
      this.showError(error.message);
    }
  }

  // 投票フォーム入力共通処理（投票ページ自動オープン対応）
  async handleVoteFormInput(games, isBulkMode = false) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const isVotePage = currentTab && currentTab.url.includes('silversecond.com/WolfRPGEditor/Contest/') && currentTab.url.includes('contestVote.cgi');

    if (!isVotePage) {
      // 投票ページが開いていない場合の処理
      const confirmMsg = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.confirmOpenVotePage') : '投票ページを開きます。その後、再度このボタンを押してください。';
      if (confirm(confirmMsg)) {
        // 年度別投票URL取得
        const currentYear = window.yearManager ? await window.yearManager.getCurrentYear() : 2025;
        const votePageUrl = (window.constants?.URLS?.getVoteUrl?.(currentYear) || 'https://silversecond.com/WolfRPGEditor/Contest/cgi/contestVote.cgi') + '?action=load';
        const newTab = await chrome.tabs.create({ url: votePageUrl, active: true });
        
        // 新しいタブでコンテンツスクリプトが実行されるのを待つ
        setTimeout(async () => {
          const action = isBulkMode ? 'fillAllVoteForms' : 'fillVoteForm';
          const data = isBulkMode ? games : games[0];
          const statusMsg = isBulkMode ? 
            `🗳️ ${games.length}件の作品を一括入力中...` : 
            '📋 投票フォームに入力中...';
          
          this.updateStatusBar(statusMsg, 'processing', 0);
          
          const response = await chrome.tabs.sendMessage(newTab.id, {
            action: action,
            data: data
          });

          if (response && response.success) {
            const successMsg = isBulkMode ? 
              `✅ 一括入力完了: 成功 ${response.successCount}件, スキップ ${response.skippedCount}件` :
              '✅ フォームへの入力が完了しました。';
            this.updateStatusBar(successMsg, 'success', isBulkMode ? 5000 : 3000);
          } else {
            const errorMsg = isBulkMode ? '一括入力に失敗しました。' : 'フォームの入力に失敗しました。';
            throw new Error(response?.error || errorMsg);
          }
        }, 2000); // 2秒待機
      }
      return;
    }

    // 投票ページが既に開いている場合の処理
    const action = isBulkMode ? 'fillAllVoteForms' : 'fillVoteForm';
    const data = isBulkMode ? games : games[0];
    const statusMsg = isBulkMode ? 
      `🗳️ ${games.length}件の作品を一括入力中...` : 
      '📋 投票フォームに入力中...';
    
    this.updateStatusBar(statusMsg, 'processing', 0);

    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: action,
      data: data
    });

    if (response && response.success) {
      const successMsg = isBulkMode ? 
        `✅ 一括入力完了: 成功 ${response.successCount}件, スキップ ${response.skippedCount}件` :
        '✅ フォームへの入力が完了しました。';
      this.updateStatusBar(successMsg, 'success', isBulkMode ? 5000 : 3000);
    } else {
      const errorMsg = isBulkMode ? '一括入力に失敗しました。' : 'フォームの入力に失敗しました。';
      throw new Error(response?.error || errorMsg);
    }
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

    // 「更新クリア」ボタンの表示制御
    const clearUpdatesBtn = document.getElementById('clear-updates-btn');
    if (filter === 'new') {
      clearUpdatesBtn.classList.remove('hidden');
    } else {
      clearUpdatesBtn.classList.add('hidden');
    }

    await this.refreshList();
  }

  // 更新クリア処理
  async clearAllUpdates() {
    const newGames = await window.gameDataManager.filterGames('new');
    if (newGames.length === 0) {
      this.showMessage('クリア対象の作品がありません。', 'info');
      return;
    }

    if (confirm(`${newGames.length}件の作品の「新着・更新」マークをすべてクリアしますか？`)) {
      try {
        this.showLoading(true);
        await window.gameDataManager.clearAllVersionStatus();
        await this.refreshList();
        this.showMessage('✅ 更新情報をクリアしました。', 'success');
      } catch (error) {
        console.error('❌ 更新クリアエラー:', error);
        this.showError('更新情報のクリアに失敗しました。');
      } finally {
        this.showLoading(false);
      }
    }
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
      
      // ステータスバーの一時メッセージをチェック
      const statusText = document.getElementById('status-text');
      const hasTemporaryMessage = statusText.statusTimer && statusText.statusTimer !== null;
      
      // 一時メッセージが表示中でない場合のみ統計情報を更新
      if (!hasTemporaryMessage) {
        await this.updateStatusBar();
      }

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
        case window.constants.SORT_TYPES.NO:
          aValue = parseInt(a.no);
          bValue = parseInt(b.no);
          break;
        case window.constants.SORT_TYPES.TITLE:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case window.constants.SORT_TYPES.RATING_ENTHUSIASM:
        case window.constants.SORT_TYPES.RATING_NOVELTY:
        case window.constants.SORT_TYPES.RATING_STORY:
        case window.constants.SORT_TYPES.RATING_GRAPHICS_AUDIO:
        case window.constants.SORT_TYPES.RATING_USABILITY:
        case window.constants.SORT_TYPES.RATING_OTHER:
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

    // XSS対策: innerHTML使用を避けて安全なDOM操作を実装
    tbody.innerHTML = ''; // 既存の内容をクリア
    games.forEach(game => {
      const row = this.createGameRowElement(game);
      tbody.appendChild(row);
    });
  }

  // ゲーム行DOM要素生成（XSS対策: 安全なDOM操作）
  createGameRowElement(game) {
    const row = document.createElement('tr');
    const rowClass = game.is_played ? 'game-row played' : 'game-row';
    row.className = rowClass;
    row.setAttribute('data-game-id', game.id);

    // 感想入力促進ハイライト判定は評価列作成時に個別に行う

    // チェックボックス列
    const checkCell = document.createElement('td');
    checkCell.className = 'col-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'monitor-checkbox';
    checkbox.setAttribute('data-game-id', game.id);
    checkbox.checked = game.web_monitoring_enabled || false;
    checkCell.appendChild(checkbox);
    row.appendChild(checkCell);

    // No列
    const noCell = document.createElement('td');
    noCell.className = 'col-no';
    noCell.textContent = game.no || '---';
    row.appendChild(noCell);

    // タイトル列（XSS対策: textContentで安全に設定）
    const titleCell = document.createElement('td');
    titleCell.className = 'col-title';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'game-title';
    titleSpan.title = game.title || '';
    titleSpan.textContent = game.title || '';
    
    // 状態表示の追加（安全なDOM操作）
    if (!game.id || game.id.toString().startsWith('temp_')) {
      const statusSpan = document.createElement('small');
      statusSpan.style.color = '#ff6b35';
      statusSpan.style.fontWeight = 'bold';
      statusSpan.textContent = ' 【読み込み失敗・新規作成】';
      titleSpan.appendChild(statusSpan);
    }
    
    titleCell.appendChild(titleSpan);
    row.appendChild(titleCell);

    // Ver列
    const verCell = document.createElement('td');
    verCell.className = 'col-ver';
    const verSpan = document.createElement('span');
    verSpan.className = 'version-status';
    verSpan.innerHTML = this.getVersionIcon(game.version_status); // アイコンHTMLは安全な内部生成
    verCell.appendChild(verSpan);
    row.appendChild(verCell);

    // 評価列（6項目）
    const ratingKeys = window.constants.RATING_CATEGORIES;
    ratingKeys.forEach(key => {
      const ratingCell = document.createElement('td');
      ratingCell.className = 'col-rating';
      ratingCell.textContent = game.rating?.[key] || '-';
      
      // 「その他」列のみ感想入力促進ハイライト判定
      if (key === 'その他' && this.shouldHighlightForReviewReminder(game)) {
        ratingCell.classList.add('review-reminder-highlight');
      }
      
      row.appendChild(ratingCell);
    });

    return row;
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
    
    return window.constants.RATING_CATEGORIES.map(category => rating[category] || '-').join('/');
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

      const statusElement = document.getElementById('status-text');
      
      // 一時メッセージが表示中の場合は統計情報更新をスキップ
      if (statusElement.statusTimer) {
        return;
      }
      
      statusElement.textContent = statusText;

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


  // ヘルプ表示
  showHelp() {
    try {
      if (!window.localizer || !window.localizer.resources || !window.localizer.resources.help) {
        // フォールバック - 日本語固定版
        this.showHelpFallback();
        return;
      }

      const help = window.localizer.resources.help;
      
      // ヘルプテキストを動的に構築
      const sections = [
        help.title,
        '',
        help.basicOperations.title,
        ...help.basicOperations.items,
        '',
        help.webMonitoring.title,
        ...help.webMonitoring.items,
        '',
        help.ratingSystem.title,
        ...help.ratingSystem.items,
        '',
        help.reviewMemo.title,
        ...help.reviewMemo.items,
        '',
        help.votingSupport.title,
        ...help.votingSupport.items,
        '',
        help.dataSaving.title,
        ...help.dataSaving.items,
        '',
        help.dataManagement.title,
        help.dataManagement.warning,
        help.dataManagement.description,
        '',
        ...help.dataManagement.items,
        '',
        help.detailInfo.title,
        help.detailInfo.officialPage
      ];

      const helpText = sections.join('\n');
      alert(helpText);
      
    } catch (error) {
      console.warn('Help localization error, using fallback:', error);
      this.showHelpFallback();
    }
  }

  // ヘルプ表示フォールバック（日本語固定）
  showHelpFallback() {
    const helpText = `
🌊 ウディこん助 使い方

【基本操作】
• 作品行をクリック → 詳細画面へ移動
• 👈戻るボタン → メイン画面に戻る
• フィルタボタンで表示切替（全表示/評価済み/未評価/新着）
• ⚙️設定ボタン → 詳細設定画面を開く
• 🔄バックグラウンド更新ボタン → 手動監視実行

【Web監視機能】
• ウディコンサイト訪問時に自動で新規作品・更新をチェック
• 拡張機能ポップアップ開時にも自動監視実行
• 手動監視ボタン（🔍）で即座に監視実行
• 新規作品や更新が見つかるとデスクトップ通知

【評価システム】
• 6カテゴリ×10点制（ウディコン公式準拠）
• 熱中度・斬新さ・物語性・画像音声・遊びやすさ・その他
• 評価完了で自動的に既プレイフラグON
• 平均値バー表示であなたの評価傾向を把握

【感想メモ機能】
• 2000字以内の詳細感想記録
• 文字数カウント機能付き
• コメント投稿時の参考にも最適

【投票支援機能】
• 投票フォームへの個別データ入力（詳細画面から）
• 評価済み作品の一括入力（🗳️ボタンから）
• 投票ページ自動オープン機能

【データ保存】
• 変更は自動的に保存されます

【データ管理】
⚠️ 重要：データ保護について
ブラウザのキャッシュクリアや拡張機能の再インストール時に、
保存された評価・感想データが消失する可能性があります。
定期的なデータエクスポートを強く推奨します。

• 設定画面からデータエクスポート・インポート可能
• JSON/CSV形式でのデータ管理に対応

【詳細情報】
公式紹介ページ: https://wudi-consuke.vercel.app/website/release/index.html
    `;
    
    alert(helpText);
  }

  // 監視チェックボックス変更ハンドラー
  async handleMonitoringToggle(checkbox) {
    try {
      const gameId = checkbox.dataset.gameId;
      const enabled = checkbox.checked;
      
      console.log(`🔄 監視設定変更: Game ${gameId} -> ${enabled}`);
      
      // データ更新
      const success = await window.gameDataManager.updateWebMonitoringFlag(gameId, enabled);
      
      if (success) {
        // 成功時の視覚的フィードバック
        this.updateStatusBar(`📡 監視設定更新: ${enabled ? 'ON' : 'OFF'}`, enabled ? 'success' : 'info', 2000);
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

  // 全選択/全選択解除機能
  async handleSelectAllMonitoring() {
    try {
      const checkboxes = document.querySelectorAll('.monitor-checkbox');
      if (checkboxes.length === 0) {
        this.showError('監視対象の作品がありません');
        return;
      }

      // 現在の選択状態を確認
      const checkedCount = document.querySelectorAll('.monitor-checkbox:checked').length;
      const totalCount = checkboxes.length;
      const willSelectAll = checkedCount < totalCount;

      // 確認ダイアログ
      const action = willSelectAll ? '全選択' : '全選択解除';
      const message = `${totalCount}件の作品の監視設定を${action}しますか？`;
      
      // confirmがブロックされている場合も考慮
      let userConfirmed = true;
      try {
        userConfirmed = confirm(message);
        if (!userConfirmed) {
          return;
        }
      } catch (error) {
        // confirmが無効化されている場合は自動的に続行
        console.log('確認ダイアログが無効化されています。処理を続行します。');
        userConfirmed = true;
      }

      this.showLoading(true);
      this.updateStatusBar(`📡 監視設定を${action}中...`, 'processing', 0);

      let successCount = 0;
      let errorCount = 0;

      // 全てのチェックボックスを更新
      for (const checkbox of checkboxes) {
        try {
          const gameId = checkbox.dataset.gameId;
          const success = await window.gameDataManager.updateWebMonitoringFlag(gameId, willSelectAll);
          
          if (success) {
            checkbox.checked = willSelectAll;
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`監視設定更新エラー (Game ${checkbox.dataset.gameId}):`, error);
          errorCount++;
        }
      }

      // 結果表示
      if (errorCount === 0) {
        this.updateStatusBar(`✅ ${action}完了: ${successCount}件の監視設定を更新`, 'success', 3000);
      } else {
        this.updateStatusBar(`⚠️ ${action}完了: 成功${successCount}件、エラー${errorCount}件`, 'warning', 5000);
      }

    } catch (error) {
      console.error('❌ 全選択処理エラー:', error);
      this.showError('全選択処理でエラーが発生しました');
    } finally {
      this.showLoading(false);
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

  // 年度・回数表示更新
  async updateYearDisplay() {
    try {
      if (window.yearManager) {
        const currentYear = await window.yearManager.getCurrentYear();
        const roundNumber = currentYear - 2008; // 第1回が2009年
        
        const yearBadge = document.getElementById('year-badge');
        if (yearBadge) {
          yearBadge.textContent = `第${roundNumber}回(${currentYear})`;
        }
      }
    } catch (error) {
      console.error('年度表示更新エラー:', error);
    }
  }

  // メッセージ表示
  showMessage(message) {
    this.updateStatusBar(message, 'success');
  }

  // エラー表示
  showError(message) {
    this.updateStatusBar(`❌ ${message}`, 'error', 5000);
  }

  // バックグラウンド更新実行
  async performBackgroundUpdate() {
    const btn = document.getElementById('background-update-btn');
    const originalClass = btn.className;

    try {
      // 更新中の視覚的フィードバック
      btn.classList.add('updating');
      btn.disabled = true;
      this.updateStatusBar('🔄 バックグラウンド更新中...', 'processing', 0);

      console.log('🚀 バックグラウンド更新開始');

      // 依存関係チェック
      if (!window.webMonitor) {
        throw new Error('WebMonitor が初期化されていません');
      }
      if (!window.pageParser) {
        throw new Error('PageParser が初期化されていません');
      }

      this.updateStatusBar('🔄 バックグラウンド更新中...', 'processing', 0);
      // バックグラウンド更新を実行
      const result = await window.webMonitor.executeBackgroundUpdate();

      if (result.success) {
        // 成功時の処理
        btn.className = originalClass;
        btn.classList.add('success');
        btn.disabled = false;

        const newWorksCount = result.newWorks?.length || 0;
        const updatedWorksCount = result.updatedWorks?.length || 0;
        const totalWorksCount = result.totalWorks || 0;

        this.updateStatusBar(`📊 更新完了: 全${totalWorksCount}作品中、新規${newWorksCount}件・更新${updatedWorksCount}件を検出`, 'success');

        // リスト更新
        await this.refreshList();

        // 結果詳細を表示（ステータスバー表示後に少し遅延）
        setTimeout(() => {
          this.showUpdateResult(result);
        }, 1000);

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

      this.updateStatusBar(`❌ 更新エラー: ${error.message}`, 'error');

      this.showUpdateError(error);

    } finally {
      // 3秒後にUIを元に戻す
      setTimeout(() => {
        btn.className = originalClass;
      }, 3000);
    }
  }

  // 感想入力促進ハイライト判定
  shouldHighlightForReviewReminder(game) {
    // 「その他」評価が0より大きく、感想が未入力の場合
    const hasOtherRating = game.rating && game.rating['その他'] && game.rating['その他'] > 0;
    const hasNoReview = !game.review || game.review.trim() === '';
    
    return hasOtherRating && hasNoReview;
  }

  // ステータスバー更新の共通メソッド
  updateStatusBar(message, type = 'info', duration = 3000) {
    const statusText = document.getElementById('status-text');
    
    // デフォルトテキストが設定されていない場合は適切なデフォルトを設定
    if (!statusText.dataset.originalText) {
      const appReadyText = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.appReady') : 'ウディこん助 準備完了';
      const defaultText = statusText.textContent === '読み込み中...' ? appReadyText : statusText.textContent;
      statusText.dataset.originalText = defaultText;
    }
    
    const originalText = statusText.dataset.originalText;

    // タイプに応じた色設定
    const colors = {
      info: '#2196F3',      // 青
      success: '#4CAF50',   // 緑
      error: '#F44336',     // 赤
      warning: '#FF9800',   // オレンジ
      processing: '#FF9800' // オレンジ（処理中）
    };

    statusText.textContent = message;
    statusText.style.color = colors[type] || colors.info;

    // 既存のタイマーをクリア
    if (statusText.statusTimer) {
      clearTimeout(statusText.statusTimer);
    }

    // 指定時間後に元に戻す
    if (duration > 0) {
      statusText.statusTimer = setTimeout(() => {
        statusText.textContent = originalText;
        statusText.style.color = '#666';
        delete statusText.statusTimer;
      }, duration);
    }
  }




  // 更新結果表示
  showUpdateResult(result) {
    // 既存の結果表示を削除
    const existingResult = document.querySelector('.update-result');
    if (existingResult) {
      existingResult.remove();
    }

    const newWorksCount = result.newWorks?.length || 0;
    const updatedWorksCount = result.updatedWorks?.length || 0;

    // 新規・更新がない場合は詳細表示をスキップ
    if (newWorksCount === 0 && updatedWorksCount === 0) {
      return;
    }

    // 新しい結果表示を作成
    const resultDiv = document.createElement('div');
    resultDiv.className = 'update-result success';
    
    let content = '📋 更新詳細:';

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

    resultDiv.innerHTML = `<pre style="white-space: pre-wrap; margin: 0; font-size: 12px; background: #f8f9fa; padding: 8px; border-radius: 4px; border-left: 3px solid #4CAF50;">${content}</pre>`;

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
    // 初期化時はupdateStatusBarが利用できない可能性があるため、直接DOM操作
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = '❌ 初期化失敗';
      statusText.style.color = '#F44336';
    }
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