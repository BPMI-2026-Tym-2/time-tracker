import type { Prisma } from '@prisma/client';
import type { publicUserSelect } from './user.schemas.js';

export type UserRecord = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
