import React, { useState } from 'react';
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function safeEval(expr, x) {
  try {
    // Only allow x and Math functions
    // eslint-disable-next-line no-new-func
    return Function('x', 'return ' + expr.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/log/g, 'Math.log10').replace(/ln/g, 'Math.log').replace(/sqrt/g, 'Math.sqrt').replace(/pi/g, 'Math.PI'))(x);
  } catch {
    return NaN;
  }
}

const Graph = () => {
  const [expr, setExpr] = useState('sin(x)');
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState('');

  const plotGraph = () => {
    let labels = [];
    let values = [];
    setError('');
    for (let i = -10; i <= 10; i += 0.1) {
      labels.push(Number(i.toFixed(2)));
      let y = safeEval(expr, i);
      if (isNaN(y) || !isFinite(y)) {
        values.push(null);
      } else {
        values.push(y);
      }
    }
    if (values.every(v => v === null)) {
      setError('Invalid function or syntax.');
    }
    setData({
      labels,
      datasets: [
        {
          label: `y = ${expr}`,
          data: values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    });
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Graph Function</h5>
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            value={expr}
            onChange={e => setExpr(e.target.value)}
            placeholder="e.g. sin(x), x^2, log(x), sqrt(x)"
          />
          <button className="btn btn-primary" onClick={plotGraph}>Plot</button>
        </div>
        {error && <div className="text-danger mb-2">{error}</div>}
        <div style={{height: 300}}>
          <Line data={data} options={{responsive: true, plugins: {legend: {display: false}}}} />
        </div>
      </div>
    </div>
  );
};

export default Graph; 