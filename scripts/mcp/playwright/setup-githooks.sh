#!/bin/bash

# 🔗 GitHook自動設定スクリプト
# HybridTestRunnerをGitHookに統合

echo "🔗 GitHook自動設定開始..."

# プロジェクトルートディレクトリを特定
if [ -d "../../template-project/.git" ]; then
    PROJECT_ROOT="../../template-project"
    echo "📁 プロジェクトルート: $PROJECT_ROOT"
else
    echo "❌ .gitディレクトリが見つかりません"
    exit 1
fi

# GitHookディレクトリ
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PLAYWRIGHT_DIR="$(pwd)"

echo "📂 GitHooksディレクトリ: $HOOKS_DIR"
echo "🎭 Playwrightディレクトリ: $PLAYWRIGHT_DIR"

# pre-commit: 軽量テスト
cat > "$HOOKS_DIR/pre-commit" << EOF
#!/bin/bash
# 🚀 Pre-commit: 軽量テスト実行

echo "🔍 Pre-commit test starting..."

# Preview serverが起動しているかチェック
if ! curl -s http://localhost:4173/ > /dev/null; then
    echo "⚠️  Preview server not running. Starting..."
    cd "$PROJECT_ROOT"
    npm run build > /dev/null 2>&1
    npm run preview > /dev/null 2>&1 &
    SERVER_PID=\$!
    sleep 3
    
    # テスト実行
    cd "$PLAYWRIGHT_DIR"
    node HybridTestRunner.js quick
    TEST_RESULT=\$?
    
    # サーバー停止
    kill \$SERVER_PID > /dev/null 2>&1
    
    exit \$TEST_RESULT
else
    # テスト実行（サーバー既存）
    cd "$PLAYWRIGHT_DIR"
    node HybridTestRunner.js quick
fi
EOF

# post-commit: 自動モード
cat > "$HOOKS_DIR/post-commit" << EOF
#!/bin/bash
# 📝 Post-commit: 自動判定テスト実行

echo "📝 Post-commit test starting..."

# Preview server状態チェック
if curl -s http://localhost:4173/ > /dev/null; then
    cd "$PLAYWRIGHT_DIR"
    node HybridTestRunner.js auto
else
    echo "ℹ️  Preview server not available, skipping tests"
fi
EOF

# pre-push: 標準テスト
cat > "$HOOKS_DIR/pre-push" << EOF
#!/bin/bash
# 🚀 Pre-push: 標準テスト実行

echo "🚀 Pre-push test starting..."

# ブランチ名取得
BRANCH=\$(git rev-parse --abbrev-ref HEAD)
echo "📋 Current branch: \$BRANCH"

# Preview serverチェック & 起動
if ! curl -s http://localhost:4173/ > /dev/null; then
    echo "⚠️  Starting preview server..."
    cd "$PROJECT_ROOT"
    npm run build > /dev/null 2>&1
    npm run preview > /dev/null 2>&1 &
    SERVER_PID=\$!
    sleep 5
    
    cd "$PLAYWRIGHT_DIR"
    if [ "\$BRANCH" = "main" ] || [ "\$BRANCH" = "master" ]; then
        echo "🎯 Main branch detected - running full tests"
        node HybridTestRunner.js full
    else
        echo "🔍 Feature branch - running standard tests"
        node HybridTestRunner.js standard
    fi
    TEST_RESULT=\$?
    
    kill \$SERVER_PID > /dev/null 2>&1
    exit \$TEST_RESULT
else
    cd "$PLAYWRIGHT_DIR"
    if [ "\$BRANCH" = "main" ] || [ "\$BRANCH" = "master" ]; then
        node HybridTestRunner.js full
    else
        node HybridTestRunner.js standard
    fi
fi
EOF

# 実行権限付与
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/post-commit"
chmod +x "$HOOKS_DIR/pre-push"

echo "✅ GitHook設定完了!"
echo ""
echo "📋 設定されたHook:"
echo "  pre-commit:  軽量テスト (quick)"
echo "  post-commit: 自動判定テスト (auto)"
echo "  pre-push:    ブランチ別テスト (standard/full)"
echo ""
echo "🧪 テスト実行例:"
echo "  cd $PLAYWRIGHT_DIR"
echo "  node HybridTestRunner.js quick     # 軽量"
echo "  node HybridTestRunner.js standard  # 標準"
echo "  node HybridTestRunner.js full      # 完全"
echo "  node HybridTestRunner.js auto      # 自動判定"
echo ""
echo "🔧 GitHook無効化:"
echo "  git config core.hooksPath /dev/null  # 一時無効"
echo "  git config --unset core.hooksPath    # 再有効"