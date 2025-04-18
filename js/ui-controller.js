/**
 * UIコントローラー
 * 画面表示と状態管理を担当
 */
class UIController {
  constructor() {
    // 画面要素
    this.loginScreen = document.getElementById('loginScreenWrap');
    this.gameScreen = document.getElementById('playGame');
    this.adminUI = document.getElementById('adminUI');
    this.playerUI = document.getElementById('playerUI');
    this.answerBtn = document.getElementById('push');
    this.correctBtn = document.getElementById('correct');
    this.wrongBtn = document.getElementById('wrong');
    this.answerList = document.getElementById('displayPushedPlayers');
    this.usernameInput = document.getElementById('playerName');
    this.joinButton = document.getElementById('join');
    
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
    
    // ページ背景設定
    this.setRandomBackground();
    
    // 参加ボタンイベント
    this.joinButton.addEventListener('click', () => {
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
    this.answerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleAnswer();
    });
  }
  
  setRandomBackground() {
    document.body.style.backgroundImage = `url("https://picsum.photos/820?q=${Math.random()}")`;
  }
  
  handleLogin() {
    const name = this.usernameInput.value.trim();
    if (!name) return;
    
    this.username = name;
    localStorage.setItem('username', name);
    
    // 画面切り替え
    this.loginScreen.style.display = 'none';
    this.gameScreen.style.display = 'flex';
    
    // Admin判定
    this.isAdmin = (name === 'Ad');
    
    if (this.isAdmin) {
      this.adminUI.style.display = 'block';
    } else {
      this.playerUI.style.display = 'block';
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
    this.answerList.innerHTML = '';
    
    // ユーザーごとにp要素を作成
    list.forEach((username, index) => {
      const p = document.createElement('p');
      p.className = 'displayPushedPlayerName';
      p.textContent = `${index + 1}. ${username}`;
      this.answerList.appendChild(p);
    });
  }
  
  resetPushState() {
    this.alreadyPushed = false;
    this.answerBtn.classList.remove('disabled');
  }
}

// グローバルインスタンス
const uiController = new UIController();