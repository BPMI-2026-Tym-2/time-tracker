import Link from 'next/link';
import { Home, Users, LayoutGrid, Tag } from 'lucide-react';

interface SettingsSidebarProps {
  activeTab?: 'overview' | 'groups' | 'categories' | 'tags';
}

export function SettingsSidebar({ activeTab = 'groups' }: SettingsSidebarProps) {
  return (
    <aside className="border-border bg-card hidden w-64 shrink-0 border-r py-6 pr-4 pl-0 md:block">
      <nav className="space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3.5 px-6 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="size-5" />
          <span>Přehled</span>
        </Link>

        <Link href="/groups" className="relative flex items-center">
          {activeTab === 'groups' && (
            <div className="bg-primary absolute top-0 bottom-0 left-0 w-1 rounded-r-md" />
          )}
          <div
            className={`ml-3 flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'groups'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="size-5" />
            <span>Skupiny</span>
          </div>
        </Link>

        <div className="text-muted-foreground flex items-center gap-3.5 px-6 py-2.5 text-sm font-medium">
          <LayoutGrid className="size-5" />
          <span>Kategorie</span>
        </div>

        <div className="text-muted-foreground flex items-center gap-3.5 px-6 py-2.5 text-sm font-medium">
          <Tag className="size-5" />
          <span>Tagy</span>
        </div>
      </nav>
    </aside>
  );
}
