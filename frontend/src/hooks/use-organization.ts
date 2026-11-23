import { useQuery } from '@tanstack/react-query';
import type { OrganizationDetailResponse } from '@time-tracker/shared';
import { getOrganization, type ApiError } from '@/lib/api/organizations';

export function useOrganization(organizationId: string) {
  return useQuery<OrganizationDetailResponse, ApiError>({
    queryKey: ['organizations', organizationId],
    queryFn: () => getOrganization(organizationId),
    retry: false,
  });
}
