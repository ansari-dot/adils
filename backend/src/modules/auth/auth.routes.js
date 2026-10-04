import express from 'express';
import { register, login, getMe } from './auth.controller.js';
import { authLimiter } from '../../middlewares/rateLimit.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

export default router;

