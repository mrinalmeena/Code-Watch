import { Router } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import db from '../database.js';
import logger from '../utils/logger.js';

const router = Router();


function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = createHash('sha256').update(salt + password).digest('hex');
  return check === hash;
}


router.post('/register', (req, res) => {
  try {
    const { name, email, password, provider } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailLower = email.toLowerCase().trim();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailLower);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    const passwordHash = hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, provider)
      VALUES (?, ?, ?, ?)
    `).run(name || '', emailLower, passwordHash, provider || 'email');

    const user = db.prepare('SELECT id, name, email, provider, avatar_url, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    logger.info('User registered', { userId: user.id, email: emailLower });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});


router.post('/login', (req, res) => {
  try {
    const { email, password, provider } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailLower);

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Update last login
    db.prepare('UPDATE users SET last_login_at = datetime(\'now\') WHERE id = ?').run(user.id);

    logger.info('User logged in', { userId: user.id, email: emailLower });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message });
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});


router.post('/social', (req, res) => {
  try {
    const { provider, email, name } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ error: 'Provider and email are required' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailLower);

    if (!user) {
      // Auto-create account for social login
      const dummyHash = hashPassword(randomBytes(32).toString('hex'));
      db.prepare(`
        INSERT INTO users (name, email, password_hash, provider)
        VALUES (?, ?, ?, ?)
      `).run(name || '', emailLower, dummyHash, provider);

      user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailLower);
      logger.info('Social user registered', { userId: user.id, provider, email: emailLower });
    }

    db.prepare('UPDATE users SET last_login_at = datetime(\'now\') WHERE id = ?').run(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    logger.error('Social login failed', { error: error.message });
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});


router.get('/me/:id', (req, res) => {
  const user = db.prepare('SELECT id, name, email, provider, avatar_url, created_at, last_login_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      avatar: user.avatar_url,
      createdAt: user.created_at,
    },
  });
});


router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(emailLower);

    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0").run(user.id);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt);

    logger.info('Password reset requested', { userId: user.id, email: emailLower });

    res.json({
      message: 'If an account with that email exists, a reset link has been sent.',

      token,
    });
  } catch (error) {
    logger.error('Forgot password failed', { error: error.message });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.post('/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const resetToken = db.prepare(`
      SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0
    `).get(token);

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Check expiration
    if (new Date(resetToken.expires_at) < new Date()) {
      db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, resetToken.user_id);

    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(resetToken.user_id);
    logger.info('Password reset successful', { userId: user.id, email: user.email });

    res.json({ message: 'Password reset successful. You can now sign in with your new password.' });
  } catch (error) {
    logger.error('Password reset failed', { error: error.message });
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

export default router;
