import { fromNodeHeaders } from 'better-auth/node';
import { isAPIError } from 'better-auth/api';
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
} from '@time-tracker/shared';
import organizationMapper from './organization.mapper.js';

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
  const [organization, membersResult] = await Promise.all([
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
    includeEmail: request.organization?.role === 'owner',
  });
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

const organizationService = {
  createInvitation,
  respondToInvitation,
  createOrganization,
  listMembers,
  deleteOrganization,
};

export default organizationService;
