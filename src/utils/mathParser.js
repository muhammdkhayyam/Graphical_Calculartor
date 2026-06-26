/**
 * Custom Safe Math Expression Parser
 * Tokenizes, parses, and evaluates expressions without using eval().
 * Uses the Shunting-yard algorithm to compile into Reverse Polish Notation (RPN).
 */

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  // If not integer, take the floor (standard calculator behavior for simplicity)
  const integer = Math.floor(n);
  let res = 1;
  for (let i = 2; i <= integer; i++) {
    res *= i;
  }
  return res;
}

/**
 * Tokenize a mathematical expression string
 */
function tokenize(str) {
  const tokens = [];
  let i = 0;

  // Clean string and replace alternate symbols
  let cleanStr = str
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi');

  while (i < cleanStr.length) {
    const char = cleanStr[i];

    // Numbers
    if (/[0-9.]/.test(char)) {
      let numStr = '';
      while (i < cleanStr.length && /[0-9.]/.test(cleanStr[i])) {
        numStr += cleanStr[i];
        i++;
      }
      // If we have just a dot, treat it as 0
      const value = numStr === '.' ? 0 : parseFloat(numStr);
      tokens.push({ type: 'NUMBER', value });
      continue;
    }

    // Single character operators
    if ('+-*/%^()!'.includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    // Words (Variables, constants, functions)
    if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (i < cleanStr.length && /[a-zA-Z]/.test(cleanStr[i])) {
        word += cleanStr[i];
        i++;
      }

      const lower = word.toLowerCase();
      if (lower === 'x') {
        tokens.push({ type: 'VARIABLE', value: 'x' });
      } else if (lower === 'pi' || lower === 'e') {
        tokens.push({ type: 'CONSTANT', value: lower });
      } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs'].includes(lower)) {
        tokens.push({ type: 'FUNCTION', value: lower });
      } else {
        throw new Error(`Unknown identifier: ${word}`);
      }
      continue;
    }

    throw new Error(`Unknown character: ${char}`);
  }

  // Handle Implicit Multiplication:
  // e.g. 2x -> 2 * x, x(x+1) -> x * (x+1), 2pi -> 2 * pi, (x+1)sin(x) -> (x+1) * sin(x)
  const processed = [];
  for (let j = 0; j < tokens.length; j++) {
    const curr = tokens[j];
    processed.push(curr);

    if (j < tokens.length - 1) {
      const next = tokens[j + 1];

      // Situations requiring implicit multiplication:
      // Left operand is a Number, Constant, Variable, or ")" or "!"
      const isLeftImplicit =
        curr.type === 'NUMBER' ||
        curr.type === 'CONSTANT' ||
        curr.type === 'VARIABLE' ||
        (curr.type === 'OPERATOR' && (curr.value === ')' || curr.value === '!'));

      // Right operand is a Constant, Variable, Function, or "("
      const isRightImplicit =
        next.type === 'CONSTANT' ||
        next.type === 'VARIABLE' ||
        next.type === 'FUNCTION' ||
        (next.type === 'OPERATOR' && next.value === '(');

      if (isLeftImplicit && isRightImplicit) {
        processed.push({ type: 'OPERATOR', value: '*' });
      }
    }
  }

  // Handle Unary operators (+ and -) by converting to special tokens
  const finalTokens = [];
  for (let j = 0; j < processed.length; j++) {
    const token = processed[j];
    if (token.type === 'OPERATOR' && (token.value === '-' || token.value === '+')) {
      const isUnary =
        j === 0 ||
        (processed[j - 1].type === 'OPERATOR' &&
          processed[j - 1].value !== ')' &&
          processed[j - 1].value !== '!');
      
      if (isUnary) {
        finalTokens.push({
          type: 'UNARY_OPERATOR',
          value: token.value === '-' ? 'u-' : 'u+',
        });
      } else {
        finalTokens.push(token);
      }
    } else {
      finalTokens.push(token);
    }
  }

  return finalTokens;
}

// Precedence and associativity configuration
const PRECEDENCE = {
  '+': 2, '-': 2,
  '*': 3, '/': 3, '%': 3,
  'u-': 4, 'u+': 4,
  '^': 5,
  '!': 6,
};

const ASSOCIATIVITY = {
  '+': 'L', '-': 'L',
  '*': 'L', '/': 'L', '%': 'L',
  'u-': 'R', 'u+': 'R',
  '^': 'R',
  '!': 'L',
};

/**
 * Parse standard token stream into RPN (Reverse Polish Notation) using Shunting-yard
 */
function parse(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER' || token.type === 'VARIABLE' || token.type === 'CONSTANT') {
      outputQueue.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'UNARY_OPERATOR') {
      operatorStack.push(token);
    } else if (token.type === 'OPERATOR') {
      const op = token.value;

      if (op === '(') {
        operatorStack.push(token);
      } else if (op === ')') {
        let foundOpen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR' && top.value === '(') {
            operatorStack.pop();
            foundOpen = true;
            break;
          }
          outputQueue.push(operatorStack.pop());
        }
        if (!foundOpen) {
          throw new Error('Mismatched parentheses');
        }
        // If the top is a function, pop it to output
        if (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === 'FUNCTION'
        ) {
          outputQueue.push(operatorStack.pop());
        }
      } else if (op === '!') {
        // Factorial (postfix unary). Pop higher precedence operators.
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR' || top.type === 'UNARY_OPERATOR') {
            const topVal = top.value;
            const topPrec = PRECEDENCE[topVal];
            const currPrec = PRECEDENCE[op];
            if (
              topPrec > currPrec ||
              (topPrec === currPrec && ASSOCIATIVITY[op] === 'L')
            ) {
              outputQueue.push(operatorStack.pop());
              continue;
            }
          }
          break;
        }
        operatorStack.push(token);
      } else {
        // Binary operators
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR' || top.type === 'UNARY_OPERATOR') {
            const topVal = top.value;
            const topPrec = PRECEDENCE[topVal];
            const currPrec = PRECEDENCE[op];
            if (
              topPrec > currPrec ||
              (topPrec === currPrec && ASSOCIATIVITY[op] === 'L')
            ) {
              outputQueue.push(operatorStack.pop());
              continue;
            }
          }
          break;
        }
        operatorStack.push(token);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === 'OPERATOR' && (top.value === '(' || top.value === ')')) {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Evaluate expressions in RPN notation
 */
function evaluateRPN(rpn, variables = {}, isRadian = true) {
  const stack = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(token.value);
    } else if (token.type === 'CONSTANT') {
      if (token.value === 'pi') stack.push(Math.PI);
      else if (token.value === 'e') stack.push(Math.E);
    } else if (token.type === 'VARIABLE') {
      const val = variables[token.value];
      if (val === undefined) {
        throw new Error(`Variable ${token.value} undefined`);
      }
      stack.push(val);
    } else if (token.type === 'UNARY_OPERATOR') {
      if (stack.length < 1) throw new Error('Invalid syntax');
      const val = stack.pop();
      if (token.value === 'u-') {
        stack.push(-val);
      } else if (token.value === 'u+') {
        stack.push(val);
      }
    } else if (token.type === 'FUNCTION') {
      if (stack.length < 1) throw new Error('Invalid syntax');
      const val = stack.pop();
      const fn = token.value;

      const toRad = (v) => v * (Math.PI / 180);
      const toDeg = (v) => v * (180 / Math.PI);

      switch (fn) {
        case 'sin':
          stack.push(Math.sin(isRadian ? val : toRad(val)));
          break;
        case 'cos':
          stack.push(Math.cos(isRadian ? val : toRad(val)));
          break;
        case 'tan':
          stack.push(Math.tan(isRadian ? val : toRad(val)));
          break;
        case 'asin':
          const radAsin = Math.asin(val);
          stack.push(isRadian ? radAsin : toDeg(radAsin));
          break;
        case 'acos':
          const radAcos = Math.acos(val);
          stack.push(isRadian ? radAcos : toDeg(radAcos));
          break;
        case 'atan':
          const radAtan = Math.atan(val);
          stack.push(isRadian ? radAtan : toDeg(radAtan));
          break;
        case 'log':
          stack.push(Math.log10(val));
          break;
        case 'ln':
          stack.push(Math.log(val));
          break;
        case 'sqrt':
          stack.push(Math.sqrt(val));
          break;
        case 'abs':
          stack.push(Math.abs(val));
          break;
        default:
          throw new Error(`Unknown function: ${fn}`);
      }
    } else if (token.type === 'OPERATOR') {
      const op = token.value;

      if (op === '!') {
        if (stack.length < 1) throw new Error('Invalid syntax');
        stack.push(factorial(stack.pop()));
        continue;
      }

      if (stack.length < 2) throw new Error('Invalid syntax');
      const right = stack.pop();
      const left = stack.pop();

      switch (op) {
        case '+': stack.push(left + right); break;
        case '-': stack.push(left - right); break;
        case '*': stack.push(left * right); break;
        case '/': stack.push(left / right); break;
        case '%': stack.push(left % right); break;
        case '^': stack.push(Math.pow(left, right)); break;
        default:
          throw new Error(`Unknown operator: ${op}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid syntax');
  }

  return stack[0];
}

/**
 * Public math evaluator interface
 * @param {string} str - Expression string
 * @param {object} variables - Key-value pair of variables e.g., { x: 5 }
 * @param {boolean} isRadian - True if trigonometry should use radians, False for degrees
 * @returns {number} evaluated result
 */
export function evaluate(str, variables = {}, isRadian = true) {
  const clean = str ? str.trim() : '';
  if (clean === '') return 0;
  
  // Basic validation for parentheses balance
  let parenCount = 0;
  for (let j = 0; j < clean.length; j++) {
    if (clean[j] === '(') parenCount++;
    if (clean[j] === ')') parenCount--;
    if (parenCount < 0) throw new Error('Mismatched parentheses');
  }
  if (parenCount !== 0) throw new Error('Mismatched parentheses');

  const tokens = tokenize(clean);
  const rpn = parse(tokens);
  return evaluateRPN(rpn, variables, isRadian);
}

/**
 * Formats a numeric result to a readable string with up to 10 decimal places,
 * truncating trailing zeros and handling division-by-zero or NaN states.
 */
export function formatResult(val) {
  if (typeof val !== 'number' || isNaN(val)) {
    return 'Error';
  }
  if (!isFinite(val)) {
    return 'Error: division by zero';
  }
  // Convert scientific notation if extremely small or large, or limit to 10 decimal digits
  const abs = Math.abs(val);
  if (abs > 1e12 || (abs < 1e-6 && abs > 0)) {
    return val.toExponential(6);
  }
  
  if (Number.isInteger(val)) {
    return val.toString();
  }
  
  // Format to 10 decimal places and strip trailing zeros
  return parseFloat(val.toFixed(10)).toString();
}

