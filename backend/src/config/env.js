import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

function loadEnvFileIfPresent() {
  const envPath = path.join(backendRoot, '.env');
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // Ignore malformed optional .env file
    }
  }
}

loadEnvFileIfPresent();

function resolveBackendPath(targetPath, fallbackRelative) {
  const raw = targetPath || fallbackRelative;
  return path.isAbsolute(raw) ? raw : path.resolve(backendRoot, raw);
}

function getOrCreateSessionSecret(dataDir) {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16) {
    return process.env.SESSION_SECRET.trim();
  }
  fs.mkdirSync(dataDir, { recursive: true });
  const secretFile = path.join(dataDir, '.session-secret');
  if (fs.existsSync(secretFile)) {
    const existing = fs.readFileSync(secretFile, 'utf8').trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(secretFile, generated, { encoding: 'utf8', mode: 0o600 });
  return generated;
}

export function loadConfig(overrides = {}) {
  const dbPath = resolveBackendPath(
    overrides.dbPath || process.env.DB_PATH,
    './data/portfolio.db'
  );
  const dataDir = path.dirname(dbPath);
  const uploadDir = resolveBackendPath(
    overrides.uploadDir || process.env.UPLOAD_DIR,
    './uploads'
  );
  const frontendDistDir = resolveBackendPath(
    overrides.frontendDistDir || process.env.FRONTEND_DIST_DIR,
    '../frontend/dist'
  );

  const corsOriginRaw = overrides.corsOrigin ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  const corsOrigins = corsOriginRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    port: Number(overrides.port ?? process.env.PORT ?? 5000),
    dbPath,
    uploadDir,
    frontendDistDir,
    corsOrigins,
    sessionSecret: overrides.sessionSecret || getOrCreateSessionSecret(dataDir),
    serveFrontend:
      overrides.serveFrontend ?? String(process.env.SERVE_FRONTEND || '').toLowerCase() === 'true',
    sessionTtlDays: Number(overrides.sessionTtlDays ?? process.env.SESSION_TTL_DAYS ?? 7),
  };
}
