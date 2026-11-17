'use client';

import Link from 'next/link';
import { NotebookPen, ChevronDown } from 'lucide-react';
import { NotificationInbox } from '@/components/features/notifications/notification-inbox';
import { authClient } from '@/lib/auth-client';

interface AppHeaderProps {
  userName?: string;
  userInitials?: string;
}

export function AppHeader({ userName, userInitials }: AppHeaderProps) {
  const session = authClient.useSession();
  const sessionUser = session.data?.user;

  const displayName = userName ?? sessionUser?.name ?? 'Emil';
  const displayInitials =
    userInitials ??
    (sessionUser?.name
      ? `${sessionUser.name.charAt(0)}${sessionUser.surname ? sessionUser.surname.charAt(0) : ''}`
      : 'EM');

  return (
    <header className="border-border bg-card sticky top-0 z-30 w-full border-b transition-colors">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-heading text-foreground flex items-center gap-2 text-base font-bold tracking-tight hover:opacity-90"
          >
            <NotebookPen className="size-5" />
            <span>Záznamník</span>
          </Link>

          <Link
            href="/groups"
            className="text-foreground flex items-center gap-1.5 text-base font-bold transition-opacity hover:opacity-80"
          >
            <span>Skupiny</span>
            <ChevronDown className="size-4" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-muted-foreground block text-[11px] leading-none font-medium">
              Jméno
            </span>
            <span className="text-foreground mt-0.5 block text-sm leading-tight font-semibold">
              {displayName}
            </span>
          </div>

          <NotificationInbox />

          <div
            aria-label={`Uživatelský profil: ${displayName}`}
            className="border-border bg-muted text-foreground flex size-9 items-center justify-center rounded-full border text-xs font-bold shadow-xs select-none"
          >
            {displayInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
