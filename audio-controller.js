/**
 * 音声コントローラー
 * 音声の再生や音量調整を管理する
 */
class AudioController {
  constructor() {
    this.audios = document.querySelectorAll('audio');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.volumeLabel = document.getElementById('volumeLabel');
    this.volumeIcon = document.getElementById('volumeIcon');
    this.isMuted = false;
    
    this.init();
  }
  
  init() {
    // localStorage から音量設定を復元
    const savedVol = localStorage.getItem('volume') || '50';
    this.setVolume(savedVol);
    
    // イベントリスナー設定
    this.volumeSlider.addEventListener('input', () => {
      this.setVolume(this.volumeSlider.value);
    });
    
    // ミュートボタン
    this.volumeIcon.addEventListener('click', () => {
      this.toggleMute();
    });
  }
  
  setVolume(volume) {
    // 音量設定
    this.volumeSlider.value = volume;
    this.volumeLabel.textContent = `${volume}%`;
    localStorage.setItem('volume', volume);
    
    // すべての音声要素に適用
    this.audios.forEach(audio => {
      audio.volume = volume / 100;
    });
    
    // ミュート状態なら解除
    if (this.isMuted && volume > 0) {
      this.isMuted = false;
      this.volumeIcon.textContent = '🔊';
    }
  }
  
  toggleMute() {
    if (this.isMuted) {
      // ミュート解除
      const savedVol = localStorage.getItem('volume') || '50';
      this.setVolume(savedVol);
      this.volumeIcon.textContent = '🔊';
    } else {
      // ミュート
      this.previousVolume = this.volumeSlider.value;
      this.audios.forEach(audio => {
        audio.volume = 0;
      });
      this.volumeIcon.textContent = '🔇';
    }
    this.isMuted = !this.isMuted;
  }
  
  play(soundId) {
    const audio = document.getElementById(soundId);
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }
}

// グローバルインスタンス
const audioController = new AudioController();