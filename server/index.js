const path = require('path');
const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

app.post('/api/history', async (req, res) => {
  const { expression, result } = req.body;
  if (!expression || result === undefined) {
    return res.status(400).json({ error: 'expression and result are required' });
  }
  try {
    const row = await pool.query(
      'INSERT INTO calculations (expression, result) VALUES ($1, $2) RETURNING *',
      [expression, String(result)]
    );
    res.json(row.rows[0]);
  } catch (err) {
    console.error('Failed to save calculation:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/history', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM calculations ORDER BY created_at DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch history:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
