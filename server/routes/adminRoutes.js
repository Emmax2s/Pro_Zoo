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

// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const result = await query('SELECT * FROM admin_users WHERE username = $1', [username]);

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
      { id: user.id, username: user.username, email: user.email },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    next(error);
  }
});

// Create Admin Route
router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO admin_users (username, email, password, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, username, email, is_active, created_at`,
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    next(error);
  }
});

// List Admins Route
router.get('/list', verifyToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, username, email, is_active, created_at, updated_at FROM admin_users ORDER BY created_at DESC'
    );

    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Update Admin Route
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, is_active } = req.body;

    const result = await query(
      `UPDATE admin_users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, username, email, is_active, created_at, updated_at`,
      [username, email, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    next(error);
  }
});

// Delete Admin Route
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;

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
