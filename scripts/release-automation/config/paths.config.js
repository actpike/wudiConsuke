const path = require('path');

// プロジェクトルートからの相対パス
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

module.exports = {
  // プロジェクト基本パス
  PROJECT_ROOT,
  
  // Chrome拡張機能
  EXTENSION_DIR: path.join(PROJECT_ROOT, 'wodicon_helper'),
  MANIFEST_PATH: path.join(PROJECT_ROOT, 'wodicon_helper/manifest.json'),
  POPUP_HTML_PATH: path.join(PROJECT_ROOT, 'wodicon_helper/popup.html'),
  
  // バージョン管理
  VERSION_MD_PATH: path.join(PROJECT_ROOT, 'VERSION.md'),
  
  // Webサイト
  WEBSITE_DIR: path.join(PROJECT_ROOT, 'website/release'),
  WEBSITE_INDEX_PATH: path.join(PROJECT_ROOT, 'website/release/index.html'),
  VERSIONS_DIR: path.join(PROJECT_ROOT, 'website/release/versions'),
  
  // 出力
  TEMP_DIR: path.join(PROJECT_ROOT, 'temp'),
  
  // 除外ファイル・フォルダ（Chrome拡張パッケージ化時）
  EXCLUDE_PATTERNS: [
    'documents',
    '.git',
    'node_modules',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '.env*',
    'icons/etc',
    'tests'
  ]
};