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
  metadata?: string | null;
};

export function findOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, metadata: true },
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

export async function updateOrganizationSettings(
  id: string,
  input: { name: string; description?: string | null },
) {
  let metadata: string | undefined = undefined;
  if (input.description !== undefined) {
    const existing = await prisma.organization.findUnique({
      where: { id },
      select: { metadata: true },
    });
    let metaObj: Record<string, unknown> = {};
    if (existing?.metadata) {
      try {
        metaObj = JSON.parse(existing.metadata);
      } catch {
        metaObj = {};
      }
    }
    metaObj.description = input.description;
    metadata = JSON.stringify(metaObj);
  }

  return prisma.organization.update({
    where: { id },
    data: {
      name: input.name,
      ...(metadata !== undefined ? { metadata } : {}),
    },
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
  updateOrganizationSettings,
  findOrganizationMembers,
  countOrganizationMembers,
  findUserOrganizations,
  countUserOrganizations,
};

export default organizationRepository;
