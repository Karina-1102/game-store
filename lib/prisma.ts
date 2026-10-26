import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query'], // допустимо; любые другие опции — частая причина ошибки
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
