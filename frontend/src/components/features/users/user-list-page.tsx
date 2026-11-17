'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { UserTable } from './components/user-table';
import { mockUserGroups, mockUsers, type MockUserGroup } from './data/mock-users';
import type { UserListApiState, UserListViewerRole } from './types';

type UserListPageProps = {
  viewerRole: UserListViewerRole;
  apiState?: UserListApiState;
};

const apiStateMessages: Partial<Record<UserListApiState, string>> = {
  loading: 'Načítám seznam uživatelů…',
  empty: 'Tato skupina zatím nemá žádné uživatele.',
  unauthenticated: 'Pro zobrazení seznamu se přihlaste.',
  forbidden: 'Nemáte oprávnění k zobrazení uživatelů této skupiny.',
  'not-found': 'Skupina nebyla nalezena.',
  error: 'Seznam uživatelů se nepodařilo načíst. Zkuste to prosím později.',
};

export function UserListPage({ viewerRole, apiState = 'success' }: UserListPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<MockUserGroup>(mockUserGroups[0]);
  const canViewEmail = viewerRole === 'admin' || viewerRole === 'superAdmin';
  const groupUsers = mockUsers.filter((user) => user.group === selectedGroup);
  const stateMessage = apiStateMessages[apiState];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <h1 className="relative flex items-center">
          <label htmlFor="selected-group" className="sr-only">
            Vybrat skupinu
          </label>
          <select
            id="selected-group"
            value={selectedGroup}
            onChange={(event) => {
              const group = mockUserGroups.find(
                (candidate) => candidate === event.currentTarget.value,
              );
              if (group) setSelectedGroup(group);
            }}
            className="appearance-none border-0 bg-transparent py-1 pr-8 text-base font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {mockUserGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-1 size-4 text-slate-500"
          />
        </h1>
        <div aria-label="Profil uživatele" className="size-9 rounded-full bg-slate-900" />
      </header>

      <section aria-label="Seznam uživatelů" className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
          {apiState === 'success' ? (
            <UserTable users={groupUsers} canViewEmail={canViewEmail} />
          ) : (
            <div className="rounded-md border border-slate-200 p-4">
              <p
                role={apiState === 'loading' || apiState === 'empty' ? 'status' : 'alert'}
                aria-live="polite"
                className="text-sm text-slate-600"
              >
                {stateMessage}
              </p>
              {apiState === 'empty' && (
                <p className="mt-2 text-sm text-slate-600">
                  Počet uživatelů: <span className="font-semibold text-slate-900">0</span>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
