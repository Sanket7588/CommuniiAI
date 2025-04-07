const fs = require("fs");
const https = require("https");
const express = require("express");
const { PeerServer } = require("peer");
const socketIo = require("socket.io");
const { createPieChart } = require('./chartGenerator');   //to generate an chart


const PORT = 5010;
const app = express();

// 🔹 Load SSL certificate & key
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

// 🔹 Create HTTPS server
const server = https.createServer(options, app);
const io = socketIo(server);

// Serve static files (frontend)
app.use(express.static("public"));

// 🔹 Start PeerJS server on HTTPS
const peerServer = PeerServer({ port: 9000, path: "/", ssl: options });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, peerId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", peerId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



// 🔹 Start the HTTPS server
server.listen(5010, () => {
  console.log("🚀 HTTPS server running at https://<your-local-ip>:5010");
});



createPieChart().then(() => {
  // Route: Home
  app.get('/', (req, res) => {
      res.send(`<h1>Welcome to Pie Chart Server</h1>
                <p>View the chart here: <a href="/chart">/chart</a></p>`);
  });

  // Route: Show the chart image
  app.get('/chart', (req, res) => {
      res.send(`
          <h2>Pie Chart</h2>
          <img src="/static/pie-chart.png" alt="Pie Chart" style="max-width: 100%; height: auto;">
      `);
  });

  // Start server
  app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});