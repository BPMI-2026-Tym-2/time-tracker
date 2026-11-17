'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Users,
  LayoutGrid,
  Tag,
  User,
} from 'lucide-react';
import { GroupListControls } from './group-list-controls';
import { GroupTable } from './group-table';
import { useOrganizations } from '@/hooks/use-organizations';
import type { OrganizationItemResponse } from '@time-tracker/shared';

const PREVIEW_GROUPS: OrganizationItemResponse[] = [
  {
    id: 'grp-prog',
    name: 'Programování',
    slug: 'programovani',
    role: 'owner',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'grp-fit',
    name: 'Fitness a zdraví',
    slug: 'fitness-a-zdravi',
    role: 'member',
    createdAt: new Date('2025-01-02'),
  },
  {
    id: 'grp-cest',
    name: 'Cestování',
    slug: 'cestovani',
    role: 'member',
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'grp-game',
    name: 'Gaming',
    slug: 'gaming',
    role: 'owner',
    createdAt: new Date('2025-01-04'),
  },
];

export function GroupListPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'owner' | 'member'>('all');
  const [sort, setSort] = useState<'default' | 'name_asc' | 'name_desc'>('default');
  const [page, setPage] = useState(1);

  const { organizations, isError, isLoading } = useOrganizations({
    search: search.trim() || undefined,
    role,
    sort,
    page,
    pageSize: 10,
  });

  const displayGroups = useMemo(() => {
    // If backend returns data, use it; otherwise fallback to the mockup preview groups
    const source =
      !isLoading && !isError && organizations.length > 0 ? organizations : PREVIEW_GROUPS;

    let filtered = [...source];
    if (role !== 'all') {
      filtered = filtered.filter((g) => g.role === role);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
    }
    if (sort === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    } else if (sort === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'cs'));
    }
    return filtered;
  }, [organizations, isLoading, isError, role, search, sort]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1:1 Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ECE8E1] bg-white px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <Image
              src="/img/feather-logo.webp"
              alt="Logo"
              width={36}
              height={36}
              className="size-9 object-contain"
            />
            <span className="font-heading text-xl font-bold tracking-tight text-[#163820]">
              Záznamník
            </span>
          </Link>

          <Link
            href="/groups"
            className="flex items-center gap-2 text-lg font-bold text-[#163820] transition-opacity hover:opacity-80"
          >
            <span>Skupiny</span>
            <ChevronDown className="size-4 stroke-[2.5]" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div
            aria-label="Uživatelský profil"
            className="flex size-9 items-center justify-center rounded-full border-2 border-[#163820] text-[#163820] select-none"
          >
            <User className="size-5" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 1:1 Sidebar */}
        <aside className="hidden w-56 shrink-0 pt-8 pr-6 pl-6 md:block">
          <nav className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-3.5 px-3 py-2 text-base font-semibold text-[#163820] transition-colors hover:opacity-80"
            >
              <Home className="size-5 stroke-[2]" />
              <span>Přehled</span>
            </Link>

            <Link
              href="/groups"
              className="flex items-center gap-3.5 rounded-2xl bg-[#163820] px-4 py-2.5 text-base font-semibold text-white shadow-xs"
            >
              <Users className="size-5 stroke-[2]" />
              <span>Skupiny</span>
            </Link>

            <div className="flex items-center gap-3.5 px-3 py-2 text-base font-semibold text-[#163820] opacity-90 transition-colors hover:opacity-100">
              <LayoutGrid className="size-5 stroke-[2]" />
              <span>Kategorie</span>
            </div>

            <div className="flex items-center gap-3.5 px-3 py-2 text-base font-semibold text-[#163820] opacity-90 transition-colors hover:opacity-100">
              <Tag className="size-5 stroke-[2]" />
              <span>Tagy</span>
            </div>
          </nav>
        </aside>

        {/* 1:1 Main Content */}
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

            <div className="space-y-5">
              <GroupTable groups={displayGroups} />

              {/* 1:1 Footer */}
              <div className="flex flex-col items-center justify-between gap-4 pt-1 sm:flex-row">
                <div className="text-sm font-medium text-[#163820]">
                  Počet skupin: <span className="font-bold">{displayGroups.length}</span>
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
          </div>
        </main>
      </div>
    </div>
  );
}
