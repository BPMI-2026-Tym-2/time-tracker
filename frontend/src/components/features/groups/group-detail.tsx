'use client';

import Link from 'next/link';
import { useOrganization } from '@/hooks/use-organization';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Recorder } from '@/components/features/activities/recorder';

const roleLabels = { owner: 'Vlastník', member: 'Člen' } as const;

export function GroupDetail({ groupId }: { groupId: string }) {
  const { data, isPending, isError, error } = useOrganization(groupId);

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4" role="alert">
        <h1 className="text-2xl font-bold">Skupinu se nepodařilo načíst</h1>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button variant="outline" render={<Link href="/groups" />} nativeButton={false}>
          Zpět na skupiny
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
          <p className="text-muted-foreground text-sm">{data.description || 'Bez popisu'}</p>
        </div>
        <Button variant="outline" render={<Link href="/groups" />} nativeButton={false}>
          Zpět na skupiny
        </Button>
      </div>

      <dl className="border-border bg-card grid gap-4 rounded-2xl border p-5 text-sm shadow-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Vlastník</dt>
          <dd className="font-medium">
            {data.owner ? `${data.owner.name} ${data.owner.surname}` : 'Neznámý'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Počet členů</dt>
          <dd className="font-medium">{data.memberCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Vaše role</dt>
          <dd className="font-medium">
            {data.currentUserRole ? roleLabels[data.currentUserRole] : 'Správce aplikace'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Kategorie</dt>
          <dd className="font-medium">
            {data.categories.length > 0 ? data.categories.join(', ') : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tagy</dt>
          <dd className="font-medium">{data.tags.length > 0 ? data.tags.join(', ') : '—'}</dd>
        </div>
      </dl>
      {data.currentUserRole ? <Recorder organizationId={groupId} /> : null}
    </div>
  );
}
