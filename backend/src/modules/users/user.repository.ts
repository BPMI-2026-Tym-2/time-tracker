import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';

const publicUserSelect = {
  id: true,
  name: true,
  surname: true,
  email: true,
  profileImageUrl: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export function findUserByEmail(email: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}
