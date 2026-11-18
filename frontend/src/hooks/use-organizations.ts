'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrganizations } from '@/lib/api/organizations';
import type { ListOrganizationsQuery, ListOrganizationsResponse } from '@time-tracker/shared';

export function useOrganizations(query: Partial<ListOrganizationsQuery> = {}) {
  return useQuery<ListOrganizationsResponse, Error>({
    queryKey: ['organizations', query],
    queryFn: () => fetchOrganizations(query),
    retry: false,
  });
}
