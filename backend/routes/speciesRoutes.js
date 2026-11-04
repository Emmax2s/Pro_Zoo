import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireSuperAdmin } from './adminRoutes.js';
import { translateSpecies } from '../services/translationService.js';

const router = Router();

// Translation proxy endpoint
router.all('/translate', async (req, res) => {
  try {
    const text = (req.body?.text || req.query?.text || req.query?.q || '').trim();
    const sl = req.body?.from || req.query?.sl || req.query?.from || 'es';
    const tl = req.body?.to || req.query?.tl || req.query?.to || 'en';

    if (!text || sl === tl) {
      return res.json({ translated: text });
    }

    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const gtxRes = await fetch(gtxUrl);
    if (gtxRes.ok) {
      const gtxData = await gtxRes.json();
      if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
        const translated = gtxData[0].map((item) => item[0]).join('');
        if (translated && translated.trim()) {
          return res.json({ translated });
        }
      }
    }
    return res.json({ translated: text });
  } catch (err) {
    return res.json({ translated: req.body?.text || req.query?.text || '', error: err.message });
  }
});

const normalizeMedia = (value, limit) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.length <= 2000).slice(0, limit)
    : [];

const getAssignedEnclosures = (value) =>
  String(value || '').split(',').map((id) => id.trim()).filter(Boolean);

const requireSpeciesMutationPermission = async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT role, enclosure_id, is_active FROM admin_users WHERE id = $1',
      [req.user?.id]
    );
    const user = userResult.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'La sesión ya no es válida.' });
    }
    if (user.role === 'superadmin') {
      req.user.role = user.role;
      return next();
    }
    if (user.role !== 'enclosure_admin') {
      return res.status(403).json({ message: 'No tienes permisos para modificar especies.' });
    }

    const assigned = getAssignedEnclosures(user.enclosure_id);
    if (req.method === 'POST') {
      if (!req.body.enclosureId || !assigned.includes(String(req.body.enclosureId))) {
        return res.status(403).json({ message: 'La especie debe pertenecer a un recinto asignado.' });
      }
    } else {
      const current = await query('SELECT enclosure_id FROM species WHERE id = $1', [req.params.id]);
      if (!current.rows[0]) return res.status(404).json({ message: 'Species not found' });
      if (!assigned.includes(String(current.rows[0].enclosure_id))) {
        return res.status(403).json({ message: 'No tienes acceso a este recinto.' });
      }
      if (
        req.body.enclosureId !== undefined &&
        String(req.body.enclosureId) !== String(current.rows[0].enclosure_id)
      ) {
        return res.status(403).json({ message: 'Solo un superadministrador puede reasignar recintos.' });
      }
      if (req.body.isVisibleToPublic !== undefined) {
        return res.status(403).json({ message: 'Solo un superadministrador puede cambiar la visibilidad pública.' });
      }
    }
    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to format species response
const formatSpeciesResponse = (row) => ({
  id: row.id.toString(),
  slug: row.slug,
  name: row.name,
  species: row.species_name,
  habitat: row.habitat,
  category: row.category,
  enclosureId: row.enclosure_id,
  isVisibleToPublic: row.is_visible_to_public !== false,
  imageUrl: row.image_url,
  mediaImages: Array.isArray(row.media_images) ? row.media_images : [],
  mediaVideos: Array.isArray(row.media_videos) ? row.media_videos : [],
  lsmVideoUrl: row.lsm_video_url || '',
  conservation: row.conservation_status,
  conservationIucn: row.conservation_iucn,
  description: row.description,
  diet: row.diet,
  lifespan: row.lifespan,
  activity: row.activity,
  size: row.size,
  weight: row.weight,
  distribution: row.distribution,
  audioDescriptionUrl: row.audio_description_url,
  scientificClassification: row.scientific_classification,
  threats: row.threats,
  ecosystemRole: row.ecosystem_role,
  updatedAt: row.updated_at,
});

// GET all species
router.get('/manage/all', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM species ORDER BY created_at DESC');
    res.json(result.rows.map(formatSpeciesResponse));
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM species WHERE is_visible_to_public = TRUE ORDER BY created_at DESC');
    const language = req.query.lang === 'en' ? 'en' : 'es';
    const species = await Promise.all(
      result.rows.map((row) => translateSpecies(formatSpeciesResponse(row), language))
    );
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
      result = await query('SELECT * FROM species WHERE id = $1 AND is_visible_to_public = TRUE', [idOrSlug]);
    } else {
      result = await query('SELECT * FROM species WHERE slug = $1 AND is_visible_to_public = TRUE', [idOrSlug]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Species not found' });
    }

    const language = req.query.lang === 'en' ? 'en' : 'es';
    const species = await translateSpecies(formatSpeciesResponse(result.rows[0]), language);
    res.json(species);
  } catch (error) {
    next(error);
  }
});

// POST create species
router.post('/', verifyToken, requireSpeciesMutationPermission, async (req, res, next) => {
  try {
    const {
      slug,
      name,
      species: speciesName,
      category,
      enclosureId,
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
      audioDescriptionUrl,
      lsmVideoUrl,
      scientificClassification,
      conservationIucn,
      threats,
      ecosystemRole,
      isVisibleToPublic = true,
      mediaImages = [],
      mediaVideos = [],
    } = req.body;

    if (!slug || !name || !speciesName) {
      return res.status(400).json({ message: 'Missing required fields: slug, name, species' });
    }

    const result = await query(
      `INSERT INTO species
       (slug, name, species_name, category, enclosure_id, habitat, image_url, media_images, media_videos, audio_description_url, lsm_video_url, conservation_status, description, diet, lifespan, activity, size, weight, distribution, scientific_classification, conservation_iucn, threats, ecosystem_role, is_visible_to_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING *`,
      [slug, name, speciesName, category, enclosureId, habitat, imageUrl, JSON.stringify(normalizeMedia(mediaImages, 4)), JSON.stringify(normalizeMedia(mediaVideos, 2)), audioDescriptionUrl, lsmVideoUrl, conservation, description, diet, lifespan, activity, size, weight, distribution, scientificClassification, conservationIucn, threats, ecosystemRole, isVisibleToPublic]
    );

    const newSpecies = formatSpeciesResponse(result.rows[0]);
    res.status(201).json(newSpecies);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Species slug already exists' });
    }
    next(error);
  }
});

// PUT update species
router.put('/:id', verifyToken, requireSpeciesMutationPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      slug,
      name,
      species: speciesName,
      category,
      enclosureId,
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
      audioDescriptionUrl,
      lsmVideoUrl,
      scientificClassification,
      conservationIucn,
      threats,
      ecosystemRole,
      isVisibleToPublic,
      mediaImages = [],
      mediaVideos = [],
    } = req.body;

    const result = await query(
      `UPDATE species
       SET slug = COALESCE($1, slug),
           name = COALESCE($2, name),
           species_name = COALESCE($3, species_name),
           category = COALESCE($4, category),
           enclosure_id = COALESCE($5, enclosure_id),
           habitat = COALESCE($6, habitat),
           image_url = COALESCE($7, image_url),
           media_images = COALESCE($8, media_images),
           media_videos = COALESCE($9, media_videos),
           audio_description_url = COALESCE($10, audio_description_url),
           lsm_video_url = COALESCE($11, lsm_video_url),
           conservation_status = COALESCE($12, conservation_status),
           description = COALESCE($13, description),
           diet = COALESCE($14, diet),
           lifespan = COALESCE($15, lifespan),
           activity = COALESCE($16, activity),
           size = COALESCE($17, size),
           weight = COALESCE($18, weight),
           distribution = COALESCE($19, distribution),
           scientific_classification = COALESCE($20, scientific_classification),
           conservation_iucn = COALESCE($21, conservation_iucn),
           threats = COALESCE($22, threats),
           ecosystem_role = COALESCE($23, ecosystem_role),
           is_visible_to_public = COALESCE($24, is_visible_to_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $25
       RETURNING *`,
      [slug, name, speciesName, category, enclosureId, habitat, imageUrl, JSON.stringify(normalizeMedia(mediaImages, 4)), JSON.stringify(normalizeMedia(mediaVideos, 2)), audioDescriptionUrl, lsmVideoUrl, conservation, description, diet, lifespan, activity, size, weight, distribution, scientificClassification, conservationIucn, threats, ecosystemRole, isVisibleToPublic, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Species not found' });
    }

    const updatedSpecies = formatSpeciesResponse(result.rows[0]);
    res.json(updatedSpecies);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Species slug already exists' });
    }
    next(error);
  }
});

// DELETE species
router.delete('/:id', verifyToken, requireSpeciesMutationPermission, async (req, res, next) => {
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
