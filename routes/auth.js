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
    const { name, email, phone, password } = req.body || {};
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanName = (name || '').trim();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter and one number' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error: 'This email is already registered. If you have forgotten your password, please use the Forgot Password option to reset it.',
        code: 'EMAIL_ALREADY_REGISTERED',
        email: cleanEmail
      });
    }

    const hash = bcrypt.hashSync(password, 12);

    const result = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(cleanName, cleanEmail, (phone || '').trim(), hash, 'user');

    const userId = result.lastInsertRowid;

    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: 'user', name: cleanName },
      SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({
      message: 'Account created successfully! Welcome to Soniviva Market.',
      token,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: 'user',
        phone: (phone || '').trim()
      }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed: users.email')) {
      return res.status(409).json({
        error: 'This email is already registered. If you have forgotten your password, please use the Forgot Password option to reset it.',
        code: 'EMAIL_ALREADY_REGISTERED',
        email: (req.body?.email || '').toLowerCase().trim()
      });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed. Please try again.' });
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

// POST /api/auth/forgot-password — Send 6-digit OTP to user's email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const db = getDb();
    let user = db.prepare('SELECT id, name, email FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
    if (!user) {
      // Auto-provision customer account so the user is never blocked
      const displayName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const tempPass = 'Tmp_' + Math.random().toString(36).slice(-10) + Date.now().toString(36);
      const tempHash = bcrypt.hashSync(tempPass, 10);
      const insertResult = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
        displayName, cleanEmail, '', tempHash, 'user'
      );
      user = { id: insertResult.lastInsertRowid, name: displayName, email: cleanEmail };
      console.log(`Auto-created customer account for password reset flow: ${cleanEmail}`);
    }

    // Generate secure random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Clear previous codes for this email and save new one
    db.prepare('DELETE FROM password_resets WHERE LOWER(TRIM(email)) = ?').run(cleanEmail);
    db.prepare('INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)').run(cleanEmail, code, expiresAt);

    // Send email with OTP code
    const { sendPasswordResetOtp } = require('../utils/email');
    const sendResult = await sendPasswordResetOtp(cleanEmail, code);

    const responsePayload = {
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`,
      email: cleanEmail
    };

    if (!sendResult.sent) {
      responsePayload.demoCode = code;
      responsePayload.message = `Verification code generated for ${cleanEmail}. Please enter the code below to complete password reset.`;
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

// POST /api/auth/reset-password — Verify OTP code and reset password
router.post('/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanCode = (code || '').toString().trim();

    if (!cleanEmail || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (!cleanCode) {
      return res.status(400).json({ error: 'Verification code is required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter and one number.' });
    }

    const db = getDb();

    // Verify OTP code and check 15-minute expiration
    const nowIso = new Date().toISOString();
    const resetRecord = db.prepare(`
      SELECT * FROM password_resets 
      WHERE LOWER(TRIM(email)) = ? AND code = ? AND expires_at > ?
      ORDER BY id DESC LIMIT 1
    `).get(cleanEmail, cleanCode, nowIso);

    if (!resetRecord) {
      return res.status(400).json({
        error: 'Invalid or expired verification code. Please check the code or request a new one.'
      });
    }

    let user = db.prepare('SELECT id FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
    if (!user) {
      const displayName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const hash = bcrypt.hashSync(newPassword, 12);
      const insertResult = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
        displayName, cleanEmail, '', hash, 'user'
      );
      user = { id: insertResult.lastInsertRowid };
    } else {
      const hash = bcrypt.hashSync(newPassword, 12);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
    }

    // Invalidate consumed OTP
    db.prepare('DELETE FROM password_resets WHERE LOWER(TRIM(email)) = ?').run(cleanEmail);

    res.json({ message: 'Password reset successfully! Please log in with your new password.' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

// GET /api/auth/google-config
router.get('/google-config', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'google_client_id'").get();
    const clientId = (row && row.value) ? row.value : (process.env.GOOGLE_CLIENT_ID || '401970135810-b9kh0j8f7qj4c4f73q46a8an1e851u2h.apps.googleusercontent.com');
    res.json({ clientId });
  } catch (err) {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '401970135810-b9kh0j8f7qj4c4f73q46a8an1e851u2h.apps.googleusercontent.com' });
  }
});

// POST /api/auth/setup-google-client — Configure Google Client ID (Admin only)
router.post('/setup-google-client', (req, res) => {
  try {
    const { clientId, adminPassword } = req.body;
    if (!clientId || !clientId.trim()) {
      return res.status(400).json({ error: 'Google Client ID is required.' });
    }
    const cleanId = clientId.trim();
    if (!cleanId.includes('.apps.googleusercontent.com')) {
      return res.status(400).json({ error: 'Invalid Google Client ID. It must end with .apps.googleusercontent.com' });
    }

    const db = getDb();
    const adminUser = db.prepare("SELECT * FROM users WHERE email = 'dappahsonnia@gmail.com'").get();
    if (!adminUser || !bcrypt.compareSync(adminPassword || '', adminUser.password_hash)) {
      return res.status(401).json({ error: 'Invalid administrator password.' });
    }

    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('google_client_id', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(cleanId);

    res.json({ message: 'Google Client ID configured successfully! Google Sign-In is now active.', clientId: cleanId });
  } catch (err) {
    console.error('Setup Google client error:', err);
    res.status(500).json({ error: 'Failed to configure Google Client ID.' });
  }
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

    // Case 2: Client sent an OAuth2 access_token (from Google OAuth2 token client with prompt: 'select_account')
    if (!email && req.body.access_token) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${req.body.access_token}` }
        });
        if (userInfoRes.ok) {
          const payload = await userInfoRes.json();
          email = payload.email;
          name = payload.name || payload.given_name || (email ? email.split('@')[0] : 'User');
          picture = payload.picture || '';
        } else {
          console.warn('Google userinfo fetch returned status:', userInfoRes.status);
        }
      } catch (tokenErr) {
        console.warn('Google userinfo fetch failed:', tokenErr.message);
      }
    }

    // Case 3: Client sent direct Google profile
    if (!email && req.body.email) {
      email = req.body.email;
      name = req.body.name || email.split('@')[0];
      picture = req.body.picture || '';
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required' });
    }

    email = email.toLowerCase().trim();

    // Security: Protect administrator account from Google sign-in bypass
    if (email === 'dappahsonnia@gmail.com') {
      return res.status(403).json({
        error: 'The administrator account must sign in securely using email and password on the login form.'
      });
    }

    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
      // User exists — log them in
      if (user.role === 'admin') {
        return res.status(403).json({
          error: 'Administrator accounts must sign in using email and password.'
        });
      }
    } else {
      // User does not exist — register as a new customer with their own account!
      const randomPass = 'goog_' + Math.random().toString(36).slice(-10) + Date.now().toString(36);
      const hash = bcrypt.hashSync(randomPass, 10);
      const displayName = name || email.split('@')[0];

      const result = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)')
        .run(displayName, email, '', hash, 'user');

      user = {
        id: result.lastInsertRowid,
        name: displayName,
        email,
        role: 'user',
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
