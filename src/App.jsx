import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HistoryPanel from './components/HistoryPanel';
import StandardCalculator from './components/StandardCalculator';
import ScientificCalculator from './components/ScientificCalculator';
import GraphingCalculator from './components/GraphingCalculator';
import './App.css';

export default function App() {
  // Theme management (default to dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('calc_theme') || 'dark';
  });

  // Mode management ('standard', 'scientific', 'graphing')
  const [currentMode, setCurrentMode] = useState('standard');

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state toggles
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  // State to pass down when a history item is restored
  const [restoredItem, setRestoredItem] = useState(null);

  // Apply theme to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveHistory = (expr, val, mode) => {
    const newItem = {
      id: Date.now().toString(),
      expr,
      val,
      mode
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem('calc_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calc_history');
  };

  const handleItemSelect = (item) => {
    setRestoredItem({ ...item, timestamp: Date.now() });
    setCurrentMode(item.mode);
  };

  return (
    <div className="app-layout">
      {/* Navigation Sidebar */}
      <Sidebar
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        toggleHistory={() => setHistoryOpen(!historyOpen)}
      />

      {/* Main App Section */}
      <div className="main-content">
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="header-title">
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {currentMode === 'standard' && 'Standard Mode'}
                {currentMode === 'scientific' && 'Scientific Mode'}
                {currentMode === 'graphing' && 'Graphing Mode'}
              </h1>
            </div>
          </div>
          <div className="header-actions">
            {/* Display active calculator layout badges or info here */}
          </div>
        </header>

        <main className="calculator-viewport">
          {currentMode === 'standard' && (
            <StandardCalculator
              onSaveHistory={handleSaveHistory}
              restoredItem={restoredItem}
            />
          )}
          {currentMode === 'scientific' && (
            <ScientificCalculator
              onSaveHistory={handleSaveHistory}
              restoredItem={restoredItem}
            />
          )}
          {currentMode === 'graphing' && (
            <GraphingCalculator />
          )}
        </main>
      </div>

      {/* Slidout History Drawer */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onClear={handleClearHistory}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
}
