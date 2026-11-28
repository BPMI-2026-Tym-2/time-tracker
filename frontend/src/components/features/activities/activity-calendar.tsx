import { addDays, format, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import type { ActivityResponse } from '@time-tracker/shared';
import { cn } from '@/lib/utils';

const minutesPerDay = 1_440;
const hours = [4, 8, 12, 16, 20];
const weekdayLabels = ['NE', 'PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO'];
const activityColors = ['#ecdec8', '#ecdec8', '#c7e9e5', '#e2ad9f'];

function activityColor(activity: ActivityResponse) {
  const key = activity.categoryIds[0] ?? activity.tagIds[0] ?? activity.name.trim().toLowerCase();
  const index = Array.from(key).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return activityColors[index % activityColors.length];
}

type CalendarEntry = {
  activity: ActivityResponse;
  start: number;
  end: number;
  lane: number;
  laneCount: number;
};

function localMinute(date: Date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

function layoutDay(day: Date, activities: ActivityResponse[]): CalendarEntry[] {
  const nextDay = addDays(day, 1);
  const entries: CalendarEntry[] = [];

  for (const activity of activities) {
    if (activity.startedAt >= nextDay || activity.endedAt <= day) continue;

    const start = activity.startedAt <= day ? 0 : localMinute(activity.startedAt);
    const end = activity.endedAt >= nextDay ? minutesPerDay : localMinute(activity.endedAt);
    entries.push({
      activity,
      start,
      end: Math.min(minutesPerDay, Math.max(end, start + 45)),
      lane: 0,
      laneCount: 1,
    });
  }

  entries.sort((a, b) => a.start - b.start || b.end - a.end);

  // Reuse a column once its previous entry ends. Entries that overlap
  // directly or through another entry divide the same available width.
  let clusterStart = 0;
  let clusterEnd = 0;
  let laneEnds: number[] = [];

  function finishCluster(index: number) {
    for (let entry = clusterStart; entry < index; entry += 1) {
      entries[entry].laneCount = laneEnds.length;
    }
  }

  entries.forEach((entry, index) => {
    if (entry.start >= clusterEnd) {
      finishCluster(index);
      clusterStart = index;
      laneEnds = [];
    }

    const availableLane = laneEnds.findIndex((end) => end <= entry.start);
    entry.lane = availableLane === -1 ? laneEnds.length : availableLane;
    laneEnds[entry.lane] = entry.end;
    clusterEnd = Math.max(clusterEnd, entry.end);
  });
  finishCluster(entries.length);

  return entries;
}

type ActivityCalendarProps = {
  weekStart: Date;
  activities: ActivityResponse[];
  expanded?: boolean;
};

export function ActivityCalendar({
  weekStart,
  activities,
  expanded = false,
}: ActivityCalendarProps) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    return { day, entries: layoutDay(day, activities) };
  });
  const today = expanded ? new Date() : undefined;
  const hourHeight = expanded ? 42 : 28;
  const gridInterval = 4 * hourHeight;
  const calendarHeight = 24 * hourHeight;

  return (
    <div
      role="region"
      aria-label="Týdenní kalendář aktivit"
      tabIndex={0}
      className={cn(
        'focus-visible:ring-ring overflow-auto focus-visible:ring-2 focus-visible:ring-inset',
        expanded ? 'max-h-[min(75dvh,50rem)]' : 'max-h-132',
      )}
    >
      <div
        className={cn(
          'grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] bg-white text-[#211e18]',
          expanded ? 'min-w-[57rem]' : 'min-w-[44rem]',
        )}
      >
        <div className="sticky top-0 left-0 z-30 border-r border-[#aaa39a] bg-white" />
        {days.map(({ day }) => {
          const isToday = today ? isSameDay(day, today) : false;
          return (
            <div
              key={day.toISOString()}
              className="sticky top-0 z-20 flex h-11 items-center gap-1.5 border border-l-0 border-[#aaa39a] bg-white px-1.5 tabular-nums"
            >
              <span
                className={cn(
                  'inline-flex h-7 items-center rounded-lg border border-[#82796a] bg-[#ecdec8] text-xs font-medium',
                  expanded ? 'px-2' : 'px-1.5',
                  isToday && 'bg-[#b19a72] font-bold',
                )}
              >
                {weekdayLabels[day.getDay()]}
              </span>
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                aria-current={isToday ? 'date' : undefined}
                className={cn('whitespace-nowrap', expanded ? 'text-sm' : 'text-xs')}
              >
                {format(day, 'd.M.yyyy')}
              </time>
            </div>
          );
        })}

        <div className="sticky left-0 z-10 border-r border-[#aaa39a] bg-white" aria-hidden="true">
          {hours.map((hour) => (
            <span
              key={hour}
              style={{ top: hour * hourHeight }}
              className="absolute right-1.5 -translate-y-1/2 text-sm tabular-nums"
            >
              {hour}:00
            </span>
          ))}
        </div>
        {days.map(({ day, entries }) => (
          <ul
            key={day.toISOString()}
            aria-label={format(day, 'EEEE d. M.', { locale: cs })}
            className="relative overflow-hidden border-r border-b border-[#aaa39a]"
            style={{
              height: calendarHeight,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${gridInterval - 1}px, #aaa39a ${gridInterval - 1}px ${gridInterval}px)`,
            }}
          >
            {entries.map(({ activity, start, end, lane, laneCount }) => {
              const timing = `${format(activity.startedAt, 'H:mm')}–${format(activity.endedAt, 'H:mm')}`;
              const width = 100 / laneCount;
              const height = Math.max(expanded ? 2 : 30, ((end - start) / 60) * hourHeight - 1);
              return (
                <li
                  key={activity.id}
                  title={`${activity.name} · ${timing}`}
                  className="absolute flex flex-col justify-between overflow-hidden rounded-xl border border-[#82796a] px-1.5"
                  style={{
                    top: (start / 60) * hourHeight,
                    height,
                    left: `calc(${lane * width}% + 3px)`,
                    width: `calc(${width}% - 6px)`,
                    backgroundColor: activityColor(activity),
                  }}
                >
                  <p className="truncate text-sm leading-[14px] font-medium">{activity.name}</p>
                  <p className="truncate text-right text-xs leading-[14px] tabular-nums">
                    {timing}
                  </p>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
