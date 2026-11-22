import type { Prisma } from '@prisma/client';
import type { ListActivitiesQuery } from '@time-tracker/shared';
import { prisma } from '../../db/prisma.js';

export type ActivityRecorder = { userId: string } | { organizationId: string };

function recorderFilter(recorder: ActivityRecorder): Prisma.ActivityWhereInput {
  if ('userId' in recorder) {
    return {
      userId: recorder.userId,
      OR: [{ organizationId: null }, { organizationId: { isSet: false } }],
    };
  }

  return {
    OR: [
      { organizationId: recorder.organizationId },
      { sharedOrganizationIds: { has: recorder.organizationId } },
    ],
  };
}

function findActivities(recorder: ActivityRecorder, query: ListActivitiesQuery) {
  return prisma.activity.findMany({
    where: {
      ...recorderFilter(recorder),
      ...(query.from && { endedAt: { gt: query.from } }),
      ...(query.to && { startedAt: { lt: query.to } }),
      ...(query.categoryId && { categoryIds: { hasSome: query.categoryId } }),
      ...(query.tagId && { tagIds: { hasSome: query.tagId } }),
    },
    orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
  });
}

async function hasActivities(recorder: ActivityRecorder): Promise<boolean> {
  const activity = await prisma.activity.findFirst({
    where: recorderFilter(recorder),
    select: { id: true },
  });
  return activity !== null;
}

export const activityRepository = { findActivities, hasActivities };
