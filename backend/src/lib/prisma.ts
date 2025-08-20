import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance across hot-reloads in dev
// and a single instance in production.
// This prevents exhausting Postgres connection slots (common on Supabase free tier).
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
