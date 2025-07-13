#!/usr/bin/env node

const VersionSync = require('./modules/version-sync');
const ChromePackager = require('./modules/chrome-packager');
const WebsiteUpdater = require('./modules/website-updater');
const GitHandler = require('./modules/git-handler');
const { LOG_CONFIG, RELEASE_MODE } = require('./config/release.config');

class ReleaseAutomation {
  constructor() {
    this.versionSync = new VersionSync();
    this.chromePackager = new ChromePackager();
    this.websiteUpdater = new WebsiteUpdater();
    this.gitHandler = new GitHandler();
    
    this.startTime = Date.now();
    
    // コマンドライン引数解析
    this.mode = this.parseArguments();
  }

  // コマンドライン引数解析
  parseArguments() {
    const args = process.argv.slice(2);
    
    // --production フラグをチェック
    if (args.includes('--production') || args.includes('--prod')) {
      return 'production';
    }
    
    return 'development';  // デフォルトは開発モード
  }

  // モード情報表示
  showModeInfo() {
    const modeConfig = RELEASE_MODE[this.mode];
    const modeEmoji = this.mode === 'production' ? '🚀' : '🛠️';
    
    console.log(`${modeEmoji} リリースモード: ${this.mode === 'production' ? '本番' : '開発'}`);
    console.log(`   📦 zipファイル: v{version}${modeConfig.ZIP_SUFFIX}.zip`);
    console.log(`   🌐 Webサイト更新: ${modeConfig.UPDATE_WEBSITE ? 'あり' : 'スキップ'}`);
    console.log(`   🗑️ ファイルクリーンアップ: ${this.mode === 'production' ? 'pre版削除' : '古いpre版削除'}`);
  }

  // 進行状況表示
  showProgress(step, total, message) {
    if (LOG_CONFIG.SHOW_PROGRESS) {
      console.log(`\\n[${step}/${total}] ${message}`);
      console.log('─'.repeat(50));
    }
  }

  // エラーハンドリング
  handleError(error, step) {
    console.error(`\\n❌ エラーが発生しました [${step}]`);
    console.error(`🔍 詳細: ${error.message}`);
    
    if (LOG_CONFIG.VERBOSE && error.stack) {
      console.error('📚 スタックトレース:');
      console.error(error.stack);
    }
    
    console.error('\\n💡 対処方法:');
    console.error('  1. 上記エラーメッセージを確認');
    console.error('  2. 必要に応じてファイルの権限・存在を確認');
    console.error('  3. 手動で修正後、再度実行');
    
    process.exit(1);
  }

  // 実行時間表示
  showExecutionTime() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    console.log(`\\n⏱️ 実行時間: ${duration}秒`);
  }

  // メイン実行処理
  async run() {
    console.log('🚀 ウディこん助 リリース自動化システム開始');
    console.log('=' .repeat(60));
    
    // モード情報表示
    this.showModeInfo();
    console.log('─'.repeat(60));
    
    let version, zipResult, websiteResult, gitResult;
    
    try {
      // Step 1: バージョン同期
      this.showProgress(1, 5, 'バージョン同期処理');
      version = await this.versionSync.syncVersions();
      console.log(`📌 確定バージョン: v${version}`);
      
      // Step 2: Chrome拡張パッケージ化
      this.showProgress(2, 5, 'Chrome拡張パッケージ化');
      zipResult = await this.chromePackager.packageExtension(version, this.mode);
      console.log(`📦 生成ファイル: ${zipResult.fileName}`);
      
      // Step 3: Webサイト更新
      this.showProgress(3, 5, 'Webサイト更新');
      websiteResult = await this.websiteUpdater.updateWebsite(version, zipResult.fileName, this.mode);
      
      if (websiteResult.skipped) {
        console.log('ℹ️ Webサイト更新をスキップ (開発モード)');
      } else {
        console.log('🌐 紹介ページ更新完了');
      }
      
      // Step 4: Git操作
      this.showProgress(4, 5, 'Git操作 (commit & push)');
      gitResult = await this.gitHandler.handleGitOperations(version, this.mode, {
        zipFile: zipResult.fileName,
        websiteUpdated: websiteResult.success && !websiteResult.skipped,
        websiteSkipped: websiteResult.skipped,
        versionSynced: true,
        filesCleanedUp: true
      });
      
      if (gitResult.skipped) {
        console.log('ℹ️ Git操作をスキップ (変更なし)');
      } else {
        console.log(`💾 コミット: ${gitResult.commit.hash}`);
        if (gitResult.push.success) {
          console.log('🚀 プッシュ完了');
        }
      }
      
      // Step 5: 完了報告
      this.showProgress(5, 5, '完了報告');
      this.showCompletionSummary(version, zipResult, websiteResult, gitResult);
      
    } catch (error) {
      this.handleError(error, 'メイン処理');
    }
  }

  // 完了サマリー表示
  showCompletionSummary(version, zipResult, websiteResult, gitResult) {
    const modeConfig = RELEASE_MODE[this.mode];
    const modeEmoji = this.mode === 'production' ? '🚀' : '🛠️';
    
    console.log('\\n🎉 リリース自動化完了!');
    console.log('=' .repeat(60));
    
    console.log('📋 実行結果サマリー:');
    console.log(`  ${modeEmoji} モード: ${this.mode === 'production' ? '本番リリース' : '開発リリース'}`);
    console.log(`  ✅ バージョン: v${version}`);
    console.log(`  ✅ パッケージ: ${zipResult.fileName} (${zipResult.fileSize}MB)`);
    
    if (websiteResult.skipped) {
      console.log(`  ⏭️ Webサイト: ${websiteResult.changes[0]}`);
    } else {
      console.log(`  ✅ Webサイト: ${websiteResult.changes.length}件の更新`);
    }
    
    if (gitResult.skipped) {
      console.log('  ⏭️ Git操作: スキップ (変更なし)');
    } else {
      console.log(`  ✅ Git操作: ${gitResult.commit.hash} → ${gitResult.push.success ? 'プッシュ済み' : 'ローカルのみ'}`);
    }
    
    console.log('\\n🔗 次のステップ:');
    if (this.mode === 'production') {
      console.log('  1. https://wudi-consuke.vercel.app/ でダウンロード確認');
      console.log('  2. 一般ユーザー向け新バージョン告知');
      console.log('  3. Chrome Web Store更新（準備完了時）');
    } else {
      console.log('  1. Chrome拡張機能の動作テスト');
      console.log('  2. 開発チーム内での検証');
      console.log('  3. 本番リリース準備（npm run create-release -- --production）');
    }
    
    this.showExecutionTime();
    
    console.log('\\n🙏 リリース作業お疲れさまでした!');
  }
}

// スクリプト直接実行時のエントリーポイント
if (require.main === module) {
  const automation = new ReleaseAutomation();
  automation.run().catch(error => {
    console.error('\\n💥 予期しないエラーが発生しました:');
    console.error(error);
    process.exit(1);
  });
}

module.exports = ReleaseAutomation;