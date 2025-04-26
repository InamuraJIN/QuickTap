const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})
const path = require("path")

app.use(express.static(__dirname))
app.use("/assets", express.static(path.join(__dirname, "assets")))

const pushedUsers = []
const answers = {}  // 〇×回答保持

let resetTimer = null

function scheduleReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    pushedUsers.length = 0
    Object.keys(answers).forEach(k => delete answers[k])
    io.emit("updateList", pushedUsers)
    io.emit("reset")
    io.emit("judgeUpdate", { maru: 0, batsu: 0 })
  }, 5 * 60 * 1000)
}

io.on("connection", (socket) => {
  socket.on("username", (name) => {
    socket.username = name
  })

  socket.on("answer", () => {
    const name = socket.username
    if (!name) return
    const index = pushedUsers.indexOf(name)
    if (index !== -1) {
      pushedUsers.splice(index, 1)
      socket.emit("reset")
    } else {
      pushedUsers.push(name)
      if (name !== "Ad" && pushedUsers.indexOf(name) < 3) {
        io.emit("play", "button")
      }
    }
    io.emit("updateList", pushedUsers)
    scheduleReset()
  })

  socket.on("untap", () => {
    const name = socket.username
    const index = pushedUsers.indexOf(name)
    if (index !== -1) {
      pushedUsers.splice(index, 1)
      socket.emit("reset")
      io.emit("updateList", pushedUsers)
    }
  })

  socket.on("selectAnswer", (mark) => {
    const name = socket.username
    if (!name) return
    answers[name] = mark

    const maru = Object.values(answers).filter(v => v === "〇").length
    const batsu = Object.values(answers).filter(v => v === "×").length
    io.emit("judgeUpdate", { maru, batsu })
  })

  socket.on("sound", (which) => {
    const name = socket.username
    if (which === "seikai") {
      pushedUsers.length = 0
      Object.keys(answers).forEach(k => delete answers[k])
      io.emit("updateList", pushedUsers)
      io.emit("play", "seikai")
      io.emit("reset")
      io.emit("judgeUpdate", { maru: 0, batsu: 0 })
      scheduleReset()
    }

    if (which === "boo") {
      if (pushedUsers.length > 0) pushedUsers.shift()
      io.emit("updateList", pushedUsers)
      io.emit("play", "boo")
    }

    if (which === "resetSilent") {
      pushedUsers.length = 0
      Object.keys(answers).forEach(k => delete answers[k])
      io.emit("updateList", pushedUsers)
      io.emit("reset")
      io.emit("judgeUpdate", { maru: 0, batsu: 0 })
      scheduleReset()
    }
  })

  socket.on("syncRequest", () => {
    socket.emit("updateList", pushedUsers)
    const maru = Object.values(answers).filter(v => v === "〇").length
    const batsu = Object.values(answers).filter(v => v === "×").length
    socket.emit("judgeUpdate", { maru, batsu })
    if (!pushedUsers.includes(socket.username)) {
      socket.emit("reset")
    }
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log("🚀 QuickTap Server is running on http://localhost:" + PORT)
})
