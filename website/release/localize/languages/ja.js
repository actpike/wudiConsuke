/**
 * 日本語リソースファイル (紹介ページ用)
 * ウディこん助Chrome拡張機能 紹介ページの日本語UI文言
 */

const jaWebsiteResources = {
  // メタ情報
  meta: {
    title: 'ウディこん助 (WodiConsuke) - WOLF RPGエディターコンテスト作品管理ツール',
    description: 'ウディコン作品のプレイ体験を向上させるChrome拡張機能。6カテゴリ評価システム、感想メモ、サイト訪問時自動監視機能でウディコンライフをもっと便利に。',
    keywords: 'ウディコン,WOLF RPGエディター,Chrome拡張機能,ゲーム管理,評価システム,自動監視,通知',
    ogTitle: 'ウディこん助 (WodiConsuke) - WOLF RPGエディターコンテスト作品管理ツール',
    ogDescription: 'ウディコン作品のプレイ体験を向上させるChrome拡張機能。6カテゴリ評価システム、感想メモ、サイト訪問時自動監視機能でウディコンライフをもっと便利に。',
    twitterTitle: 'ウディこん助 (WodiConsuke) - ウディコン作品管理ツール',
    twitterDescription: 'ウディコン作品のプレイ体験を向上させるChrome拡張機能。評価管理、感想メモ、サイト訪問時自動監視機能でウディコンライフをサポート。'
  },

  // ヘッダー
  header: {
    title: 'ウディこん助',
    subtitle: 'WodiConsuke',
    description: 'WOLF RPGエディターコンテスト作品管理ツール',
    languageSelector: '言語',
    japanese: '日本語',
    english: 'English'
  },

  // ナビゲーション
  navigation: {
    overview: '概要',
    features: '機能',
    installation: 'インストール',
    usage: '使い方',
    download: 'ダウンロード',
    support: 'サポート'
  },

  // メインセクション
  main: {
    heroTitle: 'ウディコンライフを<br>もっと便利に',
    heroSubtitle: 'Chrome拡張機能',
    heroDescription: '『ウディこん助』は、WOLF RPGエディターコンテスト（通称：ウディコン）のファンが作成した非公式のChrome拡張機能です。<br>作品管理を目的とし、プレイ済み作品のチェック・感想管理、新作や更新の検出までバッチリ対応。<br>あなたのウディコン体験をもっと快適に。',
    currentVersion: '最新バージョン',
    downloadButton: 'Chrome Web Store',
    githubButton: 'GitHub で見る',
    officialSite: '公式ウディコンサイト'
  },

  // 機能セクション
  features: {
    sectionTitle: '主な機能',
    sectionSubtitle: 'ウディコン作品管理に必要な機能を全て搭載',
    
    autoMonitoring: {
      title: '🔍 サイト訪問時自動監視',
      description: 'ウディコンサイトを訪問した際に自動的に新規作品・更新をチェック。デスクトップ通知で新着情報をお知らせします。'
    },
    
    ratingSystem: {
      title: '📊 6カテゴリ評価システム',
      description: 'ウディコン公式準拠の6カテゴリ（熱中度・斬新さ・物語性・画像音声・遊びやすさ・その他）×10点制評価システム。'
    },
    
    reviewMemo: {
      title: '📝 感想メモ機能',
      description: '2000字以内の詳細感想記録。文字数カウント機能付きで、思い出を詳細に記録できます。'
    },
    
    dataManagement: {
      title: '💾 データ管理',
      description: 'JSON/CSV形式でのデータエクスポート・インポート機能。ブラウザキャッシュクリア時のデータ保護も安心。'
    },
    
    votingSupport: {
      title: '🗳️ 投票支援機能',
      description: '評価済み作品の投票フォームへの一括入力機能。投票作業を効率化できます。'
    },
    
    localStorage: {
      title: '🔒 完全ローカル動作',
      description: '全てのデータはブラウザのローカルストレージに保存。外部サーバーを一切使用せず、プライバシーを守ります。'
    }
  },

  // インストールセクション
  installation: {
    sectionTitle: 'インストール方法',
    sectionSubtitle: '簡単3ステップでご利用開始',
    
    step1: {
      title: 'ステップ1: ダウンロード',
      description: '上記のダウンロードボタンから最新版のzipファイルをダウンロードしてください。'
    },
    
    step2: {
      title: 'ステップ2: 解凍',
      description: 'ダウンロードしたzipファイルを任意の場所に解凍してください。'
    },
    
    step3: {
      title: 'ステップ3: Chrome拡張機能として読み込み',
      description: 'Chromeの「拡張機能」ページで「パッケージ化されていない拡張機能を読み込む」を選択し、解凍したフォルダを指定してください。'
    },
    
    browserCompatibility: {
      title: 'ブラウザ対応状況',
      chrome: 'Google Chrome（推奨）',
      edge: 'Microsoft Edge',
      brave: 'Brave Browser',
      note: 'Chrome拡張機能として開発されており、Chromiumベースのブラウザで動作します。'
    }
  },

  // 使い方セクション
  usage: {
    sectionTitle: '使い方',
    sectionSubtitle: '基本的な操作方法',
    
    basicOperations: {
      title: '基本操作',
      items: [
        '作品行をクリック → 詳細画面へ移動',
        '👈戻るボタン → メイン画面に戻る',
        'フィルタボタンで表示切替（全表示/評価済み/未評価/新着）',
        '⚙️設定ボタン → 詳細設定画面を開く'
      ]
    },
    
    webMonitoring: {
      title: 'Web監視機能',
      items: [
        'ウディコンサイト訪問時に自動で新規作品・更新をチェック',
        '拡張機能ポップアップ開時にも自動監視実行',
        '手動監視ボタン（🔍）で即座に監視実行',
        '新規作品や更新が見つかるとデスクトップ通知'
      ]
    },
    
    ratingSystem: {
      title: '評価システム',
      items: [
        '6カテゴリ×10点制（ウディコン公式準拠）',
        '熱中度・斬新さ・物語性・画像音声・遊びやすさ・その他',
        '評価完了で自動的に既プレイフラグON',
        '平均値バー表示であなたの評価傾向を把握'
      ]
    }
  },

  // サポートセクション
  support: {
    sectionTitle: 'サポート・お問い合わせ',
    sectionSubtitle: 'ご不明な点やご要望はお気軽にお問い合わせください',
    
    documentation: {
      title: '📚 ドキュメント',
      description: '詳細な使い方やよくある質問は拡張機能内のヘルプページをご確認ください。'
    },
    
    github: {
      title: '🐙 GitHub',
      description: 'ソースコードの確認や機能要望・バグ報告はGitHubリポジトリまでお願いします。',
      link: 'GitHub リポジトリ'
    },
    
    contact: {
      title: '📧 お問い合わせ',
      description: 'その他のご質問やご要望は以下の方法でお問い合わせください。',
      twitter: 'Twitter: @actpike',
      email: 'または拡張機能内のお問い合わせフォームをご利用ください'
    }
  },

  // フッター
  footer: {
    copyright: '© 2024 ぴけ (actpike). All rights reserved.',
    madeWith: '❤️ を込めて制作',
    version: 'バージョン',
    lastUpdated: '最終更新',
    officialContest: 'ウディコン公式サイト',
    privacyNote: 'この拡張機能は完全ローカル動作であり、個人情報を外部送信することはありません。'
  },

  // 共通UI要素
  common: {
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    close: '閉じる',
    more: '詳細',
    less: '簡略',
    new: '新着',
    updated: '更新',
    beta: 'ベータ'
  },

  // アクセシビリティ
  accessibility: {
    skipToContent: 'コンテンツへスキップ',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    languageMenu: '言語選択メニュー',
    mainContent: 'メインコンテンツ',
    navigation: 'ナビゲーション',
    backToTop: 'ページトップへ戻る'
  }
};

// グローバルに公開
window.jaWebsiteResources = jaWebsiteResources;