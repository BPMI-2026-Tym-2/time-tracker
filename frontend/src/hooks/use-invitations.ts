'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvitation,
  fetchNotifications,
  acceptInvitation,
  rejectInvitation,
  ApiError,
} from '@/lib/api/invitations';
import type {
  CreateInvitationRequest,
  InvitationNotification,
  InvitationResponse,
  ListNotificationsResponse,
} from '@time-tracker/shared';

const DUMMY_NOTIFICATIONS: InvitationNotification[] = [
  {
    id: 'inv-1',
    type: 'organization-invitation',
    organization: {
      id: 'org-tech',
      name: 'Vývojáři & DevOps',
    },
    createdAt: new Date('2025-05-10T10:00:00Z'),
    expiresAt: new Date('2025-05-24T10:00:00Z'),
  },
  {
    id: 'inv-2',
    type: 'organization-invitation',
    organization: {
      id: 'org-design',
      name: 'Design & UI/UX',
    },
    createdAt: new Date('2025-05-12T14:30:00Z'),
    expiresAt: new Date('2025-05-26T14:30:00Z'),
  },
];

export function useNotifications() {
  const queryKey = ['notifications'];

  const notificationsQuery = useQuery<ListNotificationsResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetchNotifications();
      } catch (err) {
        if (
          process.env.NODE_ENV !== 'production' &&
          !(err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403))
        ) {
          console.warn('Backend není dostupný, používám testovací data pro notifikace pozvánek.');
          return { items: DUMMY_NOTIFICATIONS };
        }
        throw err;
      }
    },
  });

  return {
    notifications: notificationsQuery.data?.items ?? [],
    count: notificationsQuery.data?.items.length ?? 0,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
  };
}

export function useCreateInvitation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation<InvitationResponse, Error, CreateInvitationRequest>({
    mutationFn: async (body) => {
      try {
        return await createInvitation(organizationId, body);
      } catch (err) {
        if (
          process.env.NODE_ENV !== 'production' &&
          !(err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403))
        ) {
          console.warn('Backend není dostupný, simuluji vytvoření pozvánky v dev módu.');
          return {
            id: `inv-${Date.now()}`,
            organizationId,
            email: body.email,
            role: 'member',
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          };
        }
        throw err;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
    },
  });
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation<void, Error, string>({
    mutationFn: async (invitationId: string) => {
      try {
        await acceptInvitation(invitationId);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Backend není dostupný, simuluji přijetí pozvánky v dev módu.');
          return;
        }
        throw err;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const rejectMutation = useMutation<void, Error, string>({
    mutationFn: async (invitationId: string) => {
      try {
        await rejectInvitation(invitationId);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Backend není dostupný, simuluji odmítnutí pozvánky v dev módu.');
          return;
        }
        throw err;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    acceptInvitation: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    rejectInvitation: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}
