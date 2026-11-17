import Link from 'next/link';
import { Home, Users, LayoutGrid, Tag } from 'lucide-react';

interface SettingsSidebarProps {
  activeTab?: 'overview' | 'groups' | 'categories' | 'tags';
}

export function SettingsSidebar({ activeTab = 'groups' }: SettingsSidebarProps) {
  return (
    <aside className="border-border bg-card hidden w-64 shrink-0 border-r py-6 pr-4 pl-0 md:block">
      <nav className="space-y-1.5 px-4">
        <Link
          href="/"
          className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#18392b] font-semibold text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="size-5" />
          <span>Přehled</span>
        </Link>

        <Link
          href="/groups"
          className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm transition-colors ${
            activeTab === 'groups'
              ? 'bg-[#18392b] font-semibold text-white'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <Users className="size-5" />
          <span>Skupiny</span>
        </Link>

        <div
          className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium ${
            activeTab === 'categories'
              ? 'bg-[#18392b] font-semibold text-white'
              : 'text-muted-foreground'
          }`}
        >
          <LayoutGrid className="size-5" />
          <span>Kategorie</span>
        </div>

        <div
          className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium ${
            activeTab === 'tags' ? 'bg-[#18392b] font-semibold text-white' : 'text-muted-foreground'
          }`}
        >
          <Tag className="size-5" />
          <span>Tagy</span>
        </div>
      </nav>
    </aside>
  );
}
