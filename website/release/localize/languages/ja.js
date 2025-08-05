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
    title: '主な機能',
    
    rating: {
      title: '評価・感想管理',
      description: 'ウディコン公式の6カテゴリ評価システムに対応。プレイした作品の評価と感想を一元管理。各評価の平均値表示で、あなたの評価傾向も把握できます。'
    },
    
    memo: {
      title: '感想メモ機能',
      description: '作品ごとに詳細な感想を記録。文字数カウント機能付きで、コメント投稿時の参考にも最適。大切な作品の印象を忘れずに保存できます。'
    },
    
    monitoring: {
      title: '自動監視・通知',
      description: 'ウディコンサイトを開いた時に自動で新規作品・更新をチェック。バージョン更新や新規投稿を見逃すことなく、デスクトップ通知でお知らせします。'
    },
    
    data: {
      title: 'データ管理',
      description: '評価・感想データのエクスポート・インポート機能。大切なデータを安全に保護します。'
    }
  },

  // スクリーンショットセクション
  screenshots: {
    title: 'スクリーンショット',
    
    main: {
      title: 'メイン画面',
      description: '作品一覧と評価状況を一目で確認'
    },
    
    detail: {
      title: '詳細画面',
      description: '6カテゴリ評価と感想入力'
    }
  },

  // インストールセクション
  installation: {
    title: '導入方法',
    description: 'Chrome Web Storeで公開中！簡単インストールまたは手動インストールをお選びください。',
    
    tabs: {
      webstore: 'Chrome Web Store',
      manual: '手動インストール'
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