import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken } from './adminRoutes.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT content_value FROM site_content WHERE content_key = $1',
      ['home.carousel']
    );
    res.json(result.rows[0]?.content_value ?? null);
  } catch (error) {
    next(error);
  }
});

router.put('/', verifyToken, async (req, res, next) => {
  try {
    const { carousel } = req.body;
    if (!Array.isArray(carousel)) {
      return res.status(400).json({ message: 'El carrusel debe ser una lista de slides.' });
    }

    const validCarousel = carousel.filter((slide) =>
      slide &&
      typeof slide.id === 'string' &&
      (slide.type === 'image' || slide.type === 'video') &&
      typeof slide.src === 'string' &&
      slide.src.trim().length > 0 &&
      typeof slide.alt === 'string' &&
      (slide.type === 'image' || typeof slide.poster === 'string')
    );

    if (validCarousel.length !== carousel.length) {
      return res.status(400).json({ message: 'El carrusel contiene slides inválidos.' });
    }

    const result = await query(
      `INSERT INTO site_content (content_key, content_value, updated_at)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (content_key)
       DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP
       RETURNING content_value`,
      ['home.carousel', JSON.stringify(validCarousel)]
    );
    res.json(result.rows[0].content_value);
  } catch (error) {
    next(error);
  }
});

router.get('/documents', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT content_value FROM site_content WHERE content_key = $1',
      ['site.documents']
    );
    res.json(result.rows[0]?.content_value ?? null);
  } catch (error) {
    next(error);
  }
});

router.put('/documents', verifyToken, async (req, res, next) => {
  try {
    const { documents } = req.body;
    if (!documents || typeof documents !== 'object') {
      return res.status(400).json({ message: 'Se requieren documentos válidos.' });
    }
    const result = await query(
      `INSERT INTO site_content (content_key, content_value, updated_at)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (content_key)
       DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP
       RETURNING content_value`,
      ['site.documents', JSON.stringify(documents)]
    );
    res.json(result.rows[0].content_value);
  } catch (error) {
    next(error);
  }
});

export default router;
