import crypto from 'node:crypto';
import { Router } from 'express';
import { listProjects, mapProjectRow, withTransaction } from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { sanitizeProjectInput } from '../utils/validation.js';

export function createProjectsRouter(db, config) {
  const router = Router();
  const authGuard = requireAdmin(db, config);

  router.get('/', (_req, res) => {
    res.json({ projects: listProjects(db) });
  });

  router.post('/', authGuard, (req, res) => {
    const parsed = sanitizeProjectInput(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const project = { ...parsed.data };
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(project.id);
    if (existing) {
      project.id = `${project.id}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const now = new Date().toISOString();
    withTransaction(db, () => {
      db.prepare('UPDATE projects SET sort_order = sort_order + 1').run();
      db.prepare(
        `INSERT INTO projects (
          id, title, category, short_description, role, client, tools_used, date,
          video_link, drive_link, external_link, banner_image, banner_gradient,
          featured, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
      ).run(
        project.id,
        project.title,
        project.category,
        project.shortDescription,
        project.role,
        project.client,
        JSON.stringify(project.toolsUsed),
        project.date,
        project.videoLink,
        project.driveLink,
        project.externalLink,
        project.bannerImage,
        project.bannerGradient,
        project.featured ? 1 : 0,
        now,
        now
      );
    });

    const createdRow = db.prepare('SELECT * FROM projects WHERE id = ?').get(project.id);
    return res.status(201).json({
      project: mapProjectRow(createdRow),
      projects: listProjects(db),
    });
  });

  router.put('/reorder', authGuard, (req, res) => {
    const orderedIds = req.body?.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string')) {
      return res.status(400).json({ error: 'orderedIds must be an array of project IDs.' });
    }

    withTransaction(db, () => {
      const updateOrder = db.prepare('UPDATE projects SET sort_order = ?, updated_at = ? WHERE id = ?');
      const now = new Date().toISOString();
      orderedIds.forEach((id, index) => {
        updateOrder.run(index, now, id);
      });
    });

    return res.json({ projects: listProjects(db) });
  });

  router.put('/:id', authGuard, (req, res) => {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const parsed = sanitizeProjectInput({ ...req.body, id }, id);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const project = parsed.data;
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE projects
       SET title = ?, category = ?, short_description = ?, role = ?, client = ?,
           tools_used = ?, date = ?, video_link = ?, drive_link = ?, external_link = ?,
           banner_image = ?, banner_gradient = ?, featured = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      project.title,
      project.category,
      project.shortDescription,
      project.role,
      project.client,
      JSON.stringify(project.toolsUsed),
      project.date,
      project.videoLink,
      project.driveLink,
      project.externalLink,
      project.bannerImage,
      project.bannerGradient,
      project.featured ? 1 : 0,
      now,
      id
    );

    const updatedRow = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return res.json({
      project: mapProjectRow(updatedRow),
      projects: listProjects(db),
    });
  });

  router.patch('/:id/featured', authGuard, (req, res) => {
    const { id } = req.params;
    const existing = db.prepare('SELECT featured FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const nextFeatured =
      typeof req.body?.featured === 'boolean'
        ? req.body.featured
          ? 1
          : 0
        : existing.featured
          ? 0
          : 1;

    db.prepare('UPDATE projects SET featured = ?, updated_at = ? WHERE id = ?').run(
      nextFeatured,
      new Date().toISOString(),
      id
    );

    const updatedRow = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return res.json({
      project: mapProjectRow(updatedRow),
      projects: listProjects(db),
    });
  });

  router.delete('/:id', authGuard, (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ ok: true, projects: listProjects(db) });
  });

  return router;
}
