import { randomUUID } from 'node:crypto';
import { fromNodeHeaders } from 'better-auth/node';
import { isAPIError } from 'better-auth/api';
import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { auth } from '../../config/auth.js';
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
  OrganizationDetailResponse,
} from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import organizationMapper from './organization.mapper.js';
import organizationRepository from './organization.repository.js';

function respondToInvitation(
  request: Request,
  invitationId: string,
  action: 'accept' | 'reject',
): Promise<Response> {
  const headers = fromNodeHeaders(request.headers);
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  headers.set('content-type', 'application/json');

  // Keep Better Auth's HTTP origin checks and session handling on the new routes.
  const url = new URL(`/api/auth/organization/${action}-invitation`, auth.options.baseURL);
  return auth.handler(
    new globalThis.Request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ invitationId }),
    }),
  );
}

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
  const organization = await auth.api.createOrganization({
    headers: fromNodeHeaders(request.headers),
    body: {
      name: input.name,
      slug: randomUUID(),
      description: input.description,
      categories: input.categories,
      tags: input.tags,
    },
  });

  if (!organization) {
    throw new AppError('Skupinu se nepodařilo vytvořit', 500);
  }

  return organizationMapper.toOrganizationResponse(organization);
}

async function listMembers(
  request: Request,
  organizationId: string,
  query: ListOrganizationMembersQuery,
): Promise<ListOrganizationMembersResponse> {
  const isOwner = request.organization?.role === 'owner';
  const where: Prisma.MemberWhereInput = {
    organizationId,
    ...(query.role && { role: query.role }),
    ...(query.search && {
      user: {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { surname: { contains: query.search, mode: 'insensitive' } },
        ],
      },
    }),
  };
  const [organization, members, total] = await Promise.all([
    organizationRepository.findOrganizationById(organizationId),
    organizationRepository.findOrganizationMembers({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      isOwner,
    }),
    organizationRepository.countOrganizationMembers(where),
  ]);

  if (!organization) {
    throw new AppError('Organizace nebyla nalezena', 404);
  }

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
    organizationRepository.findUserOrganizations({
      where,
      orderBy,
      skip,
      take,
    }),
    organizationRepository.countUserOrganizations(where),
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

  const organization = await organizationRepository.findOrganizationById(organizationId);

  if (!organization) {
    throw new AppError('Skupina nebyla nalezena', 404);
  }

  const owner = await organizationRepository.findOrganizationOwner(organizationId);

  if (!owner) {
    throw new AppError('Vlastník skupiny nebyl nalezen', 404);
  }

  return organizationMapper.toSettingsResponse({
    organization,
    owner,
    currentUserRole: memberRoleResult?.role ?? null,
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

  await organizationRepository.updateOrganizationSettings(organizationId, {
    name: input.name,
    description: input.description,
  });

  return getSettings(request, organizationId);
}

async function deleteOrganization(request: Request, organizationId: string): Promise<void> {
  try {
    await auth.api.deleteOrganization({
      headers: fromNodeHeaders(request.headers),
      body: { organizationId },
    });
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError(error.message, error.statusCode);
    }

    console.error(error);
    throw new AppError('Odstranění skupiny se nezdařilo. Zkuste to prosím znovu', 500);
  }
}

async function getOrganization(
  requestingUser: RequestingUser,
  organizationId: string,
): Promise<OrganizationDetailResponse> {
  const detail = await organizationRepository.findOrganizationDetailById(
    organizationId,
    requestingUser.id,
  );

  if (!detail) {
    throw new AppError('Skupina nebyla nalezena', 404);
  }

  if (!detail.currentUserRole && !requestingUser.roles.includes('admin')) {
    throw new AppError('Nemáte dostatečná oprávnění v této organizaci!', 403);
  }

  return organizationMapper.toOrganizationDetailResponse(detail);
}

const organizationService = {
  createInvitation,
  respondToInvitation,
  createOrganization,
  getOrganization,
  listMembers,
  listOrganizations,
  getSettings,
  updateSettings,
  deleteOrganization,
};

export default organizationService;
