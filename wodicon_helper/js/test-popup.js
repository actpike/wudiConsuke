// テスト用の簡単な初期化スクリプト
console.log('🌊 Test popup script loaded');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌊 DOM loaded, starting simple test...');
  
  try {
    // ローディングを非表示にする
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      console.log('✅ Loading hidden');
    }
    
    // 簡単なテストデータを表示
    const tbody = document.getElementById('game-list-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr class="game-row">
          <td class="col-check">□</td>
          <td class="col-no">1</td>
          <td class="col-title">テスト作品</td>
          <td class="col-ver">✅</td>
          <td class="col-rating">-/-/-/-/-/-</td>
        </tr>
      `;
      console.log('✅ Test data loaded');
    }
    
    // ステータスバーを更新
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = '📊 テストモード: 1作品';
      console.log('✅ Status updated');
    }
    
    console.log('🌊 Simple test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // エラー表示
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = '❌ テスト失敗: ' + error.message;
    }
  }
});