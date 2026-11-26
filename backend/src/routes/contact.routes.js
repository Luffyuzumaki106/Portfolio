import crypto from 'node:crypto';
import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { sanitizeContactInput } from '../utils/validation.js';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 15;

function mapMessageRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    projectType: row.project_type,
    message: row.message,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export function createContactRouter(db, config) {
  const router = Router();
  const authGuard = requireAdmin(db, config);
  const recentSubmissions = new Map();

  router.post('/contact', (req, res) => {
    const ip = req.ip || 'unknown';
    const nowMs = Date.now();
    const recent = (recentSubmissions.get(ip) || []).filter((ts) => nowMs - ts < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX_REQUESTS) {
      return res
        .status(429)
        .json({ error: 'Too many messages sent recently. Please try again in a few minutes.' });
    }

    const parsed = sanitizeContactInput(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    recent.push(nowMs);
    recentSubmissions.set(ip, recent);

    const id = `msg-${nowMs}-${crypto.randomBytes(3).toString('hex')}`;
    const createdAt = new Date(nowMs).toISOString();

    db.prepare(
      `INSERT INTO contact_messages (id, name, email, project_type, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    ).run(
      id,
      parsed.data.name,
      parsed.data.email,
      parsed.data.projectType,
      parsed.data.message,
      createdAt
    );

    return res.status(201).json({
      ok: true,
      id,
      message: 'Thanks for reaching out! Your message has been delivered.',
    });
  });

  router.get('/messages', authGuard, (_req, res) => {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    const messages = rows.map(mapMessageRow);
    const unreadCount = messages.filter((m) => !m.isRead).length;
    res.json({ messages, unreadCount });
  });

  router.patch('/messages/:id', authGuard, (req, res) => {
    const { id } = req.params;
    const existing = db.prepare('SELECT is_read FROM contact_messages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    const nextRead =
      typeof req.body?.isRead === 'boolean'
        ? req.body.isRead
          ? 1
          : 0
        : existing.is_read
          ? 0
          : 1;

    db.prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?').run(nextRead, id);
    const updated = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
    return res.json({ message: mapMessageRow(updated) });
  });

  router.delete('/messages/:id', authGuard, (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    return res.json({ ok: true });
  });

  return router;
}
