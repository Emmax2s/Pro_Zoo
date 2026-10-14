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
      ADD COLUMN IF NOT EXISTS enclosure_id VARCHAR(100);

    ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'superadmin',
      ADD COLUMN IF NOT EXISTS enclosure_id VARCHAR(100);

    ALTER TABLE species
      ALTER COLUMN image_url TYPE TEXT;
  `);
};

export const getPool = () => pool;
