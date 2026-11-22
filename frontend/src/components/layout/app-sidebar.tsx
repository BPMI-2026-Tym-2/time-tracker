'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Info, Settings, UserRound, Users } from 'lucide-react';

const mainLinks = [
  { href: '/overview', label: 'Přehled', icon: BookOpen },
  { href: '/groups', label: 'Skupiny', icon: Users },
  { href: '/myaccount', label: 'Můj účet', icon: UserRound },
];

export function AppSidebar() {
  const pathname = usePathname();
  const groupPath = pathname.match(/^\/groups\/[^/]+/)?.[0];
  const links = groupPath
    ? [
        ...mainLinks,
        { href: groupPath, label: 'Detail skupiny', icon: Info },
        { href: `${groupPath}/settings`, label: 'Nastavení', icon: Settings },
      ]
    : mainLinks;

  return (
    <aside className="border-b border-[#e8e2d6] bg-[#f9f6ef] px-4 py-3 md:w-56 md:shrink-0 md:border-r md:border-b-0 md:p-5">
      <nav
        aria-label="Hlavní navigace"
        className="flex flex-wrap gap-1.5 md:flex-col md:items-stretch"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const isGroupSection = href === '/groups' && Boolean(groupPath);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors md:gap-3 md:px-4 md:py-2.5 ${
                isActive
                  ? 'bg-[#163820] text-white'
                  : isGroupSection
                    ? 'bg-[#e9efe4] text-[#163820] hover:bg-[#dce7d7]'
                    : 'text-[#163820] hover:bg-[#eee9df]'
              }`}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
