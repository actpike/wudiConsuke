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
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', async () => {
  try {
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