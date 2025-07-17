// ウディこん助 紹介ページ JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初期化
    initializeApp();
});

function initializeApp() {
    // ブラウザ判定とダウンロードボタン制御
    initializeBrowserDetection();
    
    // タブ切り替え機能
    initializeTabs();
    
    // スムーススクロール
    initializeSmoothScroll();
    
    // アニメーション
    initializeAnimations();
    
    // インタラクション
    initializeInteractions();
    
    // パフォーマンス最適化
    initializeLazyLoading();
    
    console.log('🌊 ウディこん助紹介ページ初期化完了');
}

// タブ切り替え機能
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`タブ要素検索結果: buttons=${tabButtons.length}, contents=${tabContents.length}`);
    
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.log('タブ要素が見つかりません');
        return;
    }
    
    // 初期状態をログ出力
    tabButtons.forEach((btn, index) => {
        console.log(`タブボタン${index}: data-tab="${btn.dataset.tab}", active=${btn.classList.contains('active')}`);
    });
    
    tabContents.forEach((content, index) => {
        console.log(`タブコンテンツ${index}: id="${content.id}", active=${content.classList.contains('active')}`);
    });
    
    // タブボタンのクリックイベント
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            const targetContentId = targetTab + '-tab';
            
            console.log(`タブクリック: ${targetTab} -> ${targetContentId}`);
            
            // すべてのタブボタンとコンテンツからactiveクラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブボタンにactiveクラスを追加
            this.classList.add('active');
            
            // 対応するタブコンテンツを表示
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log(`✅ タブ切り替え成功: ${targetContentId}`);
            } else {
                console.error(`❌ タブコンテンツが見つかりません: ${targetContentId}`);
            }
        });
    });
    
    console.log('✅ タブ切り替え機能初期化完了');
}

// ブラウザ判定とダウンロードボタン制御
function initializeBrowserDetection() {
    const downloadBtn = document.getElementById('download-btn');
    const downloadText = document.getElementById('download-text');
    const browserWarning = document.getElementById('browser-warning');
    
    // 要素が存在しない場合は処理をスキップ
    if (!downloadBtn || !downloadText || !browserWarning) {
        console.log('ダウンロードボタン要素が見つかりません');
        return;
    }
    
    // Chrome判定（より精密な判定）
    const isChrome = /Chrome/.test(navigator.userAgent) && 
                    /Google Inc/.test(navigator.vendor) &&
                    !/Edg|OPR|Opera/.test(navigator.userAgent);
    
    // モバイル端末判定
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    
    console.log(`ブラウザ判定結果: Chrome=${isChrome}, Mobile=${isMobile}, UserAgent=${navigator.userAgent}`);
    
    if (!isChrome || isMobile) {
        // Chrome以外またはモバイル端末の場合
        downloadBtn.classList.remove('btn-primary');
        downloadBtn.classList.add('btn-disabled');
        downloadBtn.removeAttribute('href');
        downloadBtn.removeAttribute('download');
        
        let warningMessage = '';
        if (isMobile) {
            downloadText.textContent = 'PC版Chromeブラウザでのみサポートしています';
            warningMessage = 'この拡張機能はPC版Google Chromeブラウザでのみ利用できます。\n\nモバイル端末では利用できません。\nパソコンのChromeブラウザからアクセスしてください。';
        } else {
            downloadText.textContent = 'Chromeブラウザでのみサポートしています';
            const browserName = getBrowserName();
            warningMessage = `この拡張機能はGoogle Chromeブラウザでのみ利用できます。\n\n現在のブラウザ: ${browserName}\n\nChromeをダウンロードしてからお試しください。\nhttps://www.google.com/chrome/`;
        }
        
        browserWarning.style.display = 'block';
        
        // クリックイベントを無効化
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            alert(warningMessage);
        });
        
        console.log('🚫 Chrome以外またはモバイル端末でダウンロードボタンを無効化しました');
    } else {
        console.log('✅ PC版Chrome環境でダウンロードボタンを有効化しました');
    }
}

// ブラウザ名取得ヘルパー関数
function getBrowserName() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Firefox')) {
        return 'Mozilla Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        return 'Safari';
    } else if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
        return 'Microsoft Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        return 'Opera';
    } else if (userAgent.includes('Chrome')) {
        return 'Google Chrome';
    } else {
        return '不明なブラウザ';
    }
}

// スムーススクロール
function initializeSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = 80; // ヘッダーの高さを考慮
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// アニメーション初期化
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 監視対象要素
    const animateElements = document.querySelectorAll('.feature-card, .screenshot-item, .download-content');
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // CSS アニメーション用のクラス追加
    const style = document.createElement('style');
    style.textContent = `
        .feature-card,
        .screenshot-item,
        .download-content {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// インタラクション
function initializeInteractions() {
    // ボタンホバーエフェクト
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    // 画像クリック拡大（簡易モーダル）
    const screenshots = document.querySelectorAll('.screenshot-img');
    screenshots.forEach(img => {
        img.addEventListener('click', function() {
            showImageModal(this.src, this.alt);
        });
        
        // カーソルをポインターに
        img.style.cursor = 'pointer';
    });
    
    // Chrome Web Store リンク（準備中の場合）
    const storeButtons = document.querySelectorAll('.btn-primary');
    storeButtons.forEach(button => {
        if (button.disabled) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showComingSoonMessage();
            });
        }
    });
}

// 画像モーダル表示
function showImageModal(src, alt) {
    // モーダルが既に存在する場合は削除
    const existingModal = document.getElementById('image-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // モーダル作成
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    // クリックで閉じる
    modal.addEventListener('click', function() {
        modal.remove();
    });
    
    // ESCキーで閉じる
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Coming Soon メッセージ
function showComingSoonMessage() {
    // 通知要素作成
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <strong>🔔 お知らせ</strong><br>
        Chrome Web Storeでの公開準備中です。<br>
        もうしばらくお待ちください。
    `;
    
    // アニメーション追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 遅延読み込み
function initializeLazyLoading() {
    // 画像の遅延読み込み
    const images = document.querySelectorAll('img[src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
        
        // 画像読み込み完了スタイル
        const style = document.createElement('style');
        style.textContent = `
            img {
                transition: opacity 0.3s ease;
            }
            img:not(.loaded) {
                opacity: 0.8;
            }
            img.loaded {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
}

// ユーティリティ関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// スクロール時のヘッダー効果
window.addEventListener('scroll', debounce(function() {
    const header = document.querySelector('.header');
    const scrolled = window.scrollY > 50;
    
    if (scrolled) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
}, 10));

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('ページエラー:', e.error);
});

// パフォーマンス計測
window.addEventListener('load', function() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 ページ読み込み時間: ${loadTime}ms`);
    }
});

// 外部リンクの安全な処理
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="http"]');
    if (link && !link.hostname.includes(window.location.hostname)) {
        // 外部リンクの場合、rel属性を確保
        if (!link.hasAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    }
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', function() {
    // モーダルなどのクリーンアップ
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.remove();
    }
});