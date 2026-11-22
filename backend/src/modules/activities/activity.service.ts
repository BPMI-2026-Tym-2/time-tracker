import type { ListActivitiesQuery, ListActivitiesResponse } from '@time-tracker/shared';
import { activityMapper } from './activity.mapper.js';
import { activityRepository, type ActivityRecorder } from './activity.repository.js';

async function listActivities(
  recorder: ActivityRecorder,
  query: ListActivitiesQuery,
): Promise<ListActivitiesResponse> {
  const activities = await activityRepository.findActivities(recorder, query);
  const hasFilters = Boolean(query.from || query.to || query.categoryId || query.tagId);

  return {
    items: activities.map(activityMapper.toActivityResponse),
    hasActivities:
      activities.length > 0 || (hasFilters && (await activityRepository.hasActivities(recorder))),
  };
}

export const activityService = { listActivities };
