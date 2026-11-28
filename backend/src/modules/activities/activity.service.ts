import {
  activityCalendarDate,
  pastActivityDateMessage,
  type ActivityResponse,
  type CreateActivityInput,
  type ListActivitiesQuery,
  type ListActivitiesResponse,
} from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
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

async function createActivity(
  input: CreateActivityInput,
  userId: string,
  organizationId?: string,
): Promise<ActivityResponse> {
  if (activityCalendarDate(input.startedAt) < activityCalendarDate()) {
    throw new AppError(pastActivityDateMessage, 400);
  }

  const activity = await activityRepository.createActivity(input, userId, organizationId);
  return activityMapper.toActivityResponse(activity);
}

export const activityService = { listActivities, createActivity };
