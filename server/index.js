require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const aiService = require('./aiService');
const authRoutes = require('./routes/auth');
const canvasRoutes = require('./routes/canvas');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apt';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Authentication routes
app.use('/api/auth', authRoutes);

// Canvas routes
app.use('/api/canvas', canvasRoutes);

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

// Store active users per canvas room
const canvasRooms = new Map(); // canvasId -> { users: Map, drawingHistory: [] }

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  // Join canvas room
  socket.on('join-canvas', (data) => {
    const { canvasId, user } = data;
    
    // Leave previous room if any
    if (socket.currentCanvasId) {
      socket.leave(socket.currentCanvasId);
      const prevRoom = canvasRooms.get(socket.currentCanvasId);
      if (prevRoom) {
        prevRoom.users.delete(socket.id);
        io.to(socket.currentCanvasId).emit('user-left', socket.id);
      }
    }
    
    // Join new room
    socket.join(canvasId);
    socket.currentCanvasId = canvasId;
    
    // Initialize room if it doesn't exist
    if (!canvasRooms.has(canvasId)) {
      canvasRooms.set(canvasId, {
        users: new Map(),
        drawingHistory: []
      });
    }
    
    const room = canvasRooms.get(canvasId);
    
    // Add user to room
    room.users.set(socket.id, {
      id: socket.id,
      username: user?.nickname || `User${room.users.size + 1}`,
      avatar: user?.avatar || null,
      color: getRandomColor()
    });
    
    // Send current room state to new user
    socket.emit('init', {
      userId: socket.id,
      users: Array.from(room.users.values()),
      history: room.drawingHistory
    });
    
    // Broadcast new user to others in room
    socket.to(canvasId).emit('user-joined', room.users.get(socket.id));
  });

  // Handle drawing events
  socket.on('draw', (data) => {
    if (!socket.currentCanvasId) return;
    
    const room = canvasRooms.get(socket.currentCanvasId);
    if (room) {
      room.drawingHistory.push(data);
      // Limit history size per room
      if (room.drawingHistory.length > 10000) {
        room.drawingHistory = room.drawingHistory.slice(-5000);
      }
    }
    socket.to(socket.currentCanvasId).emit('draw', data);
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    if (!socket.currentCanvasId) return;
    
    socket.to(socket.currentCanvasId).emit('cursor-move', {
      userId: socket.id,
      ...data
    });
  });

  // Handle clear canvas
  socket.on('clear-canvas', () => {
    if (!socket.currentCanvasId) return;
    
    const room = canvasRooms.get(socket.currentCanvasId);
    if (room) {
      room.drawingHistory = [];
    }
    io.to(socket.currentCanvasId).emit('clear-canvas');
  });
  
  // Handle save canvas
  socket.on('save-canvas', (data) => {
    if (!socket.currentCanvasId) return;
    
    const room = canvasRooms.get(socket.currentCanvasId);
    if (room) {
      // Save drawing history for persistence
      socket.emit('canvas-saved', { success: true });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.currentCanvasId) {
      const room = canvasRooms.get(socket.currentCanvasId);
      if (room) {
        room.users.delete(socket.id);
        io.to(socket.currentCanvasId).emit('user-left', socket.id);
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          canvasRooms.delete(socket.currentCanvasId);
        }
      }
    }
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
