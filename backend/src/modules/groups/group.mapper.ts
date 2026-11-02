import type { GroupResponse } from '@time-tracker/shared';
import type { GroupRecord } from './group.repository.js';
export function toGroupResponse(group: GroupRecord): GroupResponse {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt,
  };
}
