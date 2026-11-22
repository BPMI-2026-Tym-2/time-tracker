import { addDays, format, isSameDay, setHours } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import type { ActivityResponse } from '@time-tracker/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const minutesPerDay = 1_440;
const hourHeight = 56;

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
      end: Math.min(minutesPerDay, Math.max(end, start + 20)),
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
  onAdd: (date: Date, trigger: HTMLButtonElement) => void;
};

export function ActivityCalendar({ weekStart, activities, onAdd }: ActivityCalendarProps) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    return { day, entries: layoutDay(day, activities) };
  });
  const today = new Date();
  let firstHour = 8;
  let lastHour = 19;
  for (const { entries } of days) {
    for (const entry of entries) {
      firstHour = Math.min(firstHour, Math.floor(entry.start / 60));
      lastHour = Math.max(lastHour, Math.ceil(entry.end / 60));
    }
  }

  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const height = hours.length * hourHeight;

  return (
    <div
      role="region"
      aria-label="Týdenní kalendář aktivit"
      tabIndex={0}
      className="focus-visible:ring-ring max-h-[40rem] overflow-auto focus-visible:ring-2 focus-visible:ring-inset"
    >
      <div className="grid min-w-[46rem] grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
        <div className="border-border bg-muted sticky top-0 left-0 z-30 border-r border-b" />
        {days.map(({ day }) => (
          <div
            key={day.toISOString()}
            className={cn(
              'border-border sticky top-0 z-20 flex min-h-14 items-center justify-between gap-1 border-r border-b bg-white px-2 last:border-r-0',
              isSameDay(day, today) && 'bg-[#e9efe4]',
            )}
          >
            <div>
              <p className="text-muted-foreground text-xs font-medium capitalize">
                {format(day, 'EEE', { locale: cs })}
              </p>
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                aria-current={isSameDay(day, today) ? 'date' : undefined}
                className="text-primary text-sm font-semibold"
              >
                {format(day, 'd. M.')}
              </time>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-haspopup="dialog"
              aria-label={`Přidat aktivitu ${format(day, 'd. M.')}`}
              onClick={(event) => onAdd(setHours(day, 9), event.currentTarget)}
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
        ))}

        <div className="border-border bg-card sticky left-0 z-10 border-r" aria-hidden="true">
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: hourHeight }}
              className="text-muted-foreground border-border border-b px-1.5 pt-1 text-right text-xs tabular-nums"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        {days.map(({ day, entries }) => (
          <ul
            key={day.toISOString()}
            aria-label={format(day, 'EEEE d. M.', { locale: cs })}
            className={cn(
              'border-border relative overflow-hidden border-r last:border-r-0',
              isSameDay(day, today) && 'bg-[#f6f9f3]',
            )}
            style={{
              height,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${hourHeight - 1}px, var(--border) ${hourHeight - 1}px ${hourHeight}px)`,
            }}
          >
            {entries.map(({ activity, start, end, lane, laneCount }) => {
              const timing = `${format(activity.startedAt, 'HH:mm')}–${format(activity.endedAt, 'HH:mm')}`;
              const width = 100 / laneCount;
              return (
                <li
                  key={activity.id}
                  title={`${activity.name} · ${timing}`}
                  className="absolute overflow-hidden rounded-md border border-l-2 border-[#d0dfcd] border-l-[#528054] bg-[#e6efe3] px-1.5 text-[#163820]"
                  style={{
                    top: ((start - firstHour * 60) / 60) * hourHeight,
                    height: Math.max(2, ((end - start) / 60) * hourHeight - 1),
                    left: `calc(${lane * width}% + 2px)`,
                    width: `calc(${width}% - 4px)`,
                  }}
                >
                  <p className="truncate text-xs leading-4 font-semibold">{activity.name}</p>
                  <p className="truncate text-[11px] leading-4 tabular-nums">{timing}</p>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
