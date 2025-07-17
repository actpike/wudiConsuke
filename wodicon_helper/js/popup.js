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
    
    // ポップアップ開時の自動監視チェック
    await this.performPopupAutoMonitoring();
    
    this.setupEventListeners();
    this.updateSortHeaders();
    await this.refreshList();
    
    // 初期化完了後にステータスバーのデフォルトテキストを設定
    this.setDefaultStatusText();
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
    const defaultText = 'ウディこん助 準備完了';
    
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

    document.getElementById('local-folder-test-btn').addEventListener('click', () => {
      this.performLocalFolderTest();
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

    // 状態表示の改善
    let statusDisplay = '';
    if (!game.id || game.id.toString().startsWith('temp_')) {
      statusDisplay = ' <small style="color: #ff6b35; font-weight: bold;">【読み込み失敗・新規作成】</small>';
    }

    // Ver列はアイコンのみ（従来仕様）
    let versionInfo = versionIcon;

    return `
      <tr class="${rowClass}" data-game-id="${game.id}">
        <td class="col-check">
          <input type="checkbox" class="monitor-checkbox" data-game-id="${game.id}" ${monitoringChecked}>
        </td>
        <td class="col-no">${game.no || '---'}</td>
        <td class="col-title">
          <span class="game-title" title="${game.title}">${game.title}${statusDisplay}</span>
        </td>
        <td class="col-ver">
          <span class="version-status">${versionInfo}</span>
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
• フィルタボタンで表示切替（全表示/評価済み/未評価/新着）

【自動監視機能】
• ウディコンサイト訪問時に自動で新規作品・更新をチェック
• ポップアップ開時にも自動監視実行
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

【自動保存】
• 3秒間隔で自動保存
• 画面遷移時も自動保存

【データ管理】
⚠️ 重要：データ保護について
ブラウザのキャッシュクリアや拡張機能の再インストール時に、
保存された評価・感想データが消失する可能性があります。
定期的なデータエクスポートを強く推奨します。

• 📤ボタンでデータエクスポート
• 設定画面でインポート可能

【詳細情報】
公式紹介ページ: https://wudi-consuke.vercel.app/
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
          const gameId = parseInt(checkbox.dataset.gameId);
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

  // ローカルフォルダアクセステスト
  async performLocalFolderTest() {
    const btn = document.getElementById('local-folder-test-btn');
    const originalClass = btn.className;

    try {
      // テスト中の視覚的フィードバック
      btn.classList.add('updating');
      btn.disabled = true;
      this.updateStatusBar('📁 ローカルフォルダテスト実行中...', 'processing', 0);

      console.log('🧪 ローカルフォルダアクセステスト開始');

      // D:\tmpフォルダへのアクセステスト
      const testPath = 'D:\\tmp\\test.txt';
      const testContent = 'ウディこん助 ローカルフォルダアクセステスト - ' + new Date().toISOString();
      
      // Service WorkerにメッセージでD:\tmpアクセスを依頼
      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'LOCAL_FOLDER_TEST',
          data: {
            path: testPath,
            content: testContent
          }
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (result.success) {
        // 成功時の処理
        btn.className = originalClass;
        btn.classList.add('success');
        btn.disabled = false;

        this.updateStatusBar(`✅ ローカルフォルダテスト成功: ${result.message}`, 'success');
        
        // 結果詳細を表示
        setTimeout(() => {
          alert(`📁 ローカルフォルダアクセステスト結果:\n\n✅ 成功\n\n詳細: ${result.message}\n\nファイルパス: ${testPath}`);
        }, 500);

        console.log('✅ ローカルフォルダテスト成功:', result);

      } else {
        throw new Error(result.error || 'ローカルフォルダアクセステストに失敗しました');
      }

    } catch (error) {
      // エラー時の処理
      console.error('❌ ローカルフォルダテストエラー:', error);
      
      btn.className = originalClass;
      btn.classList.add('error');
      btn.disabled = false;

      this.updateStatusBar(`❌ ローカルフォルダテスト失敗: ${error.message}`, 'error');

      // エラー詳細を表示
      setTimeout(() => {
        alert(`📁 ローカルフォルダアクセステスト結果:\n\n❌ 失敗\n\nエラー: ${error.message}\n\nChrome拡張機能のセキュリティ制約により、file://プロトコルへの直接アクセスは制限されています。`);
      }, 500);

    } finally {
      // 3秒後にUIを元に戻す
      setTimeout(() => {
        btn.className = originalClass;
      }, 3000);
    }
  }


  // ステータスバー更新の共通メソッド
  updateStatusBar(message, type = 'info', duration = 3000) {
    const statusText = document.getElementById('status-text');
    
    // デフォルトテキストが設定されていない場合は適切なデフォルトを設定
    if (!statusText.dataset.originalText) {
      const defaultText = statusText.textContent === '読み込み中...' ? 'ウディこん助 準備完了' : statusText.textContent;
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