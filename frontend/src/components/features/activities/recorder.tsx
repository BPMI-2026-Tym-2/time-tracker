'use client';

import { useQuery } from '@tanstack/react-query';
import { activitySchema } from '@time-tracker/shared';
import { Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { publicEnv } from '@/lib/env';

const startedAtFormat = new Intl.DateTimeFormat('cs-CZ', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const durationFormat = new Intl.NumberFormat('cs-CZ', { style: 'unit', unit: 'minute' });

export function Recorder({ organizationId }: { organizationId?: string }) {
  const title = organizationId ? 'Záznamník skupiny' : 'Vlastní záznamník';
  const path = organizationId
    ? `/api/organizations/${encodeURIComponent(organizationId)}/activities`
    : '/api/users/activities';

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['activities', organizationId],
    queryFn: async ({ signal }) => {
      const response = await fetch(`${publicEnv.apiUrl}${path}`, {
        credentials: 'include',
        signal,
      });
      if (!response.ok) throw new Error('Aktivity se nepodařilo načíst.');
      return activitySchema.listResponse.parse(await response.json());
    },
  });

  return (
    <section aria-label={title} className="border-border bg-card rounded-2xl border shadow-xs">
      <div className="border-border flex items-center gap-3 border-b px-5 py-4">
        <span className="bg-primary/10 text-primary rounded-xl p-2.5">
          <Clock3 aria-hidden="true" className="size-5" />
        </span>
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      </div>
      {isPending ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="space-y-3 p-5">
          <p role="alert" className="text-destructive text-sm">
            Aktivity se nepodařilo načíst.
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Zkusit znovu
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <p className="text-muted-foreground p-5 text-sm">Zatím tu nejsou žádné aktivity.</p>
      ) : (
        <ul className="divide-border divide-y px-5">
          {data.items.map((activity) => (
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
      )}
    </section>
  );
}
