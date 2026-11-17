'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useTable } from '@tanstack/react-table';
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
import { UserTablePagination } from './user-table-pagination';

const initialState = {
  columnVisibility: { joinedAt: false },
  pagination: { pageIndex: 0, pageSize: 5 },
  sorting: [{ id: 'joinedAt', desc: true }],
};

type UserTableProps = {
  users: User[];
  canViewEmail: boolean;
};

export function UserTable({ users, canViewEmail }: UserTableProps) {
  const [searchInput, setSearchInput] = useState('');
  const columns = useMemo(() => createUserColumns(canViewEmail), [canViewEmail]);
  const table = useTable({
    features: userTableFeatures,
    data: users,
    columns,
    initialState,
    globalFilterFn: 'includesString',
  });
  const roleFilter = table.getColumn('role')?.getFilterValue();
  const selectedRole: UserRole | '' =
    roleFilter === 'Člen' || roleFilter === 'admin' ? roleFilter : '';
  const isNewestFirst = table.getColumn('joinedAt')?.getIsSorted() !== 'asc';
  const visibleRows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    table.setGlobalFilter(searchInput.trim());
    table.setPageIndex(0);
  }

  function handleRoleChange(role: UserRole | '') {
    table.getColumn('role')?.setFilterValue(role || undefined);
    table.setPageIndex(0);
  }

  function handleSortToggle() {
    table.getColumn('joinedAt')?.toggleSorting(!isNewestFirst);
    table.setPageIndex(0);
  }

  return (
    <>
      <UserListControls
        canViewEmail={canViewEmail}
        searchInput={searchInput}
        selectedRole={selectedRole}
        isNewestFirst={isNewestFirst}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onRoleChange={handleRoleChange}
        onSortToggle={handleSortToggle}
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
      <UserTablePagination
        currentPage={table.state.pagination.pageIndex}
        pageCount={table.getPageCount()}
        rowCount={table.getFilteredRowModel().rows.length}
        canGoBack={table.getCanPreviousPage()}
        canGoForward={table.getCanNextPage()}
        onPageChange={(page) => table.setPageIndex(page)}
      />
    </>
  );
}
