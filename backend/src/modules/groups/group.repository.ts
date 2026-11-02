import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';

const groupSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
} satisfies Prisma.GroupSelect;

export type GroupRecord = Prisma.GroupGetPayload<{
  select: typeof groupSelect;
}>;

export function createGroup(data: Prisma.GroupCreateInput): Promise<GroupRecord> {
  return prisma.group.create({
    data,
    select: groupSelect,
  });
}
