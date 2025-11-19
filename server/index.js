require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const aiService = require('./aiService');

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

// API endpoint for AI text-to-sketch
app.post('/api/ai/text-to-sketch', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const result = await aiService.textToSketch(prompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for AI auto-complete
app.post('/api/ai/auto-complete', async (req, res) => {
  try {
    const { strokes } = req.body;
    const result = await aiService.autoComplete(strokes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for drawing optimization
app.post('/api/ai/optimize', async (req, res) => {
  try {
    const { drawingData } = req.body;
    const result = await aiService.optimizeDrawing(drawingData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    aiEnabled: aiService.enabled,
    timestamp: Date.now() 
  });
});

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
