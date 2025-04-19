let alreadyPushed = false
const answerBtn = document.getElementById("answerBtn")
const usernameInput = document.getElementById("username")
const startBtn = document.getElementById("startBtn")
const slider = document.getElementById("volumeSlider")
const label = document.getElementById("volumeLabel")
const audios = document.querySelectorAll("audio")
const login = document.getElementById("loginScreen")
const game = document.getElementById("gameScreen")
const admin = document.getElementById("adminUI")
const player = document.getElementById("playerUI")

// 音量初期化
const savedVol = localStorage.getItem("volume") || "50"
slider.value = savedVol
label.textContent = `${savedVol}%`
audios.forEach(a => a.volume = savedVol / 100)

slider.addEventListener("input", () => {
  const v = slider.value
  label.textContent = `${v}%`
  localStorage.setItem("volume", v)
  audios.forEach(a => a.volume = v / 100)
})

const savedName = localStorage.getItem("username")
if (savedName) usernameInput.value = savedName

startBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim()
  if (!name) return
  localStorage.setItem("username", name)
  window.socket.emit("username", name)
  login.classList.add("hidden")
  game.classList.remove("hidden")
  if (name === "Ad") {
    admin.classList.remove("hidden")
  } else {
    player.classList.remove("hidden")
  }
})

answerBtn.addEventListener("click", () => {
  if (alreadyPushed) return
  alreadyPushed = true
  answerBtn.classList.add("disabled")
  window.socket.emit("answer")
  window.socket.emit("sound", "button")  // ← これを追加！
})

document.getElementById("seikaiBtn").addEventListener("click", () => {
  window.socket.emit("sound", "seikai")
})

document.getElementById("booBtn").addEventListener("click", () => {
  window.socket.emit("sound", "boo")
})

window.resetPushState = () => {
  alreadyPushed = false
  answerBtn.classList.remove("disabled")
}
