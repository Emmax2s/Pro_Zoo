import { Router } from 'express';
import { env } from '../config/env.js';
import { getSiteData, upsertSiteData } from '../repositories/siteRepository.js';

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
    const data = await getSiteData();
    res.json(data || {});
  } catch (error) {
    next(error);
  }
});

router.put('/', assertAdminKey, async (req, res, next) => {
  try {
    await upsertSiteData(req.body);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
