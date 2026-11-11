import type { GroupMemberResponse, GroupRole, GroupSettingsResponse } from '@time-tracker/shared';
import type { GroupMemberRecord, GroupSettingsRecord } from './group.repository.js';

export type GroupMapper = {
  toMemberResponse: (member: GroupMemberRecord, includeEmail: boolean) => GroupMemberResponse;
  toSettingsResponse: (
    group: GroupSettingsRecord,
    currentUserRole: GroupRole | null,
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canManageMembers: boolean;
      canLeaveGroup: boolean;
    },
    includeOwnerEmail: boolean,
  ) => GroupSettingsResponse;
};

const toMemberResponse = (
  member: GroupMemberRecord,
  includeEmail: boolean,
): GroupMemberResponse => {
  return {
    id: member.user.id,
    name: member.user.name,
    surname: member.user.surname,
    ...(includeEmail && { email: member.user.email }),
    role: member.role as GroupRole,
    joinedAt: member.joinedAt,
  };
};

const normalizeCategory = (category: string | null | undefined): string => {
  if (!category || category === 'Vývoj') return 'Obecná';
  return category;
};

const normalizeColor = (color: string | null | undefined): string => {
  if (!color || color === 'blue') return 'blue-sky';
  return color;
};

const normalizeLogo = (logo: string | null | undefined): string => {
  if (!logo) return 'users';
  return logo;
};

const toSettingsResponse = (
  group: GroupSettingsRecord,
  currentUserRole: GroupRole | null,
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canLeaveGroup: boolean;
  },
  includeOwnerEmail: boolean,
): GroupSettingsResponse => {
  const ownerMember = group.members.find((m) => m.role === 'owner');
  const owner = ownerMember
    ? {
        id: ownerMember.user.id,
        name: ownerMember.user.name,
        surname: ownerMember.user.surname,
        ...(includeOwnerEmail && { email: ownerMember.user.email }),
      }
    : null;

  return {
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    category: normalizeCategory(group.category),
    color: normalizeColor(group.color),
    logo: normalizeLogo(group.logo),
    visibility: (group.visibility as 'public' | 'private') ?? 'private',
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    invitationCode: group.invitationCode ?? group.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
    owner,
    membersCount: group._count.members,
    currentUserRole,
    permissions,
  };
};

const groupMapper: GroupMapper = {
  toMemberResponse,
  toSettingsResponse,
};

export default groupMapper;
