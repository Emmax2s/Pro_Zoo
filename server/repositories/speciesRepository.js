import { pool } from '../config/db.js';

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const mapRowsToSpecies = (rows) => {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        slug: row.slug,
        species: row.scientific_name,
        conservation: row.conservation_status,
        activity: row.activity_pattern,
        name: row.name,
        habitat: row.habitat,
        description: row.description,
        diet: row.diet,
        lifespan: row.lifespan,
        size: row.size_text,
        weight: row.weight_text,
        importance: row.importance_text,
        distribution: row.distribution_text,
        threats: parseJsonArray(row.threats_json),
        funFacts: parseJsonArray(row.fun_facts_json),
        mediaUrls: [],
        audioUrl: '',
        imageUrl: '',
      });
    }

    const current = map.get(row.id);
    if (row.media_type && row.media_url) {
      if (row.media_type === 'audio') {
        current.audioUrl = row.media_url;
      } else {
        current.mediaUrls.push({
          type: row.media_type,
          url: row.media_url,
        });
      }
    }
  }

  return Array.from(map.values()).map((item) => {
    const imageMedia = item.mediaUrls.find((media) => media.type === 'image');
    return {
      ...item,
      imageUrl: imageMedia?.url || item.imageUrl || '',
    };
  });
};

export async function getAllSpecies(lang = 'es') {
  const [rows] = await pool.query(
    `SELECT
      s.id,
      s.slug,
      s.scientific_name,
      s.conservation_status,
      s.activity_pattern,
      c.name,
      c.habitat,
      c.description,
      c.diet,
      c.lifespan,
      c.size_text,
      c.weight_text,
      c.importance_text,
      c.distribution_text,
      c.threats_json,
      c.fun_facts_json,
      m.media_type,
      m.url AS media_url,
      m.sort_order
    FROM species s
    LEFT JOIN species_content c ON c.species_id = s.id AND c.lang = :lang
    LEFT JOIN species_media m ON m.species_id = s.id
    ORDER BY s.id ASC, m.sort_order ASC, m.id ASC`,
    { lang }
  );

  return mapRowsToSpecies(rows);
}

export async function getSpeciesByIdOrSlug(idOrSlug, lang = 'es') {
  const [rows] = await pool.query(
    `SELECT
      s.id,
      s.slug,
      s.scientific_name,
      s.conservation_status,
      s.activity_pattern,
      c.name,
      c.habitat,
      c.description,
      c.diet,
      c.lifespan,
      c.size_text,
      c.weight_text,
      c.importance_text,
      c.distribution_text,
      c.threats_json,
      c.fun_facts_json,
      m.media_type,
      m.url AS media_url,
      m.sort_order
    FROM species s
    LEFT JOIN species_content c ON c.species_id = s.id AND c.lang = :lang
    LEFT JOIN species_media m ON m.species_id = s.id
    WHERE s.id = :idOrSlug OR s.slug = :idOrSlug
    ORDER BY m.sort_order ASC, m.id ASC`,
    { idOrSlug, lang }
  );

  const list = mapRowsToSpecies(rows);
  return list[0] || null;
}

export async function upsertSpecies(payload) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO species (id, slug, scientific_name, conservation_status, activity_pattern)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         slug = VALUES(slug),
         scientific_name = VALUES(scientific_name),
         conservation_status = VALUES(conservation_status),
         activity_pattern = VALUES(activity_pattern)`,
      [
        payload.id,
        payload.slug,
        payload.species,
        payload.conservation,
        payload.activity || 'Diurno',
      ]
    );

    await conn.query(
      `INSERT INTO species_content
        (species_id, lang, name, habitat, description, diet, lifespan, size_text, weight_text, importance_text, distribution_text, threats_json, fun_facts_json)
       VALUES (?, 'es', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        habitat = VALUES(habitat),
        description = VALUES(description),
        diet = VALUES(diet),
        lifespan = VALUES(lifespan),
        size_text = VALUES(size_text),
        weight_text = VALUES(weight_text),
        importance_text = VALUES(importance_text),
        distribution_text = VALUES(distribution_text),
        threats_json = VALUES(threats_json),
        fun_facts_json = VALUES(fun_facts_json)`,
      [
        payload.id,
        payload.name,
        payload.habitat,
        payload.description || null,
        payload.diet || null,
        payload.lifespan || null,
        payload.size || null,
        payload.weight || null,
        payload.importance || null,
        payload.distribution || null,
        JSON.stringify(payload.threats || []),
        JSON.stringify(payload.funFacts || []),
      ]
    );

    await conn.query('DELETE FROM species_media WHERE species_id = ?', [payload.id]);

    const mediaList = [
      ...(payload.mediaUrls || []),
      ...(payload.audioUrl ? [{ type: 'audio', url: payload.audioUrl }] : []),
    ];

    for (let i = 0; i < mediaList.length; i += 1) {
      const media = mediaList[i];
      await conn.query(
        `INSERT INTO species_media (species_id, media_type, url, sort_order)
         VALUES (?, ?, ?, ?)`,
        [payload.id, media.type, media.url, i]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function deleteSpecies(id) {
  const [result] = await pool.query('DELETE FROM species WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
