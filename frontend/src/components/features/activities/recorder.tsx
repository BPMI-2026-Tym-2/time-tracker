'use client';

import { useRef, useState } from 'react';
import { addDays, addWeeks, format, isSameWeek, setHours, startOfDay, startOfWeek } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus } from 'lucide-react';
import type { ActivityResponse } from '@time-tracker/shared';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useActivities } from '@/hooks/use-activities';
import { authClient } from '@/lib/auth-client';
import { ActivityCalendar } from './activity-calendar';
import { AddActivityDialog } from './add-activity-dialog';

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
  const [draft, setDraft] = useState<{ date: Date; trigger: HTMLButtonElement }>();
  const addButton = useRef<HTMLButtonElement>(null);
  const { data, isPending, isError, refetch } = useActivities(
    userId,
    weekStart,
    addWeeks(weekStart, 1),
    organizationId,
  );
  const activities = data?.items ?? [];
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
    <section
      aria-label={title}
      className="border-border bg-card min-w-0 rounded-2xl border shadow-xs"
    >
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#e9efe4] p-2.5 text-[#163820]">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        </div>
        <Button
          ref={addButton}
          type="button"
          aria-haspopup="dialog"
          disabled={!userId}
          onClick={(event) =>
            openDialog(
              setHours(isCurrentWeek ? startOfDay(new Date()) : weekStart, 9),
              event.currentTarget,
            )
          }
        >
          <Plus aria-hidden="true" /> Přidat aktivitu
        </Button>
      </div>
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Předchozí týden"
            onClick={() => setWeekStart((week) => addWeeks(week, -1))}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <p aria-live="polite" className="px-1 text-sm font-semibold tabular-nums">
            {weekLabel}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Další týden"
            onClick={() => setWeekStart((week) => addWeeks(week, 1))}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isCurrentWeek}
            onClick={() => setWeekStart(startOfWeek(new Date(), weekOptions))}
          >
            Tento týden
          </Button>
        </div>
        <div
          role="group"
          aria-label="Zobrazení aktivit"
          className="bg-muted flex gap-1 rounded-full p-1"
        >
          <Button
            size="sm"
            variant={view === 'calendar' ? 'default' : 'ghost'}
            aria-pressed={view === 'calendar'}
            onClick={() => setView('calendar')}
          >
            <CalendarDays aria-hidden="true" /> Kalendář
          </Button>
          <Button
            size="sm"
            variant={view === 'list' ? 'default' : 'ghost'}
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            <List aria-hidden="true" /> Seznam
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
              {data.hasActivities
                ? 'V tomto týdnu nejsou žádné aktivity.'
                : 'Zatím tu nejsou žádné aktivity.'}
            </p>
          ) : null}
          {view === 'calendar' ? (
            <ActivityCalendar weekStart={weekStart} activities={activities} onAdd={openDialog} />
          ) : (
            <ActivityList activities={activities} />
          )}
        </>
      )}
      {draft && userId ? (
        <AddActivityDialog
          startedAt={draft.date}
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
