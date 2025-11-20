# APT (AI-Powered Paint Together)

An intelligent collaborative drawing canvas with real-time multi-user painting and AI assistance.

# Waiting for your Collaboration!

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

### Phase 3: Advanced Features ✅
- ✅ Undo/redo functionality
- ✅ Additional drawing tools (shapes: line, rectangle, circle, filled variants)
- ✅ Canvas zoom and pan
- ✅ Additional export formats (PNG, JPG)

### Phase 4: AI Integration ✅
- ✅ AI framework and service architecture
- ✅ Text-to-sketch generation (demo with mock data)
- ✅ Auto-completion framework (ready for ML model)
- ✅ Drawing optimization framework (ready for ML model)
- ✅ Collapsible AI Assistant UI panel

### Phase 5: Authentication & Workspace System ✅ NEW!
- ✅ User authentication with email/password
- ✅ Google OAuth integration
- ✅ User profile management (nickname, avatar)
- ✅ Personal workspace for each user
- ✅ Multiple canvas support per user
- ✅ Canvas naming and theme selection
- ✅ Canvas rooms with isolated drawing sessions

## Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation and routing
- **Vite** - Build tool and dev server
- **Socket.io-client** - WebSocket client for real-time communication
- **HTML5 Canvas API** - Drawing functionality
- **Axios** - HTTP client
- **@react-oauth/google** - Google OAuth integration

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - WebSocket server for real-time communication
- **MongoDB** - Database for user and canvas data
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **AI Service Module** - Framework for AI integration (OpenAI, Stable Diffusion, etc.)

## Getting Started

> **📘 New User Authentication System!**  
> This app now requires user authentication. See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js (v20 or higher)
- npm (v10 or higher)
- **MongoDB (v4.4 or higher)** - Required for user authentication
- (Optional) OpenAI API key for full AI features
- (Optional) Google OAuth credentials for Google login

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

> **⚠️ Important:** You must set up MongoDB before running the application. See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed instructions.

**Quick Start:**

1. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Get connection string from https://www.mongodb.com/cloud/atlas
   ```

2. **Configure Environment:**
   
   Create `server/.env`:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```
   
   Required settings:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens (change in production!)
   
   Optional settings:
   - `OPENAI_API_KEY` - For full AI features
   - `GOOGLE_CLIENT_ID` - For Google OAuth login

3. **Start the Backend Server:**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:3001`

4. **Start the Frontend Development Server (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

5. **Access the Application:**
   
   Open your browser and navigate to `http://localhost:5173`
   
   - First time: Click "Sign Up" to create an account
   - Returning user: Sign in with your credentials or Google
   - Create your first canvas in your workspace!

### Using the Application

#### Authentication
- **Register**: Create account with email/password or Google
- **Login**: Sign in to access your workspace
- **Profile**: Update nickname and avatar from workspace header

#### Workspace
- **Create Canvas**: Click "New Canvas" button
- **Name Canvas**: Give it a meaningful name
- **Choose Theme**: Select from 6 themes (default, light, dark, colorful, minimal, vintage)
- **Open Canvas**: Click any canvas card to start drawing
- **Delete Canvas**: Hover over canvas and click × button

#### Drawing Tools
- **Brush**: Click the Brush button to activate drawing mode. Adjust size and color as needed.
- **Eraser**: Click the Eraser button to remove drawn content.
- **Shapes**: Line, Rectangle, Circle (outline and filled variants)
- **Color Picker**: Use the color picker or select from preset colors.
- **Brush Size**: Use the slider to adjust brush size (1-50px).

#### Canvas Actions
- **Clear Canvas**: Removes all drawings from the canvas for all users in the room.
- **Export PNG/JPG**: Downloads the current canvas as an image.
- **Undo/Redo**: Navigate through your drawing history.
- **Zoom/Pan**: Zoom in/out with mouse wheel or buttons, pan with Ctrl+drag.

#### Collaboration
- See online users in the right sidebar with their color-coded identities and avatars.
- Watch other users' cursors move in real-time.
- All drawing actions are synchronized instantly across all connected users in the same canvas.
- Each canvas is a separate room - only users viewing that canvas see each other.

#### AI Assistant
- **Text-to-Sketch**: Describe what you want (e.g., "house", "tree", "star") and AI generates a basic sketch.
- **Auto-Complete**: (Framework ready) AI predicts and completes your drawing strokes.
- **Optimize Drawing**: (Framework ready) AI suggests improvements for your artwork.
- Toggle the AI panel using the 🤖 button on the right side.

## Usage
```
npm run dev
```
The client will run on `http://localhost:5173`

4. Open your browser and navigate to `http://localhost:5173`

5. Open multiple browser windows/tabs to test real-time collaboration!

## Usage

For detailed usage instructions, see the **Using the Application** section above.

## Project Structure

```
APT/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Canvas.jsx
│   │   │   ├── Canvas.css
│   │   │   ├── AIAssistant.jsx
│   │   │   └── AIAssistant.css
│   │   ├── contexts/    # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── pages/       # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Workspace.jsx
│   │   │   └── CanvasPage.jsx
│   │   ├── utils/       # Utility functions
│   │   │   └── api.js
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
    ├── models/          # MongoDB models
    │   ├── User.js
    │   └── Canvas.js
    ├── routes/          # API routes
    │   ├── auth.js
    │   └── canvas.js
    ├── middleware/      # Express middleware
    │   └── auth.js
    ├── index.js         # Express + Socket.io server
    ├── aiService.js     # AI service module
    ├── package.json
    └── .env.example     # Environment variables template
```

## Environment Variables

See [AUTH_SETUP.md](./AUTH_SETUP.md) for complete environment variable setup guide.

Quick reference - Create a `.env` file in the `server` directory:

```env
# Required for authentication
MONGODB_URI=mongodb://localhost:27017/apt
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Optional: AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Server Port (default: 3001)
PORT=3001
```

**Note**: AI features work with demo data when API keys are not configured.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Need To Be Done Further

1. ~~**User login nickname and avatar selection**~~ ✅ **COMPLETED!**
2. **Visualization of tools such as the eraser**
3. ~~**Each user can create their own canvas**~~ ✅ **COMPLETED!** (with naming and theme setting)
   - **Future**: Canvas sharing to public square
4. **Currently, I haven’t found a suitable text-to-sketch AI, sketch auto-completion AI, or theme-based drawing AI.** I may need to train one myself, and I’m currently considering **Sketch-RNN**
5. **I would love to fine-tune a drawing AI myself**, but it depends on time
6. **Looking forward to collaborators** — if you have ideas in this domain, want to build this project together, or have relevant AI models, feel free to contact me!

1. ~~用户登录昵称以及头像的选择~~ ✅ **已完成！**
1.用户登录昵称以及头像的选择  
3. ~~每个用户可以创建自己的画布（命名，定主题）~~ ✅ **已完成！**
   - **未来**: 可以分享画布至广场等
3.每个用户可以创建自己的画布（命名，定主题），可以分享画布至广场等  
4.目前没有看到很合适的文生画的AI，或者自动补全绘画的AI,以及通过主题画主题内容的AI,可能需要自己训练，现在在考虑的是Sketch-RNN  
5.当然很想自己微调一个绘画的AI，但得看时间了  
6.期待合作者，如果你有这方面的想法或者想一起来完成这个项目，或者你有相关的AI，欢迎联系！  

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Roadmap

See the [Development Roadmap](#features) above for planned features and current progress.

