# Quick Start Guide for APT (AI-Powered Paint Together)

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies (1 minute)
```bash
# Clone the repository (if not already done)
git clone https://github.com/JunjieYu28/APT.git
cd APT

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Start the Application (30 seconds)
```bash
# Open Terminal 1 - Start Backend
cd server
npm start
# Server will run on http://localhost:3001

# Open Terminal 2 - Start Frontend
cd client
npm run dev
# Client will run on http://localhost:5173
```

### Step 3: Start Drawing! (Immediately)
1. Open your browser to http://localhost:5173
2. Start drawing with the brush tool!
3. Open another browser tab/window to see real-time collaboration

## 🎨 Basic Usage

### Drawing
- **Select Tool**: Click on Brush, Eraser, Line, or Shapes in the left toolbar
- **Choose Color**: Use the color picker or click preset colors
- **Adjust Size**: Drag the brush size slider (1-50px)
- **Draw**: Click and drag on the white canvas

### Collaboration
- **Multiple Users**: Open multiple browser tabs/windows
- **See Others**: Watch other users' cursors (colored dots) in real-time
- **User List**: Check the "Online Users" section in the left toolbar

### Advanced Features
- **Undo/Redo**: Click ↶ Undo or ↷ Redo buttons
- **Zoom**: Scroll mouse wheel or use zoom buttons
- **Pan**: Hold Ctrl and drag to move around
- **Clear**: Click "🗑️ Clear Canvas" to start over
- **Export**: Click "💾 Export PNG" or "💾 Export JPG"

### AI Features
1. Click the **🤖 AI Assistant** panel on the right side
2. Type a description like "house", "tree", "star", or "circle"
3. Press Enter or click "✨ Generate Sketch"
4. The AI will draw the shape for you!

## 📋 Common Tasks

### Drawing a House
1. Click AI Assistant (🤖) on the right
2. Type "house"
3. Press Enter
4. AI draws a basic house structure!

### Collaborating with Friends
1. Share http://localhost:5173 with your local network friends
2. They can draw together in real-time
3. See each other's cursors and drawings instantly

### Creating Precise Shapes
1. Select Rectangle or Circle tool from toolbar
2. Click and drag on canvas
3. Release to create the shape
4. Use the filled versions for solid shapes

## 🔧 Optional: Enable Full AI Features

1. Get an OpenAI API key from https://platform.openai.com/
2. Create `.env` file in the `server` directory:
   ```bash
   cd server
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```
3. Restart the server
4. Full AI capabilities are now enabled!

## ❓ Troubleshooting

**Port already in use?**
- Backend: Edit `server/.env` and change `PORT=3001` to another port
- Frontend: Vite will automatically suggest another port

**Can't connect?**
- Make sure both backend and frontend are running
- Check that backend is on port 3001
- Refresh the browser page

**Drawing not syncing?**
- Check browser console for errors
- Verify backend is running (check Terminal 1)
- Look for connection status in the top-right of the app

## 🎯 What to Try

✅ Draw something
✅ Open multiple tabs and draw together
✅ Try all the shape tools
✅ Use undo/redo
✅ Zoom in and out
✅ Generate an AI sketch (type "star" in AI panel)
✅ Export your artwork
✅ Change colors and brush sizes

## 📚 More Information

- See `README.md` for detailed documentation
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Visit the GitHub repository for updates

---

**Enjoy drawing together! 🎨✨**
