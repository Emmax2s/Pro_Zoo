import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();
const publicUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  name: row.display_name || row.username,
  role: row.role,
  enclosureId: row.enclosure_id,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Sesión requerida.' });
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: 'Sesión inválida o expirada.' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Se requieren permisos de superadministrador.' });
  }
  next();
};

const requireSmtp = () => {
  if (!env.smtpUser || !env.smtpPassword || !env.smtpFrom) {
    const error = new Error('El correo de recuperación no está configurado en el servidor.');
    error.statusCode = 503;
    throw error;
  }
};

const sendResetEmail = async (email, token) => {
  requireSmtp();
  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPassword },
  });
  const url = `${env.publicAppUrl}/recuperar-cuenta?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: 'Recuperación de cuenta Pro Zoo',
    text: `Solicitaste cambiar tu contraseña. Abre este enlace antes de 30 minutos: ${url}`,
    html: `<p>Solicitaste cambiar tu contraseña.</p><p><a href="${url}">Crear una nueva contraseña</a></p><p>El enlace expira en 30 minutos.</p>`,
  });
};

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Usuario/correo y contraseña son obligatorios.' });
    const result = await query(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
      [username.trim()]
    );
    const user = result.rows[0];
    if (!user || !user.is_active || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, env.jwtSecret, { expiresIn: '8h' });
    res.json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM admin_users WHERE id = $1 AND is_active = true', [req.user.id]);
    if (!result.rows[0]) return res.status(401).json({ message: 'Cuenta inactiva o inexistente.' });
    res.json({ user: publicUser(result.rows[0]) });
  } catch (error) { next(error); }
});

router.post('/create', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { username, email, password, name, role = 'superadmin', enclosureId = null } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ message: 'Usuario, correo y contraseña son obligatorios.' });
    if (password.length < 10) return res.status(400).json({ message: 'La contraseña debe tener al menos 10 caracteres.' });
    if (!['superadmin', 'enclosure_admin'].includes(role)) return res.status(400).json({ message: 'Rol inválido.' });
    if (role === 'enclosure_admin' && !enclosureId) return res.status(400).json({ message: 'El administrador de recinto requiere un recinto.' });
    const result = await query(
      `INSERT INTO admin_users (username, email, display_name, role, enclosure_id, password)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [username.trim(), email.trim().toLowerCase(), name?.trim() || username.trim(), role, enclosureId, await bcrypt.hash(password, 12)]
    );
    res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'El usuario o correo ya existe.' });
    next(error);
  }
});

router.get('/list', verifyToken, requireSuperAdmin, async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM admin_users ORDER BY created_at DESC');
    res.json(result.rows.map(publicUser));
  } catch (error) { next(error); }
});

router.put('/:id', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { username, email, name, role, enclosureId, isActive, password } = req.body || {};
    if (role !== undefined && !['superadmin', 'enclosure_admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido.' });
    }
    if (role === 'enclosure_admin' && !enclosureId) {
      return res.status(400).json({ message: 'El administrador de recinto requiere un recinto.' });
    }
    const hashed = password ? await bcrypt.hash(password, 12) : null;
    const result = await query(
      `UPDATE admin_users SET username = COALESCE($1, username), email = COALESCE($2, email),
       display_name = COALESCE($3, display_name), role = COALESCE($4, role),
       enclosure_id = $5, is_active = COALESCE($6, is_active),
       password = COALESCE($7, password), updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [username?.trim() || null, email?.trim().toLowerCase() || null, name?.trim() || null, role || null,
        enclosureId ?? null, typeof isActive === 'boolean' ? isActive : null, hashed, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Cuenta no encontrada.' });
    res.json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'El usuario o correo ya existe.' });
    next(error);
  }
});

router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
    const result = await query('DELETE FROM admin_users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Cuenta no encontrada.' });
    res.json({ id: result.rows[0].id });
  } catch (error) { next(error); }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'El correo es obligatorio.' });
    const user = (await query('SELECT id, email FROM admin_users WHERE LOWER(email) = $1 AND is_active = true', [email])).rows[0];
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      await query('DELETE FROM password_reset_tokens WHERE admin_user_id = $1 OR expires_at < CURRENT_TIMESTAMP', [user.id]);
      await query(
        'INSERT INTO password_reset_tokens (admin_user_id, token_hash, expires_at) VALUES ($1,$2,CURRENT_TIMESTAMP + INTERVAL \'30 minutes\')',
        [user.id, hash]
      );
      await sendResetEmail(user.email, token);
    }
    res.json({ message: 'Si el correo existe, recibirás instrucciones de recuperación.' });
  } catch (error) { next(error); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password || password.length < 10) return res.status(400).json({ message: 'Token y contraseña válida son obligatorios.' });
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await query(
      `SELECT id, admin_user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
      [hash]
    );
    if (!result.rows[0]) return res.status(400).json({ message: 'El enlace es inválido o expiró.' });
    await query('UPDATE admin_users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [await bcrypt.hash(password, 12), result.rows[0].admin_user_id]);
    await query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [result.rows[0].id]);
    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) { next(error); }
});

export default router;
