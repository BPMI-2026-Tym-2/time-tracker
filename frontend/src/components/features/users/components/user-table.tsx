'use client';

import { useMemo, useState } from 'react';
import { useTable, type SortingState, type ColumnFiltersState } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User, UserRole } from '../types';
import { createUserColumns } from '../table/columns';
import { userTableFeatures } from '../table/features';
import { UserListControls } from './user-list-controls';

const initialState = {
  columnVisibility: { joinedAt: false },
  pagination: { pageIndex: 0, pageSize: 7 },
};

type UserTableProps = {
  users: User[];
  canViewEmail: boolean;
};

export function UserTable({ users, canViewEmail }: UserTableProps) {
  const columns = useMemo(() => createUserColumns(canViewEmail), [canViewEmail]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'joinedAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useTable({
    features: userTableFeatures,
    data: users,
    columns,
    initialState,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      sorting,
      columnFilters,
    },
  });
  const nameFilter = table.getColumn('name')?.getFilterValue();
  const searchInput = typeof nameFilter === 'string' ? nameFilter : '';
  const roleFilter = table.getColumn('role')?.getFilterValue();
  const selectedRole: UserRole | '' =
    roleFilter === 'Člen' || roleFilter === 'admin' ? roleFilter : '';
  const isNewestFirst = table.getColumn('joinedAt')?.getIsSorted() !== 'asc';
  const visibleRows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;
  const rowCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  function handleSearchInputChange(value: string) {
    table.getColumn('name')?.setFilterValue(value);
    table.setPageIndex(0);
  }

  function handleRoleChange(role: UserRole | '') {
    table.getColumn('role')?.setFilterValue(role || undefined);
    table.setPageIndex(0);
  }

  return (
    <>
      <UserListControls
        canViewEmail={canViewEmail}
        searchInput={searchInput}
        selectedRole={selectedRole}
        isNewestFirst={isNewestFirst}
        onSearchInputChange={handleSearchInputChange}
        onRoleChange={handleRoleChange}
        onSortToggle={() => {
          const column = table.getColumn('joinedAt');
          column?.toggleSorting(column.getIsSorted() === 'asc');
          table.setPageIndex(0);
        }}
      />
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table className="min-w-120 border-collapse text-left text-sm">
          <TableHeader className="bg-slate-50 text-xs text-slate-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className="border-b border-slate-200 px-3 py-0 font-medium"
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-14 px-3 text-slate-600">
                  Žádní uživatelé neodpovídají výběru.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow key={row.id} className="h-13">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <p aria-live="polite" className="flex-1 text-sm text-slate-600">
          Počet uživatelů: <span className="font-semibold text-slate-900">{rowCount}</span>
        </p>
        {rowCount > 0 && (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
            <p className="min-w-24 text-center text-sm font-medium">
              Stránka {table.state.pagination.pageIndex + 1} z {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Předchozí stránka"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Další stránka"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
