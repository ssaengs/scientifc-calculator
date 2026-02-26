const { Pool, Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/scientific_calculator';

function redactedUrl() {
  try {
    const url = new URL(connectionString);
    if (url.password) url.password = '***';
    return url.toString();
  } catch {
    return '(invalid URL)';
  }
}

function buildSslConfig() {
  if (!connectionString.includes('sslmode=require')) return false;
  const cfg = {};
  if (process.env.DATABASE_CA_CERT) {
    cfg.ca = process.env.DATABASE_CA_CERT;
    cfg.rejectUnauthorized = true;
  } else {
    cfg.rejectUnauthorized = false;
  }
  return cfg;
}

const sslConfig = buildSslConfig();

console.log('[DB] config', {
  url: redactedUrl(),
  ssl: sslConfig ? 'on' : 'off',
  caCert: sslConfig && sslConfig.ca ? 'provided' : 'not set',
});

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('[DB] pool idle client error', { code: err.code, message: err.message, stack: err.stack });
});

pool.on('connect', () => {
  console.log('[DB] pool new client connected');
});

async function ensureDatabase() {
  const url = new URL(connectionString);
  const dbName = url.pathname.replace('/', '');

  if (process.env.DATABASE_URL) {
    console.log(`[DB] managed database detected, skipping ensureDatabase for "${dbName}"`);
    return;
  }

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
      console.log(`[DB] created database "${dbName}"`);
    }
  } finally {
    await client.end();
  }
}

let healthCheckInterval;

function startHealthCheck() {
  healthCheckInterval = setInterval(async () => {
    const start = Date.now();
    try {
      const { rows } = await pool.query('SELECT NOW() AS server_time');
      const duration = Date.now() - start;
      console.log('[DB] health check OK', {
        duration: `${duration}ms`,
        serverTime: rows[0].server_time,
        totalPool: pool.totalCount,
        idlePool: pool.idleCount,
        waitingPool: pool.waitingCount,
      });
    } catch (err) {
      const duration = Date.now() - start;
      console.error('[DB] health check FAILED', {
        duration: `${duration}ms`,
        code: err.code,
        message: err.message,
      });
    }
  }, 30000);
  healthCheckInterval.unref();
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
  startHealthCheck();
}

module.exports = { pool, query, initDb };
