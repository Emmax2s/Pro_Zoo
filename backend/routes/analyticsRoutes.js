import { Router } from 'express';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import crypto from 'crypto';

const router = Router();

const assertAdminKey = (req, res, next) => {
  const adminKey = req.header('x-admin-key');
  if (!adminKey || adminKey !== env.adminKey) {
    res.status(401).json({ message: 'Unauthorized admin request' });
    return;
  }
  next();
};

// POST register a species visit
router.post('/:speciesId/visit', async (req, res, next) => {
  try {
    const { speciesId } = req.params;
    const {
      visitorId,
      language = 'es',
      durationSeconds = 0,
      accessedVia = 'direct',
    } = req.body;

    // Hash IP and user agent for privacy
    const ipHash = crypto
      .createHash('sha256')
      .update((req.ip || 'unknown') + process.env.JWT_SECRET)
      .digest('hex');

    const userAgentHash = crypto
      .createHash('sha256')
      .update((req.header('user-agent') || 'unknown') + process.env.JWT_SECRET)
      .digest('hex');

    await query(
      `INSERT INTO species_visits
       (species_id, visitor_id, visitor_language, duration_seconds, accessed_via, ip_hash, user_agent_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [speciesId, visitorId, language, durationSeconds, accessedVia, ipHash, userAgentHash]
    );

    res.status(201).json({ message: 'Visit recorded successfully' });
  } catch (error) {
    next(error);
  }
});

// GET analytics for a species
router.get('/:speciesId/analytics', assertAdminKey, async (req, res, next) => {
  try {
    const { speciesId } = req.params;

    // Check if species exists
    const speciesResult = await query('SELECT id, name FROM species WHERE id = $1', [speciesId]);
    if (speciesResult.rows.length === 0) {
      return res.status(404).json({ message: 'Species not found' });
    }

    const speciesName = speciesResult.rows[0].name;

    // Get total visits
    const totalResult = await query(
      'SELECT COUNT(*) as count FROM species_visits WHERE species_id = $1',
      [speciesId]
    );
    const totalVisits = parseInt(totalResult.rows[0].count);

    // Get visits by language
    const languageResult = await query(
      `SELECT visitor_language, COUNT(*) as count
       FROM species_visits
       WHERE species_id = $1
       GROUP BY visitor_language
       ORDER BY count DESC`,
      [speciesId]
    );
    const visitsByLanguage = Object.fromEntries(
      languageResult.rows.map(row => [row.visitor_language, parseInt(row.count)])
    );

    // Get average visit duration
    const durationResult = await query(
      `SELECT AVG(duration_seconds)::INTEGER as avg_duration,
              MAX(duration_seconds) as max_duration,
              MIN(duration_seconds) as min_duration
       FROM species_visits
       WHERE species_id = $1`,
      [speciesId]
    );
    const avgDuration = durationResult.rows[0].avg_duration || 0;
    const maxDuration = durationResult.rows[0].max_duration || 0;
    const minDuration = durationResult.rows[0].min_duration || 0;

    // Get visits by hour (last 7 days)
    const hourlyResult = await query(
      `SELECT
        DATE_TRUNC('hour', timestamp)::TEXT as hour,
        COUNT(*) as count
       FROM species_visits
       WHERE species_id = $1 AND timestamp > NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('hour', timestamp)
       ORDER BY hour DESC
       LIMIT 24`,
      [speciesId]
    );
    const hourlyData = hourlyResult.rows.map(row => ({
      hour: row.hour,
      visits: parseInt(row.count),
    }));

    // Get access method distribution
    const accessResult = await query(
      `SELECT accessed_via, COUNT(*) as count
       FROM species_visits
       WHERE species_id = $1
       GROUP BY accessed_via`,
      [speciesId]
    );
    const accessMethods = Object.fromEntries(
      accessResult.rows.map(row => [row.accessed_via, parseInt(row.count)])
    );

    // Get unique visitors (approximation based on IP hash)
    const uniqueResult = await query(
      `SELECT COUNT(DISTINCT ip_hash) as unique_count
       FROM species_visits
       WHERE species_id = $1`,
      [speciesId]
    );
    const uniqueVisitors = parseInt(uniqueResult.rows[0].unique_count);

    // Get recent visits
    const recentResult = await query(
      `SELECT timestamp, visitor_language, duration_seconds, accessed_via
       FROM species_visits
       WHERE species_id = $1
       ORDER BY timestamp DESC
       LIMIT 10`,
      [speciesId]
    );

    res.json({
      speciesId: parseInt(speciesId),
      speciesName,
      totalVisits,
      uniqueVisitors,
      visitsByLanguage,
      averageDuration: avgDuration,
      maxDuration,
      minDuration,
      accessMethods,
      hourlyData,
      recentVisits: recentResult.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// GET analytics for all species (admin only)
router.get('/all/summary', assertAdminKey, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        s.id,
        s.name,
        COUNT(sv.id) as total_visits,
        COUNT(DISTINCT sv.ip_hash) as unique_visitors,
        AVG(sv.duration_seconds)::INTEGER as avg_duration
       FROM species s
       LEFT JOIN species_visits sv ON s.id = sv.species_id
       GROUP BY s.id, s.name
       ORDER BY total_visits DESC`
    );

    const summary = result.rows.map(row => ({
      speciesId: row.id,
      speciesName: row.name,
      totalVisits: parseInt(row.total_visits),
      uniqueVisitors: parseInt(row.unique_visitors),
      averageDuration: row.avg_duration || 0,
    }));

    res.json({
      summary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
