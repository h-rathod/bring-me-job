import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const user = await AuthService.register({ email, password, fullName });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login({ email, password });

      res.json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
