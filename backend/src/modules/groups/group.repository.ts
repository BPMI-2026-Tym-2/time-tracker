import type { Prisma } from '@prisma/client';
import type { GroupRole } from '@time-tracker/shared';
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

const groupSettingsSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  color: true,
  logo: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  members: {
    where: {
      role: 'owner',
    },
    take: 1,
    select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
    },
  },
  _count: {
    select: {
      members: true,
    },
  },
} satisfies Prisma.GroupSelect;

export type GroupRecord = Prisma.GroupGetPayload<{ select: typeof groupSelect }>;
export type GroupSettingsRecord = Prisma.GroupGetPayload<{ select: typeof groupSettingsSelect }>;
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

function findSettingsById(id: string): Promise<GroupSettingsRecord | null> {
  return prisma.group.findUnique({
    where: { id },
    select: groupSettingsSelect,
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

function updateSettingsById(
  id: string,
  data: Prisma.GroupUpdateInput,
): Promise<GroupSettingsRecord | null> {
  return prisma.group.update({
    where: { id },
    data,
    select: groupSettingsSelect,
  });
}

const groupRepository = {
  findById,
  findSettingsById,
  updateSettingsById,
  findMembership,
  findMembers,
};

export default groupRepository;
