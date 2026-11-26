import { Router } from 'express';

export function createHealthRouter(db) {
  const router = Router();

  router.get('/health', (_req, res) => {
    const row = db.prepare('SELECT 1 AS ok').get();
    res.json({
      ok: Boolean(row?.ok),
      tier: 'backend',
      database: 'sqlite',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
