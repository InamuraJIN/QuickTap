const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const path = require("path")

// 回答ユーザー管理
const pushedUsers = []
let resetTimer = null

// 静的ファイル配信設定
app.use(express.static(__dirname))
app.use("/assets", express.static(path.join(__dirname, "assets")))
app.use("/css", express.static(path.join(__dirname, "css")))
app.use("/js", express.static(path.join(__dirname, "js")))

io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id)
  
  // 接続時に現在の回答者リストを送信
  socket.emit("updateList", pushedUsers)

  // ユーザー名受信
  socket.on("username", (name) => {
    socket.username = name
    console.log(`ユーザー名設定: ${socket.id} => ${name}`)
  })

  // 回答ボタン押下
  socket.on("answer", () => {
    if (!socket.username || pushedUsers.includes(socket.username)) return
    
    // ユーザーを回答リストに追加
    pushedUsers.push(socket.username)
    console.log(`回答: ${socket.username} (${pushedUsers.length}番目)`)
    
    // 最大3名まで音声再生
    if (pushedUsers.length <= 3) {
      io.emit("play", "button")
    }
    
    // 全員に回答リスト更新を通知
    io.emit("updateList", pushedUsers)
  })

  // 正解／残念ボタン押下（管理者のみ）
  socket.on("sound", (which) => {
    // 管理者チェック
    if (socket.username !== "Ad") {
      console.log(`管理者以外の音声再生要求: ${socket.username}`)
      return
    }
    
    if (which === "seikai" || which === "boo") {
      console.log(`音声再生: ${which}`)
      
      // リストリセット
      pushedUsers.length = 0
      
      // 全員に通知
      io.emit("play", which)
      io.emit("updateList", pushedUsers)
      io.emit("resetButtons")
      
      // 自動リセットタイマーをクリア
      if (resetTimer) {
        clearTimeout(resetTimer)
      }
      
      // 新しいタイマーをセット
      setupAutoReset()
    }
  })

  // 切断時の処理
  socket.on("disconnect", () => {
    console.log("切断:", socket.id, socket.username || "匿名")
  })
})

// 5分後に自動リセットするタイマー設定
function setupAutoReset() {
  // 前のタイマーをクリア
  if (resetTimer) {
    clearTimeout(resetTimer)
  }
  
  // 新しいタイマーを設定（5分 = 300,000ミリ秒）
  resetTimer = setTimeout(() => {
    console.log("自動リセット実行")
    pushedUsers.length = 0
    io.emit("updateList", pushedUsers)
    io.emit("resetButtons")
  }, 300000)
}

// 初期タイマー設定
setupAutoReset()

// サーバー起動
const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log("サーバー起動中 ポート:", PORT)
})