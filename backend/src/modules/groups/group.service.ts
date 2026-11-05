import type {
  GroupSettingsResponse,
  ListGroupMembersQuery,
  ListGroupMembersResponse,
  UpdateGroupSettingsBody,
} from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import { AppError } from '../../shared/errors/app-error.js';
import groupRepository from './group.repository.js';
import groupMapper from './group.mapper.js';
import type { GroupRole } from '@time-tracker/shared';

export type GroupService = {
  listMembers: (
    requestingUser: RequestingUser,
    groupId: string,
    query: ListGroupMembersQuery,
  ) => Promise<ListGroupMembersResponse>;
  getSettings: (requestingUser: RequestingUser, groupId: string) => Promise<GroupSettingsResponse>;
  updateSettings: (
    requestingUser: RequestingUser,
    groupId: string,
    data: UpdateGroupSettingsBody,
  ) => Promise<GroupSettingsResponse>;
};

// Seznam členů skupiny smí vidět člen, zakladatel skupiny a super admin.
// E-mail vidí (a hledat podle nej smi) jen zakladatel skupiny a super admin.
async function listMembers(
  requestingUser: RequestingUser,
  groupId: string,
  query: ListGroupMembersQuery,
): Promise<ListGroupMembersResponse> {
  const group = await groupRepository.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  const isSuperAdmin = requestingUser.role === 'superAdmin';
  const membership = isSuperAdmin
    ? null
    : await groupRepository.findMembership(groupId, requestingUser.id);

  if (!isSuperAdmin && !membership) {
    throw new AppError('K zobrazení tohoto seznamu nemáte oprávnění', 403);
  }

  const canSeeEmail = isSuperAdmin || membership?.role === 'owner';
  const { items, total } = await groupRepository.findMembers(
    groupId,
    { search: query.search, searchEmail: canSeeEmail, role: query.role },
    { skip: (query.page - 1) * query.pageSize, take: query.pageSize },
  );

  return {
    group,
    items: items.map((member) => groupMapper.toMemberResponse(member, canSeeEmail)),
    pageInfo: { page: query.page, pageSize: query.pageSize, total },
  };
}

// Nastavení skupiny smí zobrazit člen skupiny, zakladatel (owner) a super admin.
// E-mail vlastníka vidí jen vlastník skupiny a super admin.
async function getSettings(
  requestingUser: RequestingUser,
  groupId: string,
): Promise<GroupSettingsResponse> {
  const group = await groupRepository.findSettingsById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  const isSuperAdmin = requestingUser.role === 'superAdmin';
  const membership = await groupRepository.findMembership(groupId, requestingUser.id);

  if (!isSuperAdmin && !membership) {
    throw new AppError('K zobrazení nastavení této skupiny nemáte oprávnění', 403);
  }

  const role = (membership?.role as GroupRole) ?? null;
  const isOwner = role === 'owner';
  const canManage = isSuperAdmin || isOwner;
  const canSeeOwnerEmail = canManage;

  const permissions = {
    canEdit: canManage,
    canDelete: canManage,
    canManageMembers: canManage,
    canLeaveGroup: !isOwner && membership !== null,
  };

  return groupMapper.toSettingsResponse(group, role, permissions, canSeeOwnerEmail);
}

async function updateSettings(
  requestingUser: RequestingUser,
  groupId: string,
  data: UpdateGroupSettingsBody,
): Promise<GroupSettingsResponse> {
  const isSuperAdmin = requestingUser.role === 'superAdmin';
  const membership = await groupRepository.findMembership(groupId, requestingUser.id);
  const isOwner = membership?.role === 'owner';

  if (!isSuperAdmin && !isOwner) {
    throw new AppError('K úpravě nastavení této skupiny nemáte oprávnění', 403);
  }

  const updatedGroup = await groupRepository.updateSettingsById(groupId, data);
  if (!updatedGroup) {
    throw new AppError('Group not found', 404);
  }

  const role = (membership?.role as GroupRole) ?? null;
  const permissions = {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canLeaveGroup: false,
  };

  return groupMapper.toSettingsResponse(updatedGroup, role, permissions, true);
}

const groupService: GroupService = {
  listMembers,
  getSettings,
  updateSettings,
};

export default groupService;
