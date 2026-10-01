import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only super administrators can manage admin users' });
  }
  next();
};

// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const result = await query(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.display_name || user.username,
        role: user.role || 'superadmin',
        enclosureId: user.enclosure_id,
      },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
});

const formatUser = (user) => ({
  id: user.id,
  username: user.username,
  name: user.display_name || user.username,
  email: user.email,
  role: user.role || 'superadmin',
  enclosureId: user.enclosure_id || null,
  status: user.is_active ? 'Activo' : 'Inactivo',
  isActive: user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, username, email, display_name, role, enclosure_id, is_active, created_at, updated_at
       FROM admin_users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Admin user not found or inactive' });
    }
    res.json(formatUser(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// Create Admin Route
router.post('/create', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { username, name, email, password, role, enclosureId, status } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Username, name, email, and password required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    }
    if (!['superadmin', 'enclosure_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid admin role' });
    }
    if (role === 'enclosure_admin' && !enclosureId) {
      return res.status(400).json({ message: 'An enclosure is required for this role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO admin_users (username, email, password, display_name, role, enclosure_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, display_name, role, enclosure_id, is_active, created_at, updated_at`,
      [username.trim(), email.trim().toLowerCase(), hashedPassword, name.trim(), role, role === 'superadmin' ? null : enclosureId, status !== 'Inactivo']
    );

    res.status(201).json(formatUser(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    next(error);
  }
});

// List Admins Route
router.get('/list', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, username, email, display_name, role, enclosure_id, is_active, created_at, updated_at
       FROM admin_users ORDER BY created_at DESC`
    );

    res.json(result.rows.map(formatUser));
  } catch (error) {
    next(error);
  }
});

// Update Admin Route
router.put('/:id', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, name, email, password, role, enclosureId, status } = req.body;
    if (role !== undefined && !['superadmin', 'enclosure_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid admin role' });
    }
    if (role === 'enclosure_admin' && !enclosureId) {
      return res.status(400).json({ message: 'An enclosure is required for this role' });
    }
    if (password !== undefined && password !== '' && password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await query(
      `UPDATE admin_users 
       SET username = COALESCE(NULLIF($1, ''), username),
           email = COALESCE(NULLIF($2, ''), email),
           display_name = COALESCE(NULLIF($3, ''), display_name),
           password = COALESCE($4, password),
           role = COALESCE($5, role),
           enclosure_id = CASE WHEN $5 = 'superadmin' THEN NULL ELSE COALESCE($6, enclosure_id) END,
           is_active = COALESCE($7, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, username, email, display_name, role, enclosure_id, is_active, created_at, updated_at`,
      [username, email?.trim().toLowerCase(), name, hashedPassword, role, enclosureId, status === undefined ? null : status !== 'Inactivo', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json(formatUser(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    next(error);
  }
});

// Delete Admin Route
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const result = await query('DELETE FROM admin_users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json({ message: 'Admin user deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

export default router;
