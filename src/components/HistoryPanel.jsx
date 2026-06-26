import React from 'react';
import { Trash2, X, History as HistoryIcon } from 'lucide-react';
import './HistoryPanel.css';

export default function HistoryPanel({
  isOpen,
  onClose,
  history = [],
  onClear,
  onItemSelect
}) {
  return (
    <>
      <div 
        className={`history-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />

      <div className={`history-panel ${isOpen ? 'open' : ''}`}>
        <div className="history-header">
          <div className="history-title">
            <HistoryIcon size={18} className="sidebar-logo-icon" />
            <span>Calculation History</span>
          </div>
          <div className="history-header-actions">
            {history.length > 0 && (
              <button 
                className="icon-btn" 
                onClick={onClear}
                title="Clear History"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              className="icon-btn" 
              onClick={onClose}
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <HistoryIcon size={32} style={{ opacity: 0.3 }} />
              <p>Your calculation history is empty.</p>
            </div>
          ) : (
            history.map((item) => (
              <button 
                key={item.id} 
                className="history-item"
                onClick={() => {
                  onItemSelect(item);
                  onClose();
                }}
              >
                <div className="history-item-expr">{item.expr}</div>
                <div className="history-item-val">{item.val}</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5 }}>
                  {item.mode} mode
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
