const socket = io("https://quicktap.onrender.com", {
  transports: ["websocket"]
})

let alreadyPushed = false
let isAd = false
let currentUsername = ""
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
const answerList = document.getElementById("answerList")

const savedVol = localStorage.getItem("volume") || "30"
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
  currentUsername = name
  localStorage.setItem("username", name)
  socket.emit("username", name)
  login.classList.add("hidden")
  game.classList.remove("hidden")
  if (name === "Ad") {
    isAd = true
    admin.classList.remove("hidden")
  } else {
    player.classList.remove("hidden")
  }
  socket.emit("syncRequest")
})

answerBtn.addEventListener("click", () => {
  socket.emit("answerToggle") // 新たなイベント名でトグル送信
})

socket.on("updateList", (list) => {
  answerList.innerHTML =
    `<div>人数: ${list.length}人</div><br>` +
    list.map((u, i) => `${i + 1}. ${u}`).join("<br>")

  if (!isAd) {
    alreadyPushed = list.includes(currentUsername)
    answerBtn.textContent = alreadyPushed ? "UnTap..." : "Tap!"
  }
})

socket.on("play", (soundId) => {
  const audio = document.getElementById(soundId)
  if (audio) {
    audio.currentTime = 0
    audio.play()
  }
})

socket.on("reset", () => {
  alreadyPushed = false
  answerBtn.textContent = "Tap!"
})

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    socket.emit("syncRequest")
  }
})
