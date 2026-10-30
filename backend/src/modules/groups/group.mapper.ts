import type { GroupMemberResponse, GroupRole } from '@time-tracker/shared';
import type { GroupMemberRecord } from './group.repository.js';

export function toGroupMemberResponse(
  member: GroupMemberRecord,
  includeEmail: boolean,
): GroupMemberResponse {
  return {
    id: member.user.id,
    name: member.user.name,
    surname: member.user.surname,
    ...(includeEmail && { email: member.user.email }),
    role: member.role as GroupRole,
    joinedAt: member.joinedAt,
  };
}
