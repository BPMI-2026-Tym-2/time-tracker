'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrganizations } from '@/lib/api/organizations';
import type {
  ListOrganizationsQuery,
  ListOrganizationsResponse,
  OrganizationItemResponse,
} from '@time-tracker/shared';

export const PREVIEW_GROUPS: OrganizationItemResponse[] = [
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

export function useOrganizations(query: Partial<ListOrganizationsQuery> = {}) {
  const queryKey = ['organizations', query];

  const organizationsQuery = useQuery<ListOrganizationsResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetchOrganizations(query);
      } catch {
        // Fallback pro zobrazení frontendu při offline/lokálním vývoji
        let filtered = [...PREVIEW_GROUPS];
        if (query.role && query.role !== 'all') {
          filtered = filtered.filter((g) => g.role === query.role);
        }
        if (query.search?.trim()) {
          const q = query.search.trim().toLowerCase();
          filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
        }
        if (query.sort === 'name_asc') {
          filtered.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
        } else if (query.sort === 'name_desc') {
          filtered.sort((a, b) => b.name.localeCompare(a.name, 'cs'));
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
    },
    retry: false,
  });

  return {
    data: organizationsQuery.data,
    organizations: organizationsQuery.data?.items ?? PREVIEW_GROUPS,
    pageInfo: organizationsQuery.data?.pageInfo,
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    error: organizationsQuery.error,
    refetch: organizationsQuery.refetch,
  };
}
