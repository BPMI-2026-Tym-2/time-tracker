'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrganizations } from '@/lib/api/organizations';
import type { ListOrganizationsQuery, ListOrganizationsResponse } from '@time-tracker/shared';

export function useOrganizations(query: Partial<ListOrganizationsQuery> = {}) {
  const queryKey = ['organizations', query];

  const organizationsQuery = useQuery<ListOrganizationsResponse, Error>({
    queryKey,
    queryFn: () => fetchOrganizations(query),
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
