const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { EXTENSION_DIR, VERSIONS_DIR, TEMP_DIR, EXCLUDE_PATTERNS } = require('../config/paths.config');
const { ZIP_CONFIG, LOG_CONFIG } = require('../config/release.config');

class ChromePackager {
  constructor() {
    this.tempDir = TEMP_DIR;
    this.outputDir = VERSIONS_DIR;
  }

  // 除外パターンチェック
  shouldExclude(filePath) {
    const relativePath = path.relative(EXTENSION_DIR, filePath);
    return EXCLUDE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        // glob pattern matching (簡易版)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(relativePath);
      }
      return relativePath.startsWith(pattern) || relativePath.includes(pattern);
    });
  }

  // Chrome拡張フォルダをWudiConsukeとしてコピー
  async copyExtensionFiles() {
    console.log('📁 Chrome拡張ファイルをコピー中...');
    
    const targetDir = path.join(this.tempDir, ZIP_CONFIG.FOLDER_NAME);
    
    // 一時ディレクトリをクリーンアップ
    await fs.remove(this.tempDir);
    await fs.ensureDir(targetDir);
    
    // ファイルコピー（除外パターン適用）
    const copyOptions = {
      filter: (src) => {
        if (this.shouldExclude(src)) {
          if (LOG_CONFIG.VERBOSE) {
            console.log(`⏭️ 除外: ${path.relative(EXTENSION_DIR, src)}`);
          }
          return false;
        }
        return true;
      }
    };
    
    await fs.copy(EXTENSION_DIR, targetDir, copyOptions);
    
    if (LOG_CONFIG.VERBOSE) {
      console.log(`✅ ファイルコピー完了: ${targetDir}`);
    }
    
    return targetDir;
  }

  // zipファイル作成
  async createZipFile(sourceDir, version) {
    return new Promise((resolve, reject) => {
      console.log('🗜️ zipファイル作成中...');
      
      const zipFileName = ZIP_CONFIG.FILE_NAME_PATTERN.replace('{version}', version);
      const zipFilePath = path.join(this.outputDir, zipFileName);
      
      // 出力ディレクトリ確保
      fs.ensureDirSync(this.outputDir);
      
      // zipストリーム作成
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: ZIP_CONFIG.COMPRESSION_LEVEL }
      });
      
      // エラーハンドリング
      archive.on('error', reject);
      output.on('close', () => {
        const fileSize = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`✅ zip作成完了: ${zipFileName} (${fileSize}MB)`)
        
        if (LOG_CONFIG.SHOW_FILE_SIZES) {
          console.log(`📊 総ファイルサイズ: ${fileSize}MB`);
          console.log(`📦 エントリ数: ${archive.pointer()} bytes`);
        }
        
        resolve({
          filePath: zipFilePath,
          fileName: zipFileName,
          fileSize: fileSize
        });
      });
      
      // zipストリーム接続
      archive.pipe(output);
      
      // WudiConsukeフォルダとして圧縮（フォルダ構造保持）
      archive.directory(sourceDir, ZIP_CONFIG.FOLDER_NAME);
      
      // 圧縮実行
      archive.finalize();
    });
  }

  // ファイル内容検証
  async verifyZipContents(zipPath) {
    try {
      // 簡易検証: ファイル存在確認
      const stats = await fs.stat(zipPath);
      
      if (stats.size === 0) {
        throw new Error('zipファイルが空です');
      }
      
      if (LOG_CONFIG.VERBOSE) {
        console.log('✅ zipファイル検証完了');
      }
      
      return true;
    } catch (error) {
      throw new Error(`zip検証エラー: ${error.message}`);
    }
  }

  // メインパッケージング処理
  async packageExtension(version) {
    console.log(`📦 Chrome拡張のパッケージング開始 (v${version})`);
    
    try {
      // 1. ファイルコピー
      const copiedDir = await this.copyExtensionFiles();
      
      // 2. zip作成
      const zipResult = await this.createZipFile(copiedDir, version);
      
      // 3. 検証
      await this.verifyZipContents(zipResult.filePath);
      
      // 4. 一時ディレクトリクリーンアップ
      await fs.remove(this.tempDir);
      
      console.log('🎉 パッケージング完了!');
      return zipResult;
      
    } catch (error) {
      // エラー時クリーンアップ
      await fs.remove(this.tempDir);
      throw new Error(`パッケージングエラー: ${error.message}`);
    }
  }
}

module.exports = ChromePackager;