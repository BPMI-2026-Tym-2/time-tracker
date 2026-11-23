'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';
import { CreateGroupDialog } from '@/components/features/groups/create-group-dialog';

export default function GroupsPage() {
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.isPending && !session.isRefetching && !session.data) {
      router.replace('/login');
    }
  }, [router, session.data, session.isPending, session.isRefetching]);

  if (session.isPending || session.isRefetching || !session.data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col justify-start p-6 md:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skupiny</h1>
            <p className="text-muted-foreground mt-1 text-sm">Správa skupin a jejich nastavení</p>
          </div>
          <CreateGroupDialog />
        </div>
      </div>
    </main>
  );
}
