'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, LayoutGrid, Tag } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Přehled', icon: Home, matchExact: true },
  { href: '/groups', label: 'Skupiny', icon: Users, matchExact: false },
  { href: '/categories', label: 'Kategorie', icon: LayoutGrid, matchExact: false },
  { href: '/tags', label: 'Tagy', icon: Tag, matchExact: false },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 pt-8 pr-6 pl-6 md:block">
      <nav className="space-y-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-2.5 text-base font-semibold transition-colors ${
                isActive
                  ? 'rounded-2xl bg-[#163820] text-white shadow-xs'
                  : 'text-[#163820] hover:opacity-80'
              }`}
            >
              <Icon className="size-5 stroke-[2]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
