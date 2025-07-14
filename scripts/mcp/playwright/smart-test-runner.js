/**
 * 🧠 スマートテストランナー
 * 状況に応じて適切なレベルのテストを自動選択
 */

const { exec } = require('child_process');
const fs = require('fs');

// テストレベル定義
const TEST_LEVELS = {
  QUICK: 'quick-health-check.js',      // 5秒、基本接続のみ
  BASIC: 'test-localhost-4173.js',     // 15秒、基本機能チェック
  FULL: 'test-react-lifesim.js'        // 30秒+、完全機能テスト
};

// 前回テスト結果のキャッシュファイル
const CACHE_FILE = './last-test-result.json';

function loadLastResult() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('📝 キャッシュファイル読み込み失敗、新規テスト実行');
  }
  return null;
}

function saveResult(result) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      ...result,
      timestamp: Date.now()
    }, null, 2));
  } catch (e) {
    console.log('⚠️ 結果保存失敗');
  }
}

function selectTestLevel(lastResult, forceLevel = null) {
  if (forceLevel) return forceLevel;
  
  // 前回結果がない、または24時間以上経過している場合はQUICKから開始
  if (!lastResult || (Date.now() - lastResult.timestamp) > 24 * 60 * 60 * 1000) {
    return 'QUICK';
  }
  
  // 前回の結果に基づいて判定
  switch (lastResult.status) {
    case 'healthy':
      // 連続で正常なら軽いテストで十分
      return 'QUICK';
    case 'warning':
      // 警告があった場合は基本テスト
      return 'BASIC';
    case 'error':
    case 'failed':
      // エラーがあった場合は完全テスト
      return 'FULL';
    default:
      return 'QUICK';
  }
}

function runTest(testLevel) {
  return new Promise((resolve, reject) => {
    const testFile = TEST_LEVELS[testLevel];
    console.log(`🚀 テストレベル: ${testLevel} (${testFile})`);
    
    exec(`node ${testFile}`, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        // エラーでも結果を解析
        try {
          const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('{')));
          resolve({ level: testLevel, result, error: true });
        } catch (e) {
          reject(error);
        }
      } else {
        try {
          const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('{')));
          resolve({ level: testLevel, result, error: false });
        } catch (e) {
          resolve({ level: testLevel, result: { status: 'unknown' }, error: false });
        }
      }
    });
  });
}

// メイン実行関数
async function main() {
  const args = process.argv.slice(2);
  const forceLevel = args[0] ? args[0].toUpperCase() : null;
  
  console.log('🧠 スマートテストランナー開始');
  
  // 前回結果読み込み
  const lastResult = loadLastResult();
  if (lastResult) {
    const age = Math.round((Date.now() - lastResult.timestamp) / (60 * 1000));
    console.log(`📊 前回結果: ${lastResult.status} (${age}分前)`);
  }
  
  // テストレベル選択
  const selectedLevel = selectTestLevel(lastResult, forceLevel);
  console.log(`🎯 選択レベル: ${selectedLevel}`);
  
  try {
    // テスト実行
    const testResult = await runTest(selectedLevel);
    
    // 結果保存
    saveResult(testResult.result);
    
    // エスカレーション判定
    if (testResult.result.status !== 'healthy' && selectedLevel === 'QUICK') {
      console.log('⬆️ エスカレーション: より詳細なテストを実行');
      const detailedResult = await runTest('BASIC');
      saveResult(detailedResult.result);
      
      // さらにエラーがある場合
      if (detailedResult.result.status === 'error' || detailedResult.result.status === 'failed') {
        console.log('⬆️⬆️ 最終エスカレーション: 完全テストを実行');
        const fullResult = await runTest('FULL');
        saveResult(fullResult.result);
      }
    }
    
    console.log('✅ スマートテスト完了');
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    process.exit(1);
  }
}

// 使用方法の表示
if (process.argv.includes('--help')) {
  console.log(`
🧠 スマートテストランナー使用方法:

基本使用:
  node smart-test-runner.js          # 自動レベル選択
  
強制レベル指定:
  node smart-test-runner.js quick    # 5秒、基本接続のみ
  node smart-test-runner.js basic    # 15秒、基本機能
  node smart-test-runner.js full     # 30秒+、完全テスト

特徴:
- 前回結果に基づいて最適なテストレベルを自動選択
- 問題検出時は自動でより詳細なテストにエスカレーション
- 結果をキャッシュして効率的な継続監視を実現
  `);
  process.exit(0);
}

main();