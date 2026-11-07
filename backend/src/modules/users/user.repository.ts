import { prisma } from '../../db/prisma.js';
import { publicUserSelect } from './user.schemas.js';
import type { UserRecord } from './user.types.js';

export function findUserByEmail(email: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}
