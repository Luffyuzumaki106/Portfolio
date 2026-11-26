import { Router } from 'express';
import { getPortfolioSnapshot, withTransaction } from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { sanitizeProjectInput, sanitizeSiteMediaInput } from '../utils/validation.js';

export function createPortfolioRouter(db, config) {
  const router = Router();
  const authGuard = requireAdmin(db, config);

  router.get('/portfolio', (_req, res) => {
    res.json(getPortfolioSnapshot(db));
  });

  router.put('/site-media', authGuard, (req, res) => {
    const parsed = sanitizeSiteMediaInput(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT OR REPLACE INTO site_media (id, profile_photo, showreel_url, featured_video_url, updated_at)
       VALUES (1, ?, ?, ?, ?)`
    ).run(
      parsed.data.profilePhoto,
      parsed.data.showreelUrl,
      parsed.data.featuredVideoUrl,
      now
    );

    return res.json({ siteMedia: parsed.data });
  });

  router.post('/portfolio/import', authGuard, (req, res) => {
    const payload = req.body;
    if (!payload || !Array.isArray(payload.projects)) {
      return res.status(400).json({ error: 'Invalid JSON format: missing "projects" array.' });
    }

    const mediaCheck = sanitizeSiteMediaInput(payload.siteMedia || {});
    if (mediaCheck.error) {
      return res.status(400).json({ error: mediaCheck.error });
    }

    const sanitizedProjects = [];
    const seenIds = new Set();
    for (let i = 0; i < payload.projects.length; i += 1) {
      const check = sanitizeProjectInput(payload.projects[i], `proj-${Date.now()}-${i}`);
      if (check.error) {
        return res.status(400).json({ error: `Project #${i + 1}: ${check.error}` });
      }
      let finalId = check.data.id;
      if (seenIds.has(finalId)) {
        finalId = `${finalId}-${i}`;
      }
      seenIds.add(finalId);
      sanitizedProjects.push({ ...check.data, id: finalId });
    }

    const now = new Date().toISOString();
    withTransaction(db, () => {
      db.prepare(
        `INSERT OR REPLACE INTO site_media (id, profile_photo, showreel_url, featured_video_url, updated_at)
         VALUES (1, ?, ?, ?, ?)`
      ).run(
        mediaCheck.data.profilePhoto,
        mediaCheck.data.showreelUrl,
        mediaCheck.data.featuredVideoUrl,
        now
      );

      db.prepare('DELETE FROM projects').run();

      const insertStmt = db.prepare(
        `INSERT INTO projects (
          id, title, category, short_description, role, client, tools_used, date,
          video_link, drive_link, external_link, banner_image, banner_gradient,
          featured, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      sanitizedProjects.forEach((project, idx) => {
        insertStmt.run(
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
          idx,
          now,
          now
        );
      });
    });

    return res.json(getPortfolioSnapshot(db));
  });

  return router;
}
