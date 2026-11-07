import { PrismaClient } from '@prisma/client';

// Jediná instance PrismaClient pro celý backend (předává se i do Better Auth Prisma adapteru).
export const prisma = new PrismaClient();
