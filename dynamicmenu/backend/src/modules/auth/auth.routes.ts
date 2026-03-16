/**
 * Auth Routes
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody } from '@middleware/validate';
import { idempotencyMiddleware } from '@middleware/idempotencyMiddleware';
import * as controller from './auth.controller';
import { loginSchema, registerSchema } from './auth.types';

const router = Router();

// Public routes
router.post('/register', idempotencyMiddleware, validateBody(registerSchema), controller.register);
router.post('/login', validateBody(loginSchema), controller.login);

// Protected routes
router.get('/me', authenticate, controller.me);

export default router;
