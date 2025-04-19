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

io.on("connection", (socket) => {
  console.log("✅ 接続:", socket.id)

  socket.on("username", (name) => {
    socket.username = name
  })

  socket.on("answer", () => {
    const name = socket.username
    if (!name || pushedUsers.includes(name)) return

    pushedUsers.push(name)

    // Ad以外 & 5人まで → 音を鳴らす
    if (name !== "Ad" && pushedUsers.length <= 5) {
      io.emit("play", "button")
    }

    io.emit("updateList", pushedUsers)
  })

  socket.on("sound", (which) => {
    const name = socket.username

    if (which === "seikai") {
      pushedUsers.length = 0
      io.emit("updateList", pushedUsers)
      io.emit("play", "seikai")
      io.emit("reset") // ← クライアント側に押下フラグのリセットを指示
    }
    
    if (which === "boo") {
      // booはリスト更新なし、音だけ
      io.emit("play", "boo")
    }

    if (which === "button") {
      io.emit("play", "button")
    }
  })

  socket.on("disconnect", () => {
    console.log("❌ 切断:", socket.id)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log("🚀 サーバー起動中 ポート:", PORT)
})

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
