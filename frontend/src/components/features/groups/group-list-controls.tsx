'use client';

import { Search, ChevronDown } from 'lucide-react';

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
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-[#7A867C]"
        />
        <input
          id="group-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Hledat podle názvu skupiny..."
          className="h-12 w-full rounded-xl border border-[#E0DDD6] bg-white pr-4 pl-11 text-sm font-medium text-[#163820] outline-none placeholder:text-[#7A867C] focus:border-[#163820]"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative min-w-[130px] rounded-xl border border-[#E0DDD6] bg-white px-3.5 py-1.5 shadow-2xs">
          <label htmlFor="role-filter" className="block text-[11px] font-medium text-[#7A867C]">
            Role
          </label>
          <div className="relative flex items-center">
            <select
              id="role-filter"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as 'all' | 'owner' | 'member')}
              className="w-full appearance-none bg-transparent pr-6 text-sm font-bold text-[#163820] outline-none"
            >
              <option value="all">Všechny</option>
              <option value="owner">Vlastník</option>
              <option value="member">Člen</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-0 size-4 text-[#163820]"
            />
          </div>
        </div>

        <div className="relative min-w-[130px] rounded-xl border border-[#E0DDD6] bg-white px-3.5 py-1.5 shadow-2xs">
          <label htmlFor="sort-filter" className="block text-[11px] font-medium text-[#7A867C]">
            Řazení
          </label>
          <div className="relative flex items-center">
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as 'default' | 'name_asc' | 'name_desc')}
              className="w-full appearance-none bg-transparent pr-6 text-sm font-bold text-[#163820] outline-none"
            >
              <option value="default">Výchozí</option>
              <option value="name_asc">A–Z</option>
              <option value="name_desc">Z–A</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-0 size-4 text-[#163820]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
