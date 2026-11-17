import Link from 'next/link';
import { Home, Users, LayoutGrid, Tag } from 'lucide-react';

export function SettingsSidebar() {
  return (
    <aside className="border-border bg-card hidden w-64 shrink-0 border-r py-6 pr-4 pl-0 md:block">
      <nav className="space-y-1">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground flex items-center gap-3.5 px-6 py-2.5 text-sm font-medium transition-colors"
        >
          <Home className="size-5" />
          <span>Přehled</span>
        </Link>

        <Link href="/groups" className="relative flex items-center">
          <div className="bg-primary absolute top-0 bottom-0 left-0 w-1 rounded-r-md" />
          <div className="bg-primary/10 text-primary ml-3 flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold">
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
