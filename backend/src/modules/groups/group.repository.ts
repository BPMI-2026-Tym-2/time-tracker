import type { Prisma } from '@prisma/client';
import type { GroupRole } from '@time-tracker/shared';
import { prisma } from '../../db/prisma.js';

const groupSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
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
  // hledat i podle e-mailu (jen pokud volající e-maily vidí).
  searchEmail: boolean;
  role?: GroupRole;
};

function findById(id: string): Promise<GroupRecord | null> {
  return prisma.group.findUnique({
    where: { id },
    select: groupSelect,
  });
}

function findMembership(groupId: string, userId: string): Promise<{ role: string } | null> {
  return prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true },
  });
}

async function findMembers(
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

function createGroup(data: Prisma.GroupCreateInput): Promise<GroupRecord> {
  return prisma.group.create({
    data,
    select: groupSelect,
  });
}

const groupRepository = {
  findById,
  findMembership,
  findMembers,
  createGroup,
};

export default groupRepository;
