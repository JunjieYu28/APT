const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active users
const users = new Map();
let drawingHistory = [];

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  // Add user to active users list
  users.set(socket.id, {
    id: socket.id,
    username: `User${users.size + 1}`,
    color: getRandomColor()
  });

  // Send current users list and drawing history to new user
  socket.emit('init', {
    userId: socket.id,
    users: Array.from(users.values()),
    history: drawingHistory
  });

  // Broadcast new user to all other users
  socket.broadcast.emit('user-joined', users.get(socket.id));

  // Handle drawing events
  socket.on('draw', (data) => {
    drawingHistory.push(data);
    // Limit history size
    if (drawingHistory.length > 10000) {
      drawingHistory = drawingHistory.slice(-5000);
    }
    socket.broadcast.emit('draw', data);
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    socket.broadcast.emit('cursor-move', {
      userId: socket.id,
      ...data
    });
  });

  // Handle clear canvas
  socket.on('clear-canvas', () => {
    drawingHistory = [];
    io.emit('clear-canvas');
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
    io.emit('user-left', socket.id);
  });
});

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
