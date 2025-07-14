# ⚡ 効率的Playwrightテスト戦略

## 🎯 トークン消費を最小化する3段階アプローチ

### **レベル1: 超軽量ヘルスチェック** (推奨頻度: 5-10分間隔)
```bash
node quick-health-check.js
# 消費時間: 3-5秒
# チェック内容: 接続可能性 + 基本要素の存在確認のみ
# トークン消費: 最小限（1-2回のコンソール出力程度）
```

### **レベル2: 基本機能テスト** (推奨頻度: 問題検出時のみ)
```bash
node test-localhost-4173.js
# 消費時間: 10-15秒
# チェック内容: UI要素確認 + 基本操作
# トークン消費: 中程度
```

### **レベル3: 完全機能テスト** (推奨頻度: 開発作業後のみ)
```bash
node test-react-lifesim.js
# 消費時間: 30秒+
# チェック内容: 全機能の動作確認
# トークン消費: 高
```

## 🧠 スマート自動選択

### **通常使用（推奨）:**
```bash
node smart-test-runner.js
# 前回結果に基づいて自動で最適なレベルを選択
# 正常時: レベル1のみ実行
# 異常検出時: 自動でレベル2→レベル3にエスカレーション
```

### **強制レベル指定:**
```bash
node smart-test-runner.js quick    # レベル1強制実行
node smart-test-runner.js basic    # レベル2強制実行  
node smart-test-runner.js full     # レベル3強制実行
```

## 📊 継続監視モード

### **軽量継続監視:**
```bash
node lightweight-monitor.js          # 5分間隔
node lightweight-monitor.js monitor 3 # 3分間隔
node lightweight-monitor.js check    # 1回のみ実行
```

**特徴:**
- ブラウザインスタンス再利用でオーバーヘッド削減
- エラー発生時のみ詳細出力
- 統計情報自動収集

## 💡 効率的な使い分け指針

### **開発中の継続監視:**
```bash
# 軽量監視を5分間隔で実行
node lightweight-monitor.js
```

### **機能追加後の確認:**
```bash
# スマートテストで自動判定
node smart-test-runner.js
```

### **デプロイ前の最終確認:**
```bash
# 完全テストを強制実行
node smart-test-runner.js full
```

### **問題調査時:**
```bash
# 基本テストで詳細確認
node smart-test-runner.js basic
```

## 📈 トークン消費量比較

| テストレベル | 実行時間 | トークン消費 | 使用頻度 |
|------------|---------|------------|----------|
| 超軽量 | 3-5秒 | 極小 | 5-10分間隔 |
| 基本 | 10-15秒 | 小 | 問題検出時 |
| 完全 | 30秒+ | 大 | 開発完了時 |

## 🔄 推奨ワークフロー

1. **日常監視**: `lightweight-monitor.js` (5分間隔)
2. **コード変更後**: `smart-test-runner.js` (自動判定)
3. **機能追加完了**: `smart-test-runner.js full` (完全テスト)
4. **問題調査**: `smart-test-runner.js basic` (詳細確認)

この戦略により、**通常は95%以上の時間で軽量テストのみ**を実行し、問題検出時のみ詳細テストを行うことで、トークン消費を大幅に削減できます。