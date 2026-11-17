'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvitation, fetchNotifications } from '@/lib/api/invitations';
import type {
  CreateInvitationRequest,
  InvitationNotification,
  InvitationResponse,
  ListNotificationsResponse,
} from '@time-tracker/shared';

const FALLBACK_NOTIFICATIONS: InvitationNotification[] = [
  {
    id: 'inv-1',
    type: 'organization-invitation',
    organization: {
      id: 'org-1',
      name: 'Skupina 1',
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
];

export function useNotifications() {
  const query = useQuery<ListNotificationsResponse, Error>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        return await fetchNotifications();
      } catch {
        return { items: FALLBACK_NOTIFICATIONS };
      }
    },
  });

  return {
    notifications: query.data?.items ?? [],
    count: query.data?.items.length ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
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
