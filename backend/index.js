import { app } from './app.js';
import { env } from './config/env.js';
import { ensureDatabaseSchema } from './config/db.js';

ensureDatabaseSchema()
  .then(() => {
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Pro Zoo API listening on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to initialize database schema:', error);
    process.exitCode = 1;
  });
