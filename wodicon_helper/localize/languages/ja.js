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
      confirmBulkInput: '{count}件の評価済み作品のデータをフォームに一括入力しますか？'
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
    language: {
      title: '言語設定',
      japanese: '日本語',
      english: 'English',
      description: '表示言語を選択してください'
    },
    monitor: {
      title: 'Web監視設定',
      enabled: '監視を有効にする',
      interval: '監視間隔',
      description: 'ウディコンサイトの自動監視設定'
    },
    data: {
      title: 'データ管理',
      export: 'データエクスポート',
      import: 'データインポート',
      reset: 'データリセット',
      description: '作品データの管理操作'
    }
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
    dataImported: 'データのインポートが完了しました'
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
  }
};

// ES6モジュールとしてエクスポート
export default jaResources;