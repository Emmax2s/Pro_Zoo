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

// GET all species
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM species ORDER BY created_at DESC');
    const species = result.rows.map(row => ({
      id: row.id.toString(),
      slug: row.slug,
      name: row.name,
      species: row.species_name,
      habitat: row.habitat,
      imageUrl: row.image_url,
      conservation: row.conservation_status,
      description: row.description,
      diet: row.diet,
      lifespan: row.lifespan,
      activity: row.activity,
      size: row.size,
      weight: row.weight,
      distribution: row.distribution,
    }));
    res.json(species);
  } catch (error) {
    next(error);
  }
});

// GET species by ID or slug
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    
    let result;
    if (isId) {
      result = await query('SELECT * FROM species WHERE id = $1', [idOrSlug]);
    } else {
      result = await query('SELECT * FROM species WHERE slug = $1', [idOrSlug]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Species not found' });
    }

    const row = result.rows[0];
    const species = {
      id: row.id.toString(),
      slug: row.slug,
      name: row.name,
      species: row.species_name,
      habitat: row.habitat,
      imageUrl: row.image_url,
      conservation: row.conservation_status,
      description: row.description,
      diet: row.diet,
      lifespan: row.lifespan,
      activity: row.activity,
      size: row.size,
      weight: row.weight,
      distribution: row.distribution,
    };
    res.json(species);
  } catch (error) {
    next(error);
  }
});

// POST create species
router.post('/', assertAdminKey, async (req, res, next) => {
  try {
    const {
      slug,
      name,
      species: speciesName,
      habitat,
      imageUrl,
      conservation,
      description,
      diet,
      lifespan,
      activity,
      size,
      weight,
      distribution,
    } = req.body;

    if (!slug || !name || !speciesName) {
      return res.status(400).json({ message: 'Missing required fields: slug, name, species' });
    }

    const result = await query(
      `INSERT INTO species 
       (slug, name, species_name, habitat, image_url, conservation_status, description, diet, lifespan, activity, size, weight, distribution)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [slug, name, speciesName, habitat, imageUrl, conservation, description, diet, lifespan, activity, size, weight, distribution]
    );

    const row = result.rows[0];
    const newSpecies = {
      id: row.id.toString(),
      slug: row.slug,
      name: row.name,
      species: row.species_name,
      habitat: row.habitat,
      imageUrl: row.image_url,
      conservation: row.conservation_status,
      description: row.description,
      diet: row.diet,
      lifespan: row.lifespan,
      activity: row.activity,
      size: row.size,
      weight: row.weight,
      distribution: row.distribution,
    };

    res.status(201).json(newSpecies);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Species slug already exists' });
    }
    next(error);
  }
});

// PUT update species
router.put('/:id', assertAdminKey, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      slug,
      name,
      species: speciesName,
      habitat,
      imageUrl,
      conservation,
      description,
      diet,
      lifespan,
      activity,
      size,
      weight,
      distribution,
    } = req.body;

    const result = await query(
      `UPDATE species 
       SET slug = COALESCE($1, slug),
           name = COALESCE($2, name),
           species_name = COALESCE($3, species_name),
           habitat = COALESCE($4, habitat),
           image_url = COALESCE($5, image_url),
           conservation_status = COALESCE($6, conservation_status),
           description = COALESCE($7, description),
           diet = COALESCE($8, diet),
           lifespan = COALESCE($9, lifespan),
           activity = COALESCE($10, activity),
           size = COALESCE($11, size),
           weight = COALESCE($12, weight),
           distribution = COALESCE($13, distribution),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [slug, name, speciesName, habitat, imageUrl, conservation, description, diet, lifespan, activity, size, weight, distribution, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Species not found' });
    }

    const row = result.rows[0];
    const updatedSpecies = {
      id: row.id.toString(),
      slug: row.slug,
      name: row.name,
      species: row.species_name,
      habitat: row.habitat,
      imageUrl: row.image_url,
      conservation: row.conservation_status,
      description: row.description,
      diet: row.diet,
      lifespan: row.lifespan,
      activity: row.activity,
      size: row.size,
      weight: row.weight,
      distribution: row.distribution,
    };

    res.json(updatedSpecies);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Species slug already exists' });
    }
    next(error);
  }
});

// DELETE species
router.delete('/:id', assertAdminKey, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM species WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Species not found' });
    }

    res.json({ message: 'Species deleted successfully', id: result.rows[0].id.toString() });
  } catch (error) {
    next(error);
  }
});

export default router;
