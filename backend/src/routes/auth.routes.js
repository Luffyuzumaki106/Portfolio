import { Router } from 'express';
import { withTransaction } from '../db/database.js';
import {
  clearSessionCookie,
  createSession,
  extractSessionToken,
  getAuthenticatedUser,
  requireAdmin,
  setSessionCookie,
} from '../middleware/auth.js';
import {
  createPasswordRecord,
  hashSessionToken,
  verifyPassword,
} from '../utils/password.js';

export function createAuthRouter(db, config) {
  const router = Router();

  router.get('/me', (req, res) => {
    const countRow = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get();
    const initialized = Number(countRow?.count || 0) > 0;
    const user = getAuthenticatedUser(req, db, config);
    res.json({
      initialized,
      authenticated: Boolean(user),
      user: user ? { id: user.id, username: user.username } : null,
    });
  });

  router.post('/setup', (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (username.length < 2 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be between 2 and 50 characters.' });
    }
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { salt, passwordHash } = createPasswordRecord(password);
    const now = new Date().toISOString();

    try {
      const user = withTransaction(db, () => {
        const countRow = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get();
        if (Number(countRow?.count || 0) > 0) {
          const err = new Error('Admin account is already initialized.');
          err.status = 409;
          throw err;
        }

        const result = db
          .prepare(
            `INSERT INTO admin_users (username, password_hash, salt, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`
          )
          .run(username, passwordHash, salt, now, now);

        return {
          id: Number(result.lastInsertRowid),
          username,
        };
      });

      const token = createSession(db, user.id, config);
      setSessionCookie(res, req, token, config);
      return res.status(201).json({ user });
    } catch (err) {
      if (err.status === 409) {
        return res.status(409).json({ error: err.message });
      }
      throw err;
    }
  });

  router.post('/login', (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const row = db
      .prepare('SELECT id, username, password_hash, salt FROM admin_users WHERE LOWER(username) = LOWER(?)')
      .get(username);

    if (!row || !verifyPassword(password, row.salt, row.password_hash)) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const token = createSession(db, row.id, config);
    setSessionCookie(res, req, token, config);
    return res.json({
      user: { id: row.id, username: row.username },
    });
  });

  router.post('/logout', (req, res) => {
    const token = extractSessionToken(req);
    if (token) {
      const tokenHash = hashSessionToken(token, config.sessionSecret);
      db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
    }
    clearSessionCookie(res);
    return res.json({ ok: true });
  });

  router.put('/credentials', requireAdmin(db, config), (req, res) => {
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required.' });
    }
    if (newUsername.length < 2 || newUsername.length > 50) {
      return res.status(400).json({ error: 'Username must be between 2 and 50 characters.' });
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const existing = db
      .prepare('SELECT id, password_hash, salt FROM admin_users WHERE id = ?')
      .get(req.adminUser.id);

    if (!existing || !verifyPassword(currentPassword, existing.salt, existing.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const { salt, passwordHash } = createPasswordRecord(newPassword);
    const now = new Date().toISOString();

    withTransaction(db, () => {
      db.prepare(
        `UPDATE admin_users
         SET username = ?, password_hash = ?, salt = ?, updated_at = ?
         WHERE id = ?`
      ).run(newUsername, passwordHash, salt, now, req.adminUser.id);

      db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').run(req.adminUser.id);
    });

    const token = createSession(db, req.adminUser.id, config);
    setSessionCookie(res, req, token, config);

    return res.json({
      user: { id: req.adminUser.id, username: newUsername },
    });
  });

  return router;
}
