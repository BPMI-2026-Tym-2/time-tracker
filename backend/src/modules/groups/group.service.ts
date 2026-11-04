import type { ListGroupMembersQuery, ListGroupMembersResponse } from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import { AppError } from '../../shared/errors/app-error.js';
import groupRepository from './group.repository.js';
import groupMapper from './group.mapper.js';

export type GroupService = {
  listMembers: (
    requestingUser: RequestingUser,
    groupId: string,
    query: ListGroupMembersQuery,
  ) => Promise<ListGroupMembersResponse>;
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

const groupService: GroupService = {
  listMembers,
};

export default groupService;
