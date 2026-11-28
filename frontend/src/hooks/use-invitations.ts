'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvitation, fetchNotifications, respondToInvitation } from '@/lib/api/invitations';
import type {
  CreateInvitationRequest,
  InvitationResponse,
  ListNotificationsResponse,
} from '@time-tracker/shared';

export function useNotifications() {
  const query = useQuery<ListNotificationsResponse, Error>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 10_000,
  });

  return {
    notifications: query.data?.items ?? [],
    count: query.data?.items.length ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, action }: { invitationId: string; action: 'accept' | 'reject' }) =>
      respondToInvitation(invitationId, action),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['organizations'] }),
      ]);
    },
  });
}

export function useCreateInvitation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation<InvitationResponse, Error, CreateInvitationRequest>({
    mutationFn: (body) => createInvitation(organizationId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
