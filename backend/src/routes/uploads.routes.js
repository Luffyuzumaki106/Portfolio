import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { createImageUploadMiddleware } from '../middleware/upload.js';

export function createUploadsRouter(db, config) {
  const router = Router();
  const authGuard = requireAdmin(db, config);
  const uploadImage = createImageUploadMiddleware(config.uploadDir);

  router.post('/', authGuard, uploadImage, (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    return res.status(201).json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });

  return router;
}
