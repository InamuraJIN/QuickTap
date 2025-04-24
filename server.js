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
let resetTimer = null

function scheduleReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    pushedUsers.length = 0
    io.emit("updateList", pushedUsers)
    io.emit("reset")
    console.log("⏱️ 自動リセット実行")
  }, 5 * 60 * 1000)
}

io.on("connection", (socket) => {
  console.log("✅ 接続:", socket.id)

  socket.on("username", (name) => {
    socket.username = name
  })

  socket.on("answer", () => {
    const name = socket.username
    if (!name || pushedUsers.includes(name)) return

    pushedUsers.push(name)

    if (name !== "Ad" && pushedUsers.indexOf(name) < 3) {
      io.emit("play", "button")
    }

    io.emit("updateList", pushedUsers)
    scheduleReset()
  })

  socket.on("untap", (name) => {
    const index = pushedUsers.indexOf(name)
    if (index !== -1) {
      pushedUsers.splice(index, 1)
      io.emit("updateList", pushedUsers)
    }
  })

  socket.on("sound", (which) => {
    const name = socket.username

    if (which === "seikai") {
      pushedUsers.length = 0
      io.emit("updateList", pushedUsers)
      io.emit("play", "seikai")
      io.emit("reset")
      scheduleReset()
    }

    if (which === "boo") {
      if (pushedUsers.length > 0) {
        pushedUsers.shift()
        io.emit("updateList", pushedUsers)
      }
      io.emit("play", "boo")
    }

    if (which === "button") {
      io.emit("play", "button")
    }

    if (which === "resetSilent") {
      pushedUsers.length = 0
      io.emit("updateList", pushedUsers)
      io.emit("reset")
      scheduleReset()
    }
  })

  socket.on("syncRequest", () => {
    socket.emit("updateList", pushedUsers)
    if (!pushedUsers.includes(socket.username)) {
      socket.emit("reset")
    }
  })

  socket.on("disconnect", () => {
    console.log("❌ 切断:", socket.id)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log("🚀 サーバー起動中：http://localhost:" + PORT)
})
