import { PrismaClient } from '@prisma/client';
if (typeof global.prisma === 'undefined') {
    global.prisma = new PrismaClient();
}
export const prisma = global.prisma;
