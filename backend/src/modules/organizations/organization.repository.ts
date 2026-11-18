import { prisma } from '../../db/prisma.js';
import type { Prisma } from '@prisma/client';

export type OrganizationOwnerRecord = {
  id: string;
  name: string;
  surname: string;
};

export type OrganizationSettingsRecord = {
  id: string;
  name: string;
  slug: string;
};

export function findOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  });
}

export async function findOrganizationOwner(
  organizationId: string,
): Promise<OrganizationOwnerRecord | null> {
  const member = await prisma.member.findFirst({
    where: {
      organizationId,
      role: 'owner',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return member?.user ?? null;
}

export function updateOrganizationName(id: string, name: string) {
  return prisma.organization.update({
    where: { id },
    data: { name },
  });
}

export function findOrganizationMembers(params: {
  where: Prisma.MemberWhereInput;
  skip: number;
  take: number;
  isOwner: boolean;
}) {
  return prisma.member.findMany({
    where: params.where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: params.isOwner,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    skip: params.skip,
    take: params.take,
  });
}

export function countOrganizationMembers(where: Prisma.MemberWhereInput) {
  return prisma.member.count({ where });
}

export function findUserOrganizations(params: {
  where: Prisma.MemberWhereInput;
  orderBy: Prisma.MemberOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.member.findMany({
    where: params.where,
    include: {
      organization: true,
    },
    orderBy: params.orderBy,
    skip: params.skip,
    take: params.take,
  });
}

export function countUserOrganizations(where: Prisma.MemberWhereInput) {
  return prisma.member.count({ where });
}

const organizationRepository = {
  findOrganizationById,
  findOrganizationOwner,
  updateOrganizationName,
  findOrganizationMembers,
  countOrganizationMembers,
  findUserOrganizations,
  countUserOrganizations,
};

export default organizationRepository;
