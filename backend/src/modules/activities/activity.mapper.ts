import type { Activity } from '@prisma/client';
import type { ActivityResponse } from '@time-tracker/shared';

function toActivityResponse(activity: Activity): ActivityResponse {
  return {
    id: activity.id,
    name: activity.name,
    startedAt: activity.startedAt,
    endedAt: activity.endedAt,
    categoryIds: activity.categoryIds,
    tagIds: activity.tagIds,
  };
}

export const activityMapper = { toActivityResponse };
