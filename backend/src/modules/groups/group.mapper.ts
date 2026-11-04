import type { GroupMemberResponse, GroupRole } from '@time-tracker/shared';
import type { GroupMemberRecord } from './group.repository.js';

export type GroupMapper = {
  toMemberResponse: (member: GroupMemberRecord, includeEmail: boolean) => GroupMemberResponse;
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

const groupMapper = {
  toMemberResponse,
};

export default groupMapper;
