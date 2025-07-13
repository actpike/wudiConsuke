const fs = require('fs');
const path = require('path');
const { MANIFEST_PATH, POPUP_HTML_PATH, VERSION_MD_PATH } = require('../config/paths.config');
const { VERSION_CONFIG } = require('../config/release.config');

class VersionSync {
  constructor() {
    this.manifestVersion = null;
    this.popupVersion = null;
    this.versionMdVersion = null;
  }

  // 各ファイルからバージョン番号を取得
  async getVersions() {
    try {
      // manifest.jsonからバージョン取得
      const manifestContent = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      this.manifestVersion = manifestContent.version;
      
      // popup.htmlからバージョン取得
      const popupContent = fs.readFileSync(POPUP_HTML_PATH, 'utf8');
      const popupVersionMatch = popupContent.match(/version-badge[^>]*>ver([0-9.]+)</);
      this.popupVersion = popupVersionMatch ? popupVersionMatch[1] : null;
      
      // VERSION.mdからバージョン取得
      const versionMdContent = fs.readFileSync(VERSION_MD_PATH, 'utf8');
      const versionMdMatch = versionMdContent.match(/## 現在のバージョン: v([0-9.]+)/);
      this.versionMdVersion = versionMdMatch ? versionMdMatch[1] : null;
      
      return {
        manifest: this.manifestVersion,
        popup: this.popupVersion,
        versionMd: this.versionMdVersion
      };
    } catch (error) {
      throw new Error(`バージョン取得エラー: ${error.message}`);
    }
  }

  // バージョン整合性チェック
  checkVersionConsistency() {
    const versions = [this.manifestVersion, this.popupVersion, this.versionMdVersion].filter(v => v);
    const uniqueVersions = [...new Set(versions)];
    
    return {
      isConsistent: uniqueVersions.length <= 1,
      versions: {
        manifest: this.manifestVersion,
        popup: this.popupVersion,
        versionMd: this.versionMdVersion
      },
      recommendedVersion: this.manifestVersion || this.popupVersion || this.versionMdVersion
    };
  }

  // VERSION.mdを更新
  async updateVersionMd(targetVersion) {
    try {
      const versionMdContent = fs.readFileSync(VERSION_MD_PATH, 'utf8');
      
      // 現在のバージョン行を更新
      const updatedContent = versionMdContent.replace(
        /## 現在のバージョン: v[0-9.]+/,
        `## 現在のバージョン: v${targetVersion}`
      );
      
      // 変更履歴に新エントリを追加（もし必要なら）
      const hasExistingEntry = updatedContent.includes(`#### v${targetVersion}`);
      let finalContent = updatedContent;
      
      if (!hasExistingEntry && VERSION_CONFIG.ADD_CHANGELOG_ENTRY) {
        const today = new Date().toISOString().split('T')[0];
        const newEntry = `\\n#### v${targetVersion} (${today}) - 自動リリース更新\\n- パッケージング自動化によるリリース\\n- バージョン情報統一\\n`;
        
        // 変更履歴セクションの後に追加
        finalContent = finalContent.replace(
          /### 変更履歴\\n/,
          `### 変更履歴${newEntry}`
        );
      }
      
      fs.writeFileSync(VERSION_MD_PATH, finalContent, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`VERSION.md更新エラー: ${error.message}`);
    }
  }

  // メイン同期処理
  async syncVersions() {
    console.log('🔄 バージョン同期を開始...');
    
    const versions = await this.getVersions();
    console.log('📋 検出されたバージョン:', versions);
    
    const consistency = this.checkVersionConsistency();
    
    if (!consistency.isConsistent) {
      console.log('⚠️ バージョン不整合を検出');
      console.log('📝 推奨バージョンでVERSION.mdを更新:', consistency.recommendedVersion);
      
      if (VERSION_CONFIG.UPDATE_VERSION_MD) {
        await this.updateVersionMd(consistency.recommendedVersion);
        console.log('✅ VERSION.md更新完了');
      }
    } else {
      console.log('✅ バージョン整合性確認済み');
    }
    
    return consistency.recommendedVersion;
  }
}

module.exports = VersionSync;