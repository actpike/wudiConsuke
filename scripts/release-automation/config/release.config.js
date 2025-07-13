module.exports = {
  // zip圧縮設定
  ZIP_CONFIG: {
    FOLDER_NAME: 'WudiConsuke',  // zip内のフォルダ名（固定）
    FILE_NAME_PATTERN: 'WudiConsuke_release_v{version}{suffix}.zip',  // zipファイル名パターン
    COMPRESSION_LEVEL: 9  // 最大圧縮
  },
  
  // バージョン管理設定
  VERSION_CONFIG: {
    SOURCE_PRIORITY: ['manifest.json', 'popup.html', 'VERSION.md'],  // バージョン取得の優先順位
    UPDATE_VERSION_MD: true,  // VERSION.md自動更新
    ADD_CHANGELOG_ENTRY: true  // 変更履歴自動追加
  },
  
  // リリースモード設定
  RELEASE_MODE: {
    development: {
      ZIP_SUFFIX: '-pre',
      UPDATE_WEBSITE: false,
      COMMIT_MESSAGE_TEMPLATE: 'dev: v{version}-pre 開発版リリース\\n\\n🤖 Generated with [Claude Code](https://claude.ai/code)\\n\\nCo-Authored-By: Claude <noreply@anthropic.com>',
      CLEANUP_OLD_PRE: true  // 古いpre版削除
    },
    production: {
      ZIP_SUFFIX: '',
      UPDATE_WEBSITE: true,
      COMMIT_MESSAGE_TEMPLATE: 'release: v{version} 本番リリース\\n\\n🤖 Generated with [Claude Code](https://claude.ai/code)\\n\\nCo-Authored-By: Claude <noreply@anthropic.com>',
      CLEANUP_PRE_VERSION: true  // 同バージョンのpre版削除
    }
  },

  // Git設定
  GIT_CONFIG: {
    AUTO_PUSH: true,  // 自動プッシュ
    BRANCH: 'main'  // 対象ブランチ
  },
  
  // Webサイト更新設定
  WEBSITE_CONFIG: {
    UPDATE_DOWNLOAD_LINKS: true,  // ダウンロードリンク更新
    UPDATE_VERSION_BADGE: true,   // バージョンバッジ更新
    VERIFY_FILE_EXISTS: true      // ファイル存在確認
  },
  
  // ログ設定
  LOG_CONFIG: {
    VERBOSE: true,  // 詳細ログ
    SHOW_FILE_SIZES: true,  // ファイルサイズ表示
    SHOW_PROGRESS: true     // 進行状況表示
  }
};