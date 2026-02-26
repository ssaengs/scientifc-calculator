const { Pool, Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/scientific_calculator';

const pool = new Pool({ connectionString });

async function ensureDatabase() {
  const url = new URL(connectionString);
  const dbName = url.pathname.replace('/', '');

  url.pathname = '/postgres';
  const client = new Client({ connectionString: url.toString() });

  try {
    await client.connect();
    const { rows } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    if (rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database "${dbName}"`);
    }
  } finally {
    await client.end();
  }
}

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[DB] query OK', { text: text.replace(/\s+/g, ' ').trim(), params, duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error('[DB] query FAILED', { text: text.replace(/\s+/g, ' ').trim(), params, duration: `${duration}ms` });
    console.error('[DB] error details', { code: err.code, message: err.message, detail: err.detail, table: err.table, constraint: err.constraint, stack: err.stack });
    throw err;
  }
}

async function initDb() {
  await ensureDatabase();
  await query(`
    CREATE TABLE IF NOT EXISTS calculations (
      id SERIAL PRIMARY KEY,
      expression TEXT NOT NULL,
      result TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('[DB] initialized successfully');
}

module.exports = { pool, query, initDb };
