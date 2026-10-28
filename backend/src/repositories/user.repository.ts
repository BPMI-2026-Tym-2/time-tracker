import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

// Pole uživatele, která smí opustit backend. Heslo (Account) ani session tokeny (Session) sem nepatří.
export const publicUserSelect = {
  id: true,
  name: true,
  surname: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export function findUserByEmail(email: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}
