document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 フォルダ選択テスト開始');
    
    const folderInput = document.getElementById('folder-input');
    const selectFolderBtn = document.getElementById('select-folder-btn');
    const selectedPath = document.getElementById('selected-path');
    const copyPathBtn = document.getElementById('copy-path-btn');
    const copyStatus = document.getElementById('copy-status');
    const pathInput = document.getElementById('path-input');
    
    let currentFolderPath = '';
    
    // フォルダ選択ボタンのクリックイベント
    selectFolderBtn.addEventListener('click', function() {
        console.log('📁 フォルダ選択ボタンがクリックされました');
        folderInput.click();
    });
    
    // フォルダ選択時の処理
    folderInput.addEventListener('change', function(event) {
        const files = event.target.files;
        console.log('📂 選択されたファイル数:', files.length);
        
        if (files.length > 0) {
            // 最初のファイルからフォルダパスを取得
            const firstFile = files[0];
            const fullPath = firstFile.webkitRelativePath;
            
            // フォルダパスを抽出（最初のフォルダ名まで）
            const folderName = fullPath.split('/')[0];
            
            // フルパスを推測・構築する関数
            const constructFullPath = () => {
                // File APIから取得可能な情報
                const fileName = firstFile.name;
                const lastModified = new Date(firstFile.lastModified);
                
                // 一般的なWindowsパス構造で推測
                const commonPaths = [
                    `C:\\Users\\${getUserName()}\\Desktop\\${folderName}`,
                    `C:\\Users\\${getUserName()}\\Documents\\${folderName}`,
                    `C:\\Users\\${getUserName()}\\Downloads\\${folderName}`,
                    `D:\\${folderName}`,
                    `E:\\${folderName}`
                ];
                
                return commonPaths[0]; // デフォルトでDesktop想定
            };
            
            // ユーザー名を取得する関数（推測）
            const getUserName = () => {
                // 環境から推測（制限あり）
                return process?.env?.USERNAME || process?.env?.USER || 'YourUserName';
            };
            
            // フルパス構築
            const estimatedFullPath = constructFullPath();
            currentFolderPath = estimatedFullPath;
            
            console.log('📍 推測されたフォルダパス:', currentFolderPath);
            console.log('📄 相対パス例:', fullPath);
            
            // UI更新（フルパス表示）
            pathInput.value = estimatedFullPath;
            copyPathBtn.disabled = false;
            
            // 詳細情報を表示
            const fileList = Array.from(files).slice(0, 3).map(f => f.webkitRelativePath).join('\n');
            selectedPath.innerHTML = `
                <strong>推測フルパス:</strong><br>
                <div style="background: #e8f4f8; padding: 8px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 5px 0;">
                    ${estimatedFullPath}
                </div>
                <strong>フォルダ名:</strong> ${folderName}<br>
                <strong>ファイル数:</strong> ${files.length}<br>
                <strong>実際のパスが異なる場合は手動で修正してください</strong><br>
                <div style="font-size: 12px; margin-top: 5px; color: #666;">
                    相対パス例: ${fileList}
                </div>
            `;
            
            showStatus('success', `✅ フォルダ「${folderName}」のパスを推測しました`);
        }
    });
    
    // クリップボードコピーボタンのクリックイベント
    copyPathBtn.addEventListener('click', async function() {
        console.log('📋 クリップボードコピーボタンがクリックされました');
        
        // 入力欄からパスを取得（ユーザーが修正可能）
        const pathToCopy = pathInput.value.trim();
        
        if (!pathToCopy) {
            showStatus('error', '❌ コピーするパスがありません');
            return;
        }
        
        try {
            // Clipboard APIを使用してコピー
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(pathToCopy);
                console.log('✅ クリップボードコピー成功:', pathToCopy);
                showStatus('success', '✅ パスをクリップボードにコピーしました');
            } else {
                // フォールバック: 古いブラウザ対応
                const textArea = document.createElement('textarea');
                textArea.value = pathToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                console.log('✅ フォールバック方式でコピー成功:', pathToCopy);
                showStatus('success', '✅ パスをクリップボードにコピーしました（フォールバック方式）');
            }
        } catch (error) {
            console.error('❌ クリップボードコピーエラー:', error);
            showStatus('error', `❌ コピーに失敗しました: ${error.message}`);
        }
    });
    
    // ステータス表示関数
    function showStatus(type, message) {
        copyStatus.className = `status ${type}`;
        copyStatus.textContent = message;
        copyStatus.style.display = 'block';
        
        // 3秒後に自動で非表示
        setTimeout(() => {
            copyStatus.style.display = 'none';
        }, 3000);
    }
    
    console.log('✅ フォルダ選択テスト初期化完了');
});