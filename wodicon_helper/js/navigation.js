// ウディこん助 画面遷移システム

class NavigationController {
  constructor() {
    this.currentView = 'main';
    this.editingGameId = null;
    this.lastDetailGameId = null;
    this.autoSaveTimer = null;
    this.hasUnsavedChanges = false;
    this.mainViewState = {
      filter: 'all',
      searchQuery: '',
      scrollPosition: 0
    };
    
    // ツールチップ機能用プロパティ
    this.currentTooltip = null;
  }

  // 初期化
  initialize() {
    this.setupEventListeners();
    this.showMainView();
  }

  // イベントリスナー設定
  setupEventListeners() {
    // 詳細画面への遷移（Noまたはタイトルクリックのみ）
    document.addEventListener('click', (e) => {
      // チェックボックスや他の要素のクリックは除外
      if (e.target.type === 'checkbox' || e.target.classList.contains('monitor-checkbox')) {
        return;
      }
      
      // No列、タイトル列、または評価列のクリックを処理
      const isNoColumn = e.target.closest('.col-no');
      const isTitleColumn = e.target.closest('.col-title');
      const isVersionColumn = e.target.closest('.col-ver');
      const isRatingColumn = e.target.closest('.col-rating');
      
      if ((isNoColumn || isTitleColumn || isVersionColumn || isRatingColumn) && this.currentView === 'main') {
        const gameRow = e.target.closest('.game-row');
        if (gameRow) {
          const gameId = gameRow.dataset.gameId;
          this.showDetailView(gameId);
        }
      }
    });

    // 戻るボタン
    document.getElementById('back-btn').addEventListener('click', () => {
      this.showMainView();
    });

    // フォルダボタン
    document.getElementById('folder-btn').addEventListener('click', () => {
      this.handleFolderButtonClick();
    });

    // マウスの戻るボタン
    document.addEventListener('mousedown', (e) => {
      if (e.button === 3) { // マウスのBrowserBackボタン
        e.preventDefault();
        if (this.currentView === 'detail') {
          this.showMainView();
        }
      }
    });

    // マウスの進むボタン
    document.addEventListener('mousedown', (e) => {
      if (e.button === 4) { // マウスのBrowserForwardボタン
        e.preventDefault();
        if (this.currentView === 'main' && this.lastDetailGameId) {
          this.showDetailView(this.lastDetailGameId);
        }
      }
    });

    // フォーム変更検知
    document.addEventListener('input', (e) => {
      if (e.target.matches('.rating-slider, #review-textarea')) {
        // スライダーの場合、null値から実際の値に変更
        if (e.target.matches('.rating-slider')) {
          const valueSpan = e.target.parentElement.querySelector('.rating-value');
          valueSpan.textContent = e.target.value;
          this.updateTotalRating();
          
          // 説明エリアの更新
          this.updateRatingIndicatorDisplay(e.target.dataset.category, e.target.value);
          
          // 🔄 NEW: リアルタイム平均バー更新
          this.updateAverageBarRealtime();
          
          // 感想入力促進ハイライト更新（評価変更時）
          this.updateReviewTextareaHighlight();
        }
        
        // 感想テキストエリア変更時
        if (e.target.matches('#review-textarea')) {
          // 感想入力促進ハイライト更新（感想入力時）
          this.updateReviewTextareaHighlight();
        }
        
        this.markAsChanged();
        // debouncedAutoSave削除：イベント駆動型に変更済み
      }
    });

    // 削除ボタン
    document.getElementById('delete-btn').addEventListener('click', () => {
      this.deleteCurrentGame();
    });

    // 詳細画面のタイトルクリック
    document.getElementById('detail-title').addEventListener('click', () => {
      this.openWodiconLink();
    });

    // フォルダ関連ボタンは削除済みのためコメントアウト
    // フォルダ関連イベントリスナーは削除済み（未使用コードクリーンアップ）
    
    // 評価ラベルホバー機能のイベントリスナー設定
    this.setupRatingLabelListeners();
  }

  // 評価ラベルホバー機能のイベントリスナー設定
  setupRatingLabelListeners() {
    // ラベルホバー時のツールチップ表示
    document.addEventListener('mouseenter', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('rating-label')) {
        this.showTooltip(e.target, e.target.dataset.ratingCategory);
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('rating-label')) {
        this.hideTooltip();
      }
    }, true);
  }

  // ツールチップ表示
  showTooltip(labelElement, category) {
    this.hideTooltip();
    
    // 安全にローカライザーから全評価指標のツールチップテキストを取得
    let tooltipText = `${category}の評価指標`;
    try {
      if (window.localizer && window.localizer.resources) {
        const resources = window.localizer.resources;
        
        // カテゴリ名をローカライズ
        const categoryMap = resources.categoryMap || {};
        const displayCategory = categoryMap[category] || category;
        
        // 評価指標リソースから全評価値の説明を取得
        const ratingResources = resources.ratings;
        
        if (ratingResources && ratingResources.indicators && ratingResources.indicators[displayCategory]) {
          const categoryData = ratingResources.indicators[displayCategory];
          const lines = [];
          
          // その他は0-10、他は1-10
          const start = category === 'その他' ? 0 : 1;
          for (let i = start; i <= 10; i++) {
            if (categoryData[i]) {
              lines.push(categoryData[i]);
            }
          }
          
          if (lines.length > 0) {
            tooltipText = lines.join('\n');
          }
        }
      }
    } catch (error) {
      console.warn('Localizer error in showTooltip, using fallback:', error);
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'rating-tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const labelRect = labelElement.getBoundingClientRect();
    const left = labelRect.right + 10;
    const top = labelRect.top - 10;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    requestAnimationFrame(() => {
      tooltip.classList.add('show');
    });
    
    this.currentTooltip = tooltip;
  }

  // ツールチップ非表示
  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }

  // 評価指標表示エリアの更新
  updateRatingIndicatorDisplay(category, value) {
    const displayElement = document.getElementById('rating-indicator-display');
    if (!displayElement) return;

    // 安全にローカライザーから評価指標を取得
    try {
      if (!window.localizer || !window.localizer.resources) {
        displayElement.textContent = `${category}：評価指標を表示`;
        displayElement.classList.remove('show');
        return;
      }
      
      const resources = window.localizer.resources;
      const currentLang = window.localizer.getCurrentLanguage();
      
      // カテゴリ名をローカライズ（categoryMapを使用）
      const categoryMap = resources.categoryMap || {};
      const displayCategory = categoryMap[category] || category;
      
      // 評価指標を取得
      const ratingResources = resources.ratings;
      
      if (ratingResources && ratingResources.indicators && 
          ratingResources.indicators[displayCategory] && 
          ratingResources.indicators[displayCategory][value]) {
        
        // テンプレートフォーマット（ローカライゼーション対応）
        const separator = currentLang === 'en' ? ': ' : '：';
        const finalText = `${displayCategory}${separator}${ratingResources.indicators[displayCategory][value]}`;
        
        displayElement.textContent = finalText;
        displayElement.classList.add('show');
      } else {
        const placeholder = window.localizer.getText('ui.placeholders.ratingIndicator');
        displayElement.textContent = placeholder;
        displayElement.classList.remove('show');
      }
      
    } catch (error) {
      console.warn('Localizer error in updateRatingIndicatorDisplay, using fallback:', error);
      displayElement.textContent = `${category}：評価指標を表示`;
      displayElement.classList.remove('show');
    }
  }

  // メイン画面表示
  async showMainView() {
    this.stopAutoSave();
    
    // 画面遷移時保存（既存機能を継続使用）
    if (this.hasUnsavedChanges && this.editingGameId) {
      await this.saveCurrentEdit();
    }

    this.hideView('detail-view');
    this.showView('main-view');
    this.currentView = 'main';
    this.editingGameId = null;
    
    this.restoreMainViewState();
    await window.gameListManager.refreshList();
  }

  // 詳細画面表示
  async showDetailView(gameId) {
    this.saveMainViewState();
    
    // 詳細画面を開く時にベルアイコンをリセット
    await this.resetUpdateNotification(gameId);
    
    this.hideView('main-view');
    this.showView('detail-view');
    this.currentView = 'detail';
    this.editingGameId = gameId;
    this.lastDetailGameId = gameId;
    
    await this.loadGameData(gameId);
    this.startAutoSave(); // イベント駆動型自動保存を開始
  }

  // 更新通知をリセット（ベルアイコンを消す）とNEWステータスを☑に変更
  async resetUpdateNotification(gameId) {
    try {
      const game = await window.gameDataManager.getGame(gameId);
      if (game) {
        let updates = {};
        let logMessage = '';
        
        if (game.version_status === 'updated') {
          updates.version_status = 'latest';
          updates.update_notification = false;
          logMessage = `🔔→✅ ベルアイコンリセット: ${game.title}`;
        } else if (game.version_status === 'new') {
          updates.version_status = 'latest';
          logMessage = `🆕→✅ NEWステータスリセット: ${game.title}`;
        }
        
        if (Object.keys(updates).length > 0) {
          console.log(logMessage);
          
          await window.gameDataManager.updateGame(gameId, updates);
          
          // メインビューのリストを更新（アイコンを消すため）
          if (window.gameListManager) {
            await window.gameListManager.refreshList();
          }
        }
      }
    } catch (error) {
      console.error('❌ 通知リセットエラー:', error);
    }
  }

  // 画面切り替えヘルパー
  showView(viewId) {
    const view = document.getElementById(viewId);
    view.classList.remove('hidden');
    view.classList.add('active');
  }

  hideView(viewId) {
    const view = document.getElementById(viewId);
    view.classList.add('hidden');
    view.classList.remove('active');
  }

  // メイン画面状態保存
  saveMainViewState() {
    const activeFilter = document.querySelector('.filter-btn.active');
    const searchInput = document.getElementById('search-input');
    const gameListContainer = document.querySelector('.game-list-container');
    
    this.mainViewState = {
      filter: activeFilter ? activeFilter.dataset.filter : 'all',
      searchQuery: searchInput.value,
      scrollPosition: gameListContainer.scrollTop
    };
  }

  // メイン画面状態復元
  restoreMainViewState() {
    // フィルタ復元
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === this.mainViewState.filter) {
        btn.classList.add('active');
      }
    });

    // 検索クエリ復元
    document.getElementById('search-input').value = this.mainViewState.searchQuery;

    // スクロール位置復元（少し遅延）
    setTimeout(() => {
      const gameListContainer = document.querySelector('.game-list-container');
      gameListContainer.scrollTop = this.mainViewState.scrollPosition;
    }, 100);
  }

  // ゲームデータ読み込み
  async loadGameData(gameId) {
    try {
      console.log(`🔍 詳細画面でゲーム検索: ID = ${gameId}`);
      const game = await window.gameDataManager.getGame(gameId);
      if (!game) {
        // デバッグ: 現在のゲーム一覧を確認
        const allGames = await window.gameDataManager.getGames();
        console.log(`❌ ゲームが見つかりません。現在のゲーム数: ${allGames.length}`);
        console.log(`📋 利用可能なID一覧:`, allGames.map(g => g.id).slice(0, 5));
        throw new Error('Game not found');
      }

      // タイトルと基本情報
      document.getElementById('detail-title').textContent = `No.${game.no} ${game.title}`;
      
      // 安全にローカライザーを使用して作者表示
      const authorLabel = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.labels.author') : '作者';
      
      document.getElementById('detail-author').textContent = `${authorLabel}: ${game.author}`;
      
      // 更新日情報
      const versionElement = document.getElementById('detail-version');
      
      // デバッグ: 詳細画面でゲームデータを確認
      console.log(`📋 詳細画面データ確認 (No.${game.no} ${game.title}):`);
      console.log(`  lastUpdate: ${game.lastUpdate}`);
      console.log(`  last_update: ${game.last_update}`);
      console.log(`  version: ${game.version}`);
      console.log(`  updated_at: ${game.updated_at}`);
      
      const lastUpdateValue = game.lastUpdate || game.last_update || game.version;
      if (lastUpdateValue) {
        // ウディコン形式の更新日（[7/13]Ver1.2に更新 等）はそのまま表示
        let updateText = '';
        
        // ISO形式の日付文字列の場合のみ日付変換
        if (typeof lastUpdateValue === 'string' && lastUpdateValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
          try {
            const updateDate = new Date(lastUpdateValue);
            if (!isNaN(updateDate.getTime())) {
              const updateLabel = (window.localizer && window.localizer.getText) ? 
                window.localizer.getText('ui.labels.updateDate') : '更新日';
              updateText = `${updateLabel}: ${updateDate.toLocaleDateString('ja-JP')}`;
            } else {
              const updateLabel = (window.localizer && window.localizer.getText) ? 
                window.localizer.getText('ui.labels.updateDate') : '更新日';
              updateText = `${updateLabel}: ${lastUpdateValue}`;
            }
          } catch (error) {
            const updateLabel = (window.localizer && window.localizer.getText) ? 
              window.localizer.getText('ui.labels.updateDate') : '更新日';
            updateText = `${updateLabel}: ${lastUpdateValue}`;
          }
        } else {
          // ウディコン形式やその他の文字列は「→」以降を除去して表示
          let cleanUpdateValue = lastUpdateValue;
          if (typeof lastUpdateValue === 'string' && lastUpdateValue.includes('→')) {
            cleanUpdateValue = lastUpdateValue.split('→')[0].trim();
          }
          const updateLabel = (window.localizer && window.localizer.getText) ? 
            window.localizer.getText('ui.labels.updateDate') : '更新日';
          updateText = `${updateLabel}: ${cleanUpdateValue}`;
        }
        
        console.log(`📅 詳細画面表示: ${updateText}`);
        versionElement.textContent = updateText;
      } else {
        versionElement.textContent = '';
      }

      // リンク設定は削除済みのためコメントアウト
      // document.getElementById('wodicon-url').value = game.wodicon_url;
      // document.getElementById('folder-path').value = game.local_folder_path || '';

      // 評価システム
      this.loadRatingData(game.rating);

      // 感想
      document.getElementById('review-textarea').value = game.review || '';
      this.updateCharacterCount();
      
      // 目盛りを追加
      this.addTickMarks();
      
      // 平均点を計算して表示
      await this.displayAverageRating();

      this.hasUnsavedChanges = false;
      const loadCompleteMsg = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.loadComplete') : '💾 読み込み完了';
      this.updateSaveStatus(loadCompleteMsg);

      // 感想入力促進ハイライト判定
      this.updateReviewTextareaHighlight();

    } catch (error) {
      console.error('Failed to load game data:', error);
      const loadErrorMsg = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.loadError') : '❌ 読み込み失敗・新規作成';
      this.updateSaveStatus(loadErrorMsg, 'error');
      
      // 読み込み失敗時の初期化処理
      await this.initializeDetailView();
    }
  }

  // 詳細画面初期化（読み込み失敗時）
  async initializeDetailView() {
    try {
      // ゲームリストから基本情報を取得する試行
      let gameInfo = null;
      if (this.editingGameId) {
        gameInfo = await this.loadGameDataFromList(this.editingGameId);
      }
      
      // 基本情報を設定（取得できた場合は使用、そうでなければ不明）
      const title = gameInfo ? `No.${gameInfo.no} ${gameInfo.title}` : '作品詳細 - 読み込み失敗';
      
      // 安全にローカライザーを使用してラベル取得
      const authorLabel = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.labels.author') : '作者';
      
      const unknownLabel = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.labels.unknown') : '不明';
      
      const author = gameInfo ? `${authorLabel}: ${gameInfo.author}` : `${authorLabel}: ${unknownLabel}`;
      
      document.getElementById('detail-title').textContent = title;
      document.getElementById('detail-author').textContent = author;
      
      // 更新日情報
      const versionElement = document.getElementById('detail-version');
      if (gameInfo && gameInfo.lastUpdate) {
        // ISO形式の日付文字列の場合のみ日付変換
        if (typeof gameInfo.lastUpdate === 'string' && gameInfo.lastUpdate.match(/^\d{4}-\d{2}-\d{2}T/)) {
          try {
            const updateDate = new Date(gameInfo.lastUpdate);
            if (!isNaN(updateDate.getTime())) {
              const updateLabel = (window.localizer && window.localizer.getText) ? 
                window.localizer.getText('ui.labels.updateDate') : '更新日';
              versionElement.textContent = `${updateLabel}: ${updateDate.toLocaleDateString('ja-JP')}`;
            } else {
              const updateLabel = (window.localizer && window.localizer.getText) ? 
                window.localizer.getText('ui.labels.updateDate') : '更新日';
              versionElement.textContent = `${updateLabel}: ${gameInfo.lastUpdate}`;
            }
          } catch (error) {
            const updateLabel = (window.localizer && window.localizer.getText) ? 
              window.localizer.getText('ui.labels.updateDate') : '更新日';
            versionElement.textContent = `${updateLabel}: ${gameInfo.lastUpdate}`;
          }
        } else {
          // ウディコン形式やその他の文字列は「→」以降を除去して表示
          let cleanUpdateValue = gameInfo.lastUpdate;
          if (typeof gameInfo.lastUpdate === 'string' && gameInfo.lastUpdate.includes('→')) {
            cleanUpdateValue = gameInfo.lastUpdate.split('→')[0].trim();
          }
          const updateLabel = (window.localizer && window.localizer.getText) ? 
            window.localizer.getText('ui.labels.updateDate') : '更新日';
          versionElement.textContent = `${updateLabel}: ${cleanUpdateValue}`;
        }
      } else {
        versionElement.textContent = '';
      }

      // 評価スライダーと入力フィールドのみリセット（平均バーは保持）
      this.resetInputsOnly();
      
      // 目盛りを追加
      this.addTickMarks();
      
      // 平均バーを表示（全作品の平均値）
      await this.displayAverageRating();
      
      // 感想入力促進ハイライト判定
      this.updateReviewTextareaHighlight();
      
    } catch (error) {
      console.error('Failed to initialize detail view:', error);
    }
  }

  // 評価データ読み込み
  loadRatingData(rating) {
    const categories = window.constants.RATING_CATEGORIES;
    
    categories.forEach(category => {
      const slider = document.querySelector(`[data-category="${category}"]`);
      const value = rating[category];
      
      if (value === null || value === undefined) {
        // 「その他」項目のみ最小値0、他は1
        slider.value = category === 'その他' ? 0 : 1;
        const valueSpan = slider.parentElement.querySelector('.rating-value');
        valueSpan.textContent = '-';
      } else {
        slider.value = value;
        const valueSpan = slider.parentElement.querySelector('.rating-value');
        valueSpan.textContent = value;
      }
    });

    this.updateTotalRating();
  }

  // 平均点表示（リアルタイム対応版）
  async displayAverageRating(currentFormRating = null) {
    try {
      // 各項目ごとの平均を計算
      const games = await window.gameDataManager.getGames();
      let playedGames = games.filter(game => game.is_played && game.rating);
      
      // リアルタイム更新の場合、現在編集中ゲームのデータを一時的に置き換え
      if (currentFormRating && this.editingGameId) {
        playedGames = [...playedGames];
        
        // 型安全な重複判定（文字列・数値両対応）
        const editingGameId = String(this.editingGameId);
        const currentGameIndex = playedGames.findIndex(g => String(g.id) === editingGameId);
        
        const currentGameData = {
          id: this.editingGameId,
          rating: currentFormRating,
          is_played: window.gameDataManager.isRatingComplete(currentFormRating)
        };
        
        if (currentGameIndex >= 0) {
          // 既存ゲームの評価を一時的に置き換え（重複排除）
          playedGames[currentGameIndex] = { ...playedGames[currentGameIndex], ...currentGameData };
        } else {
          // 現在編集中ゲームが元々playedGamesに含まれていない場合のみ
          // 且つ評価完了の場合のみ追加（重複防止）
          if (currentGameData.is_played) {
            // 全ゲーム配列からも重複チェック（念の為の安全装置）
            const allGamesHasThis = games.some(g => String(g.id) === editingGameId);
            if (allGamesHasThis) {
              // 既存ゲームなのにplayedGamesに含まれていない = is_played=falseだった
              // 新たに評価完了したので追加
              playedGames.push(currentGameData);
            } else {
              // 完全新規ゲーム（通常はここに来ない）
              playedGames.push(currentGameData);
            }
          }
        }
      }
      
      if (playedGames.length === 0) return;
      
      const categories = window.constants.RATING_CATEGORIES;
      const averages = {};
      
      categories.forEach(category => {
        // null値を除外して平均を計算
        const validRatings = playedGames
          .map(game => game.rating[category])
          .filter(rating => rating !== null && rating !== undefined && rating > 0);
        
        if (validRatings.length > 0) {
          const total = validRatings.reduce((sum, rating) => sum + rating, 0);
          averages[category] = total / validRatings.length;
        } else {
          averages[category] = 0;
        }
      });
      
      // 各スライダーに平均線を追加
      this.updateAverageIndicators(averages);
      
    } catch (error) {
      console.error('Failed to display average rating:', error);
    }
  }

  // 目盛りを追加
  addTickMarks() {
    const categories = window.constants.RATING_CATEGORIES;
    
    categories.forEach(category => {
      const slider = document.querySelector(`[data-category="${category}"]`);
      if (slider) {
        const ratingInput = slider.closest('.rating-input');
        if (ratingInput) {
          // 既存の目盛りを削除
          const existingTicks = ratingInput.querySelector('.rating-tick-marks');
          if (existingTicks) {
            existingTicks.remove();
          }
          
          // 新しい目盛りを作成
          const tickMarks = document.createElement('div');
          tickMarks.className = 'rating-tick-marks';
          
          // 位置基準を確保
          ratingInput.style.position = 'relative';
          
          // スライダー要素の実際の位置と幅を取得（平均バーと同じ計算）
          const ratingInputRect = ratingInput.getBoundingClientRect();
          const sliderRect = slider.getBoundingClientRect();
          const sliderCursolSize = 8;
          
          // スライダーの実際の幅と相対位置を計算
          const sliderWidth = sliderRect.width - sliderCursolSize * 2;
          const sliderStartPos = sliderRect.left - ratingInputRect.left + sliderCursolSize;
          
          // 「その他」項目は0-10で10等分、他は1-10で9等分
          const tickCount = category === 'その他' ? 10 : 9;
          
          for (let i = 1; i < tickCount; i++) {
            const tick = document.createElement('div');
            tick.style.position = 'absolute';
            
            // 平均バーと同じ位置計算方法
            const tickPosition = (i / tickCount) * sliderWidth;
            const finalPosition = sliderStartPos + tickPosition;
            
            tick.style.left = `${finalPosition}px`;
            tick.style.top = '0px';
            tick.style.transform = '';
            tick.style.width = '1px';
            tick.style.height = '5px';
            tick.style.backgroundColor = 'rgba(102, 126, 234, 0.5)';
            tick.style.pointerEvents = 'none';
            tick.style.zIndex = '4';
            
            tickMarks.appendChild(tick);
          }
          
          ratingInput.appendChild(tickMarks);
        }
      }
    });
  }

  // 平均点インジケータを更新
  updateAverageIndicators(averages) {
    const categories = window.constants.RATING_CATEGORIES;
    
    categories.forEach(category => {
      const slider = document.querySelector(`[data-category="${category}"]`);
      if (slider) {
        const average = averages[category] || 0;
        
        // 値を1-10の範囲に制限
        const clampedAverage = Math.max(1, Math.min(10, average));
        
        // スライダーコンテナ内の相対位置を計算（0-100%）
        const position = ((clampedAverage - 1) / 9) * 100;
        
        // 位置を0-100%の範囲に制限（安全対策）
        const clampedPosition = Math.max(0, Math.min(100, position));
        
        // 既存の平均線を削除
        const existingLine = slider.parentElement.querySelector('.average-line');
        if (existingLine) {
          existingLine.remove();
        }
        
        // 平均値が有効な場合のみ平均線を表示
        if (average > 0) {
          const averageLine = document.createElement('div');
          averageLine.className = 'average-line';
          
          // 多言語対応の平均ラベルとタイトル
          const averageLabel = (window.localizer && window.localizer.getText) ? 
            window.localizer.getText('ui.labels.average') : '平均';
          averageLine.setAttribute('data-average-label', averageLabel);
          averageLine.title = `${averageLabel}: ${average.toFixed(1)}点`;
          
          // スライダーの親要素（.rating-input）に追加
          const ratingInput = slider.closest('.rating-input');
          if (ratingInput) {
            ratingInput.style.position = 'relative'; // 位置基準を確保
            
            // スライダー要素の実際の位置と幅を取得
            const ratingInputRect = ratingInput.getBoundingClientRect();
            const sliderRect = slider.getBoundingClientRect();
            const sliderCursolSize = 8;
            
            // スライダーの実際の幅と相対位置を計算
            const sliderWidth = sliderRect.width - sliderCursolSize * 2;
            const sliderStartPos = sliderRect.left - ratingInputRect.left + sliderCursolSize;
            
            // スライダー範囲内での位置を計算
            const positionInSlider = (clampedPosition / 100) * sliderWidth;
            const finalPosition = sliderStartPos + positionInSlider;
            
            averageLine.style.left = `${finalPosition}px`;
            ratingInput.appendChild(averageLine);
            
            console.log(`平均線配置: ${category} 平均=${average.toFixed(1)} 位置=${finalPosition}px (${clampedPosition}%)`);
          }
        }
      }
    });
  }

  // 現在の編集内容保存
  async saveCurrentEdit() {
    if (!this.editingGameId) return false;

    try {
      const savingMsg = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.saving') : '💾 保存中...';
      this.updateSaveStatus(savingMsg, 'saving');

      const updates = this.collectFormData();
      const success = await window.gameDataManager.updateGame(this.editingGameId, updates);

      if (success) {
        this.hasUnsavedChanges = false;
        const saveCompleteMsg = (window.localizer && window.localizer.getText) ? 
          window.localizer.getText('ui.status.saveComplete') : '✅ 保存完了';
        const readyMsg = (window.localizer && window.localizer.getText) ? 
          window.localizer.getText('ui.status.ready') : '💾 準備完了';
        
        this.updateSaveStatus(saveCompleteMsg, 'saved');
        setTimeout(() => {
          this.updateSaveStatus(readyMsg);
        }, 2000);
        return true;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      const saveErrorMsg = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.saveError') : '❌ 保存失敗';
      this.updateSaveStatus(saveErrorMsg, 'error');
      return false;
    }
  }

  // フォームデータ収集
  collectFormData() {
    // folder-pathフィールドは削除済みのためコメントアウト
    // const folderPath = document.getElementById('folder-path').value.trim();
    const review = document.getElementById('review-textarea').value.trim();
    
    // 評価データ収集（定数使用）
    const rating = Object.fromEntries(
      window.constants.RATING_CATEGORIES.map(category => [
        category, 
        parseInt(document.querySelector(`[data-category="${category}"]`).value)
      ])
    );
    
    rating.total = window.gameDataManager.calculateTotalRating(rating);

    return {
      // local_folder_path: folderPath, // フィールド削除済みのためコメントアウト
      rating: rating,
      review: review,
      review_length: review.length,
      is_played: window.gameDataManager.isRatingComplete(rating)
    };
  }

  // 現在編集中のゲームデータをフォームの値と合わせて取得
  async getCurrentGameDataWithFormValues() {
    if (!this.editingGameId) {
      return null;
    }
    try {
      // First, get the current form data, as this represents the user's latest input.
      const formData = this.collectFormData();

      // Then, try to get the stored game data to get metadata like title, no, etc.
      let game = await window.gameDataManager.getGame(this.editingGameId);

      if (!game) {
        // If the game is not in storage (e.g., new entry), get basic info from the list.
        game = await this.loadGameDataFromList(this.editingGameId);
        if (!game) {
            // If it's not in the list either, we can't proceed.
            return null;
        }
      }

      // Combine the stored data with the current form data.
      // The form data should take precedence for fields like 'rating' and 'review'.
      return {
        ...game,
        ...formData
      };
    } catch (error) {
      console.error('Failed to get current game data with form values:', error);
      return null;
    }
  }

  // 編集内容リセット
  async resetCurrentEdit() {
    if (!this.editingGameId) return;

    if (this.hasUnsavedChanges) {
      const confirmMsg = (window.localizer && window.localizer.getText) ? 
        window.localizer.getText('ui.status.confirmReset') : '未保存の変更があります。リセットしますか？';
      const confirmed = confirm(confirmMsg);
      if (!confirmed) return;
    }

    await this.loadGameData(this.editingGameId);
  }

  // 共通のフォームリセット処理
  resetFormInputs() {
    try {
      // 評価スライダーをリセット
      const ratingCategories = window.constants.RATING_CATEGORIES;
      ratingCategories.forEach(category => {
        const slider = document.querySelector(`input[data-category="${category}"]`);
        if (slider) {
          slider.value = 1;
          const valueSpan = slider.nextElementSibling;
          if (valueSpan) {
            valueSpan.textContent = '1';
          }
        }
      });

      // 感想テキストエリアをクリア
      const reviewTextarea = document.getElementById('review-textarea');
      if (reviewTextarea) {
        reviewTextarea.value = '';
        // 感想入力促進ハイライトをクリア
        reviewTextarea.classList.remove('review-textarea-highlight');
      }

      // 文字数カウンターをクリア
      const charCount = document.getElementById('character-count');
      if (charCount) {
        charCount.textContent = '0';
      }

      // 合計評価をリセット - テンプレート使用
      this.updateTotalRatingDisplay(6);

      // 変更フラグをリセット
      this.hasUnsavedChanges = false;

    } catch (error) {
      console.error('resetFormInputs エラー:', error);
    }
  }

  // UI要素をリセット（削除時など、平均バーも含めて完全リセット）
  resetUI() {
    try {
      // 共通のフォームリセット
      this.resetFormInputs();

      // 平均バーを完全にリセット
      const averageBars = document.querySelectorAll('.average-bar');
      averageBars.forEach(bar => {
        bar.style.display = 'none';
        bar.style.width = '0%';
        bar.style.opacity = '0';
      });

      // 平均値表示をリセット
      const averageValues = document.querySelectorAll('.average-value');
      averageValues.forEach(value => {
        value.textContent = '';
        value.style.display = 'none';
      });

    } catch (error) {
      console.error('resetUI エラー:', error);
    }
  }

  // 入力フィールドのみリセット（平均バーは保持）
  resetInputsOnly() {
    this.resetFormInputs();
  }

  // ゲームデータ削除
  async deleteCurrentGame() {
    if (!this.editingGameId) return;

    const game = await window.gameDataManager.getGame(this.editingGameId);
    if (!game) return;

    const confirmTemplate = (window.localizer && window.localizer.getText) ? 
      window.localizer.getText('ui.status.confirmDeleteGame') : 
      '「{title}」の評価・感想データを削除しますか？\n\nこの操作は取り消せません。';
    const confirmMsg = confirmTemplate.replace('{title}', game.title);
    const confirmed = confirm(confirmMsg);
    if (!confirmed) return;

    try {
      // 評価と感想をクリア（適切なデフォルト評価オブジェクトで自動フラグ更新を回避）
      const defaultRating = Object.fromEntries(
        window.constants.RATING_CATEGORIES.map(category => [category, null])
      );
      defaultRating.total = 0;
      
      await window.gameDataManager.updateGame(this.editingGameId, {
        rating: defaultRating,
        review: '',
        is_played: false
      });

      console.log(`ゲームデータ削除完了: ${game.title}`);
      
      // UI更新して即座にメイン画面に戻る
      this.resetUI();
      this.showMainView();

    } catch (error) {
      console.error('削除処理エラー:', error);
      
      // エラーが発生してもデータは削除されている可能性があるため
      // 確認せずに削除完了として扱い、メイン画面に戻る
      console.log('削除処理は完了している可能性があります。メイン画面に戻ります。');
      this.resetUI();
      this.showMainView();
    }
  }

  // 自動保存開始（イベント駆動型）
  startAutoSave() {
    this.stopAutoSave();
    // beforeUnloadイベントリスナーを追加（拡張機能終了時保存）
    this.setupBeforeUnloadSave();
  }

  // 自動保存停止
  stopAutoSave() {
    // beforeUnloadイベントリスナーを削除
    this.removeBeforeUnloadSave();
  }

  // 拡張機能終了時保存の設定（visibilitychange使用）
  setupBeforeUnloadSave() {
    // Chrome拡張機能ではbeforeunloadが動作しない場合があるため
    // visibilitychangeイベントを使用（タブ切り替え時・拡張機能終了時）
    this.visibilityChangeHandler = async () => {
      if (document.visibilityState === 'hidden' && this.hasUnsavedChanges && this.editingGameId) {
        try {
          const updates = this.collectFormData();
          await window.gameDataManager.updateGame(this.editingGameId, updates);
          this.hasUnsavedChanges = false;
          console.log('🔄 拡張機能終了時自動保存完了');
        } catch (error) {
          console.error('❌ 拡張機能終了時保存エラー:', error);
        }
      }
    };
    
    // visibilitychangeイベントを追加
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // 拡張機能終了時保存の削除
  removeBeforeUnloadSave() {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  // 遅延自動保存は削除済み（イベント駆動型に変更）
  // debouncedAutoSave() - 削除完了

  // 変更フラグ設定
  markAsChanged() {
    this.hasUnsavedChanges = true;
    const hasChangesMsg = (window.localizer && window.localizer.getText) ? 
      window.localizer.getText('ui.status.hasChanges') : '💾 未保存の変更があります';
    this.updateSaveStatus(hasChangesMsg);
  }

  // 保存状態更新
  updateSaveStatus(text, className = '') {
    const statusElement = document.getElementById('save-status-text');
    statusElement.textContent = text;
    
    statusElement.className = '';
    if (className) {
      statusElement.classList.add(className);
    }
  }

  // 合計評価更新
  updateTotalRating() {
    const sliders = document.querySelectorAll('.rating-slider');
    let total = 0;
    let ratedCount = 0;
    
    sliders.forEach(slider => {
      const valueSpan = slider.parentElement.querySelector('.rating-value');
      
      // 現在の表示が「-」かどうかで判定
      if (valueSpan.textContent === '-') {
        // null値の場合は合計に含めない
        return;
      } else {
        // 値がある場合は合計に加算
        total += parseInt(slider.value);
        ratedCount++;
        valueSpan.textContent = slider.value;
      }
    });
    
    this.updateTotalRatingDisplay(total);
    
  }

  // 合計評価表示の更新（テンプレート使用）
  updateTotalRatingDisplay(total) {
    const displayElement = document.getElementById('total-rating-display');
    if (!displayElement) return;

    try {
      if (window.localizer && window.localizer.getText) {
        const template = window.localizer.getText('ui.templates.totalRating');
        const displayText = template.replace('{score}', total).replace('{maxScore}', '60');
        displayElement.textContent = displayText;
      } else {
        // フォールバック
        displayElement.textContent = `${total}/60点`;
      }
    } catch (error) {
      console.warn('Localizer error in updateTotalRatingDisplay, using fallback:', error);
      displayElement.textContent = `${total}/60点`;
    }
  }

  // 文字数カウント更新
  updateCharacterCount() {
    const textarea = document.getElementById('review-textarea');
    const count = textarea.value.length;
    document.getElementById('character-count').textContent = count;
    
    // 文字数制限警告
    const countElement = document.getElementById('character-count');
    if (count > 1800) {
      countElement.style.color = '#ff9800';
    } else if (count > 1900) {
      countElement.style.color = '#f44336';
    } else {
      countElement.style.color = '#666';
    }
  }

  // フォームから現在の評価値を取得
  getCurrentFormRating() {
    const categories = window.constants.RATING_CATEGORIES;
    const rating = {};
    
    categories.forEach(category => {
      const slider = document.querySelector(`[data-category="${category}"]`);
      const valueSpan = slider.parentElement.querySelector('.rating-value');
      
      // null値処理（Requirement 3対応）
      if (valueSpan.textContent === '-') {
        rating[category] = null;
      } else {
        rating[category] = parseInt(slider.value);
      }
    });
    
    return rating;
  }

  // リアルタイム平均バー更新（統一ロジック版）
  async updateAverageBarRealtime() {
    try {
      // 現在のフォーム値を取得
      const currentRating = this.getCurrentFormRating();
      
      // 既存の正確な平均計算ロジックを現在のフォーム値付きで実行
      await this.displayAverageRating(currentRating);
      
    } catch (error) {
      // 統一エラーハンドリング（Requirement 4対応）
      window.errorHandler.handleError(error, 'realtime-average-update');
      console.warn('平均バー更新エラー - 前回表示を維持します');
    }
  }


  // ローカルフォルダ機能は削除済み（未使用コードクリーンアップ）

  // フォルダ編集機能は削除済み（未使用コードクリーンアップ）

  // ウディコンページ機能は削除済み（未使用コードクリーンアップ）

  // ウディコンリンクを開く
  async openWodiconLink() {
    if (!this.editingGameId) return;
    
    try {
      const game = await window.gameDataManager.getGame(this.editingGameId);
      if (game && game.wodicon_url) {
        await chrome.tabs.create({ url: game.wodicon_url, active: true });
      }
    } catch (error) {
      console.error('Failed to open Wodicon link:', error);
    }
  }

  // ゲームリストから基本情報を取得（フォールバック用）
  async loadGameDataFromList(gameId) {
    try {
      // GameListManagerから直接作品情報を取得
      if (window.gameListManager && window.gameListManager.games) {
        const game = window.gameListManager.games.find(g => g.id == gameId);
        if (game) {
          return {
            no: game.no,
            title: game.title,
            author: game.author,
            genre: game.genre,
            lastUpdate: game.lastUpdate || game.last_update || game.version || game.updated_at
          };
        }
      }
      
      // dataManagerから作品リストを取得
      const allGames = await window.gameDataManager.getGames();
      const targetGame = allGames.find(g => g.id == gameId);
      if (targetGame) {
        return {
          no: targetGame.no,
          title: targetGame.title,
          author: targetGame.author,
          genre: targetGame.genre,
          lastUpdate: targetGame.lastUpdate || targetGame.last_update || targetGame.version || targetGame.updated_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load game data from list:', error);
      return null;
    }
  }

  // 感想入力促進ハイライト更新
  updateReviewTextareaHighlight() {
    try {
      const reviewTextarea = document.getElementById('review-textarea');
      if (!reviewTextarea) return;

      // 現在の「その他」評価値を取得
      const otherSlider = document.querySelector('input[data-category="その他"]');
      const otherValue = otherSlider ? parseInt(otherSlider.value) : 0;

      // 現在の感想内容を取得
      const reviewValue = reviewTextarea.value.trim();

      // 「その他」評価が0より大きく、感想が未入力の場合にハイライト
      if (otherValue > 0 && reviewValue === '') {
        reviewTextarea.classList.add('review-textarea-highlight');
      } else {
        reviewTextarea.classList.remove('review-textarea-highlight');
      }
    } catch (error) {
      console.error('感想入力促進ハイライト更新エラー:', error);
    }
  }

  // フォルダボタンクリック処理
  async handleFolderButtonClick() {
    try {
      if (!this.editingGameId) {
        console.error('編集中のゲームIDが設定されていません');
        return;
      }

      // ゲームフォルダ管理システムの初期化を確認
      await this.initializeGameFolderSystem();

      // フォルダ設定状態をチェック
      const isConfigured = await this.checkFolderConfiguration(this.editingGameId);

      if (!isConfigured) {
        // 未設定の場合：確認メッセージ → ゲームフォルダ管理ページを開く
        const confirmMessage = 'ローカルフォルダが設定されていません。\nゲームフォルダ管理ページを開いて設定しますか？';
        
        if (confirm(confirmMessage)) {
          chrome.tabs.create({
            url: chrome.runtime.getURL('game_folder_management.html')
          });
        }
      } else {
        // 設定済みの場合：フルパスをクリップボードにコピー
        await this.copyGameFolderPath(this.editingGameId);
      }

    } catch (error) {
      console.error('❌ フォルダボタンクリック処理エラー:', error);
      // 統一エラーハンドリング
      if (window.errorHandler) {
        window.errorHandler.handleError(error, 'folder-button-click');
      }
    }
  }

  // ゲームフォルダシステム初期化
  async initializeGameFolderSystem() {
    // GameFolderManagerのインスタンスが存在しない場合は作成
    if (!window.gameFolderManager) {
      // GameFolderManagerクラスを動的に読み込み（必要に応じて）
      // 通常はgameFolderManager.jsが既に読み込まれている前提
      
      // 基本的なフォルダデータ管理機能のみ実装
      window.gameFolderManager = {
        isGameFolderConfigured: async (gameId) => {
          return await this.checkFolderConfigurationDirect(gameId);
        },
        getGameFullPath: async (gameId) => {
          return await this.getGameFullPathDirect(gameId);
        }
      };
    }
  }

  // フォルダ設定状態の直接チェック
  async checkFolderConfiguration(gameId) {
    try {
      // 現在の年度を取得
      let currentYear;
      if (window.yearManager) {
        currentYear = await window.yearManager.getCurrentYear();
      } else {
        currentYear = new Date().getFullYear().toString();
      }

      console.log('🔍 フォルダ設定チェック開始:', { gameId, currentYear });

      // ルートパスとフォルダデータを取得
      const rootPathKey = `wodicon_root_path_${currentYear}`;
      const folderDataKey = `wodicon_folder_data_${currentYear}`;
      
      console.log('🔍 Storage keys:', { rootPathKey, folderDataKey });
      
      const result = await chrome.storage.local.get([rootPathKey, folderDataKey]);
      
      console.log('🔍 Storage result:', result);
      
      const rootPath = result[rootPathKey];
      const folderData = result[folderDataKey] || {};
      const gameFolder = folderData[gameId];

      console.log('🔍 Data extraction:', { rootPath, folderData, gameFolder });

      // ルートパスとフォルダ名の両方が設定されている場合のみtrue
      const isConfigured = !!(rootPath && gameFolder);
      console.log('🔍 Configuration status:', isConfigured);
      
      return isConfigured;

    } catch (error) {
      console.error('フォルダ設定状態チェックエラー:', error);
      return false;
    }
  }

  // フォルダ設定状態の直接チェック（バックアップ用）
  async checkFolderConfigurationDirect(gameId) {
    return await this.checkFolderConfiguration(gameId);
  }

  // ゲームフォルダパスをクリップボードにコピー
  async copyGameFolderPath(gameId) {
    try {
      const fullPath = await this.getGameFullPathDirect(gameId);
      
      if (!fullPath) {
        this.showTemporaryMessage('❌ フォルダパスが設定されていません', 'error');
        return;
      }

      // クリップボードにコピー（アラートなし）
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullPath);
        console.log('✅ フォルダパスコピー成功:', fullPath);
      } else {
        // フォールバック
        const textarea = document.createElement('textarea');
        textarea.value = fullPath;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        console.log('✅ フォルダパスコピー成功（フォールバック方式):', fullPath);
      }
      
      // 成功時は控えめな通知（アラートではなく一時メッセージ）
      this.showTemporaryMessage(`📁 ${fullPath}`, 'success');

    } catch (error) {
      console.error('❌ フォルダパスコピーエラー:', error);
      this.showTemporaryMessage(`❌ コピー失敗: ${error.message}`, 'error');
    }
  }

  // ゲームフルパス直接取得
  async getGameFullPathDirect(gameId) {
    try {
      // 現在の年度を取得
      let currentYear;
      if (window.yearManager) {
        currentYear = await window.yearManager.getCurrentYear();
      } else {
        currentYear = new Date().getFullYear().toString();
      }

      console.log('🔍 フルパス取得開始:', { gameId, currentYear });

      // ルートパスとフォルダデータを取得
      const rootPathKey = `wodicon_root_path_${currentYear}`;
      const folderDataKey = `wodicon_folder_data_${currentYear}`;
      
      console.log('🔍 Path keys:', { rootPathKey, folderDataKey });
      
      const result = await chrome.storage.local.get([rootPathKey, folderDataKey]);
      
      console.log('🔍 Path storage result:', result);
      
      const rootPath = result[rootPathKey];
      const folderData = result[folderDataKey] || {};
      const gameFolder = folderData[gameId];

      console.log('🔍 Path data:', { rootPath, folderData, gameFolder });

      if (!rootPath || !gameFolder) {
        console.log('🔍 Missing data - rootPath:', !!rootPath, 'gameFolder:', !!gameFolder);
        return null;
      }

      const fullPath = `${rootPath}\\${gameFolder}`;
      console.log('🔍 Generated full path:', fullPath);
      return fullPath;

    } catch (error) {
      console.error('ゲームフルパス取得エラー:', error);
      return null;
    }
  }

  // 一時メッセージ表示
  showTemporaryMessage(message, type = 'info') {
    // 詳細画面にメッセージ表示領域を追加する場合
    let messageContainer = document.getElementById('temp-message-container');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.id = 'temp-message-container';
      messageContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 300px;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        word-break: break-all;
      `;
      document.body.appendChild(messageContainer);
    }

    // タイプに応じてスタイル設定
    if (type === 'success') {
      messageContainer.style.backgroundColor = '#d4edda';
      messageContainer.style.color = '#155724';
      messageContainer.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
      messageContainer.style.backgroundColor = '#f8d7da';
      messageContainer.style.color = '#721c24';
      messageContainer.style.border = '1px solid #f5c6cb';
    } else {
      messageContainer.style.backgroundColor = '#d1ecf1';
      messageContainer.style.color = '#0c5460';
      messageContainer.style.border = '1px solid #bee5eb';
    }

    messageContainer.textContent = message;
    messageContainer.style.display = 'block';

    // 4秒後に自動で非表示
    setTimeout(() => {
      if (messageContainer) {
        messageContainer.style.display = 'none';
      }
    }, 4000);
  }
}

// グローバルインスタンス
window.navigationController = new NavigationController();