const fs = require('fs');
const path = require('path');
const { WEBSITE_INDEX_PATH, VERSIONS_DIR } = require('../config/paths.config');
const { WEBSITE_CONFIG, LOG_CONFIG, RELEASE_MODE } = require('../config/release.config');

class WebsiteUpdater {
  constructor() {
    this.indexPath = WEBSITE_INDEX_PATH;
  }

  // ダウンロードリンクの更新
  updateDownloadLinks(content, version, zipFileName) {
    console.log('🔗 ダウンロードリンク更新中...');
    
    // href属性の更新
    const hrefPattern = /href="\.\/versions\/WudiConsuke_release_v[0-9.]+\.zip"/g;
    const newHref = `href="./versions/${zipFileName}"`;
    let updatedContent = content.replace(hrefPattern, newHref);
    
    // download属性の更新
    const downloadPattern = /download="WudiConsuke_v[0-9.]+\.zip"/g;
    const newDownload = `download="WudiConsuke_v${version}.zip"`;
    updatedContent = updatedContent.replace(downloadPattern, newDownload);
    
    // ダウンロードボタンテキストの更新
    const buttonTextPattern = /ウディこん助 v[0-9.]+ をダウンロード/g;
    const newButtonText = `ウディこん助 v${version} をダウンロード`;
    updatedContent = updatedContent.replace(buttonTextPattern, newButtonText);
    
    if (LOG_CONFIG.VERBOSE) {
      console.log(`✅ ダウンロードリンク更新: ${zipFileName}`);
    }
    
    return updatedContent;
  }

  // バージョンバッジの更新
  updateVersionBadge(content, version) {
    console.log('🏷️ バージョンバッジ更新中...');
    
    // ヘッダーのversion-badgeを更新
    const versionBadgePattern = /<span class="version-badge">ver[0-9.]+<\/span>/g;
    const newVersionBadge = `<span class="version-badge">ver${version}</span>`;
    const updatedContent = content.replace(versionBadgePattern, newVersionBadge);
    
    if (LOG_CONFIG.VERBOSE) {
      console.log(`✅ バージョンバッジ更新: ver${version}`);
    }
    
    return updatedContent;
  }

  // zipファイル存在確認
  verifyZipFileExists(zipFileName) {
    const zipPath = path.join(VERSIONS_DIR, zipFileName);
    const exists = fs.existsSync(zipPath);
    
    if (!exists) {
      throw new Error(`zipファイルが見つかりません: ${zipPath}`);
    }
    
    if (LOG_CONFIG.VERBOSE) {
      console.log(`✅ zipファイル存在確認: ${zipFileName}`);
    }
    
    return true;
  }

  // index.htmlの読み込み
  readIndexFile() {
    try {
      return fs.readFileSync(this.indexPath, 'utf8');
    } catch (error) {
      throw new Error(`index.html読み込みエラー: ${error.message}`);
    }
  }

  // index.htmlの書き込み
  writeIndexFile(content) {
    try {
      fs.writeFileSync(this.indexPath, content, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`index.html書き込みエラー: ${error.message}`);
    }
  }

  // 変更内容の検証
  validateChanges(originalContent, updatedContent, version, zipFileName) {
    const changes = [];
    
    // ダウンロードリンクチェック
    if (updatedContent.includes(zipFileName)) {
      changes.push('✅ ダウンロードリンク更新済み');
    } else {
      changes.push('❌ ダウンロードリンク更新失敗');
    }
    
    // バージョンバッジチェック
    if (updatedContent.includes(`ver${version}`)) {
      changes.push('✅ バージョンバッジ更新済み');
    } else {
      changes.push('❌ バージョンバッジ更新失敗');
    }
    
    // 内容に変更があるかチェック
    if (originalContent !== updatedContent) {
      changes.push('✅ ファイル内容に変更あり');
    } else {
      changes.push('⚠️ ファイル内容に変更なし');
    }
    
    return changes;
  }

  // メインWebサイト更新処理
  async updateWebsite(version, zipFileName, mode = 'development') {
    const modeConfig = RELEASE_MODE[mode];
    
    console.log(`🌐 Webサイト更新開始 (v${version}) [${mode}モード]`);
    
    try {
      // 1. zipファイル存在確認
      if (WEBSITE_CONFIG.VERIFY_FILE_EXISTS) {
        this.verifyZipFileExists(zipFileName);
      }
      
      // 2. モードに応じて更新スキップ
      if (!modeConfig.UPDATE_WEBSITE) {
        console.log('ℹ️ 開発モードのため、Webサイト更新をスキップ');
        return {
          success: true,
          skipped: true,
          reason: 'development mode',
          changes: ['⏭️ 開発モードによりWebサイト更新スキップ']
        };
      }
      
      // 3. 現在のindex.html読み込み
      const originalContent = this.readIndexFile();
      let updatedContent = originalContent;
      
      // 4. ダウンロードリンク更新
      if (WEBSITE_CONFIG.UPDATE_DOWNLOAD_LINKS) {
        updatedContent = this.updateDownloadLinks(updatedContent, version, zipFileName);
      }
      
      // 5. バージョンバッジ更新
      if (WEBSITE_CONFIG.UPDATE_VERSION_BADGE) {
        updatedContent = this.updateVersionBadge(updatedContent, version);
      }
      
      // 6. 変更内容検証
      const changes = this.validateChanges(originalContent, updatedContent, version, zipFileName);
      
      if (LOG_CONFIG.VERBOSE) {
        console.log('📋 更新内容:');
        changes.forEach(change => console.log(`  ${change}`));
      }
      
      // 7. ファイル書き込み
      this.writeIndexFile(updatedContent);
      
      console.log('🎉 Webサイト更新完了!');
      
      return {
        success: true,
        changes: changes,
        filePath: this.indexPath
      };
      
    } catch (error) {
      throw new Error(`Webサイト更新エラー: ${error.message}`);
    }
  }
}

module.exports = WebsiteUpdater;