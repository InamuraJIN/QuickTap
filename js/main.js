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
    
    // キーボードイベント設定
    this.setupKeyboardEvents();
  }
  
  setupKeyboardEvents() {
    // スペースキーで回答、Escでリセット
    document.addEventListener('keydown', (e) => {
      // ログイン画面ではキーボードショートカットを無効
      if (uiController.loginScreen.style.display !== 'none') {
        return;
      }
      
      // スペースキーで回答
      if ((e.code === 'Space' || e.code === 'Enter') && !uiController.isAdmin) {
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

    // スペースキー押しっぱなし防止
    document.addEventListener('keyup', (event) => {
      const code = event.code;
      if (code === 'Space' || code === 'Enter') {
        event.preventDefault();
      }
    });
  }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  window.app = new QuickTapApp();
});