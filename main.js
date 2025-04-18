/**
 * QuickTap メインアプリケーション
 * アプリケーションの初期化と統合を行う
 */
class QuickTapApp {
  constructor() {
    // アプリケーション全体の初期化処理
    this.init();
  }
  
  init() {
    // アプリケーション起動時の処理
    console.log('QuickTap アプリケーションを起動しました');
    
    // 5分自動リセットタイマー
    this.setupAutoReset();
    
    // キーボードイベント設定
    this.setupKeyboardEvents();
  }
  
  setupAutoReset() {
    // 5分（300,000ミリ秒）ごとにリセット
    setInterval(() => {
      // 管理者がいない場合も自動リセット
      uiController.resetPushState();
    }, 300000);
  }
  
  setupKeyboardEvents() {
    // スペースキーで回答
    document.addEventListener('keydown', (e) => {
      // ログイン画面ではキーボードショートカットを無効
      if (!uiController.loginScreen.classList.contains('hidden')) {
        return;
      }
      
      // スペースキーで回答
      if (e.code === 'Space' && !uiController.isAdmin) {
        uiController.handleAnswer();
        e.preventDefault();
      }
      
      // 管理者用ショートカット（1キーで正解、0キーで残念）
      if (uiController.isAdmin) {
        if (e.key === '1') {
          socketHandler.emitSound('seikai');
        } else if (e.key === '0') {
          socketHandler.emitSound('boo');
        }
      }
    });
  }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  window.app = new QuickTapApp();
});