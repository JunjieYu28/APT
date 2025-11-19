import { useState } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ onApplySketch, canvasRef }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTextToSketch = async () => {
    if (!prompt.trim()) {
      setMessage('Please enter a description');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/ai/text-to-sketch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      
      if (result.success || result.mockData) {
        const data = result.data || result.mockData;
        setMessage(`✓ Generated sketch for "${prompt}"`);
        
        // Apply the sketch to canvas
        if (onApplySketch && data.shapes) {
          applyShapesToCanvas(data.shapes);
        }
      } else {
        setMessage(`⚠ ${result.message}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyShapesToCanvas = (shapes) => {
    if (!canvasRef || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    shapes.forEach(shape => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = shape.color || '#000000';
      ctx.fillStyle = shape.color || '#000000';
      ctx.lineWidth = shape.lineWidth || 2;

      switch (shape.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'rectangle':
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(shape.x0, shape.y0);
          ctx.lineTo(shape.x1, shape.y1);
          ctx.stroke();
          break;
        default:
          break;
      }
    });

    // Notify parent to save state if callback provided
    if (onApplySketch) {
      onApplySketch();
    }
  };

  const handleAutoComplete = async () => {
    setMessage('Auto-complete feature coming soon with AI model integration');
  };

  const handleOptimize = async () => {
    setMessage('Optimization feature coming soon with AI model integration');
  };

  return (
    <div className={`ai-assistant ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ai-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>🤖 AI Assistant</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '◀'}</span>
      </div>
      
      {isExpanded && (
        <div className="ai-content">
          <div className="ai-section">
            <h4>Text to Sketch</h4>
            <p className="ai-description">
              Describe what you want to draw and AI will create a basic sketch
            </p>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextToSketch()}
              placeholder="e.g., house, tree, star, circle..."
              disabled={loading}
              className="ai-input"
            />
            <button 
              onClick={handleTextToSketch}
              disabled={loading}
              className="ai-button primary"
            >
              {loading ? '⏳ Generating...' : '✨ Generate Sketch'}
            </button>
          </div>

          <div className="ai-section">
            <h4>AI Tools</h4>
            <button 
              onClick={handleAutoComplete}
              className="ai-button"
            >
              🎯 Auto-Complete Drawing
            </button>
            <button 
              onClick={handleOptimize}
              className="ai-button"
            >
              ✨ Optimize Drawing
            </button>
          </div>

          {message && (
            <div className={`ai-message ${message.startsWith('✗') ? 'error' : message.startsWith('⚠') ? 'warning' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="ai-info">
            <p>💡 AI Features Status:</p>
            <ul>
              <li>✅ Text-to-Sketch (Demo with mock data)</li>
              <li>⏳ Auto-Complete (Framework ready)</li>
              <li>⏳ Drawing Optimization (Framework ready)</li>
            </ul>
            <p className="ai-note">
              To enable full AI features, configure your API key in the server environment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
