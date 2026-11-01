'use client';

import { Fragment, useState, type FormEvent } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, ChevronDown, Search } from 'lucide-react';
import { Sidebar } from '@/components/layout/nav/sidebar';
import { Button } from '@/components/ui/button';

type UserRole = 'Člen' | 'admin';
type UserGroup = 'sport' | 'volný čas' | 'hry';
export type UserListViewerRole = 'member' | 'admin' | 'superAdmin';
export type UserListApiState =
  'loading' | 'success' | 'empty' | 'unauthenticated' | 'forbidden' | 'not-found' | 'error';

type User = {
  name: string;
  email: string;
  group: UserGroup;
  role: UserRole;
  joinedAt: string;
};

const groups: UserGroup[] = ['sport', 'volný čas', 'hry'];
const pageSize = 5;

// Ukázková data a skupiny nahradí odpovědi API po dokončení backendových endpointů.
const users: User[] = [
  {
    name: 'Tereza',
    email: 'tereza@unicorn.cz',
    group: 'sport',
    role: 'Člen',
    joinedAt: '2025-08-03',
  },
  {
    name: 'Pavel',
    email: 'pavel@unicorn.cz',
    group: 'sport',
    role: 'admin',
    joinedAt: '2024-11-12',
  },
  {
    name: 'Lenka',
    email: 'lenka@unicorn.cz',
    group: 'sport',
    role: 'Člen',
    joinedAt: '2025-01-21',
  },
  {
    name: 'David',
    email: 'david@unicorn.cz',
    group: 'sport',
    role: 'Člen',
    joinedAt: '2024-07-08',
  },
  {
    name: 'Eva',
    email: 'eva@unicorn.cz',
    group: 'sport',
    role: 'admin',
    joinedAt: '2025-04-15',
  },
  {
    name: 'Tomáš',
    email: 'tomas@unicorn.cz',
    group: 'sport',
    role: 'Člen',
    joinedAt: '2024-09-30',
  },
  {
    name: 'Barbora',
    email: 'barbora@unicorn.cz',
    group: 'sport',
    role: 'Člen',
    joinedAt: '2025-06-11',
  },
  {
    name: 'Jakub',
    email: 'jakub@unicorn.cz',
    group: 'sport',
    role: 'Člen',
    joinedAt: '2025-02-26',
  },
  {
    name: 'Adam',
    email: 'adam@unicorn.cz',
    group: 'volný čas',
    role: 'Člen',
    joinedAt: '2025-05-04',
  },
  {
    name: 'Jana',
    email: 'jana@unicorn.cz',
    group: 'volný čas',
    role: 'admin',
    joinedAt: '2024-10-19',
  },
  {
    name: 'Petr',
    email: 'petr@unicorn.cz',
    group: 'volný čas',
    role: 'Člen',
    joinedAt: '2025-07-22',
  },
  {
    name: 'Anna',
    email: 'anna@unicorn.cz',
    group: 'volný čas',
    role: 'Člen',
    joinedAt: '2024-08-05',
  },
  {
    name: 'Martin',
    email: 'martin@unicorn.cz',
    group: 'volný čas',
    role: 'Člen',
    joinedAt: '2025-03-13',
  },
  {
    name: 'Eliška',
    email: 'eliska@unicorn.cz',
    group: 'volný čas',
    role: 'admin',
    joinedAt: '2024-12-01',
  },
  {
    name: 'Marek',
    email: 'marek@unicorn.cz',
    group: 'volný čas',
    role: 'Člen',
    joinedAt: '2025-09-10',
  },
  {
    name: 'Veronika',
    email: 'veronika@unicorn.cz',
    group: 'volný čas',
    role: 'Člen',
    joinedAt: '2025-01-08',
  },
  {
    name: 'Klára',
    email: 'klara@gmail.com',
    group: 'hry',
    role: 'admin',
    joinedAt: '2025-06-25',
  },
  {
    name: 'Ondřej',
    email: 'ondrej@unicorn.cz',
    group: 'hry',
    role: 'Člen',
    joinedAt: '2024-09-14',
  },
  {
    name: 'Monika',
    email: 'monika@unicorn.cz',
    group: 'hry',
    role: 'Člen',
    joinedAt: '2025-02-05',
  },
  {
    name: 'Filip',
    email: 'filip@unicorn.cz',
    group: 'hry',
    role: 'Člen',
    joinedAt: '2024-11-28',
  },
  {
    name: 'Natálie',
    email: 'natalie@unicorn.cz',
    group: 'hry',
    role: 'admin',
    joinedAt: '2025-08-17',
  },
  {
    name: 'Šimon',
    email: 'simon@unicorn.cz',
    group: 'hry',
    role: 'Člen',
    joinedAt: '2025-04-09',
  },
  {
    name: 'Lucie',
    email: 'lucie@unicorn.cz',
    group: 'hry',
    role: 'Člen',
    joinedAt: '2024-07-31',
  },
  {
    name: 'Daniel',
    email: 'daniel@unicorn.cz',
    group: 'hry',
    role: 'Člen',
    joinedAt: '2025-01-16',
  },
];
type UserListPageProps = {
  // Při napojení autentizace předávat skutečnou roli přihlášeného uživatele.
  viewerRole: UserListViewerRole;
  // Napojit na stav požadavku pro načtení členů skupiny.
  apiState?: UserListApiState;
};

export function UserListPage({ viewerRole, apiState = 'success' }: UserListPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<UserGroup>('sport');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const canViewEmail = viewerRole === 'admin' || viewerRole === 'superAdmin';

  const filteredUsers = users
    .filter((user) => {
      const matchesGroup = user.group === selectedGroup;
      const matchesRole = selectedRole === '' || user.role === selectedRole;
      const searchableText = `${user.name} ${canViewEmail ? user.email : ''}`.toLocaleLowerCase(
        'cs-CZ',
      );
      const matchesSearch = searchableText.includes(searchTerm.toLocaleLowerCase('cs-CZ'));

      return matchesGroup && matchesRole && matchesSearch;
    })
    .sort((left, right) =>
      isNewestFirst
        ? right.joinedAt.localeCompare(left.joinedAt)
        : left.joinedAt.localeCompare(right.joinedAt),
    );

  const pageCount = Math.ceil(filteredUsers.length / pageSize);
  const firstVisiblePage = Math.max(1, currentPage - 1);
  const lastVisiblePage = Math.min(pageCount, currentPage + 1);
  const pageNumbers =
    pageCount === 0
      ? []
      : [
          ...new Set([
            1,
            ...Array.from(
              { length: lastVisiblePage - firstVisiblePage + 1 },
              (_, index) => firstVisiblePage + index,
            ),
            pageCount,
          ]),
        ];
  const firstUserIndex = (currentPage - 1) * pageSize;
  const visibleUsers = filteredUsers.slice(firstUserIndex, firstUserIndex + pageSize);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />

        <section className="min-w-0 flex-1 bg-slate-50">
          <header className="flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <h1 className="relative flex items-center">
              <select
                aria-label="Vybrat skupinu"
                value={selectedGroup}
                onChange={(event) => {
                  const group = groups.find((candidate) => candidate === event.currentTarget.value);
                  if (group) {
                    setSelectedGroup(group);
                    setCurrentPage(1);
                  }
                }}
                className="appearance-none border-0 bg-transparent py-1 pr-8 text-base font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {groups.map((group) => (
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

          <div className="p-4 sm:p-6 lg:p-8">
            <section
              aria-label="Seznam uživatelů"
              className="mx-auto max-w-6xl rounded-xl bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Seznam uživatelů
                </h2>
                <Button
                  type="button"
                  aria-label={
                    isNewestFirst
                      ? 'Seřadit od nejstaršího vstupu'
                      : 'Seřadit od nejnovějšího vstupu'
                  }
                  onClick={() => {
                    setIsNewestFirst(!isNewestFirst);
                    setCurrentPage(1);
                  }}
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
                onSubmit={handleSearch}
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
                    onChange={(event) => setSearchInput(event.target.value)}
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
                      setSelectedRole(role);
                      setCurrentPage(1);
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

              <div className="overflow-x-auto rounded-md border border-slate-200">
                {apiState === 'loading' && (
                  <p role="status" aria-live="polite" className="p-4 text-sm text-slate-600">
                    Načítám seznam uživatelů…
                  </p>
                )}
                {apiState === 'empty' && (
                  <p role="status" className="p-4 text-sm text-slate-600">
                    Tato skupina zatím nemá žádné uživatele.
                  </p>
                )}
                {apiState === 'unauthenticated' && (
                  <p role="alert" className="p-4 text-sm text-slate-600">
                    Pro zobrazení seznamu se přihlaste.
                  </p>
                )}
                {apiState === 'forbidden' && (
                  <p role="alert" className="p-4 text-sm text-slate-600">
                    Nemáte oprávnění k zobrazení uživatelů této skupiny.
                  </p>
                )}
                {apiState === 'not-found' && (
                  <p role="alert" className="p-4 text-sm text-slate-600">
                    Skupina nebyla nalezena.
                  </p>
                )}
                {apiState === 'error' && (
                  <p role="alert" className="p-4 text-sm text-slate-600">
                    Seznam uživatelů se nepodařilo načíst. Zkuste to prosím později.
                  </p>
                )}
                {apiState === 'success' && (
                  <table
                    className={`w-full border-collapse text-left text-sm ${
                      canViewEmail ? 'min-w-120' : 'min-w-80'
                    }`}
                  >
                    <thead className="bg-slate-50 text-xs text-slate-600">
                      <tr className="h-10">
                        <th
                          scope="col"
                          className={`${canViewEmail ? 'w-1/3' : 'w-2/3'} border-b border-slate-200 px-3 font-medium`}
                        >
                          Uživatel
                        </th>
                        {canViewEmail && (
                          <th
                            scope="col"
                            className="w-1/2 border-b border-slate-200 px-3 font-medium"
                          >
                            E-mail
                          </th>
                        )}
                        <th scope="col" className="border-b border-slate-200 px-3 font-medium">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleUsers.map((user) => (
                        <tr key={user.email} className="h-13">
                          <td className="px-3 py-2 font-semibold text-slate-800">{user.name}</td>
                          {canViewEmail && (
                            <td className="px-3 py-2 text-slate-600">{user.email}</td>
                          )}
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={canViewEmail ? 3 : 2} className="h-14 px-3 text-slate-600">
                            Žádní uživatelé neodpovídají výběru.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {(apiState === 'success' || apiState === 'empty') && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p aria-live="polite" className="text-slate-600">
                    Počet uživatelů:{' '}
                    <span className="font-semibold text-slate-900">
                      {apiState === 'empty' ? 0 : filteredUsers.length}
                    </span>
                  </p>
                  {apiState === 'success' && pageCount > 1 && (
                    <nav aria-label="Stránkování" className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Předchozí stránka"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        ‹
                      </Button>
                      {pageNumbers.map((page, index) => {
                        const previousPage = pageNumbers[index - 1];

                        return (
                          <Fragment key={page}>
                            {previousPage !== undefined && page - previousPage > 1 && (
                              <span aria-hidden="true" className="px-1">
                                …
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Stránka ${page}`}
                              aria-current={page === currentPage ? 'page' : undefined}
                              onClick={() => setCurrentPage(page)}
                              className={`rounded-md border-slate-200 text-slate-600 hover:bg-slate-50 ${
                                page === currentPage
                                  ? 'border-blue-600 bg-blue-600 font-semibold text-white hover:bg-blue-700 hover:text-white'
                                  : ''
                              }`}
                            >
                              {page}
                            </Button>
                          </Fragment>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Další stránka"
                        disabled={currentPage === pageCount}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        ›
                      </Button>
                    </nav>
                  )}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
