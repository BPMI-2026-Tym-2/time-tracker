import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateOrganizationRequest, CreateOrganizationResponse } from '@time-tracker/shared';
import { createOrganization, type ApiError } from '@/lib/api/organizations';

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrganizationResponse, ApiError, CreateOrganizationRequest>({
    mutationFn: (input) => createOrganization(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
