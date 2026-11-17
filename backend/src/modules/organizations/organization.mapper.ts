import {
  organizationSchema,
  type CreateOrganizationResponse,
  type ListOrganizationMembersResponse,
  type OrganizationMemberResponse,
} from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';

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
  toMemberResponse,
  toOrganizationResponse,
  toMembersResponse,
};

export default organizationMapper;
