import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticateToken, AuthRequest, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword
  });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const id = 'usr-' + uuidv4().slice(0, 8);
  const password_hash = await bcrypt.hash(password, 10);
  const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, avatar)
    VALUES (?, ?, ?, ?, 'user', ?, ?)
  `).run(id, name, email, password_hash, phone || '', avatar);

  const user = { id, name, email, role: 'user', phone, avatar };
  const token = jwt.sign(
    { id, email, role: 'user', name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?').get(req.user?.id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(user.id);
  res.json({ user, addresses });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req: AuthRequest, res) => {
  const { name, phone, avatar } = req.body;
  const userId = req.user?.id;

  db.prepare(`
    UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar)
    WHERE id = ?
  `).run(name, phone, avatar, userId);

  const updatedUser = db.prepare('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?').get(userId);
  res.json({ message: 'Profile updated successfully', user: updatedUser });
});

export default router;
