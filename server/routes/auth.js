const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    },
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0c1017,161f2e&textColor=f59e0b`;

  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, avatar_url)
    VALUES (?, ?, ?, 'customer', ?)
  `).run(name.trim(), email.trim().toLowerCase(), passwordHash, avatarUrl);

  const newUser = {
    id: result.lastInsertRowid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'customer',
    avatar_url: avatarUrl,
  };

  const token = createToken(newUser);
  res.status(201).json({ token, user: newUser });
});

// POST /api/auth/demo-login
// Convenience endpoint for 1-click test login as either 'admin' or 'customer'
router.post('/demo-login', (req, res) => {
  const { role } = req.body; // 'admin' or 'customer'
  const targetRole = role === 'admin' ? 'admin' : 'customer';

  const user = db.prepare('SELECT * FROM users WHERE role = ? LIMIT 1').get(targetRole);
  if (!user) {
    return res.status(404).json({ error: `Demo account for role '${targetRole}' not found` });
  }

  const token = createToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

module.exports = router;
