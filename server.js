const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http, {
  cors: { origin: "*", methods: ["GET","POST"] }
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
  }, 5 * 60 * 1000)
}

io.on("connection", socket => {
  socket.on("username", name => {
    socket.username = name
  })

  socket.on("answer", () => {
    const name = socket.username
    if (!name) return

    const idx = pushedUsers.indexOf(name)
    if (idx !== -1) {
      pushedUsers.splice(idx, 1)
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

  socket.on("sound", which => {
    if (which === "seikai") {
      pushedUsers.length = 0
      io.emit("updateList", pushedUsers)
      io.emit("play", "seikai")
      io.emit("reset")
      scheduleReset()
    }
    if (which === "boo") {
      if (pushedUsers.length) pushedUsers.shift()
      io.emit("updateList", pushedUsers)
      io.emit("play", "boo")
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
    socket.emit("reset")
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
