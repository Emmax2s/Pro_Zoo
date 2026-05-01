import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Backend
  port: Number(process.env.PORT || 4000),

  // PostgreSQL
  postgresHost: process.env.POSTGRES_HOST || 'localhost',
  postgresPort: Number(process.env.POSTGRES_PORT || 5432),
  postgresUser: process.env.POSTGRES_USER || 'postgres',
  postgresPassword: process.env.POSTGRES_PASSWORD || 'postgres',
  postgresDatabase: process.env.POSTGRES_DATABASE || 'pro_zoo',

  // Admin & Security
  adminKey: process.env.ADMIN_API_KEY || 'zoomat-admin-key',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-zoomat-key-2026',
};

