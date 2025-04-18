/**
 * ソケットハンドラー
 * サーバーとの通信を管理
 */
class SocketHandler {
  constructor() {
    this.socket = null;
    this.connected = false;
  }
  
  connect(username) {
    // Socket.IOクライアント初期化
    this.socket = io();
    
    // ユーザー名送信
    this.socket.emit('username', username);
    this.connected = true;
    
    // イベントリスナー設定
    this.setupListeners();
  }
  
  setupListeners() {
    // 回答リスト更新
    this.socket.on('updateList', (list) => {
      uiController.updateAnswerList(list);
    });
    
    // 音声再生
    this.socket.on('play', (soundId) => {
      audioController.play(soundId);
      uiController.resetAfterSound(soundId);
    });
    
    // リセットイベント
    this.socket.on('resetButtons', () => {
      uiController.resetPushState();
    });
    
    // 切断時
    this.socket.on('disconnect', () => {
      this.connected = false;
    });
  }
  
  emitAnswer() {
    if (!this.connected) return;
    this.socket.emit('answer');
  }
  
  emitSound(type) {
    if (!this.connected) return;
    this.socket.emit('sound', type);
  }
}

// グローバルインスタンス
const socketHandler = new SocketHandler();