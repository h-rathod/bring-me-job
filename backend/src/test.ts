// Simple test to verify server setup
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testDatabase();
