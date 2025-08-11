import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthedRequest extends Request {
  user?: { userId: string; email: string };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = await AuthService.verifyToken(token);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
