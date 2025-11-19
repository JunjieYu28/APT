# APT (AI-Powered Paint Together)

An intelligent collaborative drawing canvas with real-time multi-user painting and AI assistance.

## Features

### Phase 1: Basic Canvas Functionality (MVP) ✅
- ✅ Basic drawing canvas with HTML5 Canvas API
- ✅ Drawing tools:
  - 🖌️ Brush with adjustable size (1-50px)
  - 🧹 Eraser tool
  - 🎨 Color picker with presets
- ✅ Clear canvas functionality
- ✅ Export canvas as PNG

### Phase 2: Real-time Collaboration ✅
- ✅ Socket.io WebSocket integration
- ✅ Multi-user real-time drawing synchronization
- ✅ Online users list with color-coded identities
- ✅ Real-time cursor tracking for all users
- ✅ Drawing history synchronization for new users

### Phase 3: Advanced Features (Planned)
- ⏳ Undo/redo functionality
- ⏳ Additional drawing tools (shapes, text, fill)
- ⏳ Canvas zoom and pan
- ⏳ Additional export formats (JPG)

### Phase 4: AI Integration (Planned)
- ⏳ AI model for drawing auto-completion
- ⏳ Text-to-sketch generation
- ⏳ AI-assisted tool optimization

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Socket.io-client** - WebSocket client for real-time communication
- **HTML5 Canvas API** - Drawing functionality

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - WebSocket server for real-time communication

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm (v10 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JunjieYu28/APT.git
cd APT
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```
The server will run on `http://localhost:3001`

2. In a new terminal, start the frontend development server:
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

4. Open multiple browser windows/tabs to test real-time collaboration!

## Usage

### Drawing Tools
- **Brush**: Click the Brush button to activate drawing mode. Adjust size and color as needed.
- **Eraser**: Click the Eraser button to remove drawn content.
- **Color Picker**: Use the color picker or select from preset colors.
- **Brush Size**: Use the slider to adjust brush size (1-50px).

### Canvas Actions
- **Clear Canvas**: Removes all drawings from the canvas for all users.
- **Export PNG**: Downloads the current canvas as a PNG image.

### Collaboration
- See online users in the right sidebar with their color-coded identities.
- Watch other users' cursors move in real-time.
- All drawing actions are synchronized instantly across all connected users.

## Project Structure

```
APT/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Canvas.jsx
│   │   │   └── Canvas.css
│   │   ├── hooks/       # Custom React hooks
│   │   │   └── useSocket.js
│   │   ├── App.jsx      # Main app component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/              # Node.js backend
    ├── index.js         # Express + Socket.io server
    └── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Roadmap

See the [Development Roadmap](#features) above for planned features and current progress.

