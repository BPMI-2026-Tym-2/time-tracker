import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserRole } from '../types';

type UserListControlsProps = {
  canViewEmail: boolean;
  searchInput: string;
  selectedRole: UserRole | '';
  isNewestFirst: boolean;
  onSearchInputChange: (value: string) => void;
  onRoleChange: (role: UserRole | '') => void;
  onSortToggle: () => void;
};

export function UserListControls({
  canViewEmail,
  searchInput,
  selectedRole,
  isNewestFirst,
  onSearchInputChange,
  onRoleChange,
  onSortToggle,
}: UserListControlsProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <div className="relative min-w-0">
        <label htmlFor="user-search" className="sr-only">
          {canViewEmail
            ? 'Vyhledat uživatele podle jména nebo e-mailu'
            : 'Vyhledat uživatele podle jména'}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
        />
        <Input
          id="user-search"
          type="search"
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder={canViewEmail ? 'Jméno / e-mail...' : 'Jméno...'}
          className="pr-3 pl-10"
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
        type="button"
        variant="outline"
        aria-label={
          isNewestFirst ? 'Seřadit od nejstaršího vstupu' : 'Seřadit od nejnovějšího vstupu'
        }
        onClick={onSortToggle}
        className="h-10 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50"
      >
        {isNewestFirst ? (
          <ArrowDownWideNarrow aria-hidden="true" />
        ) : (
          <ArrowUpWideNarrow aria-hidden="true" />
        )}
        Řazení: {isNewestFirst ? 'nejnovější vstupy' : 'nejstarší vstupy'}
      </Button>
    </div>
  );
}
