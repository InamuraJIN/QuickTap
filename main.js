const socket = io("https://quicktap.onrender.com", {
  transports: ["websocket"]
})

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
const answerList = document.getElementById("answerList")
const nameNote = document.getElementById("nameNote")
const judge = document.getElementById("judgeCounts")
const rankingScreen = document.getElementById("rankingScreen")
const rankingList = document.getElementById("rankingList")
const backBtn = document.getElementById("backBtn")
const downloadBtn = document.getElementById("downloadBtn")
const rankingToggle = document.getElementById("rankingToggle")
const rankingBtn = document.getElementById("rankingBtn")

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
  if (!name || /[^\u0020-\u007E]/.test(name)) {
    nameNote.style.color = "red"
    return
  }
  nameNote.style.color = "white"
  localStorage.setItem("username", name)
  socket.emit("username", name)
  login.classList.add("hidden")
  game.classList.remove("hidden")
  if (/^Ad\d{4}$/.test(name) || name === "Ad") {
    admin.classList.remove("hidden")
  } else {
    player.classList.remove("hidden")
  }
  socket.emit("syncRequest")
})

answerBtn.textContent = "Tap!"

answerBtn.addEventListener("click", () => {
  if (!alreadyPushed) {
    alreadyPushed = true
    answerBtn.textContent = "UnTap..."
    socket.emit("answer")
  } else {
    alreadyPushed = false
    answerBtn.textContent = "Tap!"
    socket.emit("untap")
  }
})

document.getElementById("selectMaru")?.addEventListener("click", () => {
  const audio = document.getElementById("button")
  if (audio) {
    audio.currentTime = 0
    audio.play()
  }
  socket.emit("selectAnswer", "〇")
})

document.getElementById("selectBatsu")?.addEventListener("click", () => {
  const audio = document.getElementById("button")
  if (audio) {
    audio.currentTime = 0
    audio.play()
  }
  socket.emit("selectAnswer", "×")
})

document.getElementById("seikaiBtn")?.addEventListener("click", () => {
  socket.emit("sound", "seikai")
})

document.getElementById("booBtn")?.addEventListener("click", () => {
  socket.emit("sound", "boo")
})

document.getElementById("resetBtn")?.addEventListener("click", () => {
  socket.emit("sound", "resetSilent")
})

rankingBtn?.addEventListener("click", () => {
  const toggle = document.getElementById("rankingToggle")
  const isPublic = toggle?.checked === true
  socket.emit("rankingRequest", isPublic)
})

backBtn?.addEventListener("click", () => {
  rankingScreen.classList.add("hidden")
  downloadBtn.classList.add("hidden")
  const name = localStorage.getItem("username")
  if (/^Ad\d{4}$/.test(name) || name === "Ad") {
    admin.classList.remove("hidden")
  } else {
    player.classList.remove("hidden")
  }
})

socket.on("updateList", (list) => {
  const name = localStorage.getItem("username")
  alreadyPushed = list.includes(name)
  answerBtn.textContent = alreadyPushed ? "UnTap..." : "Tap!"

  const userCount = document.getElementById("userCount")
  if (userCount) {
    userCount.textContent = `Tap人数: ${list.length}人`
  }

  const nameList = document.getElementById("userNames")
  if (nameList) {
    nameList.innerHTML = list.map((u, i) => `${i + 1}. ${u}`).join("<br>")
  }
})

socket.on("judgeUpdate", ({ maru, batsu }) => {
  if (judge) {
    judge.textContent = `〇:${maru}、×:${batsu}、計:${maru + batsu}`
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
  answerBtn?.classList?.remove("disabled")
  answerBtn.textContent = "Tap!"
})

socket.on("rankingData", ({ list, isPublic }) => {
  game.classList.remove("hidden")
  player.classList.add("hidden")
  admin.classList.add("hidden")
  rankingScreen.classList.remove("hidden")

  const sorted = Object.entries(list)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score], i) => `${i + 1}. ${name}: ${score}点`)
    .join("<br>")
  rankingList.innerHTML = sorted

  const name = localStorage.getItem("username")
  if (/^Ad\d{4}$/.test(name)) {
    downloadBtn.classList.remove("hidden")
    createDownloadLink(list, name.slice(2, 6))
  } else {
    downloadBtn.classList.add("hidden")
  }
})

function createDownloadLink(data, dateStr) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  downloadBtn.onclick = () => {
    const a = document.createElement("a")
    a.href = url
    a.download = `ranking_${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    socket.emit("syncRequest")
  }
})
