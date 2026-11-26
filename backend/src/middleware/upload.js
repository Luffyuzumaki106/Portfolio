import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function createImageUploadMiddleware(uploadDir) {
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = MIME_TO_EXT[file.mimetype] || '.bin';
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, unique);
    },
  });

  const uploader = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!MIME_TO_EXT[file.mimetype]) {
        cb(new Error('Invalid image format. Only JPG, PNG, and WebP are allowed.'));
        return;
      }
      cb(null, true);
    },
  });

  return (req, res, next) => {
    uploader.single('image')(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image file exceeds the 5 MB upload limit.' });
      }
      return res.status(400).json({ error: err.message || 'Could not process uploaded image.' });
    });
  };
}
