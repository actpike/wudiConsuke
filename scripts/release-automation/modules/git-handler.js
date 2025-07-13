const { execSync } = require('child_process');
const path = require('path');
const { PROJECT_ROOT } = require('../config/paths.config');
const { GIT_CONFIG, LOG_CONFIG } = require('../config/release.config');

class GitHandler {
  constructor() {
    this.projectRoot = PROJECT_ROOT;
  }

  // gitコマンド実行ヘルパー
  execGitCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: LOG_CONFIG.VERBOSE ? 'inherit' : 'pipe',
        ...options
      });
      return result;
    } catch (error) {
      throw new Error(`Git操作エラー: ${command}\\n${error.message}`);
    }
  }

  // git status確認
  getGitStatus() {
    console.log('📊 Git状態確認中...');
    
    const status = this.execGitCommand('git status --porcelain', { stdio: 'pipe' });
    const statusLines = status.trim().split('\\n').filter(line => line.length > 0);
    
    const result = {
      hasChanges: statusLines.length > 0,
      staged: statusLines.filter(line => line.charAt(0) !== ' ' && line.charAt(0) !== '?'),
      unstaged: statusLines.filter(line => line.charAt(1) !== ' ' || line.charAt(0) === '?'),
      all: statusLines
    };
    
    if (LOG_CONFIG.VERBOSE && result.hasChanges) {
      console.log('📋 変更ファイル一覧:');
      result.all.forEach(line => console.log(`  ${line}`));
    }
    
    return result;
  }

  // 変更ファイルをステージング
  stageFiles(files = []) {
    console.log('📤 ファイルをステージング中...');
    
    if (files.length === 0) {
      // 全ファイルをadd
      this.execGitCommand('git add .');
      console.log('✅ 全変更ファイルをステージング');
    } else {
      // 指定ファイルのみadd
      const fileList = files.map(f => `"${f}"`).join(' ');
      this.execGitCommand(`git add ${fileList}`);
      console.log(`✅ 指定ファイルをステージング: ${files.length}件`);
    }
    
    // ステージング後の状態確認
    if (LOG_CONFIG.VERBOSE) {
      const stagedFiles = this.execGitCommand('git diff --cached --name-only', { stdio: 'pipe' });
      if (stagedFiles.trim()) {
        console.log('📋 ステージ済みファイル:');
        stagedFiles.trim().split('\\n').forEach(file => console.log(`  ${file}`));
      }
    }
  }

  // コミットメッセージ生成
  generateCommitMessage(version, additionalInfo = {}) {
    let message = GIT_CONFIG.COMMIT_MESSAGE_TEMPLATE.replace('{version}', version);
    
    // 追加情報がある場合は含める
    if (additionalInfo.zipFile) {
      message += `\\n\\n- パッケージファイル: ${additionalInfo.zipFile}`;
    }
    if (additionalInfo.websiteUpdated) {
      message += `\\n- Webサイト更新: ダウンロードリンク・バージョン表示`;
    }
    if (additionalInfo.versionSynced) {
      message += `\\n- VERSION.md同期更新`;
    }
    
    return message;
  }

  // コミット実行
  createCommit(version, additionalInfo = {}) {
    console.log(`💾 コミット作成中 (v${version})...`);
    
    const message = this.generateCommitMessage(version, additionalInfo);
    
    // シンプルなコミットメッセージ渡し（エスケープ処理）
    const escapedMessage = message.replace(/"/g, '\\\\"').replace(/\\n/g, '\\\\n');
    const command = `git commit -m "${escapedMessage}"`;
    
    try {
      const result = this.execGitCommand(command, { stdio: 'pipe' });
      
      // コミットハッシュ取得
      const commitHash = this.execGitCommand('git rev-parse HEAD', { stdio: 'pipe' }).trim().substring(0, 8);
      
      console.log(`✅ コミット完了: ${commitHash}`);
      
      if (LOG_CONFIG.VERBOSE) {
        console.log('📝 コミットメッセージ:');
        console.log(message.split('\\n').map(line => `  ${line}`).join('\\n'));
      }
      
      return {
        success: true,
        hash: commitHash,
        message: message
      };
      
    } catch (error) {
      throw new Error(`コミット作成エラー: ${error.message}`);
    }
  }

  // リモートにプッシュ
  pushToRemote() {
    console.log('🚀 リモートリポジトリにプッシュ中...');
    
    try {
      const result = this.execGitCommand(`git push origin ${GIT_CONFIG.BRANCH}`);
      console.log('✅ プッシュ完了');
      
      return {
        success: true,
        branch: GIT_CONFIG.BRANCH
      };
      
    } catch (error) {
      throw new Error(`プッシュエラー: ${error.message}`);
    }
  }

  // ブランチ・リモート状態確認
  checkGitState() {
    console.log('🔍 Git状態詳細確認中...');
    
    try {
      const currentBranch = this.execGitCommand('git branch --show-current', { stdio: 'pipe' }).trim();
      const remoteStatus = this.execGitCommand('git status -b --porcelain', { stdio: 'pipe' });
      
      const info = {
        currentBranch,
        isOnTargetBranch: currentBranch === GIT_CONFIG.BRANCH,
        remoteStatus: remoteStatus.split('\\n')[0] // 最初の行にブランチ情報
      };
      
      if (LOG_CONFIG.VERBOSE) {
        console.log(`📋 現在のブランチ: ${currentBranch}`);
        console.log(`📋 対象ブランチ: ${GIT_CONFIG.BRANCH}`);
        console.log(`📋 リモート状態: ${info.remoteStatus}`);
      }
      
      return info;
      
    } catch (error) {
      console.warn(`⚠️ Git状態確認警告: ${error.message}`);
      return { currentBranch: 'unknown', isOnTargetBranch: false };
    }
  }

  // メインGit処理
  async handleGitOperations(version, releaseInfo = {}) {
    console.log(`🔧 Git操作開始 (v${version})`);
    
    try {
      // 1. Git状態確認
      const gitState = this.checkGitState();
      
      if (!gitState.isOnTargetBranch) {
        console.warn(`⚠️ 警告: 現在のブランチ(${gitState.currentBranch})が対象ブランチ(${GIT_CONFIG.BRANCH})と異なります`);
      }
      
      // 2. 変更状態確認
      const status = this.getGitStatus();
      
      if (!status.hasChanges) {
        console.log('ℹ️ コミットする変更がありません');
        return { success: true, skipped: true, reason: 'no changes' };
      }
      
      // 3. ファイルステージング
      this.stageFiles();
      
      // 4. コミット作成
      const commitResult = this.createCommit(version, releaseInfo);
      
      // 5. リモートプッシュ
      let pushResult = { success: false };
      if (GIT_CONFIG.AUTO_PUSH) {
        pushResult = this.pushToRemote();
      } else {
        console.log('ℹ️ 自動プッシュはスキップされました');
      }
      
      console.log('🎉 Git操作完了!');
      
      return {
        success: true,
        commit: commitResult,
        push: pushResult,
        gitState
      };
      
    } catch (error) {
      throw new Error(`Git操作エラー: ${error.message}`);
    }
  }
}

module.exports = GitHandler;