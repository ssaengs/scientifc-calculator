import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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

function App() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

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

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow calculator">
            <div className="card-body">
              <div className="mb-3">
                <div className="form-control text-end fs-3" style={{height: '60px'}} readOnly>{input || '0'}</div>
                {error && <div className="text-danger small">Invalid Expression</div>}
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 