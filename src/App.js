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

const buttons = [
  ['C', '(', ')', '⌫'],
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+'],
  ['^', '√', 'sin', 'cos'],
  ['tan', 'log', 'ln', 'π']
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
    <div className="container py-5" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e3e9f3 100%)', minHeight: '100vh' }}>
      <div className="row justify-content-center mb-4">
        <div className="col-md-6 col-lg-5">
          <h1 style={{ color: '#1976d2', textAlign: 'center', fontWeight: 700, letterSpacing: 1, marginBottom: 30, textShadow: '0 2px 8px #e3e9f3' }}>
            Texas Instrument
          </h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow calculator p-3" style={{borderRadius: 20, background: '#fff', color: '#23272f'}}>
            <div className="mb-3">
              <div className="form-control text-end fs-3" style={{height: '60px', borderRadius: 10, background: '#f8fafc', color: '#23272f', border: '1px solid #ced4da'}} readOnly>{input || '0'}</div>
              {error && <div className="text-danger small" style={{color: '#d32f2f'}}>Invalid Expression</div>}
            </div>
            <div className="mb-3">
              {buttons.map((row, i) => (
                <div className="row g-2 mb-2" key={i}>
                  {row.map((btn) => {
                    // Light theme button logic
                    let btnStyle = {};
                    let btnClass = 'btn btn-calc w-100';
                    if (!isNaN(btn) || btn === '.') {
                      // Numbers
                      btnStyle = { background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', color: '#232323', border: '1px solid #90caf9', fontWeight: 600 };
                    } else if (btn === '=') {
                      btnStyle = { background: 'linear-gradient(135deg, #fff176 0%, #ffd54f 100%)', color: '#232323', border: '1px solid #ffe082', fontWeight: 700, boxShadow: '0 2px 8px #ffe08299' };
                    } else if (['+', '-', '*', '/', '^'].includes(btn)) {
                      btnStyle = { background: 'linear-gradient(135deg, #b2dfdb 0%, #80cbc4 100%)', color: '#232323', border: '1px solid #4db6ac', fontWeight: 700 };
                    } else if (btn === 'C' || btn === '⌫') {
                      btnStyle = { background: 'linear-gradient(135deg, #ffe0b2 0%, #ffcc80 100%)', color: '#232323', border: '1px solid #ffb74d', fontWeight: 700 };
                    } else if (btn === '√') {
                      btnStyle = { background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)', color: '#232323', border: '1px solid #81c784', fontWeight: 700 };
                    } else if (['sin','cos','tan','log','ln','π'].includes(btn)) {
                      btnStyle = { background: 'linear-gradient(135deg, #f8bbd0 0%, #f48fb1 100%)', color: '#232323', border: '1px solid #f06292', fontWeight: 700 };
                    } else {
                      btnStyle = { background: 'linear-gradient(135deg, #d1c4e9 0%, #b39ddb 100%)', color: '#232323', border: '1px solid #9575cd', fontWeight: 700 };
                    }
                    return (
                      <div className="col" key={btn}>
                        <button
                          className={btnClass}
                          style={{ minWidth: 60, minHeight: 50, fontSize: '1.2rem', ...btnStyle }}
                          onClick={() => handleClick(btn)}
                        >
                          {btn}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  style={{ background: '#f8fafc', color: '#23272f', border: '1px solid #ced4da' }}
                  value={graphExpr}
                  onChange={e => setGraphExpr(e.target.value)}
                  placeholder="e.g. sin(x), x^2, log(x), sqrt(x)"
                />
                <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #b2dfdb 0%, #80cbc4 100%)', border: '1px solid #4db6ac', color: '#232323', fontWeight: 700 }} onClick={plotGraph}>Plot</button>
              </div>
              {graphError && <div className="text-danger mb-2" style={{color: '#d32f2f'}}>{graphError}</div>}
              <div style={{height: 300}}>
                <Line data={graphData} options={{responsive: true, plugins: {legend: {display: false}}, scales: {x: {ticks: {color: '#23272f'}}, y: {ticks: {color: '#23272f'}}}}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 