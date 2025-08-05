document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 フォルダパス構築システム開始（手動入力版）');
    
    // DOM要素の取得
    const rootPathInput = document.getElementById('root-path-input');
    const individualFolderInput = document.getElementById('individual-folder-input');
    const individualPathDisplay = document.getElementById('individual-path-display');
    
    const fullPathDisplay = document.getElementById('full-path-display');
    const buildPathBtn = document.getElementById('build-path-btn');
    const copyFullPathBtn = document.getElementById('copy-full-path-btn');
    const pathStatus = document.getElementById('path-status');
    
    // 状態管理
    let individualFolderName = '';
    let fullPath = '';
    
    // ステップ1: Rootパス入力
    rootPathInput.addEventListener('input', function() {
        console.log('📝 Rootパス入力:', rootPathInput.value);
        updateFullPathButton();
    });
    
    // ステップ2: 個別フォルダ名入力（手動入力）
    individualFolderInput.addEventListener('input', function() {
        const inputValue = individualFolderInput.value.trim();
        console.log('📝 個別フォルダ名入力:', inputValue);
        
        // フォルダ名のバリデーション
        const isValidFolderName = validateFolderName(inputValue);
        
        if (inputValue === '') {
            individualFolderName = '';
            individualPathDisplay.innerHTML = 'フォルダ名が入力されていません';
            individualPathDisplay.style.background = '#f0f0f0';
            individualPathDisplay.style.color = '#666';
        } else if (isValidFolderName) {
            individualFolderName = inputValue;
            individualPathDisplay.innerHTML = `
                <strong>入力されたフォルダ名:</strong><br>
                <div style="background: #d4edda; padding: 8px; border-radius: 4px; margin: 5px 0; font-weight: bold;">
                    ${individualFolderName}
                </div>
                <div style="font-size: 12px; color: #155724;">
                    ✅ 有効なフォルダ名（手動入力・アラートなし）
                </div>
            `;
            individualPathDisplay.style.background = '#d4edda';
            individualPathDisplay.style.color = '#155724';
        } else {
            individualFolderName = '';
            individualPathDisplay.innerHTML = `
                <strong>⚠️ 無効なフォルダ名:</strong><br>
                <div style="background: #f8d7da; padding: 8px; border-radius: 4px; margin: 5px 0;">
                    ${inputValue}
                </div>
                <div style="font-size: 12px; color: #721c24;">
                    使用できない文字が含まれています: \\ / : * ? " < > |
                </div>
            `;
            individualPathDisplay.style.background = '#f8d7da';
            individualPathDisplay.style.color = '#721c24';
        }
        
        // フルパス構築ボタンを更新
        updateFullPathButton();
    });
    
    // ステップ3: フルパス構築
    buildPathBtn.addEventListener('click', function() {
        console.log('🔧 フルパス構築ボタンがクリックされました');
        buildFullPath();
    });
    
    // ステップ3: フルパスコピー
    copyFullPathBtn.addEventListener('click', async function() {
        console.log('📋 フルパスコピーボタンがクリックされました');
        
        if (!fullPath) {
            showStatus('error', '❌ コピーするフルパスがありません');
            return;
        }
        
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(fullPath);
                console.log('✅ フルパスコピー成功:', fullPath);
                showStatus('success', '✅ フルパスをクリップボードにコピーしました');
            } else {
                // フォールバック
                const textArea = document.createElement('textarea');
                textArea.value = fullPath;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                console.log('✅ フォールバック方式でフルパスコピー成功:', fullPath);
                showStatus('success', '✅ フルパスをクリップボードにコピーしました（フォールバック方式）');
            }
        } catch (error) {
            console.error('❌ フルパスコピーエラー:', error);
            showStatus('error', `❌ コピーに失敗しました: ${error.message}`);
        }
    });
    
    
    // ヘルパー関数: フルパス構築
    function buildFullPath() {
        const rootPath = rootPathInput.value.trim();
        
        if (!rootPath || !individualFolderName) {
            showStatus('error', '❌ Rootパスまたは個別フォルダが入力されていません');
            return;
        }
        
        // Root + 個別フォルダでフルパス構築
        fullPath = `${rootPath}\\${individualFolderName}`;
        
        // UI更新
        fullPathDisplay.innerHTML = `
            <strong>構築されたフルパス:</strong><br>
            <div style="background: #d4edda; padding: 10px; border-radius: 4px; margin: 5px 0; word-break: break-all;">
                ${fullPath}
            </div>
        `;
        
        // コピーボタンを有効化
        copyFullPathBtn.disabled = false;
        
        showStatus('success', '✅ フルパスを構築しました');
        console.log('🔧 構築されたフルパス:', fullPath);
    }
    
    // ヘルパー関数: ボタン状態更新
    function updateFullPathButton() {
        const rootPath = rootPathInput.value.trim();
        if (rootPath && individualFolderName) {
            buildPathBtn.disabled = false;
        } else {
            buildPathBtn.disabled = true;
        }
    }
    
    // ヘルパー関数: ステータス表示
    function showStatus(type, message) {
        pathStatus.className = `status ${type}`;
        pathStatus.textContent = message;
        pathStatus.style.display = 'block';
        
        setTimeout(() => {
            pathStatus.style.display = 'none';
        }, 3000);
    }
    
    // ヘルパー関数: フォルダ名バリデーション
    function validateFolderName(folderName) {
        if (!folderName || folderName.length === 0) {
            return false;
        }
        
        // Windowsで使用できない文字をチェック
        const invalidChars = /[\\\/\:\*\?\"\<\>\|]/;
        if (invalidChars.test(folderName)) {
            return false;
        }
        
        // 末尾スペースやピリオドをチェック
        if (folderName.endsWith(' ') || folderName.endsWith('.')) {
            return false;
        }
        
        // 予約語をチェック
        const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        if (reservedNames.includes(folderName.toUpperCase())) {
            return false;
        }
        
        return true;
    }
    
    console.log('✅ フォルダパス構築システム初期化完了（手動入力版）');
});