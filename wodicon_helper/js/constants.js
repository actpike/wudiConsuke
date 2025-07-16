// ウディこん助 - 定数定義
// マジックナンバー・文字列の一元管理

// ストレージキー
const STORAGE_KEYS = {
  GAMES: 'games',
  RATINGS: 'ratings',
  WODICON_SETTINGS: 'wodicon_settings',
  WEB_MONITOR_SETTINGS: 'web_monitor_settings',
  UPDATE_MANAGER_SETTINGS: 'update_manager_settings',
  AUTO_MONITOR_SETTINGS: 'auto_monitor_settings',
  LAST_AUTO_MONITOR_TIME: 'last_auto_monitor_time',
  MONITOR_HISTORY: 'monitor_history',
  PENDING_MONITOR_CHECK: 'pending_monitor_check'
};

// フィルタータイプ
const FILTER_TYPES = {
  ALL: 'all',
  PLAYED: 'played',
  UNPLAYED: 'unplayed',
  NEW: 'new',
  RATED: 'rated',
  UNRATED: 'unrated'
};

// ソートタイプ
const SORT_TYPES = {
  NO: 'no',
  TITLE: 'title',
  AUTHOR: 'author',
  OVERALL: 'overall',
  LAST_PLAYED: 'lastPlayed'
};

// 監視モード
const MONITOR_MODES = {
  ALL: 'all',
  SELECTED: 'selected',
  DISABLED: 'disabled'
};

// 評価項目
const RATING_CATEGORIES = {
  STORY: 'story',
  GRAPHICS: 'graphics',
  MUSIC: 'music',
  ORIGINALITY: 'originality',
  GAMEPLAY: 'gameplay',
  OTHER: 'other',
  OVERALL: 'overall'
};

// 制限値
const LIMITS = {
  MAX_GAMES: 80,
  MAX_COMMENT_LENGTH: 2000,
  STORAGE_LIMIT_MB: 5,
  STORAGE_LIMIT_BYTES: 5 * 1024 * 1024,
  AUTO_MONITOR_INTERVAL_MS: 30 * 60 * 1000, // 30分
  POPUP_MONITOR_INTERVAL_MS: 60 * 60 * 1000, // 1時間
  AUTO_SAVE_DEBOUNCE_MS: 3000, // 3秒
  MAX_RETRY_COUNT: 3,
  PERFORMANCE_CHECK_INTERVAL_MS: 5 * 60 * 1000, // 5分
  MEMORY_CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1時間
  MEMORY_WARNING_THRESHOLD_MB: 50
};

// URL
const URLS = {
  WODICON_BASE: 'https://silversecond.com',
  WODICON_CONTEST: 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml',
  WODICON_CONTEST_BASE: 'https://silversecond.com/WolfRPGEditor/Contest/'
};

// 通知設定
const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: 5,
  ICON_URL: 'icons/icon128.png',
  BUTTON_TEXT: '確認'
};

// エラーメッセージ
const ERROR_MESSAGES = {
  STORAGE_FULL: 'ストレージ容量が不足しています。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。',
  PARSE_ERROR: 'データの解析に失敗しました。',
  SAVE_ERROR: 'データの保存に失敗しました。',
  LOAD_ERROR: 'データの読み込みに失敗しました。',
  PERMISSION_ERROR: '権限が不足しています。',
  TIMEOUT_ERROR: 'リクエストがタイムアウトしました。'
};

// 成功メッセージ
const SUCCESS_MESSAGES = {
  DATA_SAVED: 'データを保存しました。',
  DATA_LOADED: 'データを読み込みました。',
  EXPORT_SUCCESS: 'エクスポートが完了しました。',
  IMPORT_SUCCESS: 'インポートが完了しました。',
  MONITOR_SUCCESS: '監視が完了しました。'
};

// バージョン情報
const VERSION_INFO = {
  CURRENT: '0.0.6',
  MANIFEST_VERSION: 3
};

// デバッグフラグ
const DEBUG = {
  ENABLED: false,
  VERBOSE_LOGGING: false,
  PERFORMANCE_MONITORING: true
};