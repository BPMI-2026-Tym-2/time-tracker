import type {
  CreateOrganizationResponse,
  InvitationResponse,
  ListOrganizationMembersResponse,
  OrganizationMemberResponse,
  OrganizationSettingsResponse,
} from '@time-tracker/shared';

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
  if (member.role !== 'member' && member.role !== 'owner') {
    throw new Error(`Unknown organization role: ${member.role}`);
  }

  return {
    id: member.user.id,
    name: member.user.name,
    surname: member.user.surname ?? '',
    ...(includeEmail && { email: member.user.email }),
    role: member.role,
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
  invitationCode,
}: {
  organization: { id: string; name: string; slug: string };
  owner: { id: string; name: string; surname?: string } | null;
  currentUserRole: string | null;
  invitationCode: string;
}): OrganizationSettingsResponse {
  const isOwner = currentUserRole === 'owner';

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    invitationCode,
    owner: owner
      ? {
          id: owner.id,
          name: owner.name,
          surname: owner.surname ?? '',
        }
      : null,
    currentUserRole:
      currentUserRole === 'owner' || currentUserRole === 'member' ? currentUserRole : null,
    permissions: {
      canEdit: isOwner,
      canDelete: isOwner,
    },
  };
}

const organizationMapper = {
  toInvitationResponse,
  toMemberResponse,
  toOrganizationResponse,
  toMembersResponse,
  toSettingsResponse,
};

export default organizationMapper;
