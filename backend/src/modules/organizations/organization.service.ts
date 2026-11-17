import { fromNodeHeaders } from 'better-auth/node';
import { isAPIError } from 'better-auth/api';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { auth } from '../../config/auth.js';
import { prisma } from '../../db/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreateOrganizationRequest,
  CreateInvitationRequest,
  InvitationResponse,
  CreateOrganizationResponse,
  ListOrganizationMembersQuery,
  ListOrganizationMembersResponse,
  OrganizationSettingsResponse,
  UpdateOrganizationSettingsRequest,
  ListOrganizationsQuery,
  ListOrganizationsResponse,
} from '@time-tracker/shared';
import organizationMapper from './organization.mapper.js';

async function createInvitation(
  request: Request,
  organizationId: string,
  input: CreateInvitationRequest,
): Promise<InvitationResponse> {
  try {
    const invitation = await auth.api.createInvitation({
      headers: fromNodeHeaders(request.headers),
      body: { organizationId, email: input.email, role: 'member' },
    });
    return organizationMapper.toInvitationResponse(invitation);
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError('Pozvánku se nepodařilo odeslat', error.statusCode);
    }
    console.error(error);
    throw new AppError('Pozvánku se nepodařilo odeslat', 500);
  }
}

async function createOrganization(
  request: Request,
  input: CreateOrganizationRequest,
): Promise<CreateOrganizationResponse> {
  const headers = fromNodeHeaders(request.headers);

  let organization;
  try {
    organization = await auth.api.createOrganization({
      headers,
      body: {
        name: input.name,
        slug: input.slug,
      },
    });
  } catch (error) {
    if (isAPIError(error)) {
      throw new AppError(error.message, error.statusCode);
    }
    throw error;
  }

  if (!organization) {
    throw new AppError('Failed to create organization', 500);
  }

  return organizationMapper.toOrganizationResponse(organization);
}

async function listMembers(
  request: Request,
  organizationId: string,
  query: ListOrganizationMembersQuery,
): Promise<ListOrganizationMembersResponse> {
  const headers = fromNodeHeaders(request.headers);

  let memberRoleResult;
  try {
    memberRoleResult = await auth.api.getActiveMemberRole({
      headers,
      query: { organizationId },
    });
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError(error.message, error.statusCode);
    }
    throw error;
  }

  const isOwner = memberRoleResult?.role === 'owner';

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true, createdAt: true },
  });

  if (!organization) {
    throw new AppError('Organization not found', 404);
  }

  const where: Prisma.MemberWhereInput = {
    organizationId,
    ...(query.role ? { role: query.role } : {}),
    ...(query.search
      ? {
          user: {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { surname: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
  };

  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: isOwner,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    }),
    prisma.member.count({ where }),
  ]);

  return organizationMapper.toMembersResponse({
    organization,
    members,
    page: query.page,
    pageSize: query.pageSize,
    total,
    includeEmail: isOwner,
  });
}

async function listOrganizations(
  request: Request,
  query: ListOrganizationsQuery,
): Promise<ListOrganizationsResponse> {
  const headers = fromNodeHeaders(request.headers);
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new AppError('Uživatel není přihlášen', 401);
  }

  const userId = session.user.id;

  const where: Prisma.MemberWhereInput = {
    userId,
    ...(query.role !== 'all' ? { role: query.role } : {}),
    ...(query.search
      ? {
          organization: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        }
      : {}),
  };

  let orderBy: Prisma.MemberOrderByWithRelationInput;
  if (query.sort === 'name_asc') {
    orderBy = { organization: { name: 'asc' } };
  } else if (query.sort === 'name_desc') {
    orderBy = { organization: { name: 'desc' } };
  } else {
    orderBy = { createdAt: 'desc' };
  }

  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        organization: true,
      },
      orderBy,
      skip,
      take,
    }),
    prisma.member.count({ where }),
  ]);

  return organizationMapper.toListOrganizationsResponse({
    items: members,
    page: query.page,
    pageSize: query.pageSize,
    total,
  });
}

async function getSettings(
  request: Request,
  organizationId: string,
): Promise<OrganizationSettingsResponse> {
  const headers = fromNodeHeaders(request.headers);

  let memberRoleResult;
  try {
    memberRoleResult = await auth.api.getActiveMemberRole({
      headers,
      query: { organizationId },
    });
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError(error.message, error.statusCode);
    }
    throw error;
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true },
  });

  if (!organization) {
    throw new AppError('Skupina nebyla nalezena', 404);
  }

  const ownerMember = await prisma.member.findFirst({
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

  return organizationMapper.toSettingsResponse({
    organization,
    owner: ownerMember?.user ?? null,
    currentUserRole: memberRoleResult?.role ?? null,
    invitationCode: organization.slug,
  });
}

async function updateSettings(
  request: Request,
  organizationId: string,
  input: UpdateOrganizationSettingsRequest,
): Promise<OrganizationSettingsResponse> {
  const headers = fromNodeHeaders(request.headers);

  let memberRoleResult;
  try {
    memberRoleResult = await auth.api.getActiveMemberRole({
      headers,
      query: { organizationId },
    });
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError(error.message, error.statusCode);
    }
    throw error;
  }

  if (memberRoleResult?.role !== 'owner') {
    throw new AppError('K úpravě nastavení nemáte oprávnění', 403);
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { name: input.name },
  });

  return getSettings(request, organizationId);
}

async function deleteOrganization(request: Request, organizationId: string): Promise<void> {
  const headers = fromNodeHeaders(request.headers);

  try {
    await auth.api.deleteOrganization({
      headers,
      body: { organizationId },
    });
  } catch (error) {
    if (isAPIError(error)) {
      throw new AppError(error.message, error.statusCode);
    }
    throw error;
  }
}

const organizationService = {
  createInvitation,
  createOrganization,
  listMembers,
  listOrganizations,
  getSettings,
  updateSettings,
  deleteOrganization,
};

export default organizationService;
