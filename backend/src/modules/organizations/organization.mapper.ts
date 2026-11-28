import {
  organizationSchema,
  type CreateOrganizationResponse,
  type InvitationResponse,
  type ListOrganizationMembersResponse,
  type ListOrganizationsResponse,
  type OrganizationDetailResponse,
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
  description?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
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

function toMemberResponse(member: OrganizationMemberRecord): OrganizationMemberResponse {
  const parsedRole = organizationSchema.role.safeParse(member.role);

  if (!parsedRole.success) {
    throw new AppError(`Neznámá organizační role: ${member.role}`, 500);
  }

  return {
    id: member.id,
    name: member.user.name,
    surname: member.user.surname ?? '',
    ...(member.user.email ? { email: member.user.email } : {}),
    role: parsedRole.data,
    joinedAt: member.createdAt,
  };
}

function toOrganizationResponse(organization: OrganizationRecord): CreateOrganizationResponse {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    description: organization.description ?? '',
    categories: organization.categories ?? [],
    tags: organization.tags ?? [],
    createdAt: organization.createdAt,
  };
}

function toMembersResponse({
  organization,
  members,
  page,
  pageSize,
  total,
}: {
  organization: Pick<OrganizationRecord, 'id' | 'name' | 'slug'>;
  members: OrganizationMemberRecord[];
  page: number;
  pageSize: number;
  total: number;
}): ListOrganizationMembersResponse {
  return {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    items: members.map(toMemberResponse),
    pageInfo: { page, pageSize, total },
  };
}

function toSettingsResponse({
  organization,
  owner,
  currentUserRole,
}: {
  organization: Pick<OrganizationRecord, 'id' | 'name' | 'slug' | 'description'> & {
    metadata?: string | null;
  };
  owner: { id: string; name: string; surname: string };
  currentUserRole: string | null;
}): OrganizationSettingsResponse {
  const isOwner = currentUserRole === 'owner';

  const description = extractDescription(organization) || null;

  return {
    id: organization.id,
    name: organization.name,
    description,
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

function extractDescription(organization: {
  description?: string | null;
  metadata?: string | null;
}): string {
  if (organization.description) {
    return organization.description;
  }
  if (organization.metadata) {
    try {
      const parsed = JSON.parse(organization.metadata) as { description?: unknown };
      if (typeof parsed.description === 'string') {
        return parsed.description;
      }
    } catch {
      // neplatný JSON v metadata se ignoruje
    }
  }
  return '';
}

function toOrganizationDetailResponse(input: {
  organization: OrganizationRecord & { logo?: string | null; metadata?: string | null };
  owner: { id: string; name: string; surname: string } | null;
  memberCount: number;
  currentUserRole: string | null;
}): OrganizationDetailResponse {
  const parsedRole = input.currentUserRole
    ? organizationSchema.role.safeParse(input.currentUserRole)
    : null;

  return {
    id: input.organization.id,
    name: input.organization.name,
    slug: input.organization.slug,
    description: extractDescription(input.organization),
    categories: input.organization.categories ?? [],
    tags: input.organization.tags ?? [],
    logo: input.organization.logo ?? null,
    createdAt: input.organization.createdAt,
    owner: input.owner
      ? { id: input.owner.id, name: input.owner.name, surname: input.owner.surname }
      : null,
    memberCount: input.memberCount,
    currentUserRole: parsedRole?.success ? parsedRole.data : null,
  };
}

const organizationMapper = {
  toInvitationResponse,
  toMemberResponse,
  toOrganizationResponse,
  toOrganizationDetailResponse,
  toMembersResponse,
  toSettingsResponse,
  toListOrganizationsResponse,
};

export default organizationMapper;
