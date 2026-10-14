import { Router } from 'express';
import { verifyToken } from './adminRoutes.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    // DB removed: return empty site data placeholder
    res.json({});
  } catch (error) {
    next(error);
  }
});

router.put('/', verifyToken, async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Site update not implemented (DB removed)' });
  } catch (error) {
    next(error);
  }
});

export default router;
