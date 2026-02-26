const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/scientific_calculator',
});

async function initDb() {
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
