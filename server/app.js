import cors from 'cors';
import express from 'express';
import { checkDatabaseConnection } from './config/db.js';
import { env } from './config/env.js';
import speciesRoutes from './routes/speciesRoutes.js';
import siteRoutes from './routes/siteRoutes.js';

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin,
  })
);
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabaseConnection();
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/species', speciesRoutes);
app.use('/api/site-content', siteRoutes);

app.use((error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  res.status(500).json({ message });
});
