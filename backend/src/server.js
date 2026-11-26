import process from 'node:process';
import { createApp } from './app.js';

const { app, db, config } = createApp();

const server = app.listen(config.port, () => {
  console.log(`[backend] API listening on http://localhost:${config.port}`);
  console.log(`[backend] SQLite database: ${config.dbPath}`);
  console.log(`[backend] Uploads directory: ${config.uploadDir}`);
});

function shutdown(signal) {
  console.log(`[backend] Received ${signal}, shutting down...`);
  server.close(() => {
    try {
      db.close();
    } catch {
      // Ignore close error
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
