const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const pushedUsers = []

// クライアント側のファイル配信
app.use(express.static(__dirname))
app.use("/assets", express.static(path.join(__dirname, "assets")))

io.on("connection", (socket) => {
  console.log("✅ 接続:", socket.id)

  // ユーザー名受信
  socket.on("username", (name) => {
    socket.username = name
  })

  // 回答ボタン押された
  socket.on("answer", () => {
    if (!socket.username || pushedUsers.includes(socket.username)) return
    pushedUsers.push(socket.username)

    if (pushedUsers.length <= 3) {
      io.emit("play", "button")  // 最初の3人だけ音を鳴らす
    }

    io.emit("updateList", pushedUsers)
  })

  // 任意の音を全体再生（正解・残念・button）
  socket.on("sound", (which) => {
    if (["seikai", "boo", "button"].includes(which)) {
      if (which === "seikai" || which === "boo") {
        pushedUsers.length = 0
        io.emit("updateList", pushedUsers)
      }

      io.emit("play", which)
    }
  })

  socket.on("disconnect", () => {
    console.log("❌ 切断:", socket.id)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log(`🚀 サーバー起動中 http://localhost:${PORT}`)
})
