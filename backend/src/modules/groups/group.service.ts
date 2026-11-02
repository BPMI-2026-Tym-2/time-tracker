import type { CreateGroupRequest } from '@time-tracker/shared';
import { createGroup, type GroupRecord } from './group.repository.js';

export function createGroupService(input: CreateGroupRequest): Promise<GroupRecord> {
  return createGroup({
    name: input.name,
    description: input.description,
  });
}
