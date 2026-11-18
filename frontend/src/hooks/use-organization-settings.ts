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
import { getMockGroupSettings } from '@/components/features/groups/data/mock-groups';

export function useOrganizationSettings(organizationId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['organization-settings', organizationId];

  const settingsQuery = useQuery<OrganizationSettingsResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetchOrganizationSettings(organizationId);
      } catch (err) {
        if (
          process.env.NODE_ENV !== 'production' &&
          !(err instanceof ApiError && (err.statusCode === 403 || err.statusCode === 404))
        ) {
          return getMockGroupSettings(organizationId);
        }
        throw err;
      }
    },
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
    mutationFn: async (body) => {
      try {
        return await updateOrganizationSettings(organizationId, body);
      } catch (err) {
        if (
          process.env.NODE_ENV !== 'production' &&
          !(err instanceof ApiError && err.statusCode === 403)
        ) {
          const current = settingsQuery.data ?? getMockGroupSettings(organizationId);
          return { ...current, name: body.name };
        }
        throw err;
      }
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(queryKey, updatedSettings);
    },
  });

  const deleteMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await deleteOrganization(organizationId);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          return;
        }
        throw err;
      }
    },
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
