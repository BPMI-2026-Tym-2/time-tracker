'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/hooks/use-logout';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layout/app-header';

export default function Home() {
  const router = useRouter();
  const session = authClient.useSession();
  const { logout, isPending: isLogoutPending } = useLogout();

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
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader
        userName={session.data.user.name}
        userInitials={`${session.data.user.name?.charAt(0) ?? 'E'}${session.data.user.surname?.charAt(0) ?? 'M'}`}
      />

      <main className="flex flex-1 flex-col items-center justify-center p-8 sm:p-24">
        <div className="border-border bg-card flex max-w-md flex-col items-center gap-6 rounded-3xl border p-8 text-center shadow-xs">
          <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Vítejte v aplikaci Time Tracker
          </h1>
          <div className="text-muted-foreground text-sm">
            <p className="text-foreground font-semibold">
              {session.data.user.name} {session.data.user.surname}
            </p>
            <p>{session.data.user.email}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button render={<Link href="/groups/skupina-1/settings" />} className="w-full">
              Nastavení skupiny
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => logout()}
              disabled={isLogoutPending}
              className="w-full"
            >
              {isLogoutPending ? 'Odhlášení...' : 'Odhlásit se'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
