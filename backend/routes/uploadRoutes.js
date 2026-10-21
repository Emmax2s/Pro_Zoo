import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { verifyToken } from './adminRoutes.js';

const router = Router();
const uploadsDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
  ['video/ogg', 'ogv'],
  ['application/pdf', 'pdf'],
]);

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { data, filename } = req.body;
    if (typeof data !== 'string' || !data.startsWith('data:')) {
      return res.status(400).json({ message: 'Se requiere un archivo válido.' });
    }

    const match = data.match(/^data:((?:image|video|application)\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);
    const extension = match && allowedTypes.get(match[1].toLowerCase());
    if (!match || !extension) {
      return res.status(400).json({ message: 'Formato no permitido. Usa JPG, PNG, WEBP, MP4, WEBM, OGG o PDF.' });
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(413).json({ message: 'El archivo no puede superar 25 MB.' });
    }

    await fs.mkdir(uploadsDirectory, { recursive: true });
    const safeName = path.basename(typeof filename === 'string' ? filename : 'image')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(0, 80);
    const storedName = `${crypto.randomUUID()}-${safeName || 'image'}.${extension}`;
    await fs.writeFile(path.join(uploadsDirectory, storedName), buffer);

    const origin = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({ url: `${origin}/uploads/${encodeURIComponent(storedName)}` });
  } catch (error) {
    next(error);
  }
});

export default router;
