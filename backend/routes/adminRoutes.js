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
const recoveryAttempts = new Map();
const RECOVERY_WINDOW_MS = 15 * 60 * 1000;
const RECOVERY_MAX_ATTEMPTS = 3;

const isRecoveryRateLimited = (key) => {
  const now = Date.now();
  const attempts = (recoveryAttempts.get(key) || []).filter((timestamp) => now - timestamp < RECOVERY_WINDOW_MS);
  if (attempts.length >= RECOVERY_MAX_ATTEMPTS) {
    recoveryAttempts.set(key, attempts);
    return true;
  }
  attempts.push(now);
  recoveryAttempts.set(key, attempts);
  return false;
};

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

export const requireSuperAdmin = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT role, is_active FROM admin_users WHERE id = $1',
      [req.user?.id]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'La sesión ya no es válida.' });
    }
    if (user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Se requieren permisos de superadministrador.' });
    }
    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
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
router.post('/create', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { username: providedUsername, email, password, name, role, enclosureId, enclosureIds } = req.body;
    const username = providedUsername || email?.split('@')[0];

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const encVal = Array.isArray(enclosureIds) && enclosureIds.length > 0
      ? enclosureIds.join(',')
      : enclosureId || null;

    const result = await query(
      `INSERT INTO admin_users (username, email, password, name, role, enclosure_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, username, email, name, role, enclosure_id, is_active, created_at`,
      [username, email, hashedPassword, name || username, role || 'superadmin', encVal]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      enclosureId: user.enclosure_id,
      enclosureIds: user.enclosure_id ? user.enclosure_id.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
router.get('/list', verifyToken, requireSuperAdmin, async (req, res, next) => {
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
      enclosureIds: row.enclosure_id ? row.enclosure_id.split(',').map(s => s.trim()).filter(Boolean) : [],
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
router.put('/:id', verifyToken, requireSuperAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password, name, role, enclosureId, enclosureIds, is_active } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const encVal = Array.isArray(enclosureIds) && enclosureIds.length > 0
      ? enclosureIds.join(',')
      : enclosureId !== undefined ? enclosureId : null;

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
      [username, email, hashedPassword, name, role, encVal, is_active, id]
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
      enclosureIds: user.enclosure_id ? user.enclosure_id.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res, next) => {
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

// Audit Logs Routes
router.get('/audit-logs', verifyToken, requireSuperAdmin, async (_req, res) => {
  try {
    const result = await query(
      'SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 200'
    );
    res.json(result.rows);
  } catch (error) {
    res.json([]);
  }
});

router.post('/audit-logs', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, userName, userEmail, userRole, assignedEnclosures, actionType, entityType, entityName, enclosureName, details } = req.body;
    const result = await query(
      `INSERT INTO admin_audit_logs (user_id, user_name, user_email, user_role, assigned_enclosures, action_type, entity_type, entity_name, enclosure_name, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [userId || null, userName || '', userEmail || '', userRole || '', JSON.stringify(assignedEnclosures || []), actionType || '', entityType || '', entityName || '', enclosureName || '', details || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(200).json({ status: 'ok' });
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const genericMessage = 'Si el correo está registrado, recibirás instrucciones pronto.';
    if (!email) return res.status(400).json({ message: 'El correo es obligatorio.' });
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRecoveryRateLimited(`ip:${ip}`) || isRecoveryRateLimited(`email:${email}`)) {
      return res.status(429).json({ message: genericMessage });
    }

    const result = await query('SELECT id, email FROM admin_users WHERE LOWER(email) = $1 AND is_active = true', [email]);
    if (!result.rows.length) return res.json({ message: genericMessage });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    await query(
      `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [result.rows[0].id]
    );
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '30 minutes')`,
      [result.rows[0].id, tokenHash]
    );
    try {
      if (!mailTransport) {
        console.error('Password recovery email skipped: SMTP is not configured.');
        return res.json({ message: genericMessage });
      }
      const resetUrl = `${env.publicAppUrl.replace(/\/$/, '')}/recuperar-cuenta?token=${resetToken}`;
      await mailTransport.sendMail({
        from: env.mailFrom,
        to: email,
        subject: 'Recuperación de contraseña de ZooMAT',
        text: `Abre este enlace para restablecer tu contraseña: ${resetUrl}. Caduca en 30 minutos y solo puede usarse una vez.`,
        html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p><p>El enlace caduca en 30 minutos y solo puede usarse una vez.</p>`,
      });
    } catch (error) {
      console.error('Password recovery email failed:', error);
      await query(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_hash = $1',
        [tokenHash]
      );
      return res.status(502).json({ message: 'No se pudo enviar el correo de recuperación. Verifica la configuración SMTP.' });
    }
    res.json({ message: genericMessage });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const token = String(req.body.token || '').trim();
    const password = String(req.body.newPassword || '');
    if (!/^[a-f0-9]{64}$/i.test(token) || password.length < 10) {
      return res.status(400).json({ message: 'El enlace no es válido o la contraseña debe tener mínimo 10 caracteres.' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const validToken = await query(
      `SELECT t.id
       FROM password_reset_tokens t
       JOIN admin_users u ON u.id = t.user_id
       WHERE t.token_hash = $1
         AND t.used_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP
         AND u.is_active = true`,
      [tokenHash]
    );
    if (!validToken.rows.length) return res.status(400).json({ message: 'El enlace es inválido o ha expirado.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await query(
      `WITH valid_token AS (
         SELECT t.id, t.user_id
         FROM password_reset_tokens t
         JOIN admin_users u ON u.id = t.user_id
         WHERE t.token_hash = $1
           AND t.used_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP
           AND u.is_active = true
         FOR UPDATE
       ), updated_user AS (
         UPDATE admin_users u
         SET password = $2, updated_at = CURRENT_TIMESTAMP
         FROM valid_token v
         WHERE u.id = v.user_id
         RETURNING v.id
       )
       UPDATE password_reset_tokens t
       SET used_at = CURRENT_TIMESTAMP
       FROM updated_user u
       WHERE t.id = u.id
       RETURNING t.id`,
      [tokenHash, hashedPassword]
    );
    if (!result.rows.length) return res.status(400).json({ message: 'El enlace es inválido o ha expirado.' });
    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
});

export default router;
