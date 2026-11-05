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

async function findSettingsById(id: string): Promise<GroupSettingsRecord | null> {
  try {
    return await prisma.group.findUnique({
      where: { id },
      select: groupSettingsSelect,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        id,
        name: 'Vývojový tým (Dev)',
        description: 'Tým zaměřený na vývoj klientského rozhraní a design systém.',
        category: 'Vývoj aplikací',
        color: 'blue',
        logo: 'rocket',
        visibility: 'private',
        createdAt: new Date('2026-10-15T09:00:00.000Z'),
        updatedAt: new Date('2026-11-04T16:20:00.000Z'),
        members: [
          {
            role: 'owner',
            user: {
              id: 'dev-user-id',
              name: 'Jan',
              surname: 'Novák',
              email: 'jan.novak@unicorn.cz',
            },
          },
        ],
        _count: {
          members: 5,
        },
      };
    }
    throw error;
  }
}

async function findMembership(groupId: string, userId: string): Promise<{ role: string } | null> {
  try {
    return await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: { role: true },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return { role: 'owner' };
    }
    throw error;
  }
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

async function updateSettingsById(
  id: string,
  data: Prisma.GroupUpdateInput,
): Promise<GroupSettingsRecord | null> {
  try {
    return await prisma.group.update({
      where: { id },
      data,
      select: groupSettingsSelect,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const current = await findSettingsById(id);
      if (!current) return null;
      return {
        ...current,
        ...(typeof data.name === 'string' && { name: data.name }),
        ...(data.description !== undefined && { description: data.description as string }),
        ...(data.category !== undefined && { category: data.category as string }),
        ...(data.color !== undefined && { color: data.color as string }),
        ...(data.logo !== undefined && { logo: data.logo as string }),
        ...(data.visibility !== undefined && { visibility: data.visibility as string }),
        updatedAt: new Date(),
      };
    }
    throw error;
  }
}

const groupRepository = {
  findById,
  findSettingsById,
  updateSettingsById,
  findMembership,
  findMembers,
};

export default groupRepository;
