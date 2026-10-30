import type { ListGroupMembersQuery, ListGroupMembersResponse } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { toGroupMemberResponse } from './group.mapper.js';
import { findGroupById, findGroupMembership, listGroupMembers } from './group.repository.js';
import type { RequestingUser } from './group.types.js';

// Seznam členů skupiny smí vidět člen, zakladatel skupiny a super admin.
// E-mail vidí (a hledat podle něj smí) jen zakladatel skupiny a super admin.
export async function listGroupMembersService(
  requestingUser: RequestingUser,
  groupId: string,
  query: ListGroupMembersQuery,
): Promise<ListGroupMembersResponse> {
  const group = await findGroupById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  const isSuperAdmin = requestingUser.role === 'superAdmin';
  const membership = isSuperAdmin ? null : await findGroupMembership(groupId, requestingUser.id);

  if (!isSuperAdmin && !membership) {
    throw new AppError('K zobrazení tohoto seznamu nemáte oprávnění', 403);
  }

  const canSeeEmail = isSuperAdmin || membership?.role === 'owner';
  const { items, total } = await listGroupMembers(
    groupId,
    { search: query.search, searchEmail: canSeeEmail, role: query.role },
    { skip: (query.page - 1) * query.pageSize, take: query.pageSize },
  );

  return {
    group,
    items: items.map((member) => toGroupMemberResponse(member, canSeeEmail)),
    pageInfo: { page: query.page, pageSize: query.pageSize, total },
  };
}
