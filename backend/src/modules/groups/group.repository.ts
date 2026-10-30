import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';

const groupSelect = {
  id: true,
  name: true,
} satisfies Prisma.GroupSelect;

const groupMemberSelect = {
  role: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
    },
  },
} satisfies Prisma.GroupMemberSelect;

export type GroupRecord = Prisma.GroupGetPayload<{ select: typeof groupSelect }>;
export type GroupMemberRecord = Prisma.GroupMemberGetPayload<{ select: typeof groupMemberSelect }>;

export type GroupMemberFilter = {
  search?: string;
  // Hledat i podle e-mailu (jen pokud volající e-maily vidí).
  searchEmail: boolean;
  role?: string;
};

export function findGroupById(id: string): Promise<GroupRecord | null> {
  return prisma.group.findUnique({
    where: { id },
    select: groupSelect,
  });
}

export function findGroupMembership(
  groupId: string,
  userId: string,
): Promise<{ role: string } | null> {
  return prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true },
  });
}

export async function listGroupMembers(
  groupId: string,
  filter: GroupMemberFilter,
  pagination: { skip: number; take: number },
): Promise<{ items: GroupMemberRecord[]; total: number }> {
  const where: Prisma.GroupMemberWhereInput = { groupId, role: filter.role };

  if (filter.search) {
    const contains = { contains: filter.search, mode: 'insensitive' } as const;
    const fields: Prisma.UserWhereInput[] = [{ name: contains }, { surname: contains }];

    if (filter.searchEmail) {
      fields.push({ email: contains });
    }

    where.user = { is: { OR: fields } };
  }

  const [items, total] = await prisma.$transaction([
    prisma.groupMember.findMany({
      where,
      select: groupMemberSelect,
      orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.groupMember.count({ where }),
  ]);

  return { items, total };
}
