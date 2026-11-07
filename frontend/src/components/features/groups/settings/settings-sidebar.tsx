import Link from 'next/link';
import { LayoutDashboard, Users, LayoutGrid, Tag } from 'lucide-react';

export function SettingsSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200/70 bg-white p-4 md:block">
      <nav className="space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LayoutDashboard className="h-4 w-4 text-slate-500" />
          <span>Přehled</span>
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-600">
          <Users className="h-4 w-4 text-blue-600" />
          <span>Skupiny</span>
        </div>
        <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
          <LayoutGrid className="h-4 w-4" />
          <span>Kategorie</span>
        </div>
        <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
          <Tag className="h-4 w-4" />
          <span>Tagy</span>
        </div>
      </nav>
    </aside>
  );
}
