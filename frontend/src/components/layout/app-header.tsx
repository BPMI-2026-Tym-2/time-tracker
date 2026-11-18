'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';
import { NotificationInbox } from '@/components/features/notifications/notification-inbox';
import { authClient } from '@/lib/auth-client';

export function AppHeader() {
  const pathname = usePathname();
  const session = authClient.useSession();
  const sessionUser = session.data?.user;

  const currentSection = pathname.startsWith('/groups')
    ? 'Skupiny'
    : pathname.startsWith('/categories')
      ? 'Kategorie'
      : pathname.startsWith('/tags')
        ? 'Tagy'
        : 'Přehled';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ECE8E1] bg-white px-6">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <Image
            src="/img/feather-logo.webp"
            alt="Logo"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="font-heading text-xl font-bold tracking-tight text-[#163820]">
            Záznamník
          </span>
        </Link>

        <div className="flex items-center gap-2 text-lg font-bold text-[#163820]">
          <span>{currentSection}</span>
          <ChevronDown className="size-4 stroke-[2.5]" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationInbox />

        <div
          aria-label={`Uživatelský profil: ${sessionUser?.name ?? 'Uživatel'}`}
          className="flex size-9 items-center justify-center rounded-full border-2 border-[#163820] text-[#163820] select-none"
        >
          {sessionUser?.name ? (
            <span className="text-xs font-bold">
              {sessionUser.name.charAt(0)}
              {sessionUser.surname ? sessionUser.surname.charAt(0) : ''}
            </span>
          ) : (
            <User className="size-5" />
          )}
        </div>
      </div>
    </header>
  );
}
