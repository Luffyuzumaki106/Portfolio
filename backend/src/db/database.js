import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.resolve(__dirname, '../data/seed.json');

function loadSeedData() {
  const raw = fs.readFileSync(seedPath, 'utf8');
  return JSON.parse(raw);
}

export function mapProjectRow(row) {
  let toolsUsed = [];
  try {
    const parsed = JSON.parse(row.tools_used || '[]');
    if (Array.isArray(parsed)) toolsUsed = parsed;
  } catch {
    toolsUsed = [];
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    shortDescription: row.short_description,
    role: row.role,
    client: row.client,
    toolsUsed,
    date: row.date,
    videoLink: row.video_link,
    driveLink: row.drive_link,
    externalLink: row.external_link,
    bannerImage: row.banner_image,
    bannerGradient: row.banner_gradient,
    featured: Boolean(row.featured),
  };
}

export function withTransaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function createDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_media (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      profile_photo TEXT NOT NULL DEFAULT '',
      showreel_url TEXT NOT NULL DEFAULT '',
      featured_video_url TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      client TEXT NOT NULL DEFAULT '',
      tools_used TEXT NOT NULL DEFAULT '[]',
      date TEXT NOT NULL DEFAULT '',
      video_link TEXT NOT NULL DEFAULT '',
      drive_link TEXT NOT NULL DEFAULT '',
      external_link TEXT NOT NULL DEFAULT '',
      banner_image TEXT NOT NULL DEFAULT '',
      banner_gradient TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      project_type TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  const seededRow = db.prepare('SELECT value FROM meta WHERE key = ?').get('seeded');
  if (!seededRow) {
    const seed = loadSeedData();
    const now = new Date().toISOString();

    withTransaction(db, () => {
      db.prepare(
        `INSERT OR REPLACE INTO site_media (id, profile_photo, showreel_url, featured_video_url, updated_at)
         VALUES (1, ?, ?, ?, ?)`
      ).run(
        seed.siteMedia?.profilePhoto || '',
        seed.siteMedia?.showreelUrl || '',
        seed.siteMedia?.featuredVideoUrl || '',
        now
      );

      const insertProject = db.prepare(
        `INSERT INTO projects (
          id, title, category, short_description, role, client, tools_used, date,
          video_link, drive_link, external_link, banner_image, banner_gradient,
          featured, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      (seed.projects || []).forEach((project, idx) => {
        insertProject.run(
          project.id,
          project.title,
          project.category,
          project.shortDescription || '',
          project.role || '',
          project.client || '',
          JSON.stringify(project.toolsUsed || []),
          project.date || '',
          project.videoLink || '',
          project.driveLink || '',
          project.externalLink || '',
          project.bannerImage || '',
          project.bannerGradient || '',
          project.featured ? 1 : 0,
          idx,
          now,
          now
        );
      });

      db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('seeded', '1');
    });
  }

  return db;
}

export function getSiteMedia(db) {
  const row = db
    .prepare('SELECT profile_photo, showreel_url, featured_video_url FROM site_media WHERE id = 1')
    .get();
  if (!row) {
    return { profilePhoto: '', showreelUrl: '', featuredVideoUrl: '' };
  }
  return {
    profilePhoto: row.profile_photo,
    showreelUrl: row.showreel_url,
    featuredVideoUrl: row.featured_video_url,
  };
}

export function listProjects(db) {
  const rows = db
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC')
    .all();
  return rows.map(mapProjectRow);
}

export function getPortfolioSnapshot(db) {
  return {
    siteMedia: getSiteMedia(db),
    projects: listProjects(db),
  };
}
