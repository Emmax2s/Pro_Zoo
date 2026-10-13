import { Router } from 'express';
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
    // DB removed: return empty site data placeholder
    res.json({});
  } catch (error) {
    next(error);
  }
});

router.put('/', assertAdminKey, async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Site update not implemented (DB removed)' });
  } catch (error) {
    next(error);
  }
});

export default router;
