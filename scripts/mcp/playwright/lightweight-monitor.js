/**
 * ⚡ 軽量監視スクリプト
 * Playwright使用を最小限に抑えた継続監視
 */

const { chromium } = require('playwright');

class LightweightMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isMonitoring = false;
    this.stats = {
      totalChecks: 0,
      errors: 0,
      lastError: null,
      uptime: 0
    };
  }
  
  async initialize() {
    console.log('⚡ 軽量監視システム初期化中...');
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'] // リソース節約
    });
    this.page = await this.browser.newPage();
    
    // エラー監視のみ設定（ログ監視は無効化してリソース節約）
    this.page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Runtime Error')) {
        this.stats.errors++;
        this.stats.lastError = msg.text();
        console.log(`🚨 [${new Date().toLocaleTimeString()}] Error detected: ${msg.text()}`);
      }
    });
    
    console.log('✅ 軽量監視システム準備完了');
  }
  
  async quickCheck() {
    if (!this.page) {
      throw new Error('Monitor not initialized');
    }
    
    this.stats.totalChecks++;
    const checkStart = Date.now();
    
    try {
      // 超軽量チェック：ページタイトルのみ確認
      await this.page.goto('http://localhost:4173/', { 
        waitUntil: 'domcontentloaded', 
        timeout: 3000 
      });
      
      const title = await this.page.title();
      const hasLifeSimButton = await this.page.$('button:has-text("軽量LifeSim")') !== null;
      
      const checkTime = Date.now() - checkStart;
      
      return {
        status: hasLifeSimButton ? 'healthy' : 'warning',
        title,
        responseTime: checkTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError = error.message;
      
      return {
        status: 'error',
        error: error.message,
        responseTime: Date.now() - checkStart,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async startMonitoring(intervalMinutes = 5) {
    if (this.isMonitoring) {
      console.log('⚠️ 既に監視中です');
      return;
    }
    
    console.log(`🔄 監視開始 (${intervalMinutes}分間隔)`);
    this.isMonitoring = true;
    this.stats.uptime = Date.now();
    
    const monitor = async () => {
      if (!this.isMonitoring) return;
      
      const result = await this.quickCheck();
      const uptimeMinutes = Math.round((Date.now() - this.stats.uptime) / (60 * 1000));
      
      console.log(`📊 [${result.timestamp.split('T')[1].slice(0, 8)}] ${result.status.toUpperCase()} (${result.responseTime}ms) - 稼働時間: ${uptimeMinutes}分, チェック回数: ${this.stats.totalChecks}, エラー: ${this.stats.errors}`);
      
      // 次回チェックをスケジュール
      setTimeout(monitor, intervalMinutes * 60 * 1000);
    };
    
    // 初回チェック実行
    await monitor();
  }
  
  stopMonitoring() {
    console.log('⏹️ 監視停止');
    this.isMonitoring = false;
  }
  
  getStats() {
    const uptimeMinutes = Math.round((Date.now() - this.stats.uptime) / (60 * 1000));
    return {
      ...this.stats,
      uptimeMinutes,
      errorRate: this.stats.totalChecks > 0 ? (this.stats.errors / this.stats.totalChecks * 100).toFixed(1) + '%' : '0%'
    };
  }
  
  async cleanup() {
    this.stopMonitoring();
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 リソースクリーンアップ完了');
    }
  }
}

// CLI使用の場合
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';
  const interval = parseInt(args[1]) || 5;
  
  if (command === '--help') {
    console.log(`
⚡ 軽量監視スクリプト使用方法:

基本監視:
  node lightweight-monitor.js                    # 5分間隔で監視開始
  node lightweight-monitor.js monitor 3          # 3分間隔で監視開始
  
ワンショット:
  node lightweight-monitor.js check              # 1回のみチェック実行

特徴:
- 最小限のリソース使用
- ブラウザインスタンス再利用
- エラー発生時のみ詳細出力
- 統計情報の自動収集
    `);
    process.exit(0);
  }
  
  const monitor = new LightweightMonitor();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 シャットダウン中...');
    const stats = monitor.getStats();
    console.log('📈 最終統計:', JSON.stringify(stats, null, 2));
    await monitor.cleanup();
    process.exit(0);
  });
  
  (async () => {
    await monitor.initialize();
    
    if (command === 'check') {
      const result = await monitor.quickCheck();
      console.log('結果:', JSON.stringify(result, null, 2));
      await monitor.cleanup();
    } else {
      await monitor.startMonitoring(interval);
    }
  })().catch(error => {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  });
}

module.exports = LightweightMonitor;