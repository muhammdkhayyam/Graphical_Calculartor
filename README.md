# Premium Multi-Mode Calculator Web Application

A modern, high-fidelity, and responsive Multi-Mode Calculator Web Application built using React JS and Vanilla CSS. It features glassmorphism visual elements, smooth theme switching (Light/Dark mode), and a high-performance interactive graphing interface.

## 🚀 Key Features

### 1. Standard Calculator
- **Basic Arithmetic**: Addition (`+`), Subtraction (`-`), Multiplication (`×`), Division (`÷`), and Modulo (`%`).
- **Input Flexibility**: Decimal number entries, positive/negative sign toggle (`±`), and clear/backspace controls.
- **Keyboard Support**: Tap digits, standard operators, backspace, escape (clear), and Enter/equals keys natively from your computer keyboard.
- **Local Storage History**: Saves past calculations locally and allows restoring them instantly in one click.

### 2. Scientific Calculator
- **All Standard Features** plus expanded functions.
- **Exponentials & Radicals**: Square roots (`√`), powers (`x²`, `xʸ`).
- **Logarithms**: Common logarithm (`log`), Natural logarithm (`ln`).
- **Trigonometry**: Sine (`sin`), Cosine (`cos`), Tangent (`tan`) and their inverse functions (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`).
- **Constants**: Direct input for Pi (`π`) and Euler's number (`e`).
- **Brackets & Factorials**: Bracket groups `( )` and integer factorials (`x!`).
- **Mode Toggle**: Easily switch between Degree (DEG) and Radian (RAD) modes.

### 3. Graphing Calculator
- **Multi-Function Plotting**: Graph multiple equations (e.g. `y = x^2`, `y = sin(x)`) concurrently.
- **HTML5 Canvas Plotter**: A buttery-smooth custom canvas render interface.
- **Interactive Navigation**: Click and drag to **Pan**, and use your mouse scrollwheel (or controls) to **Zoom** dynamically.
- **Adaptive Grid**: Mathematical grid lines and numerical axis labels scale fluidly based on the zoom depth.
- **Color Selection**: Pick custom accent colors for each plotted formula.
- **Coordinates Display**: Track and display math coordinates (`X` and `Y`) in real-time as your cursor moves across the grid.
- **Syntax Validation**: Real-time evaluation checks give instant error indicators on invalid equations.

---

## 🛠️ Architecture & Core Components

The project uses a component-based directory structure separating UI elements from core business logic:

```
Calculator-Anti-Gravity/
├── dist/                     # Compiled production assets (created after build)
├── public/                   # Static public assets
├── src/
│   ├── assets/               # SVGs, assets
│   ├── components/           # UI Components
│   │   ├── HistoryPanel.jsx  # Calculation history slide-drawer
│   │   ├── HistoryPanel.css  # History styles
│   │   ├── Sidebar.jsx       # Side navigation & toggles
│   │   ├── Sidebar.css       # Sidebar styles
│   │   ├── StandardCalculator.jsx   # Standard grid layout
│   │   ├── ScientificCalculator.jsx # Scientific math grid
│   │   ├── GraphingCalculator.jsx   # HTML5 Canvas interface
│   │   └── GraphingCalculator.css   # Graphing layout styles
│   ├── utils/
│   │   └── mathParser.js     # Tokenizer, Pratt/Shunting-yard parser
│   ├── App.jsx               # Master dashboard coordinator
│   ├── App.css               # Main container styles
│   ├── index.css             # Root variables & dark/light definitions
│   └── main.jsx              # Vite entrypoint
├── package.json
└── README.md
```

### 🧠 The Safe Math Evaluator (`src/utils/mathParser.js`)
Instead of using unsafe `eval()` expressions which expose vulnerability risks and lack variables or scientific function capabilities, this application utilizes a custom-written **lexer, tokenizer, and expression parser** based on the **Shunting-yard algorithm**:
1. **Lexer/Tokenizer**: Breaks strings down into tokens (`NUMBER`, `VARIABLE`, `OPERATOR`, `FUNCTION`, `CONSTANT`).
2. **Implicit Multiplication**: Scans the stream to insert `*` tokens where multiplication is implied (e.g. `2x` becomes `2 * x`, `5pi` becomes `5 * pi`, `x(x+1)` becomes `x * (x+1)`).
3. **Unary Processing**: Resolves leading or sandwiched signs (like `-5` or `* -3`) to special high-precedence unary operators (`u-`, `u+`).
4. **Shunting-yard Parser**: Arranges infix tokens into Reverse Polish Notation (RPN) based on operator precedence and associativity rules.
5. **Evaluator**: Iterates the RPN stack, applying operations. For graphing, the evaluator executes hundreds of computations per frame with variable bounds (e.g., evaluating `{ x: value }`) seamlessly.

---

## ⌨️ Keyboard Mappings

When the calculator is active, you can use the following keys:
- **Digits**: `0` - `9`
- **Decimal**: `.`
- **Operators**: `+`, `-`, `*` or `x` (multiplication), `/` (division), `%` (modulo), `^` (power)
- **Parentheses**: `(` and `)`
- **Constants**: `p` or `P` (inserts `π`), `e` or `E` (inserts `e`)
- **Calculate/Solve**: `Enter` or `=`
- **Backspace**: `Backspace`
- **Clear**: `Escape`

---

## 💻 Local Setup & Installation

Follow these steps to run the application locally on your machine:

### Prerequisites
Make sure you have **Node.js** (version 18+ recommended) and **npm** installed.

### 1. Install Dependencies
Navigate to the root directory and install packages:
```bash
npm install
```

### 2. Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open the provided URL (e.g. `http://localhost:5173`) in your browser to view the application.

### 3. Build for Production
To bundle the project into optimized static files for deployment:
```bash
npm run build
```
This generates the `dist/` directory, which can be uploaded directly to any static web hosting platform (e.g., Netlify, Vercel, GitHub Pages, Firebase Hosting).

---

## 🎨 UI Aesthetics
- **Theme Switcher**: Fluid transition animations when toggling between dark-slate (`#090a0f`) and soft light-grey (`#f4f5f8`) themes.
- **Glassmorphism Panels**: Semi-transparent card panels (`backdrop-filter: blur(16px)`) with subtle inset borders and soft drop shadows to present a premium dashboard experience.
- **Modern Typography**: Tailored using the Google Font **Outfit** for clean numbers and labels, and **JetBrains Mono** for formula representations.
