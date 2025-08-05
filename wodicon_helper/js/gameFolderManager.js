// ウディこん助 ゲームフォルダ管理システム

class GameFolderManager {
  constructor() {
    // constants.jsの定数を使用
    this.FOLDER_DATA_PREFIX = 'wodicon_folder_data_';
    this.ROOT_PATH_KEY = 'wodicon_root_path_';
    
    // DOM要素の参照
    this.rootPathInput = null;
    this.gamesContainer = null;
    this.currentYearDisplay = null;
    this.rootPathStatus = null;
    this.folderManagementStatus = null;
    
    // 状態管理
    this.currentYear = null;
    this.gamesList = [];
    this.folderData = {};
    this.rootPath = '';
  }

  // 初期化
  async initialize() {
    try {
      console.log('🚀 GameFolderManager初期化開始');
      
      // DOM要素取得
      this.initializeDOMElements();
      
      // イベントリスナー設定
      this.setupEventListeners();
      
      // YearManagerから現在年度取得
      if (window.yearManager) {
        await window.yearManager.initialize();
        this.currentYear = await window.yearManager.getCurrentYear();
        this.updateCurrentYearDisplay();
      } else {
        this.currentYear = new Date().getFullYear().toString();
        console.warn('YearManager利用不可、現在年度をデフォルト値に設定:', this.currentYear);
      }
      
      // データ読み込み
      await this.loadData();
      
      // UI更新
      await this.updateUI();
      
      console.log('✅ GameFolderManager初期化完了');
    } catch (error) {
      console.error('❌ GameFolderManager初期化エラー:', error);
      this.showStatus('error', `初期化エラー: ${error.message}`, 'folder-management-status');
    }
  }

  // DOM要素の初期化
  initializeDOMElements() {
    this.rootPathInput = document.getElementById('root-path-input');
    this.gamesContainer = document.getElementById('games-container');
    this.currentYearDisplay = document.getElementById('current-year-display');
    this.rootPathStatus = document.getElementById('root-path-status');
    this.folderManagementStatus = document.getElementById('folder-management-status');
    
    // 必要な要素が存在するかチェック
    const requiredElements = [
      'rootPathInput', 'gamesContainer', 'currentYearDisplay'
    ];
    
    for (const elementName of requiredElements) {
      if (!this[elementName]) {
        throw new Error(`必須DOM要素が見つかりません: ${elementName}`);
      }
    }
  }

  // イベントリスナー設定
  setupEventListeners() {
    // ルートパス入力
    this.rootPathInput.addEventListener('input', () => {
      this.onRootPathChange();
    });
    
    // 保存ボタン
    const saveAllBtn = document.getElementById('save-all-btn');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', () => {
        this.saveAllFolderData();
      });
    }
    
    // クリアボタン
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.clearAllFolderData();
      });
    }
    
    // 戻るボタン
    const backBtn = document.getElementById('back-to-options-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = 'options.html';
      });
    }
    
    // テストボタン
    const testBtn = document.getElementById('test-clipboard-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testClipboard();
      });
    }
    
    // エクスポートボタン
    const exportBtn = document.getElementById('export-folder-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportFolderData();
      });
    }
  }

  // 現在年度表示更新
  updateCurrentYearDisplay() {
    if (this.currentYearDisplay) {
      this.currentYearDisplay.textContent = `${this.currentYear}年度`;
    }
  }

  // データ読み込み
  async loadData() {
    try {
      // ゲームデータ取得
      if (window.gameDataManager) {
        this.gamesList = await window.gameDataManager.getGames();
        console.log('📥 ゲームデータ取得完了:', this.gamesList.length, '件');
      } else {
        throw new Error('GameDataManager利用不可');
      }
      
      // フォルダデータ取得
      await this.loadFolderData();
      
      // ルートパス取得
      await this.loadRootPath();
      
    } catch (error) {
      console.error('❌ データ読み込みエラー:', error);
      throw error;
    }
  }

  // フォルダデータ読み込み
  async loadFolderData() {
    try {
      const storageKey = this.FOLDER_DATA_PREFIX + this.currentYear;
      const result = await chrome.storage.local.get(storageKey);
      this.folderData = result[storageKey] || {};
      console.log('📁 フォルダデータ読み込み完了:', Object.keys(this.folderData).length, '件');
    } catch (error) {
      console.error('❌ フォルダデータ読み込みエラー:', error);
      this.folderData = {};
    }
  }

  // ルートパス読み込み
  async loadRootPath() {
    try {
      const storageKey = this.ROOT_PATH_KEY + this.currentYear;
      const result = await chrome.storage.local.get(storageKey);
      this.rootPath = result[storageKey] || '';
      
      if (this.rootPathInput) {
        this.rootPathInput.value = this.rootPath;
      }
      
      console.log('📂 ルートパス読み込み完了:', this.rootPath);
    } catch (error) {
      console.error('❌ ルートパス読み込みエラー:', error);
      this.rootPath = '';
    }
  }

  // UI更新
  async updateUI() {
    try {
      this.renderGamesList();
    } catch (error) {
      console.error('❌ UI更新エラー:', error);
      this.showStatus('error', `UI更新エラー: ${error.message}`, 'folder-management-status');
    }
  }

  // ゲームリスト描画
  renderGamesList() {
    if (!this.gamesContainer) return;
    
    if (this.gamesList.length === 0) {
      this.gamesContainer.innerHTML = `
        <div class="loading">
          📝 この年度にはまだゲームデータがありません<br>
          <small>メインページで作品を追加すると、ここに表示されます</small>
        </div>
      `;
      return;
    }
    
    const gamesListHTML = `
      <div class="games-list">
        ${this.gamesList.map((game, index) => this.renderGameRow(game, index)).join('')}
      </div>
    `;
    
    this.gamesContainer.innerHTML = gamesListHTML;
    
    // 個別の入力フィールドにイベントリスナーを追加
    this.gamesList.forEach((game, index) => {
      const input = document.getElementById(`folder-input-${index}`);
      if (input) {
        input.addEventListener('input', (e) => {
          this.onFolderNameChange(game.id, e.target.value);
        });
      }
    });
  }

  // ゲーム行描画
  renderGameRow(game, index) {
    const currentFolderName = this.folderData[game.id] || '';
    const fullPath = this.rootPath && currentFolderName 
      ? `${this.rootPath}\\${currentFolderName}` 
      : '';
    
    return `
      <div class="game-row">
        <div class="game-info">
          <div class="game-title">${this.escapeHtml(game.title || '無題')}</div>
          <div class="game-id">No: ${game.no || '未設定'}</div>
          ${fullPath ? `<div class="help-text">📂 ${this.escapeHtml(fullPath)}</div>` : ''}
        </div>
        <div class="folder-input-container">
          <input 
            type="text" 
            id="folder-input-${index}"
            class="folder-name-input"
            placeholder="FolderName2024"
            value="${this.escapeHtml(currentFolderName)}"
            maxlength="100"
          >
        </div>
      </div>
    `;
  }

  // ルートパス変更処理
  onRootPathChange() {
    const newRootPath = this.rootPathInput.value.trim();
    
    // バリデーション
    if (newRootPath && !this.validateRootPath(newRootPath)) {
      this.showStatus('error', '無効なパス形式です。Windowsのフォルダパスを入力してください。', 'root-path-status');
      return;
    }
    
    this.rootPath = newRootPath;
    this.renderGamesList(); // フルパス表示を更新
    
    if (newRootPath) {
      this.showStatus('success', 'ルートパスを設定しました', 'root-path-status');
    } else {
      this.showStatus('info', 'ルートパスがクリアされました', 'root-path-status');
    }
  }

  // フォルダ名変更処理
  onFolderNameChange(gameId, folderName) {
    const trimmedName = folderName.trim();
    
    if (trimmedName === '') {
      delete this.folderData[gameId];
    } else {
      this.folderData[gameId] = trimmedName;
    }
    
    // リアルタイムでフルパス表示を更新（フォーカス・スクロールを保持）
    this.updateSingleGameRowPath(gameId, trimmedName);
  }

  // 単一ゲーム行のパス表示のみ更新（フォーカス・スクロール保持）
  updateSingleGameRowPath(gameId, folderName) {
    // ゲーム情報を見つける
    const gameIndex = this.gamesList.findIndex(game => game.id === gameId);
    if (gameIndex === -1) return;

    const game = this.gamesList[gameIndex];
    const gameRow = document.querySelector(`#folder-input-${gameIndex}`);
    if (!gameRow) return;

    const gameInfoDiv = gameRow.closest('.game-row').querySelector('.game-info');
    if (!gameInfoDiv) return;

    // フルパスを計算
    const fullPath = this.rootPath && folderName 
      ? `${this.rootPath}\\${folderName}` 
      : '';

    // 既存のフルパス表示を削除
    const existingPathDiv = gameInfoDiv.querySelector('.help-text');
    if (existingPathDiv) {
      existingPathDiv.remove();
    }

    // 新しいフルパス表示を追加
    if (fullPath) {
      const pathDiv = document.createElement('div');
      pathDiv.className = 'help-text';
      pathDiv.textContent = `📂 ${fullPath}`;
      gameInfoDiv.appendChild(pathDiv);
    }
  }

  // ルートパスバリデーション
  validateRootPath(path) {
    // 基本的なWindowsパスパターンチェック
    const windowsPathPattern = /^[A-Za-z]:\\(?:[^\\/:*?"<>|]+\\)*[^\\/:*?"<>|]*$/;
    return windowsPathPattern.test(path);
  }

  // 全フォルダデータ保存
  async saveAllFolderData() {
    try {
      // ルートパス保存
      const rootPathKey = this.ROOT_PATH_KEY + this.currentYear;
      await chrome.storage.local.set({ [rootPathKey]: this.rootPath });
      
      // フォルダデータ保存
      const folderDataKey = this.FOLDER_DATA_PREFIX + this.currentYear;
      await chrome.storage.local.set({ [folderDataKey]: this.folderData });
      
      console.log('💾 フォルダデータ保存完了');
      this.showStatus('success', `${Object.keys(this.folderData).length}件のフォルダデータを保存しました`, 'folder-management-status');
      
    } catch (error) {
      console.error('❌ フォルダデータ保存エラー:', error);
      this.showStatus('error', `保存エラー: ${error.message}`, 'folder-management-status');
    }
  }

  // 全フォルダデータクリア
  async clearAllFolderData() {
    if (!confirm('全てのフォルダデータをクリアしますか？\nこの操作は元に戻せません。')) {
      return;
    }
    
    try {
      this.folderData = {};
      this.rootPath = '';
      this.rootPathInput.value = '';
      
      // ストレージからも削除
      const rootPathKey = this.ROOT_PATH_KEY + this.currentYear;
      const folderDataKey = this.FOLDER_DATA_PREFIX + this.currentYear;
      await chrome.storage.local.remove([rootPathKey, folderDataKey]);
      
      // UI再描画
      this.renderGamesList();
      
      console.log('🗑️ フォルダデータクリア完了');
      this.showStatus('success', 'フォルダデータをクリアしました', 'folder-management-status');
      
    } catch (error) {
      console.error('❌ フォルダデータクリアエラー:', error);
      this.showStatus('error', `クリアエラー: ${error.message}`, 'folder-management-status');
    }
  }

  // クリップボードテスト
  async testClipboard() {
    const testPath = this.rootPath ? `${this.rootPath}\\TestFolder` : 'C:\\Test\\TestFolder';
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(testPath);
        this.showStatus('success', `テストパスをコピーしました: ${testPath}`, 'folder-management-status');
      } else {
        throw new Error('Clipboard API利用不可');
      }
    } catch (error) {
      console.error('❌ クリップボードテストエラー:', error);
      this.showStatus('error', `クリップボードテスト失敗: ${error.message}`, 'folder-management-status');
    }
  }

  // フォルダデータエクスポート
  async exportFolderData() {
    try {
      const exportData = {
        year: this.currentYear,
        rootPath: this.rootPath,
        folderData: this.folderData,
        exportDate: new Date().toISOString(),
        totalGames: this.gamesList.length,
        configuredFolders: Object.keys(this.folderData).length
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `wudiconsuke_folder_data_${this.currentYear}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showStatus('success', 'フォルダデータをエクスポートしました', 'folder-management-status');
      
    } catch (error) {
      console.error('❌ エクスポートエラー:', error);
      this.showStatus('error', `エクスポートエラー: ${error.message}`, 'folder-management-status');
    }
  }

  // 指定ゲームのフルパス取得
  getGameFullPath(gameId) {
    const folderName = this.folderData[gameId];
    if (!this.rootPath || !folderName) {
      return null;
    }
    return `${this.rootPath}\\${folderName}`;
  }

  // フォルダ設定状態確認
  isGameFolderConfigured(gameId) {
    return !!(this.rootPath && this.folderData[gameId]);
  }

  // HTMLエスケープ
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ステータス表示
  showStatus(type, message, elementId) {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) return;
    
    statusElement.className = `status ${type}`;
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    
    // 3秒後に自動で非表示
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// グローバルインスタンス作成
document.addEventListener('DOMContentLoaded', async function() {
  try {
    window.gameFolderManager = new GameFolderManager();
    await window.gameFolderManager.initialize();
  } catch (error) {
    console.error('❌ GameFolderManager起動エラー:', error);
  }
});