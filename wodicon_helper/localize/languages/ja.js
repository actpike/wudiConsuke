/**
 * 日本語リソースファイル
 * ウディこん助 Chrome拡張機能の日本語UI文言とメッセージ
 */

const jaResources = {
  // 評価カテゴリ翻訳マップ (トップレベルでアクセス容易)
  categoryMap: {
    '熱中度': '熱中度',
    '斬新さ': '斬新さ',
    '物語性': '物語性',
    '画像音声': '画像音声',
    '遊びやすさ': '遊びやすさ',
    'その他': 'その他'
  },

  // UI要素
  ui: {
    // ヘッダー
    header: {
      title: 'ウディこん助',
      subtitle: 'WOLF RPGエディターコンテスト作品管理ツール'
    },

    // ボタン
    buttons: {
      save: '保存',
      cancel: 'キャンセル',
      reset: 'リセット',
      delete: '削除',
      export: 'エクスポート',
      import: 'インポート',
      settings: '設定',
      help: 'ヘルプ',
      close: '閉じる',
      confirm: '確認',
      back: '👈戻る',
      next: '次へ',
      retry: '再試行',
      refresh: '更新',
      monitor: '手動監視実行',
      monitorStatus: '監視状態確認',
      backgroundUpdate: 'バックグラウンド更新',
      fillAllForms: '評価済み作品を投票フォームに一括入力',
      clearUpdates: '更新クリア',
      voteForm: '投票フォームに入力'
    },

    // ラベル・項目名
    labels: {
      // 評価項目
      rating: '評価',
      ratingHeat: '熱中度',
      ratingNovelty: '斬新さ',
      ratingStory: '物語性',
      ratingGraphicsAudio: '画像音声',
      ratingUsability: '遊びやすさ',
      ratingOther: 'その他',
      
      // 評価項目（短縮形・テーブルヘッダー用）
      ratingHeatShort: '熱',
      ratingNoveltyShort: '斬',
      ratingStoryShort: '物',
      
      // 詳細画面項目
      author: '作者',
      genre: 'ジャンル', 
      updateDate: '更新日',
      unknown: '不明',
      ratingGraphicsAudioShort: '画',
      ratingUsabilityShort: '遊',
      ratingOtherShort: '他',
      
      // 基本情報
      gameTitle: '作品名',
      author: '作者',
      genre: 'ジャンル',
      lastUpdate: '更新',
      playStatus: 'プレイ状況',
      totalRating: '合計',
      
      // フィルター
      filterAll: '全表示',
      filterPlayed: '評価済み',
      filterUnplayed: '未評価',
      filterNew: '新着',
      
      // ソート
      sortByNo: 'No.',
      sortByTitle: '作品名',
      sortByRating: '評価',
      sortByUpdate: '更新日時',
      
      // その他
      review: '感想',
      comment: 'コメント欄',
      characterCount: '文字数',
      maxCharacters: '2000字',
      language: '言語',
      options: 'オプション',
      average: '平均'
    },

    // セクションタイトル
    sections: {
      gameInfo: '■ 作品基本情報',
      rating: '■ 評価',
      review: '■ コメント欄 (2000字以内)',
      settings: '■ 設定',
      monitor: '■ Web監視機能',
      export: '■ データエクスポート・インポート',
      yearSelection: '年度選択',
      dataManagement: 'データ管理'
    },

    // メッセージ
    messages: {
      // 成功メッセージ
      saved: 'データを保存しました',
      loaded: 'データを読み込みました',
      exported: 'エクスポートが完了しました',
      imported: 'インポートが完了しました',
      monitorSuccess: '監視が完了しました',
      deleted: 'データを削除しました',
      reset: 'データをリセットしました',
      
      // エラーメッセージ
      saveError: 'データの保存に失敗しました',
      loadError: 'データの読み込みに失敗しました',
      networkError: 'ネットワークエラーが発生しました',
      parseError: 'データの解析に失敗しました',
      storageError: 'ストレージ容量が不足しています',
      permissionError: '権限が不足しています',
      timeoutError: 'リクエストがタイムアウトしました',
      
      // 確認メッセージ
      confirmDelete: '本当に削除しますか？この操作は取り消せません。',
      confirmReset: '本当にリセットしますか？すべてのデータが失われます。',
      confirmImport: 'データをインポートしますか？既存のデータは上書きされます。',
      confirmClearUpdates: '{count}件の作品の「新着・更新」マークをすべてクリアしますか？',
      
      // 更新クリアメッセージ
      noClearTargets: 'クリア対象の作品がありません。',
      updatesClearSuccess: '✅ 更新情報をクリアしました。',
      updatesClearError: '更新情報のクリアに失敗しました。',
      
      // 情報メッセージ
      noData: 'データがありません',
      noGames: '作品が見つかりません',
      loading: '読み込み中...',
      processing: '処理中...',
      completed: '完了しました',
      
      // ステータスメッセージ
      saveStatus: '保存状態',
      autoSave: '自動保存',
      readOnly: '読み取り専用',
      offline: 'オフライン'
    },

    // プレースホルダー
    placeholders: {
      search: '検索...',
      review: '感想を入力してください...',
      gameTitle: '作品名を入力',
      author: '作者名を入力',
      ratingIndicator: 'ここに評価指標が表示されます',
      totalRatingIndicator: '総合評価指標がここに表示されます'
    },

    // 動的文字列テンプレート
    templates: {
      totalRating: '{score}/{maxScore}点',
      characterCount: '{count}/{maxCount}字',
      saveReady: '💾 準備完了',
      saveStatus: '💾 保存状態'
    },

    // ステータスメッセージ
    status: {
      loadComplete: '💾 読み込み完了',
      loadError: '❌ 読み込み失敗・新規作成',
      saving: '💾 保存中...',
      saveComplete: '✅ 保存完了',
      saveError: '❌ 保存失敗',
      hasChanges: '💾 変更は自動的に保存されます',
      ready: '💾 準備完了',
      confirmReset: '未保存の変更があります。リセットしますか？',
      confirmDeleteGame: '「{title}」の評価・感想データを削除しますか？\n\nこの操作は取り消せません。',
      appReady: 'ウディこん助 準備完了',
      confirmOpenVotePage: '投票ページを開きます。その後、再度このボタンを押してください。',
      votePageRequired: '投票ページで実行してください。',
      confirmBulkInput: '{count}件の評価済み作品のデータをフォームに一括入力しますか？',
      autoMonitorComplete: '🔔 自動監視完了: 新規{newCount}件、更新{updateCount}件',
      autoMonitorNoUpdates: '✅ 自動監視完了: 更新なし',
      manualUpdateComplete: '📊 更新完了: 全{totalCount}作品中、新規{newCount}件・更新{updateCount}件を検出',
      noPlayedGames: '評価済みの作品がありません。'
    },


    // ツールチップ
    tooltips: {
      settings: '設定',
      help: 'ヘルプ',
      refresh: '更新',
      monitor: '手動監視実行',
      monitorStatus: '📊 監視状態確認',
      backgroundUpdate: 'バックグラウンド更新',
      fillAllForms: '評価済み作品を投票フォームに一括入力',
      clearUpdates: 'すべての新着・更新マークをクリアします',
      delete: '削除',
      reset: 'リセット'
    }
  },

  // 評価指標
  ratings: {
    // カテゴリ名
    categories: {
      heat: '熱中度',
      novelty: '斬新さ',
      story: '物語性',
      graphicsAudio: '画像音声',
      usability: '遊びやすさ',
      other: 'その他'
    },

    // 評価指標テキスト（既存のRATING_INDICATORSから）
    indicators: {
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
  },

  // 設定画面
  settings: {
    title: '設定',
    pageTitle: 'ウディこん助 - 設定',
    subtitle: 'Chrome拡張機能の設定とデータ管理',
    language: {
      title: '言語設定',
      japanese: '日本語',
      english: 'English',
      description: '表示言語を選択してください。初回起動時はブラウザの言語設定から自動判定されます。',
      displayLanguage: '表示言語',
      statusChanged: '言語設定を変更しました'
    },
    yearSelection: {
      title: '年度選択',
      targetYear: '対象年度',
      loading: '読み込み中...',
      description: '年度を変更すると、該当年度のデータのみが表示されます。各年度のデータは独立して管理されます。',
      currentYear: '現在の年度',
      availableYears: '利用可能な年度',
      storageUsage: 'ストレージ使用量',
      addNewYear: '新年度を追加',
      deleteYearData: '年度データ削除'
    },
    dataManagement: {
      title: 'データ管理',
      export: {
        title: 'エクスポート',
        description: '全ての作品データと設定を指定した形式で保存できます。',
        format: '形式',
        jsonOption: 'JSON (全データ)',
        csvOption: 'CSV（年度別評価データ）',
        button: '📤 データエクスポート'
      },
      import: {
        title: 'インポート',
        description: 'エクスポートしたデータファイル（JSON/CSV）を読み込むことができます。',
        button: '📥 データインポート',
        warning: '⚠️ 注意:',
        jsonWarning: '• JSON: 全データが上書きされます',
        csvWarning: '• CSV: 既存データに追加されます（重複回避のため該当年度データ削除後を推奨）'
      }
    },
    monitoring: {
      title: '手動監視・履歴',
      contestUrl: 'ウディコンページURL',
      contestUrlPlaceholder: 'https://silversecond.com/WolfRPGEditor/Contest/entry.shtml',
      contestUrlDescription: '監視対象となるウディコンページのURLを設定します',
      lastMonitorTime: '最終更新チェック日時',
      notExecuted: '未実行',
      manualMonitorButton: '今すぐ監視実行',
      manualMonitorDescription: '手動での新規・更新チェックを実行します',
      recentHistory: '最近の監視履歴',
      noHistory: '監視履歴がありません',
      loadError: 'データ読み込みエラーが発生しました',
      statistics: {
        totalChecks: '総チェック回数: {count}回',
        totalFound: '発見: 新規{new}件, 更新{updated}件',
        successRate: '成功率: {rate}%'
      },
      historyItem: {
        newWorks: '新規{count}件',
        updatedWorks: '更新{count}件',
        error: '(エラー)'
      }
    },
    autoMonitoring: {
      title: '新規・更新チェック設定',
      enableAutoMonitoring: '新規・更新チェックを有効にする',
      enableAutoMonitoringDescription: 'ウディコンサイト訪問時やポップアップ開時の自動チェック機能です',
      enableContentAutoMonitoring: 'ウディコンサイト訪問時の自動チェック',
      enableContentAutoMonitoringDescription: 'ウディコンページを開いた際に自動的に新規・更新をチェックします（30分間隔制限）',
      clearHistory: '履歴クリア',
      nextCheck: '次回自動チェック: ウディコンサイト訪問時またはポップアップ開時',
      statusTitle: '📊 自動チェック状況',
      statusDescription: '現在の自動チェック設定と次回実行予定を表示します',
      history: {
        statisticsTitle: '監視統計',
        recentHistoryTitle: '最近の履歴',
        totalChecks: '総監視回数',
        newGames: '新規',
        updatedGames: '更新',
        errors: 'エラー',
        times: '回',
        items: '件',
        newItemsCount: '新規{count}件',
        updatedItemsCount: '更新{count}件',
        errorOccurred: '(エラー)',
        noHistory: '監視履歴がありません',
        dataLoadError: 'データ読み込みエラーが発生しました'
      },
      status: {
        disabled: '❌ 実用的自動監視は無効です',
        enabled: '✅ 有効',
        contentMonitoring: 'ウディコンサイト訪問時',
        popupMonitoring: 'ポップアップ開時（{interval}時間間隔）',
        nextPopupCheck: '次回ポップアップ自動監視まで: {minutes}分',
        nextPopupScheduled: '次回ポップアップ開時に自動監視実行予定',
        notExecuted: '未実行'
      }
    },
    notifications: {
      title: '通知設定',
      enableNotifications: 'Chrome通知を有効にする',
      notifyNewWorks: '新規作品を通知',
      notifyUpdatedWorks: '更新作品を通知',
      testNotification: '🔔 テスト通知送信',
      testNotificationDescription: '設定確認用のテスト通知を送信します'
    },
    dataDeletion: {
      title: 'データ削除',
      warning: '注意: この操作は元に戻すことができません。',
      clearAllData: '🗑️ 全データ削除',
      resetSettings: '🔄 設定リセット'
    },
    information: {
      title: '情報',
      version: 'バージョン',
      externalLinks: '🔗 外部リンク',
      officialContest: '🏆 ウディコン公式',
      introductionPage: '📖 『ウディこん助』紹介ページ'
    },
    common: {
      loading: '読み込み中...',
      noGamesRegistered: 'ゲームが登録されていません',
      noSearchResults: '検索結果がありません'
    },
    yearFormat: '第{number}回 ({year}年)'
  },

  // Web監視機能
  monitor: {
    title: 'Web監視機能',
    status: {
      enabled: '有効',
      disabled: '無効',
      running: '実行中',
      completed: '完了',
      error: 'エラー'
    },
    messages: {
      newGames: '{count}件の新規作品を発見しました',
      updatedGames: '{count}件の作品が更新されました',
      noChanges: '変更はありませんでした',
      monitorError: '監視中にエラーが発生しました'
    }
  },

  // 通知メッセージ
  notifications: {
    newGame: '新しい作品が追加されました: {title}',
    updatedGame: '作品が更新されました: {title}',
    monitorComplete: 'Web監視が完了しました',
    dataExported: 'データのエクスポートが完了しました',
    dataImported: 'データのインポートが完了しました',
    newWorks: {
      title: '🆕 新規作品が見つかりました',
      message: '新規作品: {count}件\n{list}'
    },
    updatedWorks: {
      title: '🔄 作品が更新されました',
      message: '更新作品: {count}件\n{list}'
    },
    autoMonitor: {
      title: 'ウディこん助 自動監視',
      message: '新規{newCount}件、更新{updateCount}件の作品を検出しました'
    },
    systemError: {
      title: '⚠️ Web監視システム警告',
      message: 'システムが不安定な状態です。一時的にWeb監視を停止します。'
    },
    error: {
      title: 'ウディこん助 - エラー'
    }
  },

  // 時間・日付
  time: {
    now: '現在',
    today: '今日',
    yesterday: '昨日',
    daysAgo: '{days}日前',
    hoursAgo: '{hours}時間前',
    minutesAgo: '{minutes}分前',
    justNow: 'たった今'
  },

  // Help Content
  help: {
    title: '🌊 ウディこん助 使い方',
    basicOperations: {
      title: '【基本操作】',
      items: [
        '• 作品行をクリック → 詳細画面へ移動',
        '• 👈戻るボタン → メイン画面に戻る',
        '• フィルタボタンで表示切替（全表示/評価済み/未評価/新着）',
        '• ⚙️設定ボタン → 詳細設定画面を開く',
        '• 🔄バックグラウンド更新ボタン → 手動監視実行'
      ]
    },
    webMonitoring: {
      title: '【Web監視機能】',
      items: [
        '• ウディコンサイト訪問時に自動で新規作品・更新をチェック',
        '• 拡張機能ポップアップ開時にも自動監視実行',
        '• 手動監視ボタン（🔍）で即座に監視実行',
        '• 新規作品や更新が見つかるとデスクトップ通知'
      ]
    },
    ratingSystem: {
      title: '【評価システム】',
      items: [
        '• 6カテゴリ×10点制（ウディコン公式準拠）',
        '• 熱中度・斬新さ・物語性・画像音声・遊びやすさ・その他',
        '• 評価完了で自動的に既プレイフラグON',
        '• 平均値バー表示であなたの評価傾向を把握'
      ]
    },
    reviewMemo: {
      title: '【感想メモ機能】',
      items: [
        '• 2000字以内の詳細感想記録',
        '• 文字数カウント機能付き'
      ]
    },
    votingSupport: {
      title: '【投票支援機能】',
      items: [
        '• 投票フォームへの個別データ入力（詳細画面から）',
        '• 評価済み作品の一括入力（🗳️ボタンから）'
      ]
    },
    dataSaving: {
      title: '【データ保存】',
      items: [
        '• 変更は自動的に保存されます'
      ]
    },
    dataManagement: {
      title: '【データ管理】',
      warning: '⚠️ 重要：データ保護について',
      description: 'ブラウザのキャッシュクリアや拡張機能の再インストール時に、\n保存された評価・感想データが消失する可能性があります。\n（拡張機能のON/OFFでは消えません）',
      items: [
        '• 設定画面からデータエクスポート・インポート可能',
        '• JSON/CSV形式でのデータ管理に対応'
      ]
    },
    detailInfo: {
      title: '【詳細情報】',
      officialPage: '公式紹介ページ: https://wudi-consuke.vercel.app/website/release/index.html'
    }
  },

  // アラートメッセージ
  alerts: {
    initializationError: 'オプションページ初期化エラー: {error}',
    confirmDeleteAllData: '本当に全てのデータを削除しますか？この操作は元に戻せません。',
    confirmResetSettings: '設定を初期値にリセットしますか？この操作は元に戻せません。',
    jsonImportConfirm: 'JSONファイルをインポートします。\n\n⚠️ 既存の全データが上書きされます。\n現在のデータは完全に置き換わりますがよろしいですか？',
    csvImportConfirm: '【{year}年】のデータが更新されます。\n該当年の既存のデータは上書きされ、復元できません。\n\n続行しますか？',
    confirmDeleteYearData: '{yearDisplay}のデータを完全に削除しますか？\n\nこの操作は取り消せません。'
  },

  // オプション画面のステータスメッセージ
  optionsStatus: {
    // 成功メッセージ
    urlSaved: 'ウディコンページURLを保存しました',
    exportComplete: '✅ エクスポート完了',
    importComplete: '✅ インポート完了',  
    allDataDeleted: '✅ 全データを削除しました',
    settingsReset: '✅ 設定をリセットしました',
    settingsSaved: '✅ 設定を保存しました',
    monitorComplete: '✅ 監視完了: {message}',
    testNotificationSent: '✅ テスト通知を送信しました',
    historyCleared: '✅ 自動監視履歴をクリアしました',
    
    // エラーメッセージ
    noFileSelected: '❌ ファイルが選択されていません',
    unsupportedFormat: '❌ サポートされていないファイル形式です（JSON、CSVのみ対応）',
    exportFailed: '❌ エクスポート失敗: {error}',
    importFailed: '❌ インポート失敗: {error}',
    deleteFailed: '❌ 削除失敗: {error}',
    resetFailed: '❌ 設定リセット失敗: {error}',
    monitorFailed: '❌ 監視失敗: {error}',
    notificationFailed: '❌ 通知送信失敗: {error}',
    historyClearFailed: '❌ 履歴クリアに失敗しました',
    exportError: '❌ エクスポートに失敗しました: {error}',
    urlSaveError: 'URL保存エラー: {error}',
    
    // 年度管理メッセージ
    yearInitFailed: '年度管理の初期化に失敗しました: {error}',
    yearChangeInProgress: '年度を{yearDisplay}に変更中...',
    yearChangeComplete: '年度を{yearDisplay}に変更しました',
    yearChangeFailed: '年度変更に失敗しました: {error}',
    yearInitInProgress: '{yearDisplay}のデータを初期化中...',
    yearInitComplete: '{yearDisplay}を追加しました',
    yearAddFailed: '新年度追加に失敗しました: {error}',
    yearDeleteInProgress: '{yearDisplay}のデータを削除中...',
    yearDeleteComplete: '{yearDisplay}のデータを削除し、{newYearDisplay}に切り替えました',
    yearDeleteFailed: '年度データ削除に失敗しました: {error}',
    lastYearCannotDelete: '最後の年度データは削除できません',
    
    // その他
    validYearRange: '有効な年度を入力してください (2009-2050)',
    yearPrompt: '追加する年度を入力してください (例: 2026)',
    monitorSystemCheck: '監視システム確認: 基本機能は正常に動作しています',
    checkComplete: 'チェック正常完了',
    unknownError: '不明なエラー',
    monitoringInProgress: '監視実行中...',
    manualMonitorButton: '今すぐ監視実行'
  },

  // テスト通知
  testNotification: {
    title: '🔔 テスト通知',
    message: 'Web監視の通知設定が正常に動作しています。\n新規：1件、更新：1件（No.02_謎解きカフェ事件簿 他）\n時刻: {time}'
  },

  // ファイル検証エラー
  fileValidation: {
    // JSON関連エラー
    jsonSyntaxError: '❌ JSON構文エラー: {error}',
    jsonSyntaxSuggestion: '💡 修正提案: JSONファイルの構文を確認してください。オンラインJSONバリデーターでの確認をお勧めします。',
    invalidDataType: '❌ 無効なデータ型: オブジェクトである必要があります',
    oldFormatDetected: '❌ 古いフォーマットファイル: このファイルは古いバージョンのフォーマットです',
    oldFormatSuggestion: '💡 修正提案: 新しいフォーマットでエクスポートしたファイルを使用してください',
    newFormatInfo: '🔄 新フォーマットでは "games" キーを使用し、"wodicon_games" は使用しません',
    invalidDataFormat: '❌ 無効なデータ形式: "games"配列または"years"オブジェクトが必要です',
    invalidDataFormatSuggestion: '💡 修正提案: ウディこん助から正常にエクスポートされたJSONファイルを使用してください',
    
    // CSV関連エラー
    csvMinimumLines: '❌ CSVファイルにはヘッダー行とデータ行が必要です',
    csvMinimumLinesSuggestion: '💡 修正提案: ヘッダー行と最低1行のデータを含むCSVファイルを作成してください',
    missingHeaders: '❌ 必須ヘッダー不足: {headers}',
    missingHeadersSuggestion: '💡 修正提案: CSVファイルの1行目に以下のヘッダーを正確に含めてください:',
    
    // 検証結果メッセージ
    validationSuccess: '✅ ファイル検証成功: {count}件のデータが有効です',
    validationFailure: '❌ ファイル検証失敗: {count}個のエラーが見つかりました',
    
    // 詳細セクション
    detailsHeader: '詳細:'
  }
};

// ES6モジュールとしてエクスポート
export default jaResources;