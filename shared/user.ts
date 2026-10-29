import type { Prisma } from '@prisma/client';

// Pole uživatele, která smí opustit backend. Heslo (Account) ani session tokeny (Session) sem nepatří.
export const publicUserSelect = {
  id: true,
  name: true,
  surname: true,
  email: true,
  profileImageUrl: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;
