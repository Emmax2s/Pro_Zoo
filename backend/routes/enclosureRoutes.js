import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken } from './adminRoutes.js';

const router = Router();

const format = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  icon: row.icon,
});

router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM enclosures ORDER BY created_at ASC');
    res.json(result.rows.map(format));
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { id, name, description = '', color = 'bg-emerald-600', icon = 'Vivario' } = req.body;
    if (!id || !name?.trim()) return res.status(400).json({ message: 'El recinto requiere un identificador y nombre.' });
    const result = await query(
      `INSERT INTO enclosures (id, name, description, color, icon)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name.trim(), description, color, icon]
    );
    res.status(201).json(format(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Ya existe un recinto con ese identificador.' });
    next(error);
  }
});

router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;
    const result = await query(
      `UPDATE enclosures
       SET name = COALESCE($1, name), description = COALESCE($2, description),
           color = COALESCE($3, color), icon = COALESCE($4, icon),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name?.trim(), description, color, icon, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Recinto no encontrado.' });
    res.json(format(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM enclosures WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Recinto no encontrado.' });
    await query('UPDATE species SET enclosure_id = NULL WHERE enclosure_id = $1', [req.params.id]);
    await query('UPDATE admin_users SET enclosure_id = NULL, role = \'superadmin\' WHERE enclosure_id = $1', [req.params.id]);
    res.json({ id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

export default router;
