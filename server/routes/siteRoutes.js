import { Router } from 'express';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

const assertAdminKey = (req, res, next) => {
  const adminKey = req.header('x-admin-key');
  if (!adminKey || adminKey !== env.adminKey) {
    res.status(401).json({ message: 'Unauthorized admin request' });
    return;
  }
  next();
};

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT content_key, content_value FROM site_content WHERE content_key IN ($1, $2)',
      ['siteData', 'carousel']
    );
    const content = Object.fromEntries(result.rows.map((row) => [row.content_key, row.content_value]));
    res.json({
      ...(content.siteData || {}),
      slides: Array.isArray(content.carousel) ? content.carousel : [],
    });
  } catch (error) {
    next(error);
  }
});

router.put('/', assertAdminKey, async (req, res, next) => {
  try {
    const { slides, ...siteData } = req.body || {};
    if (Object.keys(siteData).length > 0) {
      await query(
        `INSERT INTO site_content (content_key, content_value)
         VALUES ($1, $2)
         ON CONFLICT (content_key)
         DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP`,
        ['siteData', siteData]
      );
    }
    if (Array.isArray(slides)) {
      await query(
        `INSERT INTO site_content (content_key, content_value)
         VALUES ($1, $2)
         ON CONFLICT (content_key)
         DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP`,
        ['carousel', slides]
      );
    }
    const currentSiteData = Object.keys(siteData).length > 0
      ? siteData
      : (await query('SELECT content_value FROM site_content WHERE content_key = $1', ['siteData'])).rows[0]?.content_value || {};
    res.json({ ...currentSiteData, slides: Array.isArray(slides) ? slides : [] });
  } catch (error) {
    next(error);
  }
});

export default router;
