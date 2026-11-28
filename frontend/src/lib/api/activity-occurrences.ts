import { addDays, addMonths, differenceInCalendarDays, differenceInCalendarMonths } from 'date-fns';
import type { ActivityResponse } from '@time-tracker/shared';

function occurrences(activity: ActivityResponse, from: Date, to: Date): ActivityResponse[] {
  const { startedAt, endedAt, recurrence } = activity;
  const overlaps = endedAt > from && startedAt < to;
  if (!recurrence || recurrence === 'none') return overlaps ? [activity] : [];

  const duration = endedAt.getTime() - startedAt.getTime();
  const earliestStart = new Date(from.getTime() - duration);
  const dayStep = recurrence === 'daily' ? 1 : 7;
  const monthStep = recurrence === 'monthly' ? 1 : 12;
  const byDay = recurrence === 'daily' || recurrence === 'weekly';
  const firstIndex = byDay
    ? Math.floor(differenceInCalendarDays(earliestStart, startedAt) / dayStep)
    : Math.floor(differenceInCalendarMonths(earliestStart, startedAt) / monthStep);

  const result: ActivityResponse[] = [];
  for (let index = Math.max(0, firstIndex); ; index += 1) {
    const start = byDay
      ? addDays(startedAt, index * dayStep)
      : addMonths(startedAt, index * monthStep);
    if (!(start < to)) break;

    const end = new Date(start.getTime() + duration);
    if (end > from) {
      result.push(
        index === 0
          ? activity
          : { ...activity, id: `${activity.id}:${index}`, startedAt: start, endedAt: end },
      );
    }
  }
  return result;
}

export function activityOccurrences(activities: ActivityResponse[], from: Date, to: Date) {
  return activities
    .flatMap((activity) => occurrences(activity, from, to))
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime() || a.id.localeCompare(b.id));
}
