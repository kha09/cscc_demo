import { PrismaClient } from '@prisma/client';

// Clear any existing instances
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };
if (globalForPrisma.prisma) {
  globalForPrisma.prisma = undefined;
}

// Create a new instance
export const prisma = new PrismaClient({
  log: ['query'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
