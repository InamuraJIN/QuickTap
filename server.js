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
const fs = require("fs")

app.use(express.static(__dirname))
app.use("/assets", express.static(path.join(__dirname, "assets")))

const pushedUsers = []
const answers = {}
const scores = {}
const tempTapPoints = {}

let resetTimer = null

function isLoggingUser(name) {
  return /^Ad\d{4}$/.test(name)
}

function saveRanking(dateStr) {
  const fileName = `ranking_${dateStr}.json`
  const json = JSON.stringify(scores, null, 2)
  fs.writeFileSync(fileName, json)
}

function scheduleReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    pushedUsers.length = 0
    Object.keys(answers).forEach(k => delete answers[k])
    Object.keys(tempTapPoints).forEach(k => delete tempTapPoints[k])
    io.emit("updateList", pushedUsers)
    io.emit("reset")
    io.emit("judgeUpdate", { maru: 0, batsu: 0 })
  }, 5 * 60 * 1000)
}

io.on("connection", (socket) => {
  socket.on("username", (name) => {
    socket.username = name
    socket.isLogging = isLoggingUser(name)
  })

  socket.on("answer", () => {
    const name = socket.username
    if (!name) return
    const index = pushedUsers.indexOf(name)
    if (index !== -1) {
      pushedUsers.splice(index, 1)
      delete tempTapPoints[name]
      socket.emit("reset")
    } else {
      pushedUsers.push(name)
      const position = pushedUsers.length
      tempTapPoints[name] = position <= 3 ? 2 : 1

      if (name !== "Ad" && position <= 3) {
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
      delete tempTapPoints[name]
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
    const dateStr = name.slice(2, 6)

    if (which === "seikai") {
      const topUser = pushedUsers[0]
      if (topUser) {
        scores[topUser] = (scores[topUser] || 0) + 10
      }

      pushedUsers.forEach(name => {
        if (tempTapPoints[name]) {
          scores[name] = (scores[name] || 0) + tempTapPoints[name]
        }
      })

      pushedUsers.length = 0
      Object.keys(answers).forEach(k => delete answers[k])
      Object.keys(tempTapPoints).forEach(k => delete tempTapPoints[k])

      if (socket.isLogging) {
        saveRanking(dateStr)
      }

      io.emit("updateList", pushedUsers)
      io.emit("play", "seikai")
      io.emit("reset")
      io.emit("judgeUpdate", { maru: 0, batsu: 0 })
      scheduleReset()
    }

    if (which === "boo") {
      if (pushedUsers.length > 0) pushedUsers.shift()

      if (socket.isLogging) {
        saveRanking(dateStr)
      }

      io.emit("updateList", pushedUsers)
      io.emit("play", "boo")
    }

    if (which === "resetSilent") {
      pushedUsers.length = 0
      Object.keys(answers).forEach(k => delete answers[k])
      Object.keys(tempTapPoints).forEach(k => delete tempTapPoints[k])

      if (socket.isLogging) {
        saveRanking(dateStr)
      }

      io.emit("updateList", pushedUsers)
      io.emit("reset")
      io.emit("judgeUpdate", { maru: 0, batsu: 0 })
      scheduleReset()
    }
  })

  socket.on("rankingRequest", (isPublic) => {
    const name = socket.username
    const dateStr = name.slice(2, 6)
    const fileName = `ranking_${dateStr}.json`
    console.log(`[Ranking] 受信: ${socket.username}, 公開 = ${isPublic}`)

    if (isLoggingUser(name) && fs.existsSync(fileName)) {
      const data = fs.readFileSync(fileName, "utf-8")
      const json = JSON.parse(data)

      if (isPublic) {
        io.emit("rankingData", { list: json, isPublic: true })
      } else {
        socket.emit("rankingData", { list: json, isPublic: false })
      }
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
