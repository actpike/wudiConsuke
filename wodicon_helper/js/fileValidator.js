// ウディこん助 - ファイル検証モジュール
// インポートファイルの形式・内容検証とエラーメッセージ生成

class FileValidator {
  constructor() {
    this.supportedVersion = '1.0.2';
    this.requiredJsonFields = ['games']; // games は必須、settings/metadata は任意
    this.requiredGameFields = ['id', 'title', 'rating', 'is_played', 'created_at', 'updated_at'];
    this.requiredCsvHeaders = ['作品No', '作品名', '熱中度', '斬新さ', '物語性', '画像音声', '遊びやすさ', 'その他'];
    this.ratingCategories = window.constants.RATING_CATEGORIES;
  }

  /**
   * ローカライゼーション対応のテキスト取得ヘルパー
   */
  getLocalizedText(key, fallback, params = {}) {
    if (window.localizer && window.localizer.getText) {
      const text = window.localizer.getText(key);
      // パラメータ置換
      return text.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match;
      });
    }
    // フォールバック: パラメータ置換した fallback を返す
    return fallback.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  }

  /**
   * JSONファイルの検証
   * @param {string} jsonString - JSONファイルの内容
   * @returns {Object} 検証結果 {valid: boolean, data: object|null, errors: string[]}
   */
  validateJsonFile(jsonString) {
    const result = {
      valid: false,
      data: null,
      errors: []
    };

    try {
      // 1. JSON構文チェック
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (parseError) {
        result.errors.push(this.getLocalizedText('fileValidation.jsonSyntaxError', '❌ JSON構文エラー: {error}', { error: parseError.message }));
        result.errors.push(this.getLocalizedText('fileValidation.jsonSyntaxSuggestion', '💡 修正提案: JSONファイルの構文を確認してください。オンラインJSONバリデーターでの確認をお勧めします。'));
        return result;
      }

      // 2. 基本型チェック
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        result.errors.push(this.getLocalizedText('fileValidation.invalidDataType', '❌ 無効なデータ型: オブジェクトである必要があります'));
        return result;
      }

      // 3. 古いフォーマット検出と拒否（フォーマット構造による判定）
      if (data.wodicon_games || data.wodicon_settings || data.wodicon_metadata) {
        result.errors.push(this.getLocalizedText('fileValidation.oldFormatDetected', '❌ 古いフォーマットファイル: このファイルは古いバージョンのフォーマットです'));
        result.errors.push(this.getLocalizedText('fileValidation.oldFormatSuggestion', '💡 修正提案: 新しいフォーマットでエクスポートしたファイルを使用してください'));
        result.errors.push(this.getLocalizedText('fileValidation.newFormatInfo', '🔄 新フォーマットでは "games" キーを使用し、"wodicon_games" は使用しません'));
        return result;
      }

      // 4. フォーマット別検証
      if (data.format_version === "multi_year" && data.years) {
        // 複数年度フォーマットの検証
        const multiYearErrors = this.validateMultiYearFormat(data);
        if (multiYearErrors.length > 0) {
          result.errors.push(...multiYearErrors);
          return result;
        }
      } else if (data.games && Array.isArray(data.games)) {
        // 単一年度フォーマットの検証（後方互換性）
        const singleYearErrors = this.validateSingleYearFormat(data);
        if (singleYearErrors.length > 0) {
          result.errors.push(...singleYearErrors);
          return result;
        }
      } else {
        result.errors.push(this.getLocalizedText('fileValidation.invalidDataFormat', '❌ 無効なデータ形式: "games"配列または"years"オブジェクトが必要です'));
        result.errors.push(this.getLocalizedText('fileValidation.invalidDataFormatSuggestion', '💡 修正提案: ウディこん助から正常にエクスポートされたJSONファイルを使用してください'));
        return result;
      }

      // 7. 全ての検証通過
      result.valid = true;
      result.data = data;
      
    } catch (error) {
      result.errors.push(`❌ 予期しないエラー: ${error.message}`);
      window.errorHandler?.handleError(error, 'json-file-validation');
    }

    return result;
  }

  /**
   * 複数年度フォーマットの検証
   * @param {Object} data - 複数年度データ
   * @returns {string[]} エラーメッセージ配列
   */
  validateMultiYearFormat(data) {
    const errors = [];

    // years オブジェクトの検証
    if (typeof data.years !== 'object' || data.years === null || Array.isArray(data.years)) {
      errors.push('❌ "years"はオブジェクトである必要があります');
      return errors;
    }

    const yearKeys = Object.keys(data.years);
    if (yearKeys.length === 0) {
      errors.push('❌ 年度データが空です');
      return errors;
    }

    // 各年度データの検証
    for (const yearStr of yearKeys) {
      const year = parseInt(yearStr);
      if (isNaN(year) || year < 2009 || year > 2050) {
        errors.push(`❌ 無効な年度: ${yearStr}（2009-2050の範囲で入力してください）`);
        continue;
      }

      const yearData = data.years[yearStr];
      if (typeof yearData !== 'object' || yearData === null || Array.isArray(yearData)) {
        errors.push(`❌ ${year}年: 年度データはオブジェクトである必要があります`);
        continue;
      }

      // games配列の検証
      if (!yearData.games || !Array.isArray(yearData.games)) {
        errors.push(`❌ ${year}年: "games"は配列である必要があります`);
        continue;
      }

      // 各ゲームデータの検証
      const gameErrors = this.validateGamesArray(yearData.games, year);
      if (gameErrors.length > 0) {
        errors.push(...gameErrors);
      }
    }

    return errors;
  }

  /**
   * 単一年度フォーマットの検証（後方互換性）
   * @param {Object} data - 単一年度データ
   * @returns {string[]} エラーメッセージ配列
   */
  validateSingleYearFormat(data) {
    const errors = [];

    // games配列チェック
    if (!Array.isArray(data.games)) {
      errors.push('❌ データ形式エラー: "games"は配列である必要があります');
      return errors;
    }

    // 各ゲームデータの検証
    const gameValidationErrors = this.validateGamesArray(data.games);
    if (gameValidationErrors.length > 0) {
      errors.push(...gameValidationErrors);
    }

    return errors;
  }

  /**
   * games配列の詳細検証
   * @param {Array} games - ゲームデータ配列
   * @param {number} year - 年度（エラーメッセージ用、任意）
   * @returns {string[]} エラーメッセージ配列
   */
  validateGamesArray(games, year = null) {
    const errors = [];

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const gameIndex = i + 1;
      const yearPrefix = year ? `${year}年 ` : '';

      // 基本型チェック
      if (typeof game !== 'object' || game === null || Array.isArray(game)) {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: オブジェクトである必要があります`);
        continue;
      }

      // 必須フィールドチェック
      const missingFields = this.requiredGameFields.filter(field => !(field in game));
      if (missingFields.length > 0) {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: 必須フィールド不足 [${missingFields.join(', ')}]`);
        continue;
      }

      // ID検証
      if (game.id === null || game.id === undefined || game.id === '') {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: IDが無効です`);
      }

      // タイトル検証
      if (typeof game.title !== 'string' || game.title.trim() === '') {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: 作品名が無効です`);
      }

      // 評価データ検証
      const ratingErrors = this.validateRating(game.rating, `${yearPrefix}ゲーム${gameIndex}`);
      if (ratingErrors.length > 0) {
        errors.push(...ratingErrors);
      }

      // is_played検証
      if (typeof game.is_played !== 'boolean') {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: is_playedはtrueまたはfalseである必要があります`);
      }

      // 日付検証
      if (!this.isValidDateString(game.created_at)) {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: created_atの日付形式が無効です`);
      }
      if (!this.isValidDateString(game.updated_at)) {
        errors.push(`❌ ${yearPrefix}ゲーム${gameIndex}: updated_atの日付形式が無効です`);
      }
    }

    return errors;
  }

  /**
   * 評価データの検証
   * @param {Object} rating - 評価オブジェクト
   * @param {string} gameIdentifier - ゲーム識別子（エラーメッセージ用）
   * @returns {string[]} エラーメッセージ配列
   */
  validateRating(rating, gameIdentifier) {
    const errors = [];

    if (typeof rating !== 'object' || rating === null || Array.isArray(rating)) {
      errors.push(`❌ ${gameIdentifier}: 評価データはオブジェクトである必要があります`);
      return errors;
    }

    // 各評価項目の検証
    this.ratingCategories.forEach(category => {
      const value = rating[category];
      
      if (value !== null && value !== undefined) {
        // 数値チェック
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          errors.push(`❌ ${gameIdentifier}: 「${category}」は整数である必要があります（現在値: ${value}）`);
          return;
        }

        // 範囲チェック
        const minValue = category === 'その他' ? 0 : 1;
        const maxValue = 10;
        if (value < minValue || value > maxValue) {
          errors.push(`❌ ${gameIdentifier}: 「${category}」は${minValue}-${maxValue}の範囲で入力してください（現在値: ${value}）`);
        }
      }
    });

    return errors;
  }

  /**
   * CSVファイルの検証
   * @param {string} csvString - CSVファイルの内容
   * @returns {Object} 検証結果 {valid: boolean, data: array|null, errors: string[]}
   */
  validateCsvFile(csvString) {
    const result = {
      valid: false,
      data: null,
      errors: []
    };

    try {
      // 1. 基本的な内容チェック
      if (!csvString || csvString.trim() === '') {
        result.errors.push('❌ ファイルが空です');
        return result;
      }

      // 2. 行分割とフィルタリング
      const lines = csvString.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      if (lines.length < 2) {
        result.errors.push(this.getLocalizedText('fileValidation.csvMinimumLines', '❌ CSVファイルにはヘッダー行とデータ行が必要です'));
        result.errors.push(this.getLocalizedText('fileValidation.csvMinimumLinesSuggestion', '💡 修正提案: ヘッダー行と最低1行のデータを含むCSVファイルを作成してください'));
        return result;
      }

      // 3. ヘッダー行検証
      const headers = this.parseCsvLine(lines[0]);
      const headerErrors = this.validateCsvHeaders(headers);
      if (headerErrors.length > 0) {
        result.errors.push(...headerErrors);
        return result;
      }

      // 4. データ行検証
      const dataLines = lines.slice(1);
      const dataErrors = this.validateCsvDataLines(dataLines, headers);
      if (dataErrors.length > 0) {
        result.errors.push(...dataErrors);
        return result;
      }

      // 5. 検証通過
      result.valid = true;
      result.data = lines;

    } catch (error) {
      result.errors.push(`❌ 予期しないエラー: ${error.message}`);
      window.errorHandler?.handleError(error, 'csv-file-validation');
    }

    return result;
  }

  /**
   * CSVヘッダーの検証
   * @param {string[]} headers - ヘッダー配列
   * @returns {string[]} エラーメッセージ配列
   */
  validateCsvHeaders(headers) {
    const errors = [];

    // 必須ヘッダーの存在チェック
    const missingHeaders = this.requiredCsvHeaders.filter(required => 
      !headers.some(header => header.trim() === required)
    );

    if (missingHeaders.length > 0) {
      errors.push(this.getLocalizedText('fileValidation.missingHeaders', '❌ 必須ヘッダー不足: {headers}', { headers: missingHeaders.join(', ') }));
      errors.push(this.getLocalizedText('fileValidation.missingHeadersSuggestion', '💡 修正提案: CSVファイルの1行目に以下のヘッダーを正確に含めてください:'));
      errors.push(`   ${this.requiredCsvHeaders.join(', ')}`);
    }

    return errors;
  }

  /**
   * CSVデータ行の検証
   * @param {string[]} dataLines - データ行配列
   * @param {string[]} headers - ヘッダー配列
   * @returns {string[]} エラーメッセージ配列
   */
  validateCsvDataLines(dataLines, headers) {
    const errors = [];
    const expectedColumnCount = headers.length;

    for (let i = 0; i < dataLines.length; i++) {
      const lineNumber = i + 2; // ヘッダー行を考慮
      const columns = this.parseCsvLine(dataLines[i]);

      // カラム数チェック
      if (columns.length !== expectedColumnCount) {
        errors.push(`❌ ${lineNumber}行目: カラム数が不正です（期待値: ${expectedColumnCount}, 実際: ${columns.length}）`);
        continue;
      }

      // 評価値の範囲チェック
      this.ratingCategories.forEach((category, index) => {
        const headerIndex = headers.findIndex(h => h.trim() === category);
        if (headerIndex >= 0 && columns[headerIndex]) {
          const value = columns[headerIndex].trim();
          if (value && value !== '-') {
            const numValue = parseInt(value);
            if (isNaN(numValue)) {
              errors.push(`❌ ${lineNumber}行目: 「${category}」は数値である必要があります（値: ${value}）`);
            } else {
              const minValue = category === 'その他' ? 0 : 1;
              if (numValue < minValue || numValue > 10) {
                errors.push(`❌ ${lineNumber}行目: 「${category}」は${minValue}-10の範囲で入力してください（値: ${numValue}）`);
              }
            }
          }
        }
      });
    }

    return errors;
  }

  /**
   * CSV行のパース（簡易版）
   * @param {string} line - CSV行
   * @returns {string[]} カラム配列
   */
  parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * 日付文字列の妥当性チェック
   * @param {string} dateString - 日付文字列
   * @returns {boolean} 有効かどうか
   */
  isValidDateString(dateString) {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 検証結果のサマリー生成
   * @param {Object} validationResult - 検証結果
   * @param {string} fileType - ファイル種類（'json'/'csv'）
   * @returns {string} サマリーメッセージ
   */
  generateValidationSummary(validationResult, fileType) {
    if (validationResult.valid) {
      if (fileType === 'json') {
        const data = validationResult.data;
        
        // 複数年度フォーマットの場合
        if (data.format_version === "multi_year" && data.years) {
          const yearKeys = Object.keys(data.years);
          const totalGames = yearKeys.reduce((total, year) => {
            return total + (data.years[year].games?.length || 0);
          }, 0);
          return this.getLocalizedText('fileValidation.validationSuccess', '✅ ファイル検証成功: {count}件のデータが有効です', { count: `${yearKeys.length}年分、${totalGames}` });
        }
        
        // 単一年度フォーマットの場合
        const gameCount = data.games?.length || 0;
        return this.getLocalizedText('fileValidation.validationSuccess', '✅ ファイル検証成功: {count}件のデータが有効です', { count: gameCount });
      } else {
        // CSVの場合
        const dataCount = validationResult.data?.length - 1 || 0; // ヘッダー行を除く
        return this.getLocalizedText('fileValidation.validationSuccess', '✅ ファイル検証成功: {count}件のデータが有効です', { count: dataCount });
      }
    } else {
      const errorCount = validationResult.errors.length;
      return this.getLocalizedText('fileValidation.validationFailure', '❌ ファイル検証失敗: {count}個のエラーが見つかりました', { count: errorCount });
    }
  }
}

// グローバルインスタンス作成
window.fileValidator = new FileValidator();