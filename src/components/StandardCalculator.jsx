import React, { useState, useEffect } from 'react';
import { evaluate, formatResult } from '../utils/mathParser';

export default function StandardCalculator({ onSaveHistory, restoredItem }) {
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');

  // Handle history restoration
  useEffect(() => {
    if (restoredItem && restoredItem.mode === 'standard') {
      const parts = restoredItem.expr.split('=');
      setExpression(parts[0].trim());
      setDisplayValue(restoredItem.val);
    }
  }, [restoredItem]);

  const handleClear = () => {
    setExpression('');
    setDisplayValue('0');
  };

  const appendDigit = (digit) => {
    if (expression.includes('=')) {
      setExpression(digit);
      setDisplayValue(digit);
      return;
    }

    if (expression === '0') {
      setExpression(digit);
      setDisplayValue(digit);
    } else {
      setExpression((prev) => prev + digit);
      const newExpr = expression + digit;
      const parts = newExpr.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      setDisplayValue(lastPart);
    }
  };

  const appendDecimal = () => {
    if (expression.includes('=')) {
      setExpression('0.');
      setDisplayValue('0.');
      return;
    }

    const parts = expression.split(/\s+/);
    const lastPart = parts[parts.length - 1] || '';

    if (lastPart.includes('.')) return;

    if (lastPart === '' || /[+\-×÷%]/.test(lastPart)) {
      setExpression((prev) => prev + '0.');
      setDisplayValue('0.');
    } else {
      setExpression((prev) => prev + '.');
      setDisplayValue(lastPart + '.');
    }
  };

  const appendOperator = (op) => {
    if (expression.includes('=')) {
      setExpression(displayValue + ' ' + op + ' ');
      return;
    }

    const expr = expression.trim();
    if (expr === '') {
      setExpression(displayValue + ' ' + op + ' ');
      return;
    }

    // Check if expression ends with an operator
    const match = expr.match(/(\s*[+\-×÷%]\s*)$/);
    if (match) {
      const base = expr.slice(0, expr.length - match[1].length);
      setExpression(base + ' ' + op + ' ');
    } else {
      setExpression(expr + ' ' + op + ' ');
    }
  };

  const handleBackspace = () => {
    if (expression.includes('=')) {
      handleClear();
      return;
    }

    let expr = expression;
    if (expr.endsWith(' ')) {
      // Remove trailing operator and its space padding
      expr = expr.trim().slice(0, -1).trim();
    } else {
      expr = expr.slice(0, -1);
    }

    if (expr === '') {
      setExpression('');
      setDisplayValue('0');
    } else {
      setExpression(expr);
      const parts = expr.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      if (lastPart && !/[+\-×÷%]/.test(lastPart)) {
        setDisplayValue(lastPart);
      } else {
        setDisplayValue('0');
      }
    }
  };

  const handleToggleSign = () => {
    if (expression.includes('=')) {
      const val = parseFloat(displayValue);
      if (!isNaN(val)) {
        const negated = (-val).toString();
        setExpression(negated);
        setDisplayValue(negated);
      }
      return;
    }

    const expr = expression.trim();
    const match = expr.match(/(-?[\d.]+)$/);
    if (match) {
      const num = match[1];
      const negated = num.startsWith('-') ? num.slice(1) : '-' + num;
      setExpression(expr.slice(0, expr.length - num.length) + negated);
      setDisplayValue(negated);
    } else {
      setExpression(expr + '-');
      setDisplayValue('-');
    }
  };

  const calculateResult = () => {
    let evalExpr = expression.trim();
    if (evalExpr === '' || expression.includes('=')) return;

    // Remove trailing operator if user hits equals immediately after operator
    const trailingOpMatch = evalExpr.match(/(\s*[+\-×÷%]\s*)$/);
    if (trailingOpMatch) {
      evalExpr = evalExpr.slice(0, evalExpr.length - trailingOpMatch[1].length).trim();
    }

    if (evalExpr === '') return;

    try {
      const result = evaluate(evalExpr);
      const formatted = formatResult(result);
      
      onSaveHistory(expression, formatted, 'standard');
      
      setExpression(expression + ' =');
      setDisplayValue(formatted);
    } catch (err) {
      setDisplayValue(err.message || 'Error');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if focus is in input element (like in graphing mode)
      if (document.activeElement.tagName === 'INPUT') return;

      const key = e.key;
      if (key >= '0' && key <= '9') {
        appendDigit(key);
      } else if (key === '.') {
        appendDecimal();
      } else if (key === '+') {
        appendOperator('+');
      } else if (key === '-') {
        appendOperator('-');
      } else if (key === '*' || key === 'x' || key === 'X') {
        appendOperator('×');
      } else if (key === '/') {
        appendOperator('÷');
      } else if (key === '%') {
        appendOperator('%');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, displayValue]);

  return (
    <div className="calc-card glass">
      <div className="calc-screen">
        <div className="screen-expression mono">{expression}</div>
        <div className={`screen-value mono ${displayValue.startsWith('Error') ? 'error' : ''}`}>
          {displayValue}
        </div>
      </div>
      
      <div className="calc-grid">
        <button onClick={handleClear} className="calc-btn danger">C</button>
        <button onClick={handleBackspace} className="calc-btn func">⌫</button>
        <button onClick={handleToggleSign} className="calc-btn func">±</button>
        <button onClick={() => appendOperator('%')} className="calc-btn func">%</button>
        
        <button onClick={() => appendDigit('7')} className="calc-btn">7</button>
        <button onClick={() => appendDigit('8')} className="calc-btn">8</button>
        <button onClick={() => appendDigit('9')} className="calc-btn">9</button>
        <button onClick={() => appendOperator('÷')} className="calc-btn operator">÷</button>
        
        <button onClick={() => appendDigit('4')} className="calc-btn">4</button>
        <button onClick={() => appendDigit('5')} className="calc-btn">5</button>
        <button onClick={() => appendDigit('6')} className="calc-btn">6</button>
        <button onClick={() => appendOperator('×')} className="calc-btn operator">×</button>
        
        <button onClick={() => appendDigit('1')} className="calc-btn">1</button>
        <button onClick={() => appendDigit('2')} className="calc-btn">2</button>
        <button onClick={() => appendDigit('3')} className="calc-btn">3</button>
        <button onClick={() => appendOperator('-')} className="calc-btn operator">-</button>
        
        <button onClick={() => appendDigit('0')} className="calc-btn double">0</button>
        <button onClick={appendDecimal} className="calc-btn">.</button>
        <button onClick={() => appendOperator('+')} className="calc-btn operator">+</button>
        
        <button onClick={calculateResult} className="calc-btn operator double" style={{ gridColumn: 'span 4', width: '100%', height: '56px', background: 'linear-gradient(135deg, var(--accent-color), #818cf8)' }}>=</button>
      </div>
    </div>
  );
}
