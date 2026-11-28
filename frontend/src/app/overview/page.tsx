'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';
import { Recorder } from '@/components/features/activities/recorder';

export default function Home() {
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.isPending && !session.isRefetching && !session.data) {
      router.replace('/login');
    }
  }, [router, session.data, session.isPending, session.isRefetching]);

  if (session.isPending || session.isRefetching || !session.data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="w-full min-w-0 space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight">
            Přehled
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {session.data.user.name} {session.data.user.surname}
          </p>
        </div>
      </div>
      <Recorder />
    </main>
  );
}
