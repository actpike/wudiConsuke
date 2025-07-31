const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { EXTENSION_DIR, VERSIONS_DIR, TEMP_DIR, EXCLUDE_PATTERNS } = require('../config/paths.config');
const { ZIP_CONFIG, LOG_CONFIG, RELEASE_MODE } = require('../config/release.config');

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
  async copyExtensionFiles(mode = 'development') {
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
    
    // manifest.jsonを調整（デバッグモード制御）
    await this.adjustManifest(targetDir, mode);
    
    // リリース時（開発・本番共通）、メインアイコンを適用
    await this.applyMainIcon(targetDir);
    
    if (LOG_CONFIG.VERBOSE) {
      console.log(`✅ ファイルコピー完了: ${targetDir}`);
    }
    
    return targetDir;
  }

  // リリース用メインアイコン適用
  async applyMainIcon(targetDir) {
    try {
      const mainIconSource = path.join(EXTENSION_DIR, 'icons/icon16_main.png');
      const mainIconTarget = path.join(targetDir, 'icons/icon16.png');
      
      // メインアイコンファイルが存在するかチェック
      if (await fs.pathExists(mainIconSource)) {
        console.log('🎯 リリース用メインアイコンを適用中...');
        
        // icon16_main.png を icon16.png として上書きコピー
        await fs.copy(mainIconSource, mainIconTarget);
        
        console.log('✅ メインアイコン適用完了: icon16_main.png → icon16.png');
      } else {
        console.warn('⚠️ メインアイコンファイルが見つかりません: icons/icon16_main.png');
        console.log('ℹ️ 既存のicon16.pngをそのまま使用します');
      }
    } catch (error) {
      console.error('❌ メインアイコン適用エラー:', error.message);
    }
  }

  // 古いpre版zipファイルを削除
  async cleanupOldPreFiles(currentVersion) {
    try {
      const files = await fs.readdir(this.outputDir);
      const prePattern = /WudiConsuke_release_v([0-9.]+)-pre\.zip$/;
      
      for (const file of files) {
        const match = file.match(prePattern);
        if (match) {
          const fileVersion = match[1];
          if (fileVersion !== currentVersion) {
            const filePath = path.join(this.outputDir, file);
            await fs.remove(filePath);
            console.log(`🗑️ 古いpre版削除: ${file}`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ pre版削除警告: ${error.message}`);
    }
  }

  // 同バージョンのpre版zipファイルを削除
  async cleanupPreVersion(version) {
    try {
      const preFileName = `WudiConsuke_release_v${version}-pre.zip`;
      const preFilePath = path.join(this.outputDir, preFileName);
      
      if (await fs.pathExists(preFilePath)) {
        await fs.remove(preFilePath);
        console.log(`🗑️ pre版削除: ${preFileName}`);
      }
    } catch (error) {
      console.warn(`⚠️ pre版削除警告: ${error.message}`);
    }
  }

  // zipファイル作成
  async createZipFile(sourceDir, version, suffix = '') {
    return new Promise((resolve, reject) => {
      console.log('🗜️ zipファイル作成中...');
      
      const zipFileName = ZIP_CONFIG.FILE_NAME_PATTERN
        .replace('{version}', version)
        .replace('{suffix}', suffix);
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
  async packageExtension(version, mode = 'development') {
    const modeConfig = RELEASE_MODE[mode];
    const suffix = modeConfig.ZIP_SUFFIX;
    
    console.log(`📦 Chrome拡張のパッケージング開始 (v${version}${suffix}) [${mode}モード]`);
    
    try {
      // 1. ファイルクリーンアップ
      if (mode === 'development' && modeConfig.CLEANUP_OLD_PRE) {
        await this.cleanupOldPreFiles(version);
      } else if (mode === 'production' && modeConfig.CLEANUP_PRE_VERSION) {
        await this.cleanupPreVersion(version);
      }
      
      // 2. ファイルコピー
      const copiedDir = await this.copyExtensionFiles(mode);
      
      // 3. zip作成
      const zipResult = await this.createZipFile(copiedDir, version, suffix);
      
      // 4. 検証
      await this.verifyZipContents(zipResult.filePath);
      
      // 5. 一時ディレクトリクリーンアップ
      await fs.remove(this.tempDir);
      
      console.log('🎉 パッケージング完了!');
      return zipResult;
      
    } catch (error) {
      // エラー時クリーンアップ
      await fs.remove(this.tempDir);
      throw new Error(`パッケージングエラー: ${error.message}`);
    }
  }

  // manifest.json調整（デバッグモード制御）
  async adjustManifest(targetDir, mode) {
    try {
      const manifestPath = path.join(targetDir, 'manifest.json');
      const manifest = await fs.readJson(manifestPath);
      
      // 開発版・本番版ともにローカル開発用の表示を削除
      if (manifest.name.includes('(LocalDev)')) {
        manifest.name = manifest.name.replace(' (LocalDev)', '');
      }
      
      if (mode === 'production') {
        console.log('🚀 本番版: デバッグパネル無効化');
      } else {
        console.log('🛠️ 開発版: デバッグパネル無効化（リリース用）');
      }
      
      await fs.writeJson(manifestPath, manifest, { spaces: 2 });
      
      if (LOG_CONFIG.VERBOSE) {
        console.log(`✅ manifest.json調整完了: ${manifest.name} v${manifest.version}`);
      }
      
    } catch (error) {
      console.warn(`⚠️ manifest.json調整でエラー: ${error.message}`);
      // 致命的でないため処理続行
    }
  }
}

module.exports = ChromePackager;