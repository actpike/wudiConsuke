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
      
      // No列またはタイトル列のクリックのみ処理
      const isNoColumn = e.target.closest('.col-no');
      const isTitleColumn = e.target.closest('.col-title');
      
      if ((isNoColumn || isTitleColumn) && this.currentView === 'main') {
        const gameRow = e.target.closest('.game-row');
        if (gameRow) {
          const gameId = parseInt(gameRow.dataset.gameId);
          this.showDetailView(gameId);
        }
      }
    });

    // 戻るボタン
    document.getElementById('back-btn').addEventListener('click', () => {
      this.showMainView();
    });

    // 閉じるボタン
    document.getElementById('close-btn').addEventListener('click', () => {
      this.showMainView();
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
        this.markAsChanged();
        this.debouncedAutoSave();
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
    // document.getElementById('open-folder-btn').addEventListener('click', () => {
    //   this.openLocalFolder();
    // });

    // document.getElementById('edit-folder-btn').addEventListener('click', () => {
    //   this.toggleFolderEdit();
    // });

    // document.getElementById('open-wodicon-btn').addEventListener('click', () => {
    //   this.openWodiconPage();
    // });
  }

  // メイン画面表示
  async showMainView() {
    this.stopAutoSave();
    
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
    
    this.hideView('main-view');
    this.showView('detail-view');
    this.currentView = 'detail';
    this.editingGameId = gameId;
    this.lastDetailGameId = gameId;
    
    await this.loadGameData(gameId);
    this.startAutoSave();
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
      const game = await window.gameDataManager.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // タイトルと基本情報
      document.getElementById('detail-title').textContent = `No.${game.no} ${game.title}`;
      document.getElementById('detail-author').textContent = `作者: ${game.author}`;
      document.getElementById('detail-genre').textContent = `ジャンル: ${game.genre}`;
      
      // 更新日情報
      const versionElement = document.getElementById('detail-version');
      
      
      const lastUpdateValue = game.lastUpdate || game.last_update || game.version || game.updated_at;
      if (lastUpdateValue) {
        // 更新日が日付文字列かどうかを確認
        let updateText = '';
        try {
          const updateDate = new Date(lastUpdateValue);
          if (!isNaN(updateDate.getTime())) {
            updateText = `更新日: ${updateDate.toLocaleDateString('ja-JP')}`;
          } else {
            // 日付変換できない場合は元の文字列を使用
            updateText = `更新日: ${lastUpdateValue}`;
          }
        } catch (error) {
          updateText = `更新日: ${lastUpdateValue}`;
        }
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
      
      // 平均点を計算して表示
      await this.displayAverageRating();

      this.hasUnsavedChanges = false;
      this.updateSaveStatus('💾 読み込み完了');

    } catch (error) {
      console.error('Failed to load game data:', error);
      this.updateSaveStatus('❌ 読み込み失敗・新規作成', 'error');
      
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
      const author = gameInfo ? `作者: ${gameInfo.author}` : '作者: 不明';
      const genre = gameInfo ? `ジャンル: ${gameInfo.genre}` : 'ジャンル: 不明';
      
      document.getElementById('detail-title').textContent = title;
      document.getElementById('detail-author').textContent = author;
      document.getElementById('detail-genre').textContent = genre;
      
      // 更新日情報
      const versionElement = document.getElementById('detail-version');
      if (gameInfo && gameInfo.lastUpdate) {
        try {
          const updateDate = new Date(gameInfo.lastUpdate);
          if (!isNaN(updateDate.getTime())) {
            versionElement.textContent = `更新日: ${updateDate.toLocaleDateString('ja-JP')}`;
          } else {
            versionElement.textContent = `更新日: ${gameInfo.lastUpdate}`;
          }
        } catch (error) {
          versionElement.textContent = `更新日: ${gameInfo.lastUpdate}`;
        }
      } else {
        versionElement.textContent = '';
      }

      // 評価システムを初期化
      const ratingCategories = ['熱中度', '斬新さ', '物語性', '画像音声', '遊びやすさ', 'その他'];
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
      }

      // 文字数カウンターをクリア
      const charCount = document.getElementById('char-count');
      if (charCount) {
        charCount.textContent = '0';
      }

      // 合計評価をクリア
      const totalRating = document.getElementById('total-rating');
      if (totalRating) {
        totalRating.textContent = '6';
      }

      // 平均バーをクリア
      try {
        const averageBar = document.querySelector('.average-bar');
        if (averageBar) {
          averageBar.style.display = 'none';
        }
        
        // 全ての平均バー要素をリセット
        const averageBars = document.querySelectorAll('.average-bar');
        averageBars.forEach(bar => {
          bar.style.display = 'none';
          bar.style.width = '0%';
        });
        
        // 平均値表示もリセット
        const averageValues = document.querySelectorAll('.average-value');
        averageValues.forEach(value => {
          value.textContent = '';
        });
      } catch (averageError) {
        console.warn('平均バークリアでエラー:', averageError);
      }

      // 変更フラグをリセット
      this.hasUnsavedChanges = false;
      
    } catch (error) {
      console.error('Failed to initialize detail view:', error);
    }
  }

  // 評価データ読み込み
  loadRatingData(rating) {
    const categories = ['熱中度', '斬新さ', '物語性', '画像音声', '遊びやすさ', 'その他'];
    
    categories.forEach(category => {
      const slider = document.querySelector(`[data-category="${category}"]`);
      const value = rating[category] || 0;
      slider.value = value;
      
      const valueSpan = slider.parentElement.querySelector('.rating-value');
      valueSpan.textContent = value;
    });

    this.updateTotalRating();
  }

  // 平均点表示
  async displayAverageRating() {
    try {
      // 各項目ごとの平均を計算
      const games = await window.gameDataManager.getGames();
      const playedGames = games.filter(game => game.is_played && game.rating);
      
      if (playedGames.length === 0) return;
      
      const categories = ['熱中度', '斬新さ', '物語性', '画像音声', '遊びやすさ', 'その他'];
      const averages = {};
      
      categories.forEach(category => {
        const total = playedGames.reduce((sum, game) => sum + (game.rating[category] || 0), 0);
        averages[category] = total / playedGames.length;
      });
      
      // 各スライダーに平均線を追加
      this.updateAverageIndicators(averages);
      
    } catch (error) {
      console.error('Failed to display average rating:', error);
    }
  }

  // 平均点インジケータを更新
  updateAverageIndicators(averages) {
    const categories = ['熱中度', '斬新さ', '物語性', '画像音声', '遊びやすさ', 'その他'];
    
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
          averageLine.title = `平均: ${average.toFixed(1)}点`;
          
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
      this.updateSaveStatus('💾 保存中...', 'saving');

      const updates = this.collectFormData();
      const success = await window.gameDataManager.updateGame(this.editingGameId, updates);

      if (success) {
        this.hasUnsavedChanges = false;
        this.updateSaveStatus('✅ 保存完了', 'saved');
        setTimeout(() => {
          this.updateSaveStatus('💾 準備完了');
        }, 2000);
        return true;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      this.updateSaveStatus('❌ 保存失敗', 'error');
      return false;
    }
  }

  // フォームデータ収集
  collectFormData() {
    // folder-pathフィールドは削除済みのためコメントアウト
    // const folderPath = document.getElementById('folder-path').value.trim();
    const review = document.getElementById('review-textarea').value.trim();
    
    // 評価データ収集
    const rating = {
      熱中度: parseInt(document.querySelector('[data-category="熱中度"]').value),
      斬新さ: parseInt(document.querySelector('[data-category="斬新さ"]').value),
      物語性: parseInt(document.querySelector('[data-category="物語性"]').value),
      画像音声: parseInt(document.querySelector('[data-category="画像音声"]').value),
      遊びやすさ: parseInt(document.querySelector('[data-category="遊びやすさ"]').value),
      その他: parseInt(document.querySelector('[data-category="その他"]').value)
    };
    
    rating.total = window.gameDataManager.calculateTotalRating(rating);

    return {
      // local_folder_path: folderPath, // フィールド削除済みのためコメントアウト
      rating: rating,
      review: review,
      review_length: review.length,
      is_played: window.gameDataManager.isRatingComplete(rating)
    };
  }

  // 編集内容リセット
  async resetCurrentEdit() {
    if (!this.editingGameId) return;

    if (this.hasUnsavedChanges) {
      const confirmed = confirm('未保存の変更があります。リセットしますか？');
      if (!confirmed) return;
    }

    await this.loadGameData(this.editingGameId);
  }

  // UI要素をリセット
  resetUI() {
    try {
      // 評価スライダーをリセット
      const ratingCategories = ['熱中度', '斬新さ', '物語性', '画像音声', '遊びやすさ', 'その他'];
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
      }

      // 文字数カウンターをクリア
      const charCount = document.getElementById('character-count');
      if (charCount) {
        charCount.textContent = '0';
      }

      // 合計評価をリセット
      const totalRating = document.getElementById('total-rating');
      if (totalRating) {
        totalRating.textContent = '6';
      }

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

      // 変更フラグをリセット
      this.hasUnsavedChanges = false;

    } catch (error) {
      console.error('resetUI エラー:', error);
    }
  }

  // ゲームデータ削除
  async deleteCurrentGame() {
    if (!this.editingGameId) return;

    const game = await window.gameDataManager.getGame(this.editingGameId);
    if (!game) return;

    const confirmed = confirm(`「${game.title}」の評価・感想データを削除しますか？\n\nこの操作は取り消せません。`);
    if (!confirmed) return;

    try {
      // 評価と感想をクリア（ratingをnullにして自動フラグ更新を回避）
      await window.gameDataManager.updateGame(this.editingGameId, {
        rating: null,
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

  // 自動保存開始
  startAutoSave() {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges) {
        this.saveCurrentEdit();
      }
    }, 3000); // 3秒間隔
  }

  // 自動保存停止
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // 遅延自動保存
  debouncedAutoSave() {
    clearTimeout(this.debouncedTimer);
    this.debouncedTimer = setTimeout(() => {
      if (this.hasUnsavedChanges) {
        this.saveCurrentEdit();
      }
    }, 1000); // 1秒後
  }

  // 変更フラグ設定
  markAsChanged() {
    this.hasUnsavedChanges = true;
    this.updateSaveStatus('💾 未保存の変更があります');
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
    
    sliders.forEach(slider => {
      total += parseInt(slider.value);
      const valueSpan = slider.parentElement.querySelector('.rating-value');
      valueSpan.textContent = slider.value;
    });
    
    document.getElementById('total-rating').textContent = total;
    
    // 星表示
    const stars = Math.round(total / 12); // 60点満点を5段階に変換
    document.getElementById('rating-stars').textContent = '⭐'.repeat(Math.min(stars, 5));
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

  // ローカルフォルダ開く
  openLocalFolder() {
    const folderPath = document.getElementById('folder-path').value.trim();
    if (!folderPath) {
      alert('フォルダパスが設定されていません。');
      return;
    }

    const fileUrl = `file:///${folderPath.replace(/\\/g, '/')}`;
    chrome.tabs.create({ url: fileUrl, active: false }).catch(error => {
      console.error('Failed to open folder:', error);
      alert('フォルダを開けませんでした。\n「ファイルのURLへのアクセスを許可する」が有効になっているか確認してください。');
    });
  }

  // フォルダ編集切り替え
  toggleFolderEdit() {
    const input = document.getElementById('folder-path');
    const button = document.getElementById('edit-folder-btn');
    
    if (input.readOnly) {
      input.readOnly = false;
      input.focus();
      button.textContent = '完了';
    } else {
      input.readOnly = true;
      button.textContent = '編集';
      this.markAsChanged();
    }
  }

  // ウディコン公式ページ開く
  openWodiconPage() {
    const url = document.getElementById('wodicon-url').value;
    if (url) {
      chrome.tabs.create({ url: url, active: true });
    }
  }

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
        const game = window.gameListManager.games.find(g => g.id === gameId);
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
      const targetGame = allGames.find(g => g.id === gameId);
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
}

// グローバルインスタンス
window.navigationController = new NavigationController();