'use client';

import { useRef, useState } from 'react';
import { addDays, addWeeks, format, isSameWeek, setHours, startOfDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Grid2X2, List, Play, Square } from 'lucide-react';
import type { ActivityResponse } from '@time-tracker/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useActivities } from '@/hooks/use-activities';
import { authClient } from '@/lib/auth-client';
import { ActivityCalendar } from './activity-calendar';
import { AddActivityDialog } from './add-activity-dialog';

const toolbarButton =
  'h-10 rounded-xl border-[#82796a] bg-[#ecdec8] px-4 text-[#211e18] hover:bg-[#e1d0b2]';
const viewButton =
  'size-10 rounded-none text-[#211e18] hover:bg-[#e1d0b2] aria-pressed:bg-[#b19a72]';

const weekOptions = { weekStartsOn: 1 } as const;
const startedAtFormat = new Intl.DateTimeFormat('cs-CZ', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const durationFormat = new Intl.NumberFormat('cs-CZ', { style: 'unit', unit: 'minute' });

function ActivityList({ activities }: { activities: ActivityResponse[] }) {
  return (
    <ul className="divide-border divide-y px-5">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-foreground font-medium wrap-break-word">{activity.name}</p>
            <time
              dateTime={activity.startedAt.toISOString()}
              className="text-muted-foreground text-sm"
            >
              {startedAtFormat.format(activity.startedAt)}
            </time>
          </div>
          <span className="bg-muted text-foreground shrink-0 rounded-full px-3 py-1 text-sm tabular-nums">
            {durationFormat.format(
              Math.round((activity.endedAt.getTime() - activity.startedAt.getTime()) / 60_000),
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Recorder({ organizationId }: { organizationId?: string }) {
  const title = organizationId ? 'Záznamník skupiny' : 'Vlastní záznamník';
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), weekOptions));
  const [draft, setDraft] = useState<{
    date: Date;
    trigger: HTMLButtonElement;
    endedAt?: Date;
  }>();
  const [filter, setFilter] = useState('');
  const [timerStart, setTimerStart] = useState<Date>();
  const addButton = useRef<HTMLButtonElement>(null);
  const { data, isPending, isError, refetch } = useActivities(
    userId,
    weekStart,
    addWeeks(weekStart, 1),
    organizationId,
  );
  const search = filter.trim().toLocaleLowerCase('cs');
  const activities = (data?.items ?? []).filter((activity) =>
    activity.name.toLocaleLowerCase('cs').includes(search),
  );
  const isCurrentWeek = isSameWeek(weekStart, new Date(), weekOptions);
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${format(weekStart, weekStart.getFullYear() === weekEnd.getFullYear() ? 'd. M.' : 'd. M. yyyy')} – ${format(weekEnd, 'd. M. yyyy')}`;

  function openDialog(date: Date, trigger: HTMLButtonElement) {
    setDraft({ date, trigger });
  }

  function closeDialog() {
    const trigger = draft?.trigger;
    setDraft(undefined);
    requestAnimationFrame(() => {
      (trigger?.isConnected ? trigger : addButton.current)?.focus();
    });
  }

  return (
    <section aria-label={title} className="bg-card min-w-0">
      <h2 className="text-foreground mb-2 text-lg font-semibold">{title}</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button
          ref={addButton}
          type="button"
          variant="outline"
          className={cn(toolbarButton, 'font-bold')}
          aria-haspopup="dialog"
          disabled={!userId}
          onClick={(event) =>
            openDialog(
              setHours(isCurrentWeek ? startOfDay(new Date()) : weekStart, 9),
              event.currentTarget,
            )
          }
        >
          Přidat aktivitu
        </Button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center" aria-label="Výběr týdne" role="group">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Předchozí týden"
              onClick={() => setWeekStart((week) => addWeeks(week, -1))}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className={toolbarButton}
              aria-label={
                isCurrentWeek ? `Tento týden, ${weekLabel}` : `${weekLabel}, zpět na tento týden`
              }
              onClick={() => setWeekStart(startOfWeek(new Date(), weekOptions))}
            >
              {isCurrentWeek ? 'Tento týden' : weekLabel}
            </Button>
            <span aria-live="polite" className="sr-only">
              {weekLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Další týden"
              onClick={() => setWeekStart((week) => addWeeks(week, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>

          <div
            role="group"
            aria-label="Zobrazení aktivit"
            className="flex overflow-hidden rounded-xl border border-[#82796a] bg-[#ecdec8]"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(viewButton, 'border-r-[#82796a]')}
              aria-label="Seznam"
              title="Seznam"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <List aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={viewButton}
              aria-label="Kalendář"
              title="Kalendář"
              aria-pressed={view === 'calendar'}
              onClick={() => setView('calendar')}
            >
              <Grid2X2 aria-hidden="true" />
            </Button>
          </div>

          <Popover>
            <PopoverTrigger
              render={<Button type="button" variant="outline" className={toolbarButton} />}
            >
              {search ? 'Filtr (1)' : 'Filtr'}
            </PopoverTrigger>
            <PopoverContent align="end" aria-label="Filtr aktivit">
              <Label htmlFor="recorder-activity-filter">Název aktivity</Label>
              <Input
                id="recorder-activity-filter"
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.currentTarget.value)}
              />
              {search && (
                <Button type="button" variant="outline" size="sm" onClick={() => setFilter('')}>
                  Zrušit filtr
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="outline"
            className={cn(toolbarButton, 'min-w-14', timerStart && 'bg-[#b19a72]')}
            disabled={!userId || Boolean(draft)}
            aria-label={timerStart ? 'Zastavit měření času' : 'Spustit měření času'}
            title={
              timerStart
                ? `Zastavit měření od ${format(timerStart, 'H:mm')}`
                : 'Spustit měření času'
            }
            onClick={(event) => {
              const now = new Date();
              if (timerStart && now > timerStart) {
                setDraft({ date: timerStart, endedAt: now, trigger: event.currentTarget });
                setTimerStart(undefined);
              } else {
                setTimerStart(now);
              }
            }}
          >
            {timerStart ? (
              <Square aria-hidden="true" fill="currentColor" />
            ) : (
              <Play aria-hidden="true" fill="currentColor" />
            )}
          </Button>
        </div>
      </div>
      {isError ? (
        <div className="space-y-3 p-5">
          <p role="alert" className="text-destructive text-sm">
            Aktivity se nepodařilo načíst.
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Zkusit znovu
          </Button>
        </div>
      ) : isPending ? (
        <div role="status" className="flex justify-center p-8">
          <Spinner />
          <span className="sr-only">Načítám aktivity…</span>
        </div>
      ) : (
        <>
          {activities.length === 0 ? (
            <p className="text-muted-foreground border-border border-b px-4 py-3 text-sm">
              {search
                ? 'Filtru neodpovídají žádné aktivity.'
                : data.hasActivities
                  ? 'V tomto týdnu nejsou žádné aktivity.'
                  : 'Zatím tu nejsou žádné aktivity.'}
            </p>
          ) : null}
          {view === 'calendar' ? (
            <ActivityCalendar weekStart={weekStart} activities={activities} expanded />
          ) : (
            <ActivityList activities={activities} />
          )}
        </>
      )}
      {draft && userId ? (
        <AddActivityDialog
          startedAt={draft.date}
          endedAt={draft.endedAt}
          userId={userId}
          organizationId={organizationId}
          onClose={closeDialog}
          onSaved={(activity) => {
            setWeekStart(startOfWeek(activity.startedAt, weekOptions));
            closeDialog();
          }}
        />
      ) : null}
    </section>
  );
}
