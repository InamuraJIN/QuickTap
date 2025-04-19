window.socket = io()

const answerList = document.getElementById("answerList")

window.socket.on("updateList", (list) => {
  answerList.innerHTML = list.map((u, i) => `${i + 1}. ${u}`).join("<br>")
})

window.socket.on("play", (soundId) => {
  const audio = document.getElementById(soundId)
  if (audio) {
    audio.currentTime = 0
    audio.play()
  }
  if (soundId === "seikai" || soundId === "boo") {
    window.resetPushState()
  }
})
