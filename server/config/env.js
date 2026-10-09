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
  postgresSsl: process.env.POSTGRES_SSL === 'true',

  // Admin & Security
  adminKey: process.env.ADMIN_API_KEY || 'zoomat-admin-key',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-zoomat-key-2026',
  publicAppUrl: process.env.PUBLIC_APP_URL || 'https://pruzo.me',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 465),
  smtpSecure: process.env.SMTP_SECURE !== 'false',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || '',
};
