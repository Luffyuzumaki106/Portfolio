import { generateSessionToken, hashSessionToken } from '../utils/password.js';

export const SESSION_COOKIE_NAME = 'fs_admin_session';

export function createSession(db, userId, config) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token, config.sessionSecret);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.sessionTtlDays * 24 * 60 * 60 * 1000);

  db.prepare(
    `INSERT INTO admin_sessions (token_hash, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(tokenHash, userId, expiresAt.toISOString(), now.toISOString());

  return token;
}

export function setSessionCookie(res, req, token, config) {
  const isHttps = Boolean(
    req.secure || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https'
  );
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    secure: process.env.COOKIE_SECURE === 'true' ? true : isHttps,
    path: '/',
    maxAge: config.sessionTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    path: '/',
  });
}

export function extractSessionToken(req) {
  if (req.cookies && typeof req.cookies[SESSION_COOKIE_NAME] === 'string') {
    return req.cookies[SESSION_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
}

export function getAuthenticatedUser(req, db, config) {
  const token = extractSessionToken(req);
  if (!token) return null;

  const tokenHash = hashSessionToken(token, config.sessionSecret);
  const row = db
    .prepare(
      `SELECT s.token_hash, s.expires_at, u.id AS user_id, u.username
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .get(tokenHash);

  if (!row) return null;

  if (Date.parse(row.expires_at) <= Date.now()) {
    db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
    return null;
  }

  return {
    id: row.user_id,
    username: row.username,
    tokenHash,
  };
}

export function requireAdmin(db, config) {
  return (req, res, next) => {
    const user = getAuthenticatedUser(req, db, config);
    if (!user) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }
    req.adminUser = user;
    return next();
  };
}
