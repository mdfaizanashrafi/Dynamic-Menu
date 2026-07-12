import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { authenticate, signToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  restaurantName: z.string().min(1).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', validateBody(registerSchema), (req, res) => {
  const { email, password, restaurantName, slug } = req.body;
  const passwordHash = bcrypt.hashSync(password, 12);

  try {
    const result = db
      .prepare(
        'INSERT INTO users (email, password_hash, restaurant_name, slug) VALUES (?, ?, ?, ?)'
      )
      .run(email, passwordHash, restaurantName, slug.toLowerCase());

    const token = signToken(Number(result.lastInsertRowid));
    res.status(201).json({
      success: true,
      data: { token, user: { id: result.lastInsertRowid, email, restaurantName, slug } },
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ success: false, error: { message: 'Email or slug already exists' } });
      return;
    }
    throw err;
  }
});

router.post('/login', validateBody(loginSchema), (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
    | { id: number; email: string; password_hash: string; restaurant_name: string; slug: string }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    return;
  }

  const token = signToken(user.id);
  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, restaurantName: user.restaurant_name, slug: user.slug },
    },
  });
});

router.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  const user = db.prepare('SELECT id, email, restaurant_name, slug FROM users WHERE id = ?').get(req.userId) as
    | { id: number; email: string; restaurant_name: string; slug: string }
    | undefined;

  if (!user) {
    res.status(404).json({ success: false, error: { message: 'User not found' } });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      restaurantName: user.restaurant_name,
      slug: user.slug,
    },
  });
});

export default router;
