import { useState } from 'react';
import Canvas from './components/Canvas';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const { socket, isConnected } = useSocket();
  const [userId, setUserId] = useState(null);

  // Get userId from socket connection
  if (socket && !userId) {
    socket.on('init', (data) => {
      setUserId(data.userId);
    });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 AI-Powered Paint Together</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>
      {isConnected ? (
        <Canvas socket={socket} userId={userId} />
      ) : (
        <div className="connecting-message">
          <div className="spinner"></div>
          <p>Connecting to server...</p>
        </div>
      )}
    </div>
  );
}

export default App;

