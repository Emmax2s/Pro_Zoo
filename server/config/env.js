import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mysqlHost: process.env.MYSQL_HOST || 'localhost',
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlUser: process.env.MYSQL_USER || 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD || '',
  mysqlDatabase: process.env.MYSQL_DATABASE || 'pro_zoo',
  adminKey: process.env.ADMIN_API_KEY || 'zoomat-admin-key',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
