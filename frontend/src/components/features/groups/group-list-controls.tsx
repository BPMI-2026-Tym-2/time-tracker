'use client';

import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

type GroupListControlsProps = {
  search: string;
  role: 'all' | 'owner' | 'member';
  sort: 'default' | 'name_asc' | 'name_desc';
  onSearchChange: (search: string) => void;
  onRoleChange: (role: 'all' | 'owner' | 'member') => void;
  onSortChange: (sort: 'default' | 'name_asc' | 'name_desc') => void;
};

export function GroupListControls({
  search,
  role,
  sort,
  onSearchChange,
  onRoleChange,
  onSortChange,
}: GroupListControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <label htmlFor="group-search" className="sr-only">
          Hledat podle názvu skupiny
        </label>
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          id="group-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Hledat podle názvu skupiny..."
          className="h-12 w-full rounded-xl pr-3 pl-10 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="border-border bg-card relative min-w-36 rounded-xl border px-3 py-1.5 shadow-xs">
          <label htmlFor="role-filter" className="text-muted-foreground block text-xs">
            Role
          </label>
          <div className="relative flex items-center">
            <select
              id="role-filter"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as 'all' | 'owner' | 'member')}
              className="text-foreground w-full appearance-none bg-transparent pr-6 text-sm font-semibold outline-none"
            >
              <option value="all">Všechny</option>
              <option value="owner">Vlastník</option>
              <option value="member">Člen</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute right-0 size-4"
            />
          </div>
        </div>

        <div className="border-border bg-card relative min-w-36 rounded-xl border px-3 py-1.5 shadow-xs">
          <label htmlFor="sort-filter" className="text-muted-foreground block text-xs">
            Řazení
          </label>
          <div className="relative flex items-center">
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as 'default' | 'name_asc' | 'name_desc')}
              className="text-foreground w-full appearance-none bg-transparent pr-6 text-sm font-semibold outline-none"
            >
              <option value="default">Výchozí</option>
              <option value="name_asc">A–Z</option>
              <option value="name_desc">Z–A</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute right-0 size-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
