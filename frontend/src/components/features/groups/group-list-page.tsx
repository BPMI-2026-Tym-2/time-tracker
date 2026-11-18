'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, FolderX, AlertCircle } from 'lucide-react';
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

  const { data, isLoading, isError, error, refetch } = useOrganizations({
    search: search.trim() || undefined,
    role,
    sort,
    page,
    pageSize: 10,
  });

  const organizations = data?.items ?? [];

  return (
    <main className="flex flex-1 flex-col justify-start p-6 md:p-8">
      <div className="w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#163820]">Seznam skupin</h1>
          <p className="mt-1 text-sm font-medium text-[#5A685D]">
            Správa skupin a jejich nastavení
          </p>
        </div>

        <GroupListControls
          search={search}
          role={role}
          sort={sort}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onRoleChange={(r) => {
            setRole(r);
            setPage(1);
          }}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
        />

        {isLoading && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E0DDD6] bg-white">
            <Spinner className="size-8 text-[#163820]" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="space-y-4 rounded-2xl border border-[#E0DDD6] bg-white p-12 text-center shadow-2xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-[#163820]">Chyba při načítání seznamu</h2>
            <p className="text-sm text-[#5A685D]">
              {error?.message ?? 'Dostupné skupiny se nepodařilo načíst.'}
            </p>
            <div>
              <Button
                variant="outline"
                onClick={() => void refetch()}
                className="border-[#163820] text-[#163820] hover:bg-slate-50"
              >
                Zkusit znovu
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && organizations.length === 0 && (
          <div className="space-y-3 rounded-2xl border border-[#E0DDD6] bg-white p-12 text-center shadow-2xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-[#163820]">
              <FolderX className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-[#163820]">Nejsou dostupné žádné skupiny</h2>
            <p className="text-sm text-[#5A685D]">
              {search || role !== 'all'
                ? 'Zadaným kritériím neodpovídá žádná skupina.'
                : 'Zatím nejste členem žádné skupiny.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && organizations.length > 0 && (
          <div className="space-y-5">
            <GroupTable groups={organizations} />

            {/* 1:1 Footer */}
            <div className="flex flex-col items-center justify-between gap-4 pt-1 sm:flex-row">
              <div className="text-sm font-medium text-[#163820]">
                Počet skupin: <span className="font-bold">{organizations.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  aria-label="Předchozí stránka"
                  className="flex size-9 items-center justify-center rounded-xl border border-[#E0DDD6] bg-white text-[#163820] transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="size-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className={`flex size-9 items-center justify-center rounded-xl text-sm font-bold shadow-xs transition-colors ${
                    page === 1
                      ? 'bg-[#163820] text-white'
                      : 'border border-[#E0DDD6] bg-white text-[#163820] hover:bg-slate-50'
                  }`}
                >
                  1
                </button>

                <button
                  type="button"
                  onClick={() => setPage(2)}
                  className={`flex size-9 items-center justify-center rounded-xl text-sm font-bold shadow-xs transition-colors ${
                    page === 2
                      ? 'bg-[#163820] text-white'
                      : 'border border-[#E0DDD6] bg-white text-[#163820] hover:bg-slate-50'
                  }`}
                >
                  2
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, 2))}
                  disabled={page >= 2}
                  aria-label="Další stránka"
                  className="flex size-9 items-center justify-center rounded-xl border border-[#E0DDD6] bg-white text-[#163820] transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
