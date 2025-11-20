# Authentication & Workspace Setup Guide

This guide explains how to set up and use the new authentication and workspace features in APT.

## New Features

### 1. User Authentication
- **Email/Password Registration**: Users can create accounts with email and password
- **Email/Password Login**: Secure login with JWT tokens
- **Google OAuth**: One-click login with Google accounts
- **Profile Management**: Update nickname and upload avatar

### 2. Workspace System
- **Personal Workspace**: Each user has their own workspace showing all their canvases
- **Canvas Management**: Create, view, and delete canvases
- **Canvas Themes**: Choose from 6 different themes (default, light, dark, colorful, minimal, vintage)
- **Canvas Naming**: Give meaningful names to your canvases

### 3. Canvas Rooms
- **Isolated Canvases**: Each canvas is a separate room with its own drawing history
- **Multi-user Collaboration**: Multiple users can work on the same canvas simultaneously
- **User Presence**: See who else is in the canvas with you

## Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- MongoDB (v4.4 or higher) - Required for production

## Installation

### 1. Install Dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB (Recommended for Development)

1. Install MongoDB:
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: Follow [MongoDB Ubuntu installation guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

2. Start MongoDB:
   ```bash
   # macOS/Linux
   sudo systemctl start mongod
   # or
   mongod --dbpath=/path/to/data
   
   # Windows
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

3. Verify MongoDB is running:
   ```bash
   mongosh
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/apt`)
4. Add your IP address to the whitelist in Atlas

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/apt
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apt

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI Integration (Optional)
# OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth (Optional - see Google OAuth Setup below)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Google OAuth Setup (Optional)

To enable Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production domain (for production)
7. Copy the Client ID and add it to:
   - Server `.env` file as `GOOGLE_CLIENT_ID`
   - Client environment (see below)

Create `client/.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:3001
```

## Running the Application

### 1. Start MongoDB (if using local)
```bash
# Make sure MongoDB is running
mongod
```

### 2. Start the Backend Server
```bash
cd server
npm start
```

The server will run on `http://localhost:3001`

### 3. Start the Frontend Development Server
```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Using the Application

### First Time User

1. **Register**: Click "Sign Up" on the login page
   - Enter your email, password, and nickname
   - Or use "Sign in with Google"
2. **Profile Setup**: After registration, you can:
   - Update your nickname
   - Upload an avatar
3. **Create Canvas**: In your workspace
   - Click "New Canvas"
   - Give it a name
   - Choose a theme
4. **Start Drawing**: Click on any canvas to open it

### Returning User

1. **Login**: Enter your email and password, or use Google
2. **Workspace**: View all your canvases
3. **Open Canvas**: Click any canvas to continue drawing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/avatar` - Upload avatar

### Canvas Management
- `GET /api/canvas` - Get all canvases for current user
- `GET /api/canvas/:id` - Get specific canvas
- `POST /api/canvas` - Create new canvas
- `PUT /api/canvas/:id` - Update canvas
- `DELETE /api/canvas/:id` - Delete canvas

## Troubleshooting

### MongoDB Connection Issues

**Error**: "MongoDB connection error"
- **Solution**: Ensure MongoDB is running
- Check the connection string in `.env`
- For Atlas, verify IP whitelist and credentials

### Google OAuth Not Working

**Error**: "Google login failed"
- **Solution**: 
  - Verify Client ID in both server and client
  - Check authorized redirect URIs in Google Console
  - Ensure the domain matches exactly

### Port Already in Use

**Error**: "Port 3001 already in use"
- **Solution**: 
  ```bash
  # Find the process using the port
  lsof -i :3001
  # Kill it
  kill -9 <PID>
  # Or change PORT in .env
  ```

### Token Expired

**Error**: "Invalid or expired token"
- **Solution**: Logout and login again
- Tokens expire after 7 days

## Development Tips

1. **Auto-reload**: Both servers support hot reload during development
2. **Debugging**: Check browser console and server logs for errors
3. **Database Inspection**: Use MongoDB Compass or `mongosh` to inspect data
4. **Testing APIs**: Use Postman or curl to test API endpoints

## Production Deployment

### Environment Variables
Set these in your production environment:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong random secret (use `openssl rand -hex 32`)
- `PORT` - Server port (default: 3001)
- `GOOGLE_CLIENT_ID` - Production Google Client ID (if using)

### Build Frontend
```bash
cd client
npm run build
```

Serve the `dist` folder with a static file server or configure your backend to serve it.

### Security Checklist
- [ ] Use strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Enable Helmet.js for security headers
- [ ] Regular security updates

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and logs

## License

ISC License - See LICENSE file for details
