import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
