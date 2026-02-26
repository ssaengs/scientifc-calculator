import React, { useState, useEffect, useCallback } from 'react';
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
import HistoryWidget from './HistoryWidget';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
  const [history, setHistory] = useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (res.ok) setHistory(await res.json());
    } catch {
      /* backend may be unavailable */
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const saveToHistory = async (expression, result) => {
    try {
      await fetch(`${API_BASE}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression, result }),
      });
      fetchHistory();
    } catch {
      /* silent fail if backend unavailable */
    }
  };

  const handleClick = (val) => {
    setError(false);
    if (val === 'C') {
      setInput('');
    } else if (val === '⌫') {
      setInput(input.slice(0, -1));
    } else if (val === '=') {
      try {
        const expression = input;
        // eslint-disable-next-line no-new-func
        let result = Function('return ' + parseExpression(input))();
        setInput(result.toString());
        saveToHistory(expression, result.toString());
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-6 mb-4 mb-lg-0">
          <div className="card shadow calculator p-3" style={{borderRadius: 20, background: '#f8f9fa'}}>
            <div className="mb-3">
              <div className="form-control text-end fs-3 bg-white" style={{height: '60px', borderRadius: 10}} readOnly>{input || '0'}</div>
              {error && <div className="text-danger small">Invalid Expression</div>}
            </div>
            <div className="mb-3">
              {buttons.map((row, i) => (
                <div className="row g-2 mb-2" key={i}>
                  {row.map((btn) => (
                    <div className="col" key={btn}>
                      <button
                        className={`btn btn-calc w-100 ${btn === '=' ? 'btn-success' : btn.match(/[\/*\-+=^]/) ? 'btn-primary' : btn === 'C' ? 'btn-secondary' : btn === '⌫' ? 'btn-secondary' : btn === '√' ? 'btn-info' : ['sin','cos','tan','log','ln','π'].includes(btn) ? 'btn-info' : 'btn-light'}`}
                        style={{minWidth: 60, minHeight: 50, fontSize: '1.2rem'}}
                        onClick={() => handleClick(btn)}
                      >
                        {btn}
                      </button>
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
                  value={graphExpr}
                  onChange={e => setGraphExpr(e.target.value)}
                  placeholder="e.g. sin(x), x^2, log(x), sqrt(x)"
                />
                <button className="btn btn-primary" onClick={plotGraph}>Plot</button>
              </div>
              {graphError && <div className="text-danger mb-2">{graphError}</div>}
              <div style={{height: 300}}>
                <Line data={graphData} options={{responsive: true, plugins: {legend: {display: false}}}} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-5">
          <HistoryWidget
            history={history}
            onSelect={(result) => setInput(result)}
          />
        </div>
      </div>
    </div>
  );
}

export default App; 