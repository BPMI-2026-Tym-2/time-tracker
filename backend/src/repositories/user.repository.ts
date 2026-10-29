import { publicUserSelect, type PublicUser } from '@time-tracker/shared';
import { prisma } from '../db/prisma.js';

export function findUserByEmail(email: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}
