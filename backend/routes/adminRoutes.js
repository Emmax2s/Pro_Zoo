import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

const mailTransport = env.smtpUser && env.smtpPassword
  ? nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPassword },
  })
  : null;

const serializeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name || user.username,
  role: user.role || 'superadmin',
  enclosureId: user.enclosure_id || null,
  isActive: user.is_active,
});

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

    const result = await query(
      'SELECT * FROM admin_users WHERE username = $1 OR email = $1',
      [username]
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
      { id: user.id, username: user.username, email: user.email },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, username, email, name, role, enclosure_id, is_active FROM admin_users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'La sesión ya no es válida.' });
    }
    res.json({ user: serializeUser(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

// Create Admin Route
router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const { username: providedUsername, email, password, name, role, enclosureId } = req.body;
    const username = providedUsername || email?.split('@')[0];

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO admin_users (username, email, password, name, role, enclosure_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, username, email, name, role, enclosure_id, is_active, created_at`,
      [username, email, hashedPassword, name || username, role || 'superadmin', enclosureId || null]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      enclosureId: user.enclosure_id,
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
      'SELECT id, username, email, name, role, enclosure_id, is_active, created_at, updated_at FROM admin_users ORDER BY created_at DESC'
    );

    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name || row.username,
      role: row.role || 'superadmin',
      enclosureId: row.enclosure_id,
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
    const { username, email, password, name, role, enclosureId, is_active } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await query(
      `UPDATE admin_users
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           password = COALESCE($3, password),
           name = COALESCE($4, name),
           role = COALESCE($5, role),
           enclosure_id = COALESCE($6, enclosure_id),
           is_active = COALESCE($7, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, username, email, name, role, enclosure_id, is_active, created_at, updated_at`,
      [username, email, hashedPassword, name, role, enclosureId, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      enclosureId: user.enclosure_id,
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

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const genericMessage = 'Si el correo está registrado, recibirás un código de verificación.';
    if (!email) return res.status(400).json({ message: 'El correo es obligatorio.' });

    const result = await query('SELECT id, email FROM admin_users WHERE LOWER(email) = $1 AND is_active = true', [email]);
    if (!result.rows.length || !mailTransport) return res.json({ message: genericMessage });

    const code = String(crypto.randomInt(100000, 1000000));
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
    await query(
      `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [result.rows[0].id]
    );
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '10 minutes')`,
      [result.rows[0].id, tokenHash]
    );
    await mailTransport.sendMail({
      from: env.mailFrom,
      to: email,
      subject: 'Código para recuperar tu cuenta de ZooMAT',
      text: `Tu código de verificación es ${code}. Caduca en 10 minutos y solo puede usarse una vez.`,
    });
    res.json({ message: genericMessage });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const password = String(req.body.password || '');
    if (!email || !/^\d{6}$/.test(code) || password.length < 10) {
      return res.status(400).json({ message: 'Correo, código de 6 dígitos y contraseña de mínimo 10 caracteres son obligatorios.' });
    }
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
    const result = await query(
      `SELECT t.id, t.user_id
       FROM password_reset_tokens t
       JOIN admin_users u ON u.id = t.user_id
       WHERE LOWER(u.email) = $1 AND t.token_hash = $2
         AND t.used_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP
         AND u.is_active = true`,
      [email, tokenHash]
    );
    if (!result.rows.length) return res.status(400).json({ message: 'El código es incorrecto o ya caducó.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await query('UPDATE admin_users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, result.rows[0].user_id]);
    await query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [result.rows[0].id]);
    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
});

export default router;
