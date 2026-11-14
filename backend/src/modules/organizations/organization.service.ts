import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { auth } from '../../config/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  ListOrganizationMembersQuery,
  ListOrganizationMembersResponse,
} from '@time-tracker/shared';
import organizationMapper from './organization.mapper.js';

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

const organizationService = {
  createOrganization,
  listMembers,
};

export default organizationService;
