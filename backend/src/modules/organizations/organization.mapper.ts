import {
  organizationSchema,
  type CreateOrganizationResponse,
  type InvitationResponse,
  type ListOrganizationMembersResponse,
  type OrganizationMemberResponse,
} from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';

function toInvitationResponse(invitation: {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}): InvitationResponse {
  if (invitation.role !== 'member' || invitation.status !== 'pending') {
    throw new Error('Unexpected invitation role or status');
  }
  return {
    id: invitation.id,
    organizationId: invitation.organizationId,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
  };
}

type OrganizationRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
};

type OrganizationMemberRecord = {
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    surname?: string;
    email: string;
  };
};

function toMemberResponse({
  member,
  includeEmail,
}: {
  member: OrganizationMemberRecord;
  includeEmail: boolean;
}): OrganizationMemberResponse {
  const parsedRole = organizationSchema.role.safeParse(member.role);

  if (!parsedRole.success) {
    throw new AppError(`Neznámá organizační role: ${member.role}`, 500);
  }

  return {
    id: member.user.id,
    name: member.user.name,
    surname: member.user.surname ?? '',
    ...(includeEmail && { email: member.user.email }),
    role: parsedRole.data,
    joinedAt: member.createdAt,
  };
}

function toOrganizationResponse(organization: OrganizationRecord): CreateOrganizationResponse {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt,
  };
}

function toMembersResponse({
  organization,
  members,
  page,
  pageSize,
  total,
  includeEmail,
}: {
  organization: OrganizationRecord;
  members: OrganizationMemberRecord[];
  page: number;
  pageSize: number;
  total: number;
  includeEmail: boolean;
}): ListOrganizationMembersResponse {
  return {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    items: members.map((member) => toMemberResponse({ member, includeEmail })),
    pageInfo: { page, pageSize, total },
  };
}

const organizationMapper = {
  toInvitationResponse,
  toMemberResponse,
  toOrganizationResponse,
  toMembersResponse,
};

export default organizationMapper;
