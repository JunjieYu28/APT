import { useRef, useEffect, useState } from 'react';
import './Canvas.css';

const Canvas = ({ socket, userId }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [users, setUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight - 100;
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Handle socket events
    if (socket) {
      // Initialize with drawing history and users
      socket.on('init', (data) => {
        setUsers(data.users);
        // Redraw history
        data.history.forEach(drawData => {
          drawLine(ctx, drawData, false);
        });
      });

      // Handle new user joined
      socket.on('user-joined', (user) => {
        setUsers(prev => [...prev, user]);
      });

      // Handle user left
      socket.on('user-left', (userId) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setRemoteCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[userId];
          return newCursors;
        });
      });

      // Handle remote drawing
      socket.on('draw', (data) => {
        drawLine(ctx, data, false);
      });

      // Handle cursor movement
      socket.on('cursor-move', (data) => {
        setRemoteCursors(prev => ({
          ...prev,
          [data.userId]: { x: data.x, y: data.y }
        }));
      });

      // Handle clear canvas
      socket.on('clear-canvas', () => {
        clearCanvas();
      });
    }

    return () => {
      if (socket) {
        socket.off('init');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('draw');
        socket.off('cursor-move');
        socket.off('clear-canvas');
      }
    };
  }, [socket]);

  const drawLine = (ctx, data, emit = true) => {
    const { x0, y0, x1, y1, color, size, tool } = data;
    
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    
    ctx.stroke();
    ctx.closePath();

    if (emit && socket) {
      socket.emit('draw', data);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Store the starting position
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const drawData = {
      x0: canvas.lastX,
      y0: canvas.lastY,
      x1: x,
      y1: y,
      color: currentColor,
      size: brushSize,
      tool: currentTool
    };

    drawLine(ctx, drawData, true);
    
    canvas.lastX = x;
    canvas.lastY = y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (socket) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      socket.emit('cursor-move', { x, y });
    }
    draw(e);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClearCanvas = () => {
    clearCanvas();
    if (socket) {
      socket.emit('clear-canvas');
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="canvas-container">
      <div className="toolbar">
        <div className="tool-section">
          <h3>Tools</h3>
          <button 
            className={currentTool === 'brush' ? 'active' : ''}
            onClick={() => setCurrentTool('brush')}
          >
            🖌️ Brush
          </button>
          <button 
            className={currentTool === 'eraser' ? 'active' : ''}
            onClick={() => setCurrentTool('eraser')}
          >
            🧹 Eraser
          </button>
        </div>

        <div className="tool-section">
          <h3>Color</h3>
          <input 
            type="color" 
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            disabled={currentTool === 'eraser'}
          />
          <div className="color-presets">
            {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map(color => (
              <button
                key={color}
                className="color-preset"
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
                disabled={currentTool === 'eraser'}
              />
            ))}
          </div>
        </div>

        <div className="tool-section">
          <h3>Brush Size: {brushSize}px</h3>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </div>

        <div className="tool-section">
          <h3>Actions</h3>
          <button onClick={handleClearCanvas}>🗑️ Clear Canvas</button>
          <button onClick={handleExport}>💾 Export PNG</button>
        </div>

        <div className="tool-section">
          <h3>Online Users ({users.length})</h3>
          <div className="users-list">
            {users.map(user => (
              <div 
                key={user.id} 
                className="user-item"
                style={{ borderLeft: `3px solid ${user.color}` }}
              >
                <span>{user.username}</span>
                {user.id === userId && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="drawing-canvas"
        />
        {Object.entries(remoteCursors).map(([userId, pos]) => {
          const user = users.find(u => u.id === userId);
          return (
            <div
              key={userId}
              className="remote-cursor"
              style={{
                left: pos.x,
                top: pos.y,
                backgroundColor: user?.color || '#000'
              }}
            >
              {user?.username}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;
