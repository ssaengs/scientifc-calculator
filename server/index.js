const path = require('path');
const express = require('express');
const cors = require('cors');
const { query, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

app.post('/api/history', async (req, res) => {
  const { expression, result } = req.body;
  if (!expression || result === undefined) {
    return res.status(400).json({ error: 'expression and result are required!' });
  }
  try {
    const row = await query(
      'INSERT INTO calculations (expression, result) VALUES ($1, $2) RETURNING *',
      [expression, String(result)]
    );
    res.json(row.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/history', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM calculations ORDER BY created_at DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaught exception', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandled rejection', reason);
});

async function start() {
  console.log('[SERVER] starting...', { port: PORT, nodeVersion: process.version, pid: process.pid });
  try {
    await initDb();
  } catch (err) {
    console.error('[SERVER] database init failed, starting without DB', { code: err.code, message: err.message, stack: err.stack });
  }
  app.listen(PORT, () => {
    console.log(`[SERVER] running on http://localhost:${PORT}`);
  });
}

start();
