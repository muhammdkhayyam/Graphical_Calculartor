import React from 'react';
import { Calculator, Compass, LineChart, Sun, Moon, History, X } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  currentMode,
  setCurrentMode,
  theme,
  toggleTheme,
  isOpen,
  setIsOpen,
  toggleHistory
}) {
  const modes = [
    { id: 'standard', name: 'Standard', icon: Calculator },
    { id: 'scientific', name: 'Scientific', icon: Compass },
    { id: 'graphing', name: 'Graphing', icon: LineChart }
  ];

  const handleModeSelect = (id) => {
    setCurrentMode(id);
    setIsOpen(false); // Close sidebar on mobile after click
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-logo">
            <Calculator className="sidebar-logo-icon" size={28} />
            <span className="sidebar-logo-text">DataGraph Studio</span>
            {/* Close button on mobile */}
            <button 
              className="menu-btn" 
              style={{ marginLeft: 'auto', display: isOpen ? 'block' : 'none' }}
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-nav">
            <span className="nav-section-title">Modes</span>
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`nav-btn ${currentMode === mode.id ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {mode.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={toggleHistory}>
            <div className="footer-btn-content">
              <History size={16} />
              <span>History</span>
            </div>
          </button>

          <button className="footer-btn" onClick={toggleTheme}>
            <div className="footer-btn-content">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className="mono" style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              {theme === 'dark' ? 'LIGHT' : 'DARK'}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
