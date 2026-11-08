import type { FormEvent } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserRole } from '../types';

type UserListControlsProps = {
  canViewEmail: boolean;
  searchInput: string;
  selectedRole: UserRole | '';
  isNewestFirst: boolean;
  onSearchInputChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onRoleChange: (role: UserRole | '') => void;
  onSortToggle: () => void;
};

export function UserListControls({
  canViewEmail,
  searchInput,
  selectedRole,
  isNewestFirst,
  onSearchInputChange,
  onSearch,
  onRoleChange,
  onSortToggle,
}: UserListControlsProps) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Seznam uživatelů</h2>
        <Button
          type="button"
          aria-label={
            isNewestFirst ? 'Seřadit od nejstaršího vstupu' : 'Seřadit od nejnovějšího vstupu'
          }
          onClick={onSortToggle}
          className="h-9 rounded-md bg-blue-600 px-3 text-white hover:bg-blue-700"
        >
          {isNewestFirst ? (
            <ArrowDownWideNarrow aria-hidden="true" />
          ) : (
            <ArrowUpWideNarrow aria-hidden="true" />
          )}
          Řazení: {isNewestFirst ? 'nejnovější vstupy' : 'nejstarší vstupy'}
        </Button>
      </div>

      <form
        onSubmit={onSearch}
        className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
      >
        <label htmlFor="user-search" className="sr-only">
          {canViewEmail
            ? 'Vyhledat uživatele podle jména nebo e-mailu'
            : 'Vyhledat uživatele podle jména'}
        </label>
        <div className="relative min-w-0">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            id="user-search"
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder={canViewEmail ? 'Jméno / e-mail...' : 'Jméno...'}
            className="h-10 w-full rounded-md border border-slate-200 bg-white pr-3 pl-10 text-sm outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <label htmlFor="role-filter" className="sr-only">
          Filtrovat podle role
        </label>
        <select
          id="role-filter"
          value={selectedRole}
          onChange={(event) => {
            const role = event.currentTarget.value;
            if (role === '' || role === 'Člen' || role === 'admin') {
              onRoleChange(role);
            }
          }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="">Všechny role</option>
          <option value="Člen">Člen</option>
          <option value="admin">admin</option>
        </select>
        <Button
          type="submit"
          className="h-10 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700"
        >
          <Search aria-hidden="true" />
          Hledat
        </Button>
      </form>
    </>
  );
}
