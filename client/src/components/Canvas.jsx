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
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [shapeStart, setShapeStart] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight - 100;
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Save initial state for undo/redo
    saveState();

    // Handle socket events
    if (socket) {
      // Initialize with drawing history and users
      socket.on('init', (data) => {
        setUsers(data.users);
        // Redraw history
        data.history.forEach(drawData => {
          if (['rectangle', 'rectangle-filled', 'circle', 'circle-filled', 'line'].includes(drawData.tool)) {
            drawShape(ctx, drawData, false);
          } else {
            drawLine(ctx, drawData, false);
          }
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
        if (['rectangle', 'rectangle-filled', 'circle', 'circle-filled', 'line'].includes(data.tool)) {
          drawShape(ctx, data, false);
        } else {
          drawLine(ctx, data, false);
        }
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

  // Save canvas state for undo/redo
  const saveState = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataURL);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo action
  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreState(history[newStep]);
    }
  };

  // Redo action
  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreState(history[newStep]);
    }
  };

  // Restore canvas state
  const restoreState = (dataURL) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // Draw shape (rectangle, circle, line)
  const drawShape = (ctx, data, emit = true) => {
    const { x0, y0, x1, y1, color, size, tool } = data;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.fillStyle = color;

    switch (tool) {
      case 'rectangle':
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        break;
      case 'rectangle-filled':
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        ctx.beginPath();
        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'circle-filled':
        const radiusFilled = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        ctx.beginPath();
        ctx.arc(x0, y0, radiusFilled, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        break;
      default:
        break;
    }

    if (emit && socket) {
      socket.emit('draw', data);
    }
  };

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
    if (e.button === 1 || (e.ctrlKey || e.metaKey) && currentTool !== 'pan') {
      // Middle mouse button or Ctrl+click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;
    
    // Store the starting position
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
    setShapeStart({ x, y });
  };

  const draw = (e) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    // For shape tools, just update preview
    if (['rectangle', 'rectangle-filled', 'circle', 'circle-filled', 'line'].includes(currentTool)) {
      return; // Shape will be drawn on mouse up
    }

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

  const stopDrawing = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;

    // Handle shape tools
    if (['rectangle', 'rectangle-filled', 'circle', 'circle-filled', 'line'].includes(currentTool) && shapeStart) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      const shapeData = {
        x0: shapeStart.x,
        y0: shapeStart.y,
        x1: x,
        y1: y,
        color: currentColor,
        size: brushSize,
        tool: currentTool
      };

      drawShape(ctx, shapeData, true);
      saveState();
      setShapeStart(null);
    } else if (currentTool === 'brush' || currentTool === 'eraser') {
      saveState();
    }

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
    saveState();
    if (socket) {
      socket.emit('clear-canvas');
    }
  };

  const handleExport = (format = 'png') => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL(`image/${format}`);
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.${format}`;
    link.href = dataURL;
    link.click();
  };

  const handleZoom = (delta) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.max(0.1, Math.min(5, newScale)); // Limit zoom between 0.1x and 5x
    });
  };

  const handleResetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
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
          <button 
            className={currentTool === 'line' ? 'active' : ''}
            onClick={() => setCurrentTool('line')}
          >
            📏 Line
          </button>
          <button 
            className={currentTool === 'rectangle' ? 'active' : ''}
            onClick={() => setCurrentTool('rectangle')}
          >
            ▢ Rectangle
          </button>
          <button 
            className={currentTool === 'rectangle-filled' ? 'active' : ''}
            onClick={() => setCurrentTool('rectangle-filled')}
          >
            ◼ Filled Rectangle
          </button>
          <button 
            className={currentTool === 'circle' ? 'active' : ''}
            onClick={() => setCurrentTool('circle')}
          >
            ○ Circle
          </button>
          <button 
            className={currentTool === 'circle-filled' ? 'active' : ''}
            onClick={() => setCurrentTool('circle-filled')}
          >
            ● Filled Circle
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
          <div className="action-buttons">
            <button onClick={undo} disabled={historyStep <= 0} title="Undo">
              ↶ Undo
            </button>
            <button onClick={redo} disabled={historyStep >= history.length - 1} title="Redo">
              ↷ Redo
            </button>
          </div>
          <button onClick={handleClearCanvas}>🗑️ Clear Canvas</button>
          <button onClick={() => handleExport('png')}>💾 Export PNG</button>
          <button onClick={() => handleExport('jpeg')}>💾 Export JPG</button>
        </div>

        <div className="tool-section">
          <h3>View (Zoom: {Math.round(scale * 100)}%)</h3>
          <div className="action-buttons">
            <button onClick={() => handleZoom(0.1)}>🔍+ Zoom In</button>
            <button onClick={() => handleZoom(-0.1)}>🔍- Zoom Out</button>
          </div>
          <button onClick={handleResetView}>↺ Reset View</button>
          <p className="hint">Scroll wheel to zoom, Ctrl+drag to pan</p>
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

      <div className="canvas-wrapper" onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="drawing-canvas"
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: '0 0',
            cursor: isPanning ? 'grabbing' : (currentTool === 'eraser' ? 'crosshair' : 'crosshair')
          }}
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
