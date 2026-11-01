'use client';

import { Home, LayoutGrid, Tag, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Skupiny, kategorie a tagy zatím nemají implementované cílové stránky.
const navigationItems = [
  { label: 'Přehled', href: '/', activePaths: ['/'], icon: Home },
  { label: 'Skupiny', href: '/groups', activePaths: ['/groups', '/users'], icon: UsersRound },
  {
    label: 'Kategorie',
    href: '/categories',
    activePaths: ['/categories'],
    icon: LayoutGrid,
  },
  { label: 'Tagy', href: '/tags', activePaths: ['/tags'], icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white p-3 sm:p-4 md:min-h-screen md:w-44 md:border-r md:border-b-0 md:p-3">
      <div className="mb-3 flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm font-semibold md:mb-5">
        logo
      </div>
      <nav aria-label="Hlavní navigace">
        <ul className="flex flex-wrap gap-1 md:flex-col">
          {navigationItems.map(({ label, href, activePaths, icon: Icon }) => {
            const isActive = activePaths.includes(pathname);

            return (
              <li key={label} className="flex flex-1 md:flex-none">
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
