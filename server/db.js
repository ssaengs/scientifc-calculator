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

async function initDb() {
  await ensureDatabase();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calculations (
      id SERIAL PRIMARY KEY,
      expression TEXT NOT NULL,
      result TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };
