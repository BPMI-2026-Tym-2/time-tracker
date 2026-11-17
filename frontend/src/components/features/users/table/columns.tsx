'use client';

import { createColumnHelper } from '@tanstack/react-table';
import type { User } from '../types';
import type { UserTableFeatures } from './features';

const columnHelper = createColumnHelper<UserTableFeatures, User>();

export function createUserColumns(canViewEmail: boolean) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'Uživatel',
      filterFn: (row, _columnId, filterValue) => {
        if (typeof filterValue !== 'string') return false;
        const query = filterValue.trim().toLowerCase();
        return (
          row.original.name.toLowerCase().includes(query) ||
          (canViewEmail && row.original.email.toLowerCase().includes(query))
        );
      },
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{getValue()}</span>,
    }),
    ...(canViewEmail
      ? [
          columnHelper.accessor('email', {
            header: 'E-mail',
            cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span>,
          }),
        ]
      : []),
    columnHelper.accessor('role', {
      header: 'Role',
      filterFn: 'equalsString',
      cell: ({ getValue }) => {
        const role = getValue();
        return (
          <span
            className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-xs font-medium ${
              role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {role}
          </span>
        );
      },
    }),
    columnHelper.accessor('joinedAt', {
      header: 'Datum vstupu',
      enableColumnFilter: false,
      enableHiding: false,
    }),
  ]);
}
