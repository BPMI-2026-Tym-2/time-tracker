'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/hooks/use-logout';
import { Button } from '@/components/ui/button';

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Welcome to the Time Tracker</h1>
        <p>{session.data.user.name}</p>
        <p>{session.data.user.surname}</p>
        <Button type="button" onClick={() => logout()} disabled={isLogoutPending}>
          {isLogoutPending ? 'Odhlášení...' : 'Odhlásit se'}
        </Button>
      </div>
    </main>
  );
}
