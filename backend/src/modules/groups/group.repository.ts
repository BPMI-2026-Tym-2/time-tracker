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

export type GroupRecord = Prisma.GroupGetPayload<{ select: typeof groupSelect }>;
export type GroupMemberRecord = Prisma.GroupMemberGetPayload<{ select: typeof groupMemberSelect }>;
export type GroupMemberFilter = {
  search?: string;
  // hledat i podle e-mailu (jen pokud volající e-maily vidí).
  searchEmail: boolean;
  role?: GroupRole;
};

export type GroupDeletionAuthorization = (
  group: GroupRecord | null,
  membership: { role: string } | null,
) => void | Promise<void>;

export type GroupRepository = {
  deleteGroup: (
    groupId: string,
    userId: string,
    authorize: GroupDeletionAuthorization,
  ) => Promise<void>;
  findById: (id: string) => Promise<GroupRecord | null>;
  findMembership: (groupId: string, userId: string) => Promise<{ role: string } | null>;
  findMembers: (
    groupId: string,
    filter: GroupMemberFilter,
    pagination: { skip: number; take: number },
  ) => Promise<{ items: GroupMemberRecord[]; total: number }>;
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

async function deleteGroup(
  groupId: string,
  userId: string,
  authorize: GroupDeletionAuthorization,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({ where: { id: groupId }, select: groupSelect });
    const membership = group
      ? await tx.groupMember.findUnique({
          where: { groupId_userId: { groupId, userId } },
          select: { role: true },
        })
      : null;

    // The service must authorize before any writes, using the same transaction snapshot.
    await authorize(group, membership);
    await tx.groupMember.deleteMany({ where: { groupId } });
    await tx.group.delete({ where: { id: groupId } });
  });
}

const groupRepository: GroupRepository = {
  deleteGroup,
  findById,
  findMembership,
  findMembers,
};

export default groupRepository;
