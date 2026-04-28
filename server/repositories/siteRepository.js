import { pool } from '../config/db.js';

export async function getSiteData() {
  const [rows] = await pool.query(
    'SELECT content_value FROM site_content WHERE content_key = ? LIMIT 1',
    ['siteData']
  );

  if (!rows.length) {
    return null;
  }

  return rows[0].content_value;
}

export async function upsertSiteData(siteData) {
  await pool.query(
    `INSERT INTO site_content (content_key, content_value)
     VALUES ('siteData', ?)
     ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)`,
    [JSON.stringify(siteData)]
  );
}
