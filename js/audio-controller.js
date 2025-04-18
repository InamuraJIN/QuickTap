/**
 * 音声コントローラー
 * 音声の再生や音量調整を管理する
 */
class AudioController {
  constructor() {
    this.audios = {
      buzzer: document.getElementById('buzzer'),
      pinpon: document.getElementById('pinpon'),
      boboo: document.getElementById('boboo')
    };
    
    this.volumeButton = document.getElementById('volume_button');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.volumeLabel = document.getElementById('volumeLabel');
    this.volumeControl = document.querySelector('.volume-control');
    
    this.isMuted = false;
    
    this.init();
  }
  
  init() {
    // localStorageから音量設定を復元
    const savedVol = localStorage.getItem('volume') || '50';
    const savedMute = localStorage.getItem('muted') === 'true';
    
    this.setVolume(savedVol);
    
    if (savedMute) {
      this.toggleMute(true);
    }
    
    // イベントリスナー設定
    this.volumeButton.addEventListener('click', () => {
      this.toggleMute();
      this.toggleVolumeControl();
    });
    
    this.volumeSlider.addEventListener('input', () => {
      this.setVolume(this.volumeSlider.value);
    });
  }
  
  setVolume(volume) {
    // 音量設定
    this.volumeSlider.value = volume;
    this.volumeLabel.textContent = `${volume}%`;
    localStorage.setItem('volume', volume);
    
    // すべての音声要素に適用
    for (const key in this.audios) {
      if (this.audios[key]) {
        this.audios[key].volume = volume / 100;
      }
    }
    
    // ミュート状態なら解除
    if (this.isMuted && Number(volume) > 0) {
      this.isMuted = false;
      this.volumeButton.textContent = '🔊';
      localStorage.setItem('muted', 'false');
    }
  }
  
  toggleMute(forced = false) {
    if (forced) {
      this.isMuted = true;
    } else {
      this.isMuted = !this.isMuted;
    }
    
    if (this.isMuted) {
      // ミュート状態
      for (const key in this.audios) {
        if (this.audios[key]) {
          this.audios[key].volume = 0;
        }
      }
      this.volumeButton.textContent = '🔇';
    } else {
      // ミュート解除
      const savedVol = localStorage.getItem('volume') || '50';
      for (const key in this.audios) {
        if (this.audios[key]) {
          this.audios[key].volume = savedVol / 100;
        }
      }
      this.volumeButton.textContent = '🔊';
    }
    
    localStorage.setItem('muted', this.isMuted.toString());
  }
  
  toggleVolumeControl() {
    if (this.volumeControl.style.display === 'none') {
      this.volumeControl.style.display = 'flex';
    } else {
      this.volumeControl.style.display = 'none';
    }
  }
  
  play(soundId) {
    // soundIdをクライアント側の音声IDに変換
    const clientSoundMap = {
      'seikai': 'pinpon',
      'boo': 'boboo',
      'button': 'buzzer'
    };
    
    const mappedSoundId = clientSoundMap[soundId] || soundId;
    
    if (this.audios[mappedSoundId]) {
      this.audios[mappedSoundId].currentTime = 0;
      this.audios[mappedSoundId].play();
    }
  }
}

// グローバルインスタンス
const audioController = new AudioController();