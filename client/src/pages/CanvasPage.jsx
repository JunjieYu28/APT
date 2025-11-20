import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canvasAPI } from '../utils/api';
import Canvas from '../components/Canvas';
import { useSocket } from '../hooks/useSocket';
import './CanvasPage.css';

function CanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadCanvas();
    }
  }, [id]);

  useEffect(() => {
    if (socket && isConnected && canvas && user) {
      // Join the canvas room
      socket.emit('join-canvas', {
        canvasId: id,
        user: {
          nickname: user.nickname,
          avatar: user.avatar
        }
      });
    }
  }, [socket, isConnected, canvas, user, id]);

  const loadCanvas = async () => {
    try {
      setLoading(true);
      const response = await canvasAPI.getById(id);
      setCanvas(response.data.canvas);
      setError('');
    } catch (err) {
      console.error('Failed to load canvas:', err);
      setError('Canvas not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWorkspace = () => {
    navigate('/workspace');
  };

  if (loading) {
    return (
      <div className="canvas-page-loading">
        <div className="spinner"></div>
        <p>Loading canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="canvas-page-error">
        <h2>⚠️ {error}</h2>
        <button onClick={handleBackToWorkspace} className="back-button">
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <button onClick={handleBackToWorkspace} className="back-button-small">
          ← Back
        </button>
        <h2>{canvas?.name}</h2>
        <div className="canvas-theme-badge">
          {canvas?.theme}
        </div>
      </div>
      {isConnected && socket ? (
        <Canvas socket={socket} userId={user?.id} canvasId={id} canvasTheme={canvas?.theme} />
      ) : (
        <div className="connecting-message">
          <div className="spinner"></div>
          <p>Connecting to server...</p>
        </div>
      )}
    </div>
  );
}

export default CanvasPage;
