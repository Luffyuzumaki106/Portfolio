import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { loadConfig } from './config/env.js';
import { createDatabase } from './db/database.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createContactRouter } from './routes/contact.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createPortfolioRouter } from './routes/portfolio.routes.js';
import { createProjectsRouter } from './routes/projects.routes.js';
import { createUploadsRouter } from './routes/uploads.routes.js';

export function createApp(overrides = {}) {
  const config = loadConfig(overrides);
  fs.mkdirSync(config.uploadDir, { recursive: true });
  const db = createDatabase(config.dbPath);

  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '6mb' }));
  app.use(cookieParser());

  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      maxAge: '7d',
    })
  );
  app.use('/uploads', (_req, res) => {
    res.status(404).json({ error: 'Uploaded media file not found.' });
  });

  app.use('/api', createHealthRouter(db));
  app.use('/api/auth', createAuthRouter(db, config));
  app.use('/api', createPortfolioRouter(db, config));
  app.use('/api/projects', createProjectsRouter(db, config));
  app.use('/api/uploads', createUploadsRouter(db, config));
  app.use('/api', createContactRouter(db, config));

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (config.serveFrontend && fs.existsSync(config.frontendDistDir)) {
    app.use(express.static(config.frontendDistDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      return res.sendFile(path.join(config.frontendDistDir, 'index.html'));
    });
  }

  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request payload is too large.' });
    }
    const status = Number(err?.status || err?.statusCode || 500);
    if (status >= 500) {
      console.error('[backend error]', err);
    }
    return res.status(status).json({
      error: status >= 500 ? 'Internal server error.' : err.message || 'Request failed.',
    });
  });

  return { app, db, config };
}
