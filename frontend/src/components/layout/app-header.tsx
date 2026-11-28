'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AccountMenu } from '@/components/layout/account-menu';
import { NotificationInbox } from '@/components/features/notifications/notification-inbox';

export function AppHeader() {
  const pathname = usePathname();

  const currentSection = pathname.startsWith('/groups')
    ? 'Skupiny'
    : pathname.startsWith('/myaccount')
      ? 'Můj účet'
      : pathname.startsWith('/users')
        ? 'Uživatelé'
        : 'Přehled';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ECE8E1] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-8">
        <Link
          href="/overview"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
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

        <span className="hidden text-sm font-semibold text-[#536556] sm:block">
          {currentSection}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <NotificationInbox />

        <AccountMenu />
      </div>
    </header>
  );
}
