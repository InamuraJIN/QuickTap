const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const path = require("path")

const pushedUsers = []

app.use(express.static(__dirname)) // index.htmlとassetsを配信
app.use("/assets", express.static(path.join(__dirname, "assets")))

io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id)

  // ユーザー名受信
  socket.on("username", (name) => {
    socket.username = name
  })

  // 回答ボタン押下
  socket.on("answer", () => {
    if (!socket.username || pushedUsers.includes(socket.username)) return
    pushedUsers.push(socket.username)
    if (pushedUsers.length <= 3) {
      io.emit("play", "button")
    }
    io.emit("updateList", pushedUsers)
  })

  // 正解／残念ボタン押下
  socket.on("sound", (which) => {
    if (which === "seikai" || which === "boo") {
      pushedUsers.length = 0 // リストリセット
      io.emit("play", which)
      io.emit("updateList", pushedUsers)
    }
  })

  socket.on("disconnect", () => {
    console.log("切断:", socket.id)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log("サーバー起動中 ポート:", PORT)
})
