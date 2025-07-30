// ウディこん助 - 定数定義
// マジックナンバー・文字列の一元管理

// ストレージキー（年度別アーキテクチャ対応）
const STORAGE_KEYS = {
  // 年度別データ管理
  DATA_PREFIX: 'wodicon_data_',
  LEGACY_GAMES: 'wodicon_games', // 移行専用レガシーキー
  APP_SETTINGS: 'app_settings',
  
  // 設定・状態管理
  RATINGS: 'ratings',
  WODICON_SETTINGS: 'wodicon_settings',
  WEB_MONITOR_SETTINGS: 'web_monitor_settings',
  UPDATE_MANAGER_SETTINGS: 'update_manager_settings',
  AUTO_MONITOR_SETTINGS: 'auto_monitor_settings',
  LAST_AUTO_MONITOR_TIME: 'last_auto_monitor_time',
  MONITOR_HISTORY: 'monitor_history',
  PENDING_MONITOR_CHECK: 'pending_monitor_check'
};

// フィルタータイプ（実装済みのみ）
const FILTER_TYPES = {
  ALL: 'all',
  PLAYED: 'played',
  UNPLAYED: 'unplayed',
  NEW: 'new'
  // 'rated', 'unrated' は未実装のため削除
};

// ソートタイプ（実装済み項目完全対応）
const SORT_TYPES = {
  NO: 'no',
  TITLE: 'title',
  RATING_ENTHUSIASM: '熱中度',
  RATING_NOVELTY: '斬新さ',
  RATING_STORY: '物語性',
  RATING_GRAPHICS_AUDIO: '画像音声',
  RATING_USABILITY: '遊びやすさ',
  RATING_OTHER: 'その他',
  UPDATED_AT: 'updated_at' // デフォルトソート
};

// 監視モード
const MONITOR_MODES = {
  ALL: 'all',
  SELECTED: 'selected',
  DISABLED: 'disabled'
};

// 評価項目（実装で使用される日本語配列）
const RATING_CATEGORIES = [
  '熱中度',
  '斬新さ',
  '物語性',
  '画像音声',
  '遊びやすさ',
  'その他'
];

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

// URL（年度別対応）
const URLS = {
  WODICON_BASE: 'https://silversecond.com',
  WODICON_CONTEST: 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml',
  WODICON_CONTEST_BASE: 'https://silversecond.com/WolfRPGEditor/Contest/',
  
  // 年度別URL生成関数
  getContestUrl: (/* year = null */) => {
    // 全ての年度で同じURLを使用
    return 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml';
  },
  
  getVoteUrl: (/* year = null */) => {
    // 全ての年度で同じURLを使用
    return 'https://silversecond.com/WolfRPGEditor/Contest/cgi/contestVote.cgi';
  }
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
  CURRENT: '1.0.2', // 最新バージョンに統一
  MANIFEST_VERSION: 3
};

// デバッグフラグ
const DEBUG = {
  ENABLED: false,
  VERBOSE_LOGGING: false,
  PERFORMANCE_MONITORING: true
};

// 多言語対応評価指標システム
const RATING_INDICATORS = {
  JP: {
    '熱中度': {
      1: '【１】★ すぐやめてしまった',
      2: '【２】★ ほとんど楽しめなかった',
      3: '【３】★★ 楽しめる部分も多少はあった',
      4: '【４】★★ 熱中できてない時間の方が多かった',
      5: '【５】★★★ 熱中できたところとそれ以外が半々だ',
      6: '【６】★★★ ６割くらいは熱中して遊んでいた',
      7: '【７】★★★★ ７割くらいは熱中して遊べた',
      8: '【８】★★★★ ８割ほど、熱中して遊ぶことができた',
      9: '【９】★★★★★ ほとんど熱中して遊んでいた',
      10: '【10】★★★★★ 最初から最後まで完全に熱中した'
    },
    '斬新さ': {
      1: '【１】★ 目新しさはどこにもない',
      2: '【２】★ 既存のものとまったく同じではない',
      3: '【３】★★ 少しは他と違う部分もある',
      4: '【４】★★ 個性やひとひねりを加えていると感じる',
      5: '【５】★★★ そこそこの目新しさを感じる',
      6: '【６】★★★ 十分な個性と目新しさがあった',
      7: '【７】★★★★ 自分にとって非常に新鮮だった',
      8: '【８】★★★★ なかなか見ない新しさだと思う',
      9: '【９】★★★★★ 記憶の中でもほとんど見ないゲームだ',
      10: '【10】★★★★★ こんなゲーム今まで一度も見たことない'
    },
    '物語性': {
      1: '【１】★ 物語性も特有の雰囲気も全く感じられない',
      2: '【２】★ 物語性や雰囲気をほぼ排除した造りだ',
      3: '【３】★★ 物語や雰囲気づくりへの努力は感じられる',
      4: '【４】★★ 多少の物語性/雰囲気を感じられる',
      5: '【５】★★★ ほどほどの物語性を感じる',
      6: '【６】★★★ 十分以上の物語性を生み出せている',
      7: '【７】★★★★ しっかりとした物語性を生み出せている',
      8: '【８】★★★★ 他と比べてもハイレベルな物語性を感じる',
      9: '【９】★★★★★ 非常に質が高い物語性を生み出せている',
      10: '【10】★★★★★ これ以上の物語性にはそうそう出会えない'
    },
    '画像音声': {
      1: '【１】★ 素材にこだわった印象を全く感じない',
      2: '【２】★ 素材への努力はしているが良い印象を持てない',
      3: '【３】★★ 素材に対してしっくり感じない点がある',
      4: '【４】★★ 未熟だが素材に対する努力を感じられる',
      5: '【５】★★★ 素材への新鮮さや統一感を多少は感じられる',
      6: '【６】★★★ 素材の統一感も新鮮さも程々で、安心できる',
      7: '【７】★★★★ 素材は目新しく､使い方も全く不満がない',
      8: '【８】★★★★ ハイレベルの目新しい素材と使われ方だ',
      9: '【９】★★★★★ 非常に優れた素材と使われ方だ',
      10: '【10】★★★★★ 間違いなく最高の素材と使われ方だ'
    },
    '遊びやすさ': {
      1: '【１】★ 許せないほどの理不尽さや難解さを感じる',
      2: '【２】★ 慣れないこともないが厳しい理不尽さ/難解さだ',
      3: '【３】★★ ぎりぎり我慢できる理不尽さ/難解さだ',
      4: '【４】★★ 理不尽･難解な部分が多いが、慣れた',
      5: '【５】★★★ 遊びにくい点は結構あるが気にはならない',
      6: '【６】★★★ ほんの少し遊びにくい点もあるが許容範囲だ',
      7: '【７】★★★★ かすかに不満があるが､十分適切だと思う',
      8: '【８】★★★★ プレイヤーへの配慮が多く感じられた',
      9: '【９】★★★★★ ほぼ全てに渡って快適で、不満もない',
      10: '【10】★★★★★ 全てに渡って完全に快適に遊べた'
    },
    'その他': {
      0: '【＋０】上記の内容で、十分に評価できている',
      1: '【＋１】★ 上記の他に良い点がある ※要ｺﾒﾝﾄ説明',
      2: '【＋２】★ 上記の他にとても良い点がある ※要ｺﾒﾝﾄ説明',
      3: '【＋３】★★ 上記の他に極めて良い点がある ※要ｺﾒﾝﾄ説明',
      4: '【＋４】★★ 上記で説明できない魅力がある ※要ｺﾒﾝﾄ説明',
      5: '【＋５】★★★ 上記で説明できない魅力が多い ※要ｺﾒﾝﾄ説明',
      6: '【＋６】★★★ 上記で説明できない魅力が多すぎる ※要ｺﾒﾝﾄ説明',
      7: '【＋７】★★★★ 上記では良さをほぼ評価できてない ※要ｺﾒﾝﾄ説明',
      8: '【＋８】★★★★ 上記では何一つ良さを説明できてない ※要ｺﾒ説明',
      9: '【＋９】★★★★★ 上記以外の全てが凄まじく良い ※要ｺﾒ説明',
      10: '【＋10】★★★★★ 上記以外の全てが伝説級に良い ※要ｺﾒ説明'
    }
  }
  // 将来追加予定: EN: { ... }
};

// 評価指標ヘルパー関数
const RATING_HELPERS = {
  // 現在の言語設定（将来的に設定から取得）
  getCurrentLanguage() {
    return 'JP';
  },
  
  // ツールチップ用の全指標テキストを取得
  getTooltipText(category) {
    const lang = this.getCurrentLanguage();
    const indicators = RATING_INDICATORS[lang];
    
    if (!indicators || !indicators[category]) {
      return `${category}の評価指標`;
    }
    
    const categoryData = indicators[category];
    const lines = [];
    
    // その他は0-10、他は1-10
    const start = category === 'その他' ? 0 : 1;
    for (let i = start; i <= 10; i++) {
      if (categoryData[i]) {
        lines.push(categoryData[i]);
      }
    }
    
    return lines.join('\n');
  }
};

// グローバルオブジェクトに登録
window.constants = {
  STORAGE_KEYS,
  FILTER_TYPES,
  SORT_TYPES,
  MONITOR_MODES,
  RATING_CATEGORIES,
  LIMITS,
  URLS,
  NOTIFICATION_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VERSION_INFO,
  DEBUG,
  RATING_INDICATORS,
  RATING_HELPERS
};

console.log('🔧 Constants loaded and registered globally');