import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterData) {
    const { email, password, fullName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            fullName,
            headline: '',
            contactInfo: {}
          }
        }
      },
      include: {
        profile: true
      }
    });

    return user;
  }

  static async login(data: LoginData) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      }
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
