import { Router } from 'express';
import {
  deleteSpecies,
  getAllSpecies,
  getSpeciesByIdOrSlug,
  upsertSpecies,
} from '../repositories/speciesRepository.js';
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

router.get('/', async (req, res, next) => {
  try {
    const lang = req.query.lang === 'en' ? 'en' : 'es';
    const species = await getAllSpecies(lang);
    res.json(species);
  } catch (error) {
    next(error);
  }
});

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const lang = req.query.lang === 'en' ? 'en' : 'es';
    const species = await getSpeciesByIdOrSlug(req.params.idOrSlug, lang);
    if (!species) {
      res.status(404).json({ message: 'Species not found' });
      return;
    }

    res.json(species);
  } catch (error) {
    next(error);
  }
});

router.post('/', assertAdminKey, async (req, res, next) => {
  try {
    await upsertSpecies(req.body);
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', assertAdminKey, async (req, res, next) => {
  try {
    await upsertSpecies({ ...req.body, id: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', assertAdminKey, async (req, res, next) => {
  try {
    const deleted = await deleteSpecies(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Species not found' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
