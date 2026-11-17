'use client';

import { NotificationInbox } from '@/components/features/notifications/notification-inbox';
import { authClient } from '@/lib/auth-client';
import type { InvitationErrorCode } from '@/lib/api/invitations';

interface AppHeaderProps {
  userName?: string;
  userInitials?: string;
  simulatedScenario?: InvitationErrorCode;
}

export function AppHeader({ userName, userInitials, simulatedScenario }: AppHeaderProps) {
  const session = authClient.useSession();
  const sessionUser = session.data?.user;

  const displayName = userName ?? sessionUser?.name ?? 'Emil';
  const displayInitials =
    userInitials ??
    (sessionUser?.name
      ? `${sessionUser.name.charAt(0)}${sessionUser.surname ? sessionUser.surname.charAt(0) : ''}`
      : 'EM');

  return (
    <header className="w-full border-b border-[#DFD8CC] bg-[#EFE9DF] px-6 py-3 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Levá část: Brand / Název */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-[#1C261F]">Time Tracker</span>
        </div>

        {/* Pravá část: Notifikace & Profil přesně podle mockupu */}
        <div className="flex items-center gap-4">
          {/* Uživatelské jméno */}
          <div className="text-right">
            <span className="block text-xs font-medium text-[#5E5A54]">Jméno</span>
            <span className="block text-sm font-bold text-[#1C261F]">{displayName}</span>
          </div>

          {/* Ikona zvonku s panelem oznámení */}
          <NotificationInbox simulatedScenario={simulatedScenario} />

          {/* Avatar uživatele (EM) */}
          <div
            aria-label={`Uživatelský profil: ${displayName}`}
            className="flex size-10 items-center justify-center rounded-full border border-[#4B5563] bg-[#D4D4D8] text-sm font-bold text-[#1C261F] shadow-xs"
          >
            {displayInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
