import type {
  DeleteGroupResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  ListGroupMembersQuery,
  ListGroupMembersResponse,
} from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import { AppError } from '../../shared/errors/app-error.js';
import groupRepository from './group.repository.js';
import groupMapper from './group.mapper.js';

export type GroupService = {
  deleteGroup: (requestingUser: RequestingUser, groupId: string) => Promise<DeleteGroupResponse>;
  listMembers: (
    requestingUser: RequestingUser,
    groupId: string,
    query: ListGroupMembersQuery,
  ) => Promise<ListGroupMembersResponse>;
  createGroup: (input: CreateGroupRequest) => Promise<CreateGroupResponse>;
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

async function deleteGroup(
  requestingUser: RequestingUser,
  groupId: string,
): Promise<DeleteGroupResponse> {
  try {
    await groupRepository.deleteGroup(groupId, requestingUser.id, (group, membership) => {
      if (!group) {
        throw new AppError('Group not found', 404);
      }

      if (membership?.role !== 'owner') {
        throw new AppError('Skupinu může odstranit pouze její vlastník', 403);
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Group deletion failed', error);
    throw new AppError('Odstranění skupiny se nezdařilo. Zkuste to prosím znovu', 500);
  }

  return { message: 'Skupina byla úspěšně odstraněna.' };
}

async function createGroup(input: CreateGroupRequest): Promise<CreateGroupResponse> {
  const group = await groupRepository.createGroup({
    name: input.name,
    description: input.description,
  });

  return groupMapper.toGroupResponse(group);
}

const groupService: GroupService = {
  deleteGroup,
  listMembers,
  createGroup,
};

export default groupService;
