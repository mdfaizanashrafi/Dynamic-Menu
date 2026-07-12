import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
