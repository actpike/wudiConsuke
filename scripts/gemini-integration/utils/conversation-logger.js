import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 会話ログ記録クラス
 */
export class ConversationLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.conversationsDir = path.join(this.logDir, 'conversations');
    this.sessionsDir = path.join(this.logDir, 'sessions');
    this.errorsDir = path.join(this.logDir, 'errors');
    this.currentSessionId = null;
    this.currentSessionFile = null;
    this.currentConversationFile = null;
    
    this.ensureDirectories();
  }

  /**
   * 必要なディレクトリを作成
   */
  ensureDirectories() {
    [this.logDir, this.conversationsDir, this.sessionsDir, this.errorsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * セッションIDを生成
   */
  generateSessionId() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    return `session_${timestamp}`;
  }

  /**
   * 会話ファイル名を生成
   */
  generateConversationFileName() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `conversation_${dateStr}_${timeStr}.txt`;
  }

  /**
   * 新しいセッションを開始
   */
  startNewSession() {
    this.currentSessionId = this.generateSessionId();
    this.currentSessionFile = path.join(this.sessionsDir, `${this.currentSessionId}.json`);
    this.currentConversationFile = path.join(this.conversationsDir, this.generateConversationFileName());

    const sessionData = {
      sessionId: this.currentSessionId,
      startTime: new Date().toISOString(),
      conversationFile: this.currentConversationFile,
      messageCount: 0,
      totalTokens: 0,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      status: 'active'
    };

    fs.writeFileSync(this.currentSessionFile, JSON.stringify(sessionData, null, 2));
    
    const conversationHeader = this.generateConversationHeader();
    fs.writeFileSync(this.currentConversationFile, conversationHeader);

    console.log(`📝 新しいセッションを開始しました: ${this.currentSessionId}`);
    console.log(`📁 会話ログ: ${this.currentConversationFile}`);
    
    return this.currentSessionId;
  }

  /**
   * 会話ファイルのヘッダーを生成
   */
  generateConversationHeader() {
    const now = new Date();
    return `================================================================================
                           GEMINI API 会話ログ
================================================================================

セッションID: ${this.currentSessionId}
開始日時: ${now.toLocaleString('ja-JP')}
モデル: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}
温度: ${process.env.GEMINI_TEMPERATURE || '0.7'}
最大トークン数: ${process.env.GEMINI_MAX_TOKENS || '4000'}

================================================================================

`;
  }

  /**
   * メッセージを記録
   */
  logMessage(input, output, metadata = {}) {
    if (!this.currentSessionId) {
      this.startNewSession();
    }

    const timestamp = new Date();
    const messageEntry = this.formatMessageEntry(input, output, timestamp, metadata);

    // 会話ファイルに追記
    fs.appendFileSync(this.currentConversationFile, messageEntry);

    // セッションファイルを更新
    this.updateSessionFile(metadata);

    console.log(`💾 会話ログを記録しました: ${this.currentConversationFile}`);
  }

  /**
   * メッセージエントリをフォーマット
   */
  formatMessageEntry(input, output, timestamp, metadata) {
    const timeStr = timestamp.toLocaleString('ja-JP');
    const responseTime = metadata.responseTime || 0;
    const usage = metadata.usage || {};

    return `
[${timeStr}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 INPUT:
${input}

🤖 OUTPUT:
${output}

📊 METADATA:
- レスポンス時間: ${responseTime}ms
- 入力トークン: ${usage.promptTokenCount || 0}
- 出力トークン: ${usage.candidatesTokenCount || 0}
- 総トークン: ${usage.totalTokenCount || 0}
- 思考トークン: ${usage.thoughtsTokenCount || 0}
- 文字数: ${output.length}文字

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
  }

  /**
   * セッションファイルを更新
   */
  updateSessionFile(metadata) {
    if (!fs.existsSync(this.currentSessionFile)) {
      return;
    }

    const sessionData = JSON.parse(fs.readFileSync(this.currentSessionFile, 'utf8'));
    sessionData.messageCount += 1;
    sessionData.totalTokens += metadata.usage?.totalTokenCount || 0;
    sessionData.lastUpdateTime = new Date().toISOString();

    fs.writeFileSync(this.currentSessionFile, JSON.stringify(sessionData, null, 2));
  }

  /**
   * エラーを記録
   */
  logError(error, context = {}) {
    const timestamp = new Date();
    const errorFileName = `error_${timestamp.toISOString().replace(/[:.]/g, '-')}.txt`;
    const errorFile = path.join(this.errorsDir, errorFileName);

    const errorEntry = `
================================================================================
                                 エラーログ
================================================================================

発生日時: ${timestamp.toLocaleString('ja-JP')}
セッションID: ${this.currentSessionId || 'N/A'}

エラー内容:
${error.message}

スタックトレース:
${error.stack}

コンテキスト:
${JSON.stringify(context, null, 2)}

================================================================================
`;

    fs.writeFileSync(errorFile, errorEntry);
    console.error(`❌ エラーログを記録しました: ${errorFile}`);
  }

  /**
   * セッションを終了
   */
  endSession() {
    if (!this.currentSessionId) {
      return;
    }

    const sessionData = JSON.parse(fs.readFileSync(this.currentSessionFile, 'utf8'));
    sessionData.endTime = new Date().toISOString();
    sessionData.status = 'completed';

    fs.writeFileSync(this.currentSessionFile, JSON.stringify(sessionData, null, 2));

    // 会話ファイルにフッターを追加
    const footer = `
================================================================================
                              セッション終了
================================================================================

終了日時: ${new Date().toLocaleString('ja-JP')}
総メッセージ数: ${sessionData.messageCount}
総トークン数: ${sessionData.totalTokens}
セッション時間: ${this.calculateSessionDuration(sessionData.startTime, sessionData.endTime)}

================================================================================
`;

    fs.appendFileSync(this.currentConversationFile, footer);

    console.log(`🏁 セッションを終了しました: ${this.currentSessionId}`);
    console.log(`📊 総メッセージ数: ${sessionData.messageCount}`);
    console.log(`📊 総トークン数: ${sessionData.totalTokens}`);

    this.currentSessionId = null;
    this.currentSessionFile = null;
    this.currentConversationFile = null;
  }

  /**
   * セッション時間を計算
   */
  calculateSessionDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${hours}時間${minutes}分${seconds}秒`;
  }

  /**
   * 最近の会話ログを取得
   */
  getRecentConversations(limit = 10) {
    const files = fs.readdirSync(this.conversationsDir)
      .filter(file => file.endsWith('.txt'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(this.conversationsDir, a));
        const statB = fs.statSync(path.join(this.conversationsDir, b));
        return statB.mtime - statA.mtime;
      })
      .slice(0, limit);

    return files.map(file => ({
      filename: file,
      path: path.join(this.conversationsDir, file),
      lastModified: fs.statSync(path.join(this.conversationsDir, file)).mtime
    }));
  }

  /**
   * セッション統計を取得
   */
  getSessionStats() {
    const sessionFiles = fs.readdirSync(this.sessionsDir)
      .filter(file => file.endsWith('.json'));

    const stats = {
      totalSessions: sessionFiles.length,
      totalMessages: 0,
      totalTokens: 0,
      avgMessagesPerSession: 0,
      avgTokensPerSession: 0
    };

    sessionFiles.forEach(file => {
      const sessionData = JSON.parse(fs.readFileSync(path.join(this.sessionsDir, file), 'utf8'));
      stats.totalMessages += sessionData.messageCount || 0;
      stats.totalTokens += sessionData.totalTokens || 0;
    });

    stats.avgMessagesPerSession = stats.totalSessions > 0 ? (stats.totalMessages / stats.totalSessions).toFixed(1) : 0;
    stats.avgTokensPerSession = stats.totalSessions > 0 ? (stats.totalTokens / stats.totalSessions).toFixed(1) : 0;

    return stats;
  }
}

// デフォルトロガーをエクスポート
export const conversationLogger = new ConversationLogger();