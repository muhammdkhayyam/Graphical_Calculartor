import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, HelpCircle } from 'lucide-react';
import { evaluate } from '../utils/mathParser';
import './GraphingCalculator.css';

const COLORS = [
  '#6366f1', // Violet
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#d946ef'  // Fuchsia
];

export default function GraphingCalculator() {
  const [equations, setEquations] = useState([
    { id: '1', equation: 'x^2', color: COLORS[0], error: null },
    { id: '2', equation: 'sin(x)', color: COLORS[1], error: null }
  ]);

  // Canvas zoom/pan states (math space)
  const [scale, setScale] = useState(40); // Pixels per math unit
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);

  // Mouse hover coordinate display state
  const [coords, setCoords] = useState({ x: 0, y: 0, show: false });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, centerStartX: 0, centerStartY: 0 });

  // Handle equation input modifications with syntax validation
  const handleEquationChange = (id, newExpr) => {
    let error = null;
    const cleanExpr = newExpr.trim();
    
    try {
      if (cleanExpr !== '') {
        // Validate expression by testing evaluation with variable x
        evaluate(cleanExpr.replace(/π/g, 'pi'), { x: 1 }, true);
      }
    } catch (err) {
      error = err.message || 'Syntax error';
    }

    setEquations((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, equation: newExpr, error } : eq))
    );
  };

  const handleColorChange = (id, color) => {
    setEquations((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, color } : eq))
    );
  };

  const addEquation = () => {
    const id = Date.now().toString();
    const nextColor = COLORS[equations.length % COLORS.length];
    setEquations((prev) => [...prev, { id, equation: '', color: nextColor, error: null }]);
  };

  const removeEquation = (id) => {
    if (equations.length === 1) {
      // Keep at least one equation row
      setEquations([{ id: Date.now().toString(), equation: '', color: COLORS[0], error: null }]);
    } else {
      setEquations((prev) => prev.filter((eq) => eq.id !== id));
    }
  };

  const handleZoom = (factor) => {
    setScale((prev) => Math.max(5, Math.min(500, prev * factor)));
  };

  const handleReset = () => {
    setScale(40);
    setCenterX(0);
    setCenterY(0);
  };

  // Canvas resize and render orchestration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect browser theme (dark vs light)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawGraph();
    };

    const drawGraph = () => {
      const { width, height } = canvas;
      
      // Clear background
      ctx.fillStyle = isDark ? '#0f111a' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Compute grid step size dynamically based on scale
      // Grid lines should be roughly 50 to 120 pixels apart
      const approxStep = (width / scale) / 8;
      const magnitude = Math.pow(10, Math.floor(Math.log10(approxStep)));
      const ratio = approxStep / magnitude;
      let gridStep;
      if (ratio < 1.5) gridStep = 1 * magnitude;
      else if (ratio < 3.5) gridStep = 2 * magnitude;
      else if (ratio < 7.5) gridStep = 5 * magnitude;
      else gridStep = 10 * magnitude;

      // Draw Grid
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
      ctx.font = '10px monospace';

      const xMin = (0 - width / 2) / scale + centerX;
      const xMax = (width - width / 2) / scale + centerX;
      const yMin = -(height - height / 2) / scale + centerY;
      const yMax = -(0 - height / 2) / scale + centerY;

      const firstXGrid = Math.floor(xMin / gridStep) * gridStep;
      const lastXGrid = Math.ceil(xMax / gridStep) * gridStep;
      const firstYGrid = Math.floor(yMin / gridStep) * gridStep;
      const lastYGrid = Math.ceil(yMax / gridStep) * gridStep;

      // Draw vertical lines
      for (let x = firstXGrid; x <= lastXGrid; x += gridStep) {
        const rx = parseFloat(x.toFixed(10));
        const px = (rx - centerX) * scale + width / 2;

        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();

        let py = -(0 - centerY) * scale + height / 2;
        if (py < 12) py = 12;
        if (py > height - 15) py = height - 15;

        if (rx !== 0) {
          ctx.fillText(rx.toString(), px + 4, py + 12);
        }
      }

      // Draw horizontal lines
      for (let y = firstYGrid; y <= lastYGrid; y += gridStep) {
        const ry = parseFloat(y.toFixed(10));
        const py = -(ry - centerY) * scale + height / 2;

        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();

        let px = (0 - centerX) * scale + width / 2;
        if (px < 5) px = 5;
        if (px > width - 35) px = width - 35;

        if (ry !== 0) {
          ctx.fillText(ry.toString(), px + 4, py - 4);
        }
      }

      // Draw Axes
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1.5;

      const yAxisPx = (0 - centerX) * scale + width / 2;
      ctx.beginPath();
      ctx.moveTo(yAxisPx, 0);
      ctx.lineTo(yAxisPx, height);
      ctx.stroke();

      const xAxisPx = -(0 - centerY) * scale + height / 2;
      ctx.beginPath();
      ctx.moveTo(0, xAxisPx);
      ctx.lineTo(width, xAxisPx);
      ctx.stroke();

      // Label Origin
      ctx.fillText('0', yAxisPx + 4, xAxisPx + 12);

      // Plot equations
      equations.forEach((eq) => {
        if (!eq.equation.trim() || eq.error) return;

        ctx.beginPath();
        ctx.strokeStyle = eq.color;
        ctx.lineWidth = 2.5;

        let drawing = false;

        for (let px = 0; px <= width; px++) {
          const x = (px - width / 2) / scale + centerX;
          try {
            const y = evaluate(eq.equation.replace(/π/g, 'pi'), { x }, true);
            if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
              const py = -(y - centerY) * scale + height / 2;

              if (py >= -100 && py <= height + 100) {
                if (!drawing) {
                  ctx.moveTo(px, py);
                  drawing = true;
                } else {
                  ctx.lineTo(px, py);
                }
              } else {
                drawing = false;
              }
            } else {
              drawing = false;
            }
          } catch (e) {
            drawing = false;
          }
        }
        ctx.stroke();
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [equations, scale, centerX, centerY]);

  // Interactive mouse/touch events for zooming and panning
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      centerStartX: centerX,
      centerStartY: centerY
    };
    canvas.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Track math coordinate readout
    const x = (mx - canvas.width / 2) / scale + centerX;
    const y = -(my - canvas.height / 2) / scale + centerY;

    setCoords({
      x: parseFloat(x.toFixed(4)),
      y: parseFloat(y.toFixed(4)),
      show: true
    });

    if (!dragRef.current.isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    setCenterX(dragRef.current.centerStartX - dx / scale);
    setCenterY(dragRef.current.centerStartY + dy / scale);
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'crosshair';
    dragRef.current.isDragging = false;
  };

  const handleMouseWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cursorX = (mx - canvas.width / 2) / scale + centerX;
    const cursorY = -(my - canvas.height / 2) / scale + centerY;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.max(5, Math.min(500, scale * zoomFactor));

    setScale(newScale);
    setCenterX(cursorX - (mx - canvas.width / 2) / newScale);
    setCenterY(cursorY + (my - canvas.height / 2) / newScale);
  };

  const handleMouseLeave = () => {
    setCoords((prev) => ({ ...prev, show: false }));
    handleMouseUp();
  };

  return (
    <div className="graphing-layout">
      {/* Equation Sidebar Control Panel */}
      <div className="graphing-sidebar">
        <div className="graphing-sidebar-title">Functions</div>
        <div className="equations-list">
          {equations.map((eq) => (
            <div key={eq.id} className="equation-item">
              <div className="equation-item-row">
                <span className="equation-label">y =</span>
                <div className="equation-input-wrapper">
                  <input
                    type="text"
                    value={eq.equation}
                    onChange={(e) => handleEquationChange(eq.id, e.target.value)}
                    placeholder="e.g. x^2 or sin(x)"
                    className="equation-input"
                  />
                </div>
                <button
                  onClick={() => removeEquation(eq.id)}
                  className="icon-btn"
                  style={{ color: 'var(--btn-danger-text)' }}
                  title="Remove Function"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {eq.error && <div className="equation-error">{eq.error}</div>}
              <div className="color-picker">
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => handleColorChange(eq.id, c)}
                    className={`color-dot ${eq.color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          ))}
          <button onClick={addEquation} className="add-btn">
            <Plus size={16} />
            <span>Add Equation</span>
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HelpCircle size={12} /> Graphing Guide:
          </div>
          • Scroll wheel to Zoom In/Out<br />
          • Click and drag canvas to Pan<br />
          • Trigonometric values are in Radians<br />
          • Supports functions: sin(x), cos(x), tan(x), log(x), ln(x), sqrt(x), abs(x)
        </div>
      </div>

      {/* Interactive Graph Canvas */}
      <div 
        ref={containerRef} 
        className="graphing-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleMouseWheel}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} className="graphing-canvas" />

        {coords.show && (
          <div className="coord-display">
            X: {coords.x} <br />
            Y: {coords.y}
          </div>
        )}

        <div className="canvas-controls">
          <button onClick={() => handleZoom(1.2)} className="canvas-btn" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={() => handleZoom(0.8)} className="canvas-btn" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleReset} className="canvas-btn" title="Reset View">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
