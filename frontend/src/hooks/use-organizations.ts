'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrganizations, ApiError } from '@/lib/api/organizations';
import type {
  ListOrganizationsQuery,
  ListOrganizationsResponse,
  OrganizationItemResponse,
} from '@time-tracker/shared';

const DUMMY_ORGANIZATIONS: OrganizationItemResponse[] = [
  {
    id: 'grp-1',
    name: 'Programování',
    slug: 'programovani',
    role: 'owner',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'grp-2',
    name: 'Fitness a zdraví',
    slug: 'fitness-a-zdravi',
    role: 'member',
    createdAt: new Date('2025-02-15'),
  },
  {
    id: 'grp-3',
    name: 'Cestování',
    slug: 'cestovani',
    role: 'member',
    createdAt: new Date('2025-03-01'),
  },
  {
    id: 'grp-4',
    name: 'Gaming',
    slug: 'gaming',
    role: 'owner',
    createdAt: new Date('2025-04-12'),
  },
];

export function useOrganizations(query: Partial<ListOrganizationsQuery> = {}) {
  const queryKey = ['organizations', query];

  const organizationsQuery = useQuery<ListOrganizationsResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetchOrganizations(query);
      } catch (err) {
        if (
          process.env.NODE_ENV !== 'production' &&
          !(err instanceof ApiError && err.statusCode === 401)
        ) {
          console.warn('Backend není dostupný, používám testovací data pro náhled seznamu skupin.');
          let filtered = [...DUMMY_ORGANIZATIONS];
          if (query.role && query.role !== 'all') {
            filtered = filtered.filter((g) => g.role === query.role);
          }
          if (query.search) {
            const q = query.search.toLowerCase();
            filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
          }
          if (query.sort === 'name_asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
          } else if (query.sort === 'name_desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
          }

          return {
            items: filtered,
            pageInfo: {
              page: query.page ?? 1,
              pageSize: query.pageSize ?? 10,
              total: filtered.length,
              totalPages: 1,
            },
          };
        }
        throw err;
      }
    },
  });

  return {
    data: organizationsQuery.data,
    organizations: organizationsQuery.data?.items ?? [],
    pageInfo: organizationsQuery.data?.pageInfo,
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    error: organizationsQuery.error,
    refetch: organizationsQuery.refetch,
  };
}
