import type {
  CreateOrganizationResponse,
  ListOrganizationMembersResponse,
  ListOrganizationsResponse,
  OrganizationMemberResponse,
} from '@time-tracker/shared';

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
  toMemberResponse,
  toOrganizationResponse,
  toMembersResponse,
  toListOrganizationsResponse,
};

export default organizationMapper;
