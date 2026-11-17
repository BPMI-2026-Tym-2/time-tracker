'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/hooks/use-logout';
import { Button } from '@/components/ui/button';

import { AppHeader } from '@/components/layout/app-header';
import Link from 'next/link';

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
    <div className="flex min-h-screen flex-col bg-[#F6F3ED]">
      <AppHeader
        userName={session.data.user.name}
        userInitials={`${session.data.user.name?.charAt(0) ?? 'E'}${session.data.user.surname?.charAt(0) ?? 'M'}`}
      />

      <main className="flex flex-1 flex-col items-center justify-center p-8 sm:p-24">
        <div className="flex max-w-md flex-col items-center gap-6 rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-8 text-center shadow-xs">
          <h1 className="text-2xl font-bold text-[#1C261F] sm:text-3xl">
            Vítejte v aplikaci Time Tracker
          </h1>
          <div className="text-sm text-[#5E5A54]">
            <p className="font-semibold text-[#1C261F]">
              {session.data.user.name} {session.data.user.surname}
            </p>
            <p>{session.data.user.email}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Link
              href="/invitations"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#1E3426] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16271D]"
            >
              Přejít na správu pozvánek a oznámení
            </Link>

            <Button
              type="button"
              variant="outline"
              onClick={() => logout()}
              disabled={isLogoutPending}
              className="w-full rounded-xl border-[#DFD8CC]"
            >
              {isLogoutPending ? 'Odhlášení...' : 'Odhlásit se'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
