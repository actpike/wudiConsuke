/**
 * 🧪 HybridTestRunner動作確認スクリプト
 */

const HybridTestRunner = require('./HybridTestRunner');

(async () => {
  console.log('🧪 HybridTestRunner動作確認開始');
  
  // 各モードをテスト
  const modes = ['quick', 'standard', 'full'];
  
  for (const mode of modes) {
    console.log(`\n🔍 Testing mode: ${mode}`);
    console.log('='.repeat(50));
    
    try {
      const runner = new HybridTestRunner(mode);
      runner.registerGitHookTestSuites();
      
      const report = await runner.executeTests();
      
      console.log('\n📊 結果サマリー:');
      console.log(`  Mode: ${report.summary.mode}`);
      console.log(`  Status: ${report.summary.overall_status}`);
      console.log(`  Success Rate: ${report.summary.success_rate}`);
      console.log(`  Total Time: ${report.summary.total_time}ms`);
      console.log(`  Tests: ${report.summary.passed}/${report.summary.total} passed`);
      
      if (report.summary.overall_status === 'FAILURE') {
        console.log('\n❌ Failed tests:');
        report.results
          .filter(r => r.status !== 'PASS')
          .forEach(r => console.log(`    - ${r.name}`));
      }
      
    } catch (error) {
      console.log(`❌ Mode ${mode} failed: ${error.message}`);
    }
    
    // 次のテストまで少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 HybridTestRunner動作確認完了');
  
})().catch(error => {
  console.error('💥 Test failed:', error.message);
  process.exit(1);
});