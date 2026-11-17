'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrganizations } from '@/lib/api/organizations';
import type { ListOrganizationsQuery, ListOrganizationsResponse } from '@time-tracker/shared';
import { getFilteredMockGroups } from '@/components/features/groups/data/mock-groups';

export function useOrganizations(query: Partial<ListOrganizationsQuery> = {}) {
  return useQuery<ListOrganizationsResponse, Error>({
    queryKey: ['organizations', query],
    queryFn: async () => {
      try {
        return await fetchOrganizations(query);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          const items = getFilteredMockGroups(query);
          return {
            items,
            pageInfo: {
              page: query.page ?? 1,
              pageSize: query.pageSize ?? 10,
              total: items.length,
              totalPages: 1,
            },
          };
        }
        throw err;
      }
    },
    retry: false,
  });
}
