import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

function createTempPaths() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-portfolio-test-'));
  return {
    tempRoot,
    dbPath: path.join(tempRoot, 'test.db'),
    uploadDir: path.join(tempRoot, 'uploads'),
  };
}

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  capture(res) {
    const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const raw of setCookie) {
      const [pair] = raw.split(';');
      const idx = pair.indexOf('=');
      if (idx > 0) {
        const name = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        if (!value) {
          this.cookies.delete(name);
        } else {
          this.cookies.set(name, value);
        }
      }
    }
  }

  header() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }
}

async function apiFetch(baseUrl, jar, pathname, options = {}) {
  const headers = new Headers(options.headers || {});
  const cookieHeader = jar?.header();
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  const res = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers,
  });
  jar?.capture(res);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, headers: res.headers, json, text };
}

test('Two-tier backend API end-to-end suite', async (t) => {
  const { tempRoot, dbPath, uploadDir } = createTempPaths();
  const { app, db } = createApp({
    dbPath,
    uploadDir,
    sessionSecret: 'test-secret-key-at-least-32-chars-long',
    corsOrigin: 'http://localhost:5173',
  });

  const server = await new Promise((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  const jar = new CookieJar();

  await t.test('GET /api/health reports healthy backend and sqlite tier', async () => {
    const res = await apiFetch(baseUrl, jar, '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.json.ok, true);
    assert.equal(res.json.tier, 'backend');
    assert.equal(res.json.database, 'sqlite');
  });

  await t.test('GET /api/portfolio returns seeded siteMedia and 4 projects', async () => {
    const res = await apiFetch(baseUrl, jar, '/api/portfolio');
    assert.equal(res.status, 200);
    assert.equal(res.json.projects.length, 4);
    assert.equal(res.json.projects[0].id, 'happy-tots-3d-rhymes');
    assert.deepEqual(res.json.siteMedia, {
      profilePhoto: '',
      showreelUrl: '',
      featuredVideoUrl: '',
    });
  });

  await t.test('Protected routes reject unauthenticated clients with 401', async () => {
    const res = await apiFetch(baseUrl, jar, '/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized Project' }),
    });
    assert.equal(res.status, 401);

    const msgRes = await apiFetch(baseUrl, jar, '/api/messages');
    assert.equal(msgRes.status, 401);
  });

  await t.test('Admin setup, duplicate setup prevention, logout, login, and credential update', async () => {
    const meBefore = await apiFetch(baseUrl, jar, '/api/auth/me');
    assert.equal(meBefore.json.initialized, false);
    assert.equal(meBefore.json.authenticated, false);

    const setup = await apiFetch(baseUrl, jar, '/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Faizmaster', password: 'secret-password-1' }),
    });
    assert.equal(setup.status, 201);
    assert.equal(setup.json.user.username, 'Faizmaster');

    const dupSetup = await apiFetch(baseUrl, jar, '/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Another', password: 'secret-password-2' }),
    });
    assert.equal(dupSetup.status, 409);

    const logout = await apiFetch(baseUrl, jar, '/api/auth/logout', { method: 'POST' });
    assert.equal(logout.status, 200);

    const meAfterLogout = await apiFetch(baseUrl, jar, '/api/auth/me');
    assert.equal(meAfterLogout.json.initialized, true);
    assert.equal(meAfterLogout.json.authenticated, false);

    const badLogin = await apiFetch(baseUrl, jar, '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Faizmaster', password: 'wrong' }),
    });
    assert.equal(badLogin.status, 401);

    const login = await apiFetch(baseUrl, jar, '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'faizmaster', password: 'secret-password-1' }),
    });
    assert.equal(login.status, 200);
    assert.equal(login.json.user.username, 'Faizmaster');

    const updateCreds = await apiFetch(baseUrl, jar, '/api/auth/credentials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: 'secret-password-1',
        username: 'FaizAdmin',
        newPassword: 'secret-password-2',
      }),
    });
    assert.equal(updateCreds.status, 200);
    assert.equal(updateCreds.json.user.username, 'FaizAdmin');
  });

  await t.test('Authenticated project CRUD, reorder, featured toggle, and validation', async () => {
    const badDrive = await apiFetch(baseUrl, jar, '/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Bad Drive',
        driveLink: 'https://example.com/not-drive',
      }),
    });
    assert.equal(badDrive.status, 400);

    const created = await apiFetch(baseUrl, jar, '/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'SQB AI Ad Film',
        category: 'Branding',
        shortDescription: 'Brand launch reel created with AI tools.',
        role: 'AI Artist',
        client: 'SQB',
        toolsUsed: ['Seedance 2.5', 'After Effects'],
        date: '2026',
        featured: false,
      }),
    });
    assert.equal(created.status, 201);
    assert.equal(created.json.projects.length, 5);
    assert.equal(created.json.projects[0].title, 'SQB AI Ad Film');
    const createdId = created.json.project.id;

    const toggled = await apiFetch(baseUrl, jar, `/api/projects/${createdId}/featured`, {
      method: 'PATCH',
    });
    assert.equal(toggled.status, 200);
    assert.equal(toggled.json.project.featured, true);

    const updated = await apiFetch(baseUrl, jar, `/api/projects/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'SQB AI Ad Film v2',
        category: 'Branding',
        shortDescription: 'Updated description',
        toolsUsed: ['Kling', 'Premiere Pro'],
        featured: true,
      }),
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.json.project.title, 'SQB AI Ad Film v2');

    const ids = updated.json.projects.map((p) => p.id);
    const reversed = [...ids].reverse();
    const reordered = await apiFetch(baseUrl, jar, '/api/projects/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reversed }),
    });
    assert.equal(reordered.status, 200);
    assert.deepEqual(
      reordered.json.projects.map((p) => p.id),
      reversed
    );

    const deleted = await apiFetch(baseUrl, jar, `/api/projects/${createdId}`, {
      method: 'DELETE',
    });
    assert.equal(deleted.status, 200);
    assert.equal(deleted.json.projects.length, 4);
  });

  await t.test('Site media update and image upload serve real files from /uploads', async () => {
    const pngBytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    const formData = new FormData();
    formData.append('image', new Blob([pngBytes], { type: 'image/png' }), 'banner.png');

    const uploadRes = await apiFetch(baseUrl, jar, '/api/uploads', {
      method: 'POST',
      body: formData,
    });
    assert.equal(uploadRes.status, 201);
    assert.ok(uploadRes.json.url.startsWith('/uploads/'));

    const mediaFetch = await fetch(`${baseUrl}${uploadRes.json.url}`);
    assert.equal(mediaFetch.status, 200);
    const downloaded = Buffer.from(await mediaFetch.arrayBuffer());
    assert.equal(downloaded.length, pngBytes.length);

    const updateMedia = await apiFetch(baseUrl, jar, '/api/site-media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profilePhoto: uploadRes.json.url,
        showreelUrl: 'https://example.com/reel.mp4',
        featuredVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    });
    assert.equal(updateMedia.status, 200);
    assert.equal(updateMedia.json.siteMedia.profilePhoto, uploadRes.json.url);
  });

  await t.test('Contact form submission and admin inbox management', async () => {
    const publicJar = new CookieJar();
    const invalid = await apiFetch(baseUrl, publicJar, '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'bad', message: 'short' }),
    });
    assert.equal(invalid.status, 400);

    const submit = await apiFetch(baseUrl, publicJar, '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Mehta',
        email: 'aarav@example.com',
        projectType: '3D Cartoon',
        message: 'Looking to collaborate on a 3D animated nursery rhyme series.',
      }),
    });
    assert.equal(submit.status, 201);
    assert.equal(submit.json.ok, true);

    const inbox = await apiFetch(baseUrl, jar, '/api/messages');
    assert.equal(inbox.status, 200);
    assert.equal(inbox.json.messages.length, 1);
    assert.equal(inbox.json.unreadCount, 1);

    const msgId = inbox.json.messages[0].id;
    const markRead = await apiFetch(baseUrl, jar, `/api/messages/${msgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });
    assert.equal(markRead.status, 200);
    assert.equal(markRead.json.message.isRead, true);

    const delMsg = await apiFetch(baseUrl, jar, `/api/messages/${msgId}`, {
      method: 'DELETE',
    });
    assert.equal(delMsg.status, 200);
  });
});
