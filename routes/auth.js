/* =========================================
   SONIVIVA — Auth Routes
   Register, Login, Logout, Reset Password
   ========================================= */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'soniviva-fallback-secret-key';

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter and one number' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(name.trim(), email.toLowerCase().trim(), phone || '', hash, 'user');

    res.status(201).json({ message: 'Account created successfully. Please log in.', userId: result.lastInsertRowid });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const hash = bcrypt.hashSync(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Password reset failed.' });
  }
});

// GET /api/auth/google-config
router.get('/google-config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// POST /api/auth/google — Sign in or Sign up with Google
router.post('/google', async (req, res) => {
  try {
    let email = '';
    let name = '';
    let picture = '';

    // Case 1: Client sent a Google ID token (credential from Google Identity Services)
    if (req.body.credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(req.body.credential)}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          name = payload.name || payload.given_name || (email ? email.split('@')[0] : 'User');
          picture = payload.picture || '';
        } else {
          // Fallback manual JWT decode if tokeninfo verification failed due to network
          const parts = req.body.credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            email = payload.email;
            name = payload.name || (email ? email.split('@')[0] : 'User');
            picture = payload.picture || '';
          }
        }
      } catch (tokenErr) {
        console.warn('Google token verify failed, falling back to payload fields:', tokenErr.message);
      }
    }

    // Case 2: Client sent direct Google profile
    if (!email && req.body.email) {
      email = req.body.email;
      name = req.body.name || email.split('@')[0];
      picture = req.body.picture || '';
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required' });
    }

    email = email.toLowerCase().trim();
    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // If email matches designated admin, ensure admin role
    const isAdminEmail = (email === 'dappahsonnia@gmail.com');

    if (user) {
      // User exists — log them in!
      if (isAdminEmail && user.role !== 'admin') {
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);
        user.role = 'admin';
      }
    } else {
      // User does not exist — sign them up automatically!
      const role = isAdminEmail ? 'admin' : 'user';
      const randomPass = 'goog_' + Math.random().toString(36).slice(-10) + Date.now().toString(36);
      const hash = bcrypt.hashSync(randomPass, 10);
      const displayName = name || email.split('@')[0];

      const result = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)')
        .run(displayName, email, '', hash, role);

      user = {
        id: result.lastInsertRowid,
        name: displayName,
        email,
        role,
        phone: ''
      };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      message: 'Google authentication successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, role, address, city, region, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
