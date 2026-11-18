import {
  organizationSchema,
  type CreateOrganizationResponse,
  type InvitationResponse,
  type ListOrganizationMembersResponse,
  type ListOrganizationsResponse,
  type OrganizationMemberResponse,
  type OrganizationSettingsResponse,
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
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    surname: string;
    email?: string;
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
    id: member.id,
    name: member.user.name,
    surname: member.user.surname ?? '',
    ...(includeEmail && member.user.email ? { email: member.user.email } : {}),
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

function toSettingsResponse({
  organization,
  owner,
  currentUserRole,
}: {
  organization: { id: string; name: string; slug: string };
  owner: { id: string; name: string; surname: string };
  currentUserRole: string | null;
}): OrganizationSettingsResponse {
  const isOwner = currentUserRole === 'owner';

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    owner: {
      id: owner.id,
      name: owner.name,
      surname: owner.surname,
    },
    currentUserRole:
      currentUserRole === 'owner' || currentUserRole === 'member' ? currentUserRole : null,
    permissions: {
      canEdit: isOwner,
      canDelete: isOwner,
    },
  };
}

function toListOrganizationsResponse({
  items,
  page,
  pageSize,
  total,
}: {
  items: Array<{
    organization: { id: string; name: string; slug: string; logo: string | null; createdAt: Date };
    role: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
}): ListOrganizationsResponse {
  return {
    items: items.map((item) => ({
      id: item.organization.id,
      name: item.organization.name,
      slug: item.organization.slug,
      logo: item.organization.logo,
      role: item.role === 'owner' ? 'owner' : 'member',
      createdAt: item.organization.createdAt,
    })),
    pageInfo: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

const organizationMapper = {
  toInvitationResponse,
  toMemberResponse,
  toOrganizationResponse,
  toMembersResponse,
  toSettingsResponse,
  toListOrganizationsResponse,
};

export default organizationMapper;
