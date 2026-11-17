import type { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  name: true,
  surname: true,
  email: true,
  image: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
