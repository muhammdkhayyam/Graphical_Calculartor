import React, { useState, useEffect } from 'react';
import { evaluate, formatResult } from '../utils/mathParser';

export default function ScientificCalculator({ onSaveHistory, restoredItem }) {
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');
  const [isRadian, setIsRadian] = useState(true);

  // Handle history restoration
  useEffect(() => {
    if (restoredItem && restoredItem.mode === 'scientific') {
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
      const parts = newExpr.split(/[\s+\-×÷%^()!]+/);
      const lastPart = parts[parts.length - 1];
      setDisplayValue(lastPart || '0');
    }
  };

  const appendDecimal = () => {
    if (expression.includes('=')) {
      setExpression('0.');
      setDisplayValue('0.');
      return;
    }

    const parts = expression.split(/[\s+\-×÷%^()!]+/);
    const lastPart = parts[parts.length - 1] || '';

    if (lastPart.includes('.')) return;

    if (lastPart === '') {
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

    const match = expr.match(/(\s*[+\-×÷%^]\s*)$/);
    if (match) {
      const base = expr.slice(0, expr.length - match[1].length);
      setExpression(base + ' ' + op + ' ');
    } else {
      setExpression(expr + ' ' + op + ' ');
    }
  };

  const appendFunction = (fnName) => {
    if (expression.includes('=')) {
      setExpression(fnName + '(');
      setDisplayValue('0');
      return;
    }
    
    // Add space padding if there's an active character before, unless it's an operator or open bracket
    const expr = expression;
    const lastChar = expr[expr.length - 1];
    
    if (expr === '' || lastChar === ' ' || lastChar === '(') {
      setExpression((prev) => prev + fnName + '(');
    } else {
      setExpression((prev) => prev + ' ' + fnName + '(');
    }
    setDisplayValue('0');
  };

  const appendConstant = (constName) => {
    const symbol = constName === 'pi' ? 'π' : 'e';
    if (expression.includes('=')) {
      setExpression(symbol);
      setDisplayValue(symbol);
      return;
    }

    const expr = expression;
    const lastChar = expr[expr.length - 1];
    
    if (expr === '' || lastChar === ' ' || lastChar === '(' || /[+\-×÷%^]/.test(lastChar)) {
      setExpression((prev) => prev + symbol);
    } else {
      setExpression((prev) => prev + ' ' + symbol);
    }
    setDisplayValue(symbol);
  };

  const appendParentheses = (paren) => {
    if (expression.includes('=')) {
      setExpression(paren);
      setDisplayValue(paren);
      return;
    }

    setExpression((prev) => prev + paren);
    setDisplayValue(paren);
  };

  const handleBackspace = () => {
    if (expression.includes('=')) {
      handleClear();
      return;
    }

    let expr = expression;
    
    // Check if it ends with a function call like "sin(", "asin(", "sqrt(", "abs(", "log(", "ln("
    const fnMatch = expr.match(/(asin|acos|atan|sqrt|sin|cos|tan|log|abs|ln)\($/);
    if (fnMatch) {
      expr = expr.slice(0, expr.length - fnMatch[0].length);
    } else if (expr.endsWith(' ')) {
      // Remove space padded operator
      expr = expr.trim().slice(0, -1).trim();
    } else {
      expr = expr.slice(0, -1);
    }

    setExpression(expr);
    
    if (expr === '') {
      setDisplayValue('0');
    } else {
      const parts = expr.split(/[\s+\-×÷%^()!]+/);
      const lastPart = parts[parts.length - 1];
      if (lastPart && !/[+\-×÷%^]/.test(lastPart)) {
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

    // Helper: auto-append missing closing brackets
    let openCount = 0;
    let closeCount = 0;
    for (let char of evalExpr) {
      if (char === '(') openCount++;
      if (char === ')') closeCount++;
    }
    if (openCount > closeCount) {
      evalExpr += ')'.repeat(openCount - closeCount);
    }

    // Clean trailing binary operators
    const trailingOpMatch = evalExpr.match(/(\s*[+\-×÷%^]\s*)$/);
    if (trailingOpMatch) {
      evalExpr = evalExpr.slice(0, evalExpr.length - trailingOpMatch[1].length).trim();
    }

    if (evalExpr === '') return;

    try {
      // Evaluate replacing alternate visuals like π with pi
      const result = evaluate(evalExpr.replace(/π/g, 'pi'), {}, isRadian);
      const formatted = formatResult(result);
      
      onSaveHistory(expression, formatted, 'scientific');
      
      setExpression(expression + ' =');
      setDisplayValue(formatted);
    } catch (err) {
      setDisplayValue(err.message || 'Error');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
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
      } else if (key === '^') {
        appendOperator('^');
      } else if (key === '(' || key === ')') {
        appendParentheses(key);
      } else if (key === '!') {
        setExpression((prev) => prev + '!');
      } else if (key === 'p' || key === 'P') {
        appendConstant('pi');
      } else if (key === 'e' || key === 'E') {
        appendConstant('e');
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
  }, [expression, displayValue, isRadian]);

  return (
    <div className="calc-card scientific glass">
      <div className="calc-screen">
        <div 
          className="mono" 
          style={{ 
            fontSize: '0.75rem', 
            alignSelf: 'flex-start',
            color: 'var(--accent-color)', 
            fontWeight: 'bold',
            border: '1px solid var(--accent-soft)',
            borderRadius: '4px',
            padding: '2px 6px',
            backgroundColor: 'var(--accent-soft)'
          }}
        >
          {isRadian ? 'RAD' : 'DEG'}
        </div>
        <div className="screen-expression mono">{expression}</div>
        <div className={`screen-value mono ${displayValue.startsWith('Error') ? 'error' : ''}`}>
          {displayValue}
        </div>
      </div>
      
      <div className="calc-grid scientific-grid">
        {/* Row 1 */}
        <button onClick={() => setIsRadian(!isRadian)} className="calc-btn func" style={{ fontSize: '0.85rem' }}>
          {isRadian ? 'DEG' : 'RAD'}
        </button>
        <button onClick={() => appendFunction('asin')} className="calc-btn func">sin⁻¹</button>
        <button onClick={() => appendFunction('acos')} className="calc-btn func">cos⁻¹</button>
        <button onClick={() => appendFunction('atan')} className="calc-btn func">tan⁻¹</button>
        <button onClick={handleClear} className="calc-btn danger">C</button>
        
        {/* Row 2 */}
        <button onClick={() => appendOperator('^')} className="calc-btn func">xʸ</button>
        <button onClick={() => appendFunction('sin')} className="calc-btn func">sin</button>
        <button onClick={() => appendFunction('cos')} className="calc-btn func">cos</button>
        <button onClick={() => appendFunction('tan')} className="calc-btn func">tan</button>
        <button onClick={handleBackspace} className="calc-btn func">⌫</button>

        {/* Row 3 */}
        <button onClick={() => setExpression((prev) => prev + '^2')} className="calc-btn func">x²</button>
        <button onClick={() => appendFunction('ln')} className="calc-btn func">ln</button>
        <button onClick={() => appendFunction('log')} className="calc-btn func">log</button>
        <button onClick={() => appendConstant('pi')} className="calc-btn func">π</button>
        <button onClick={() => appendConstant('e')} className="calc-btn func">e</button>

        {/* Row 4 */}
        <button onClick={() => appendFunction('sqrt')} className="calc-btn func">√</button>
        <button onClick={() => appendParentheses('(')} className="calc-btn func">(</button>
        <button onClick={() => appendParentheses(')')} className="calc-btn func">)</button>
        <button onClick={() => setExpression((prev) => prev + '!')} className="calc-btn func">x!</button>
        <button onClick={() => appendOperator('÷')} className="calc-btn operator">÷</button>

        {/* Numbers & Basic Ops */}
        <button onClick={() => appendFunction('abs')} className="calc-btn func">|x|</button>
        <button onClick={() => appendDigit('7')} className="calc-btn">7</button>
        <button onClick={() => appendDigit('8')} className="calc-btn">8</button>
        <button onClick={() => appendDigit('9')} className="calc-btn">9</button>
        <button onClick={() => appendOperator('×')} className="calc-btn operator">×</button>

        <button onClick={handleToggleSign} className="calc-btn func">±</button>
        <button onClick={() => appendDigit('4')} className="calc-btn">4</button>
        <button onClick={() => appendDigit('5')} className="calc-btn">5</button>
        <button onClick={() => appendDigit('6')} className="calc-btn">6</button>
        <button onClick={() => appendOperator('-')} className="calc-btn operator">-</button>

        <button onClick={() => appendOperator('%')} className="calc-btn func">%</button>
        <button onClick={() => appendDigit('1')} className="calc-btn">1</button>
        <button onClick={() => appendDigit('2')} className="calc-btn">2</button>
        <button onClick={() => appendDigit('3')} className="calc-btn">3</button>
        <button onClick={() => appendOperator('+')} className="calc-btn operator">+</button>

        <button onClick={() => appendDigit('0')} className="calc-btn double" style={{ gridColumn: 'span 2' }}>0</button>
        <button onClick={appendDecimal} className="calc-btn">.</button>
        <button onClick={calculateResult} className="calc-btn operator double" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, var(--accent-color), #818cf8)' }}>=</button>
      </div>
    </div>
  );
}
