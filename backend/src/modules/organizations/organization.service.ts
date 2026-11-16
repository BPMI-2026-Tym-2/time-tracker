import { fromNodeHeaders } from 'better-auth/node';
import { isAPIError } from 'better-auth/api';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { auth } from '../../config/auth.js';
import { prisma } from '../../db/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  ListOrganizationMembersQuery,
  ListOrganizationMembersResponse,
  ListOrganizationsQuery,
  ListOrganizationsResponse,
} from '@time-tracker/shared';
import organizationMapper from './organization.mapper.js';

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

async function createOrganization(
  request: Request,
  input: CreateOrganizationRequest,
): Promise<CreateOrganizationResponse> {
  const organization = await auth.api.createOrganization({
    headers: fromNodeHeaders(request.headers),
    body: input,
  });

  if (!organization) {
    throw new AppError('Organizaci se nepodařilo vytvořit', 500);
  }

  return organizationMapper.toOrganizationResponse(organization);
}

async function listMembers(
  request: Request,
  organizationId: string,
  query: ListOrganizationMembersQuery,
): Promise<ListOrganizationMembersResponse> {
  const headers = fromNodeHeaders(request.headers);
  const [organization, membersResult, memberRoleResult] = await Promise.all([
    auth.api.getOrganization({
      headers,
      query: { organizationId },
    }),
    auth.api.listMembers({
      headers,
      query: {
        organizationId,
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
        ...(query.role && {
          filterField: 'role',
          filterOperator: 'eq',
          filterValue: query.role,
        }),
        ...(query.search && {
          filterField: 'user.name',
          filterOperator: 'contains',
          filterValue: query.search,
        }),
      },
    }),
    auth.api.getActiveMemberRole({
      headers,
      query: { organizationId },
    }),
  ]);

  if (!organization) {
    throw new AppError('Organizace nebyla nalezena', 404);
  }

  if (!membersResult) {
    throw new AppError('Členy organizace se nepodařilo načíst', 500);
  }

  return organizationMapper.toMembersResponse({
    organization,
    members: membersResult.members,
    page: query.page,
    pageSize: query.pageSize,
    total: membersResult.total,
    includeEmail: memberRoleResult.role === 'owner',
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

const organizationService = {
  createOrganization,
  listMembers,
  listOrganizations,
  deleteOrganization,
};

export default organizationService;
