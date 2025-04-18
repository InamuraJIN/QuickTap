/**
 * UIコントローラー
 * 画面表示と状態管理を担当
 */
class UIController {
  constructor() {
    // 画面要素
    this.loginScreen = document.getElementById('loginScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.adminUI = document.getElementById('adminUI');
    this.playerUI = document.getElementById('playerUI');
    this.answerBtn = document.getElementById('answerBtn');
    this.answerList = document.getElementById('answerList');
    this.usernameInput = document.getElementById('username');
    this.startBtn = document.getElementById('startBtn');
    this.correctBtn = document.getElementById('correctBtn');
    this.wrongBtn = document.getElementById('wrongBtn');
    
    // 状態管理
    this.username = '';
    this.isAdmin = false;
    this.alreadyPushed = false;
    
    this.init();
  }
  
  init() {
    // 保存されたユーザー名の復元
    const savedName = localStorage.getItem('username');
    if (savedName) {
      this.usernameInput.value = savedName;
    }
    
    // スタートボタンイベント
    this.startBtn.addEventListener('click', () => {
      this.handleLogin();
    });
    
    // キーボードエンターでもログイン
    this.usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });
    
    // 管理者用ボタン
    this.correctBtn.addEventListener('click', () => {
      socketHandler.emitSound('seikai');
    });
    
    this.wrongBtn.addEventListener('click', () => {
      socketHandler.emitSound('boo');
    });
    
    // 回答ボタン
    this.answerBtn.addEventListener('click', () => {
      this.handleAnswer();
    });
  }
  
  handleLogin() {
    const name = this.usernameInput.value.trim();
    if (!name) return;
    
    this.username = name;
    localStorage.setItem('username', name);
    
    // 画面切り替え
    this.loginScreen.classList.add('hidden');
    this.gameScreen.classList.remove('hidden');
    
    // Admin判定
    this.isAdmin = (name === 'Ad');
    
    if (this.isAdmin) {
      this.adminUI.classList.remove('hidden');
    } else {
      this.playerUI.classList.remove('hidden');
    }
    
    // ソケット接続
    socketHandler.connect(name);
  }
  
  handleAnswer() {
    if (this.alreadyPushed) return;
    
    this.alreadyPushed = true;
    this.answerBtn.classList.add('disabled');
    socketHandler.emitAnswer();
  }
  
  updateAnswerList(list) {
    this.answerList.innerHTML = list.map((u, i) => `${i + 1}. ${u}`).join('<br>');
  }
  
  resetPushState() {
    this.alreadyPushed = false;
    this.answerBtn.classList.remove('disabled');
  }
  
  resetAfterSound(soundId) {
    if (soundId === 'seikai' || soundId === 'boo') {
      this.resetPushState();
    }
  }
}

// グローバルインスタンス
const uiController = new UIController();