import {
  organizationSchema,
  type CreateOrganizationResponse,
  type InvitationResponse,
  type ListOrganizationMembersResponse,
  type OrganizationDetailResponse,
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
  description?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
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
};

export default organizationMapper;
