const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    game: "Campus Combat",
    status: "Running",
    players: 0,
  });
});

app.get("/players", (req, res) => {
  res.json({
    totalPlayers: Object.keys(players).length,
    players,
  });
});

// Create HTTP Server
const server = http.createServer(app);

// Create Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Listen for new players

const players = {};
io.on("connection", (socket) => {
  console.log("Player Connected:", socket.id);

  players[socket.id] = {
  id: socket.id,
  x: 8,
  y: 0.5,
  z: 8,
  health: 100,
};

console.log(players);
io.emit("players-update", { ...players });
socket.on("player-move", (position) => {

  if (!players[socket.id]) return;

  players[socket.id] = {
    ...players[socket.id],
    x: position.x,
    y: position.y,
    z: position.z,
  };

  io.emit("players-update", { ...players });

});

  socket.on("disconnect", () => {
  delete players[socket.id];


console.log("Player Disconnected:", socket.id);
console.log(players);

io.emit("players-update", players);
});
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});