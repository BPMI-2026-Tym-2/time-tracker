'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
  deleteOrganization,
  ApiError,
} from '@/lib/api/organizations';
import type {
  OrganizationSettingsResponse,
  UpdateOrganizationSettingsRequest,
} from '@time-tracker/shared';

export function useOrganizationSettings(organizationId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['organization-settings', organizationId];

  const settingsQuery = useQuery<OrganizationSettingsResponse, Error>({
    queryKey,
    queryFn: () => fetchOrganizationSettings(organizationId),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 404)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const updateMutation = useMutation<
    OrganizationSettingsResponse,
    Error,
    UpdateOrganizationSettingsRequest
  >({
    mutationFn: (body) => updateOrganizationSettings(organizationId, body),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(queryKey, updatedSettings);
    },
  });

  const deleteMutation = useMutation<void, Error, void>({
    mutationFn: () => deleteOrganization(organizationId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    resetUpdateError: updateMutation.reset,
    deleteOrganization: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
