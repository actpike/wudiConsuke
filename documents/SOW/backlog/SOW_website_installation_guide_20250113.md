---
title: "ウディこん助 Web紹介ページ導入手順追加"
date: 2025-01-13
status: Todo
priority: High
estimated_hours: 3
category: Web Development
---

# SOW: ウディこん助 Web紹介ページ導入手順追加

## 1. プロジェクト概要

### 目的
ウディこん助のWeb紹介ページ（`website/release/`）にChrome拡張機能の導入手順セクションを追加し、Installation画像4枚を使用して分かりやすい導入ガイドを提供する。

### 背景
- Chrome Web Store公開前の段階で、手動インストール方法の案内が必要
- Installation画像4枚（`wdiconsuke_Installation_01.png` ～ `04.png`）が用意済み
- ダウンロードリンクを`versions/WudiConsuke_release_v0.0.1.zip`に設定
- Chrome拡張機能のため、Chrome以外のブラウザでは利用不可

## 2. 技術仕様

### 対象ファイル
- **メインファイル**: `website/release/index.html`
- **画像ファイル**: `website/release/images/Installation/wdiconsuke_Installation_01.png` ～ `04.png`
- **ダウンロードファイル**: `website/release/versions/WudiConsuke_release_v0.0.1.zip`
- **スタイルファイル**: `website/release/css/styles.css`（必要に応じて）
- **JavaScript**: `website/release/js/main.js`（ブラウザ判定機能追加）

### 修正箇所
**index.html 175-193行目の「ダウンロード」セクション**
- 現在：Chrome Web Store公開待ちの表示
- 変更後：手動インストール用のダウンロードリンクと導入手順を追加

## 3. 実装内容

### 3.1 ダウンロードセクションの修正

#### 現在の構造
```html
<section id="download" class="download">
    <div class="container">
        <div class="download-content">
            <h2 class="section-title">ダウンロード</h2>
            <p class="download-description">
                Chrome Web Storeでの公開準備中です。<br>
                もうしばらくお待ちください。
            </p>
            <div class="download-button">
                <button class="btn btn-primary btn-large" disabled>
                    <!-- Coming Soon ボタン -->
                </button>
            </div>
        </div>
    </div>
</section>
```

#### 修正後の構造
```html
<section id="download" class="download">
    <div class="container">
        <div class="download-content">
            <h2 class="section-title">ダウンロード</h2>
            <p class="download-description">
                現在Chrome Web Store公開準備中です。<br>
                こちらから手動でインストールしていただけます。
            </p>
            
            <!-- ダウンロードボタン（ブラウザ判定対応） -->
            <div class="download-button">
                <a href="./versions/WudiConsuke_release_v0.0.1.zip" 
                   id="download-btn"
                   class="btn btn-primary btn-large"
                   download="WudiConsuke_v0.0.1.zip">
                    <span class="btn-icon">📦</span>
                    <span id="download-text">ウディこん助 v0.0.1 をダウンロード</span>
                </a>
                <p id="browser-warning" class="browser-warning" style="display: none;">
                    ⚠️ この拡張機能はChromeブラウザでのみ動作します
                </p>
            </div>
            
            <!-- 導入手順セクション -->
            <div class="installation-guide">
                <h3 class="installation-title">導入手順</h3>
                <div class="installation-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Chrome拡張機能管理画面を開く</h4>
                            <p>Chromeブラウザで <code>chrome://extensions/</code> にアクセスし、右上の「開発者モード」を有効にします。</p>
                            <img src="./images/Installation/wdiconsuke_Installation_01.png" 
                                 alt="Chrome拡張機能管理画面" 
                                 class="step-image">
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>zipファイルを解凍</h4>
                            <p>ダウンロードしたzipファイルを適当なフォルダに解凍します。</p>
                            <img src="./images/Installation/wdiconsuke_Installation_02.png" 
                                 alt="zipファイル解凍" 
                                 class="step-image">
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>拡張機能を読み込む</h4>
                            <p>「パッケージ化されていない拡張機能を読み込む」をクリックし、解凍したフォルダを選択します。</p>
                            <img src="./images/Installation/wdiconsuke_Installation_03.png" 
                                 alt="拡張機能読み込み" 
                                 class="step-image">
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>インストール完了</h4>
                            <p>ウディこん助がインストールされ、ブラウザのツールバーにアイコンが表示されます。クリックして利用開始！</p>
                            <img src="./images/Installation/wdiconsuke_Installation_04.png" 
                                 alt="インストール完了" 
                                 class="step-image">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

### 3.2 JavaScript機能追加（ブラウザ判定）

#### main.js に追加するコード
```javascript
// ブラウザ判定とダウンロードボタン制御
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('download-btn');
    const downloadText = document.getElementById('download-text');
    const browserWarning = document.getElementById('browser-warning');
    
    // Chrome判定
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (!isChrome) {
        // Chrome以外の場合
        downloadBtn.classList.remove('btn-primary');
        downloadBtn.classList.add('btn-disabled');
        downloadBtn.removeAttribute('href');
        downloadBtn.removeAttribute('download');
        downloadText.textContent = 'Chromeブラウザでのみサポートしています';
        browserWarning.style.display = 'block';
        
        // クリックイベントを無効化
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('この拡張機能はGoogle Chromeブラウザでのみ利用できます。\\nChromeをダウンロードしてからお試しください。');
        });
    }
});
```

### 3.3 CSSスタイル追加

#### 導入手順用スタイル
```css
/* Browser Warning Styles */
.browser-warning {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    color: #856404;
    font-size: 0.9rem;
    text-align: center;
}

.btn-disabled {
    background: #6c757d !important;
    border-color: #6c757d !important;
    cursor: not-allowed !important;
    opacity: 0.7;
}

.btn-disabled:hover {
    background: #6c757d !important;
    border-color: #6c757d !important;
    transform: none !important;
}

/* Installation Guide Styles */
.installation-guide {
    margin-top: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.installation-title {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
    font-size: 1.5rem;
}

.installation-steps {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.step {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-number {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
}

.step-content {
    flex: 1;
}

.step-content h4 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.2rem;
}

.step-content p {
    margin: 0 0 1rem 0;
    color: #6c757d;
    line-height: 1.6;
}

.step-content code {
    background: #f1f3f4;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
}

.step-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
    .step {
        flex-direction: column;
        text-align: center;
    }
    
    .step-number {
        align-self: center;
    }
}
```

## 4. 品質要件

### 4.1 デザイン要件
- 既存のデザインシステムとの一貫性を保持
- モバイルレスポンシブ対応
- アクセシビリティ考慮（alt属性、適切なマークアップ）

### 4.2 機能要件
- ダウンロードリンクの正常動作
- 画像の適切な表示とロード最適化
- 手順の分かりやすさと論理的な流れ

### 4.3 技術要件
- 既存のCSS構造を破綻させない
- 画像ファイルサイズの最適化
- SEO対応（適切なheading構造）

## 5. 受け入れ基準

### 5.1 必須条件
- [ ] Chrome環境：ダウンロードボタンから正しいzipファイルがダウンロードできる
- [ ] Chrome以外：ボタンが無効化され、適切な警告メッセージが表示される
- [ ] 4つの導入手順が順序立てて表示される
- [ ] 各手順にInstallation画像が適切に表示される
- [ ] モバイル・デスクトップ両環境で正常表示される
- [ ] ブラウザ判定機能が正常に動作する

### 5.2 確認項目
- [ ] 既存のレイアウトが崩れていない
- [ ] 画像のalt属性が適切に設定されている
- [ ] ダウンロードファイルのパスが正しい
- [ ] CSS追加による他セクションへの影響がない
- [ ] JavaScript追加による既存機能への影響がない
- [ ] ブラウザ判定ロジックの精度が適切である

## 6. 実装後の確認事項

### 6.1 動作確認
1. **Chrome環境での動作確認**
   - ダウンロードリンクの動作確認
   - 導入手順の表示確認
   - ダウンロードファイルの内容確認

2. **非Chrome環境での動作確認**
   - Firefox: ボタン無効化と警告表示確認
   - Safari: ボタン無効化と警告表示確認
   - Edge: ボタン無効化と警告表示確認

3. **デバイス別表示確認**
   - デスクトップ（Chrome）
   - モバイル（Chrome）
   - 画像ロード速度の確認

### 6.2 コンテンツ確認
1. 導入手順の内容が正確で分かりやすいか
2. 画像と説明文の対応が適切か
3. 技術的な正確性（chrome://extensions/ URLなど）

## 7. 補足事項

### 7.1 将来的な考慮事項
- Chrome Web Store公開時は該当セクションを「手動インストール」として残し、「Chrome Web Store」ボタンを追加
- バージョンアップ時のダウンロードリンク更新手順の検討
- ブラウザ判定ロジックの定期的な見直し（新しいブラウザへの対応）

### 7.2 ブラウザサポート方針
- **対象ブラウザ**: Google Chrome（デスクトップ・モバイル）
- **非対象ブラウザ**: Firefox, Safari, Edge等（警告表示のみ）
- **将来的な拡張**: 他のChromiumベースブラウザへの対応検討

### 7.3 関連ファイル
- Installation画像の品質確認
- zipファイルの内容確認（最新版であるか）
- 必要に応じてREADME.txtの追加検討
- ブラウザ判定機能のテストケース作成