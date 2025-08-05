import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

// GET /api/auth/me (protected route - for future use)
// router.get('/me', authenticateToken, AuthController.me);

export default router;
