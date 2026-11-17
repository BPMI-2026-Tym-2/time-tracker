'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, FolderX } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { SettingsSidebar } from './settings-sidebar';
import { GroupListControls } from './group-list-controls';
import { GroupTable } from './group-table';
import { useOrganizations } from '@/hooks/use-organizations';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

export function GroupListPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'owner' | 'member'>('all');
  const [sort, setSort] = useState<'default' | 'name_asc' | 'name_desc'>('default');
  const [page, setPage] = useState(1);

  const { organizations, pageInfo, isLoading, isError, error, refetch } = useOrganizations({
    search: search.trim() || undefined,
    role,
    sort,
    page,
    pageSize: 10,
  });

  const total = pageInfo?.total ?? 0;
  const totalPages = Math.max(pageInfo?.totalPages ?? 1, 1);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleRoleChange(newRole: 'all' | 'owner' | 'member') {
    setRole(newRole);
    setPage(1);
  }

  function handleSortChange(newSort: 'default' | 'name_asc' | 'name_desc') {
    setSort(newSort);
    setPage(1);
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader />

      <div className="flex flex-1">
        <SettingsSidebar activeTab="groups" />

        <main className="flex flex-1 flex-col justify-start p-6 md:p-10">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Seznam skupin
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Správa skupin a jejich nastavení</p>
            </div>

            <GroupListControls
              search={search}
              role={role}
              sort={sort}
              onSearchChange={handleSearchChange}
              onRoleChange={handleRoleChange}
              onSortChange={handleSortChange}
            />

            {isLoading && (
              <div className="border-border bg-card flex h-64 items-center justify-center rounded-2xl border shadow-xs">
                <Spinner className="text-primary size-8" />
              </div>
            )}

            {!isLoading && isError && (
              <div className="border-border bg-card space-y-4 rounded-2xl border p-8 text-center shadow-xs">
                <div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
                  <AlertCircle className="size-6" />
                </div>
                <h2 className="text-foreground text-lg font-bold">Chyba při načítání seznamu</h2>
                <p className="text-muted-foreground text-sm">
                  {error?.message ??
                    'Dostupné skupiny se nepodařilo načíst. Zkuste to prosím znovu.'}
                </p>
                <Button variant="outline" onClick={() => void refetch()}>
                  Zkusit znovu
                </Button>
              </div>
            )}

            {!isLoading && !isError && organizations.length === 0 && (
              <div className="border-border bg-card space-y-4 rounded-2xl border p-12 text-center shadow-xs">
                <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
                  <FolderX className="size-6" />
                </div>
                <h2 className="text-foreground text-lg font-bold">Nejsou dostupné žádné skupiny</h2>
                <p className="text-muted-foreground text-sm">
                  {search || role !== 'all'
                    ? 'Zadaným kritériím neodpovídá žádná skupina.'
                    : 'Zatím nejste členem žádné skupiny.'}
                </p>
              </div>
            )}

            {!isLoading && !isError && organizations.length > 0 && (
              <div className="space-y-4">
                <GroupTable groups={organizations} />

                <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                  <div className="text-muted-foreground text-sm font-medium">
                    Počet skupin: <span className="text-foreground font-bold">{total}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1}
                      aria-label="Předchozí stránka"
                      className="size-8 rounded-lg"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        type="button"
                        variant={pageNumber === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNumber)}
                        className="size-8 rounded-lg p-0 text-xs font-semibold"
                      >
                        {pageNumber}
                      </Button>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page >= totalPages}
                      aria-label="Další stránka"
                      className="size-8 rounded-lg"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
