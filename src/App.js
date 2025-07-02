import 'bootstrap/dist/css/bootstrap.min.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useState } from 'react';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// TI-84 inspired button layout
const buttons = [
  // Top row: F-keys (not functional, for look)
  ['F1', 'F2', 'F3', 'F4', 'F5'],
  // Second row: Graph, Trace, Zoom, Window, Y=
  ['Y=', 'WINDOW', 'ZOOM', 'TRACE', 'GRAPH'],
  // Third row: 2nd, Mode, Del, Alpha, X,T,θ,n
  ['2ND', 'MODE', 'DEL', 'ALPHA', 'X,T,θ,n'],
  // Fourth row: Math, Apps, Prgm, Vars, Clear
  ['MATH', 'APPS', 'PRGM', 'VARS', 'CLEAR'],
  // Fifth row: directional pad (arrows)
  ['↑', '', '', '', ''],
  ['←', '', '→', '', ''],
  // Sixth row: numbers and operations
  ['7', '8', '9', '/', '^'],
  ['4', '5', '6', '*', '√'],
  ['1', '2', '3', '-', '(',],
  ['0', '.', '(-)', '+', ')'],
  // Last row: Enter, Trig, Log, Ln, π
  ['ENTER', 'sin', 'cos', 'tan', 'π']
];

function parseExpression(expr) {
  let replaced = expr
    .replace(/π/g, Math.PI)
    .replace(/√/g, 'Math.sqrt')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/log/g, 'Math.log10')
    .replace(/ln/g, 'Math.log')
    .replace(/\^/g, '**');
  return replaced;
}

function safeEval(expr, x) {
  try {
    // Only allow x and Math functions
    // eslint-disable-next-line no-new-func
    return Function('x', 'return ' + expr.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/log/g, 'Math.log10').replace(/ln/g, 'Math.log').replace(/sqrt/g, 'Math.sqrt').replace(/pi/g, 'Math.PI'))(x);
  } catch {
    return NaN;
  }
}

function App() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [graphExpr, setGraphExpr] = useState('sin(x)');
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] });
  const [graphError, setGraphError] = useState('');

  const handleClick = (val) => {
    setError(false);
    if (val === 'C') {
      setInput('');
    } else if (val === '⌫') {
      setInput(input.slice(0, -1));
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-new-func
        let result = Function('return ' + parseExpression(input))();
        setInput(result.toString());
      } catch {
        setInput('');
        setError(true);
      }
    } else if (val === 'π') {
      setInput(input + 'π');
    } else if (val === '√') {
      setInput(input + '√(');
    } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(val)) {
      setInput(input + val + '(');
    } else {
      setInput(input + val);
    }
  };

  const plotGraph = () => {
    let labels = [];
    let values = [];
    setGraphError('');
    for (let i = -10; i <= 10; i += 0.1) {
      labels.push(Number(i.toFixed(2)));
      let y = safeEval(graphExpr, i);
      if (isNaN(y) || !isFinite(y)) {
        values.push(null);
      } else {
        values.push(y);
      }
    }
    if (values.every(v => v === null)) {
      setGraphError('Invalid function or syntax.');
    }
    setGraphData({
      labels,
      datasets: [
        {
          label: `y = ${graphExpr}`,
          data: values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    });
  };

  return (
    <div className="container py-5" style={{ background: '#181a20', minHeight: '100vh' }}>
      <div className="row justify-content-center mb-4">
        <div className="col-md-6 col-lg-5">
          <h1 style={{ color: '#90caf9', textAlign: 'center', fontWeight: 700, letterSpacing: 1, marginBottom: 30, textShadow: '0 2px 8px #0008' }}>
            Scientific Calculator
          </h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow calculator p-3" style={{borderRadius: 20, background: '#23272f', color: '#f8f9fa'}}>
            <div className="mb-3">
              <div className="form-control text-end fs-3" style={{height: '60px', borderRadius: 10, background: '#181a20', color: '#f8f9fa', border: '1px solid #343a40'}} readOnly>{input || '0'}</div>
              {error && <div className="text-danger small">Invalid Expression</div>}
            </div>
            <div className="mb-3">
              {buttons.map((row, i) => (
                <div className="row g-1 mb-1" key={i}>
                  {row.map((btn, j) => (
                    <div className="col" key={btn + j}>
                      {btn ? (
                        <button
                          className={`btn btn-calc w-100 ${btn === 'ENTER' ? 'btn-success' : btn.match(/[\/*\-+=^]/) ? 'btn-primary' : btn === 'CLEAR' ? 'btn-danger' : ['sin','cos','tan','log','ln','π','√'].includes(btn) ? 'btn-info' : btn === 'DEL' ? 'btn-warning' : btn === '2ND' ? 'btn-secondary' : 'btn-dark'}`}
                          style={{
                            minWidth: btn === 'ENTER' ? 90 : 60,
                            minHeight: 45,
                            fontSize: btn === 'ENTER' ? '1.1rem' : '1rem',
                            background: btn === 'ENTER' ? '#43a047' : btn === 'CLEAR' ? '#e53935' : btn === 'DEL' ? '#fbc02d' : btn === '2ND' ? '#90caf9' : btn === 'ALPHA' ? '#f48fb1' : btn === 'MODE' ? '#bdbdbd' : btn === 'MATH' ? '#ce93d8' : btn === 'APPS' ? '#ffb74d' : btn === 'PRGM' ? '#a5d6a7' : btn === 'VARS' ? '#80cbc4' : btn === 'Y=' ? '#81d4fa' : btn === 'WINDOW' ? '#ffe082' : btn === 'ZOOM' ? '#b0bec5' : btn === 'TRACE' ? '#ffcc80' : btn === 'GRAPH' ? '#aed581' : btn === 'X,T,θ,n' ? '#fff59d' : btn === '↑' || btn === '←' || btn === '→' ? '#616161' : btn === '(-)' ? '#616161' : ['sin','cos','tan','log','ln','π','√'].includes(btn) ? '#3949ab' : '#23272f',
                            color: ['DEL', '2ND', 'ALPHA', 'MODE', 'MATH', 'APPS', 'PRGM', 'VARS', 'Y=', 'WINDOW', 'ZOOM', 'TRACE', 'GRAPH', 'X,T,θ,n', '↑', '←', '→', '(-)'].includes(btn) ? '#23272f' : '#f8f9fa',
                            border: '1px solid #343a40',
                          }}
                          onClick={() => handleClick(btn)}
                        >
                          {btn}
                        </button>
                      ) : (
                        <div style={{ minWidth: 60, minHeight: 45 }}></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  style={{ background: '#181a20', color: '#f8f9fa', border: '1px solid #343a40' }}
                  value={graphExpr}
                  onChange={e => setGraphExpr(e.target.value)}
                  placeholder="e.g. sin(x), x^2, log(x), sqrt(x)"
                />
                <button className="btn btn-primary" style={{ background: '#1e88e5', border: '1px solid #343a40' }} onClick={plotGraph}>Plot</button>
              </div>
              {graphError && <div className="text-danger mb-2">{graphError}</div>}
              <div style={{height: 300}}>
                <Line data={graphData} options={{responsive: true, plugins: {legend: {display: false}}, scales: {x: {ticks: {color: '#f8f9fa'}}, y: {ticks: {color: '#f8f9fa'}}}}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 