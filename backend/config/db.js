import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

const pool = new Pool({
  host: env.postgresHost,
  port: env.postgresPort,
  user: env.postgresUser,
  password: env.postgresPassword,
  database: env.postgresDatabase,
  ssl: env.postgresSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text, params) => pool.query(text, params);

export const checkDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

export const ensureDatabaseSchema = async () => {
  await pool.query(`
    ALTER TABLE species
      ADD COLUMN IF NOT EXISTS category VARCHAR(50),
      ADD COLUMN IF NOT EXISTS enclosure_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS translation_cache JSONB;

    ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'superadmin',
      ADD COLUMN IF NOT EXISTS enclosure_id VARCHAR(100);

    ALTER TABLE species
      ALTER COLUMN image_url TYPE TEXT;

    CREATE TABLE IF NOT EXISTS enclosures (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      color VARCHAR(50) NOT NULL DEFAULT 'bg-emerald-600',
      icon VARCHAR(100) NOT NULL DEFAULT 'Vivario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const getPool = () => pool;
