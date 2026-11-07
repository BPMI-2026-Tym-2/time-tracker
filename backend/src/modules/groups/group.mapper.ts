import type { CreateGroupResponse } from '@time-tracker/shared';
import type { GroupRecord } from './group.repository.js';
import type { GroupMemberResponse, GroupRole } from '@time-tracker/shared';
import type { GroupMemberRecord } from './group.repository.js';

export type GroupMapper = {
  toMemberResponse: (member: GroupMemberRecord, includeEmail: boolean) => GroupMemberResponse;
  toGroupResponse: (group: GroupRecord) => CreateGroupResponse;
};

function toMemberResponse(member: GroupMemberRecord, includeEmail: boolean): GroupMemberResponse {
  return {
    id: member.user.id,
    name: member.user.name,
    surname: member.user.surname,
    ...(includeEmail && { email: member.user.email }),
    role: member.role as GroupRole,
    joinedAt: member.joinedAt,
  };
}

function toGroupResponse(group: GroupRecord): CreateGroupResponse {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt,
  };
}

const groupMapper = {
  toMemberResponse,
  toGroupResponse,
};

export default groupMapper;
