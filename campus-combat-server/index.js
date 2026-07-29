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
// const scores = {};

io.on("connection", (socket) => {
  console.log("Player Connected:", socket.id);



  players[socket.id] = {

    

  id: socket.id,
  x: 8,
  y: 0.5,
  z: 8,
  rotation: 0,
  health: 100,
};

// scores[socket.id] = {
//   kills: 0,
//   deaths: 0,
// };

console.log(players);
io.emit("players-update", { ...players });

socket.on("player-fire", () => {
  console.log("🔥 Player Fired:", socket.id);

  socket.broadcast.emit("player-fired", {
    id: socket.id,
  });
});

socket.on("player-hit", ({ playerId }) => {

  console.log("🎯 Player Hit:", playerId);

  if (!players[playerId]) return;

  // Reduce Health
  players[playerId].health -= 20;

  if (players[playerId].health <= 0) {

    players[playerId].health = 0;

    console.log("💀 Player Dead:", playerId);

//     scores[socket.id].kills++;
// scores[playerId].deaths++;

// io.emit("score-update", scores);

    io.emit("players-update", { ...players });

    // Respawn after 3 seconds
    setTimeout(() => {

      if (!players[playerId]) return;

      players[playerId].health = 100;
      players[playerId].x = 8;
      players[playerId].y = 0.5;
      players[playerId].z = 8;
      players[playerId].rotation = 0;

      console.log("🔄 Player Respawned:", playerId);

      io.emit("players-update", { ...players });

    }, 3000);

    return;
  }

  console.log("❤️ Health:", players[playerId].health);

  io.emit("players-update", { ...players });

});

socket.on("player-move", (position) => {

  if (!players[socket.id]) return;

  players[socket.id] = {
  ...players[socket.id],
  x: position.x,
  y: position.y,
  z: position.z,
  rotation: position.rotation,
};
  io.emit("players-update", { ...players });

});

  socket.on("disconnect", () => {

  // delete scores[socket.id];
  delete players[socket.id];


console.log("Player Disconnected:", socket.id);
console.log(players);

io.emit("players-update", players);
});
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});