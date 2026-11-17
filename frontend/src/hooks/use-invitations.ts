'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvitation,
  fetchNotifications,
  acceptInvitation,
  rejectInvitation,
  ApiError,
  classifyInvitationError,
  type InvitationErrorCode,
} from '@/lib/api/invitations';
import type {
  CreateInvitationRequest,
  InvitationNotification,
  InvitationResponse,
  ListNotificationsResponse,
} from '@time-tracker/shared';

export const DEFAULT_MOCK_NOTIFICATIONS: InvitationNotification[] = [
  {
    id: 'inv-skupina-1',
    type: 'organization-invitation',
    organization: {
      id: 'org-skupina-1',
      name: 'Skupina 1',
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
];

export type NotificationFeedback = {
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  code?: InvitationErrorCode;
  invitationId?: string;
  organizationName?: string;
};

// In-memory fallback cache for development/demo when backend is not running
let mockNotificationsCache: InvitationNotification[] = [...DEFAULT_MOCK_NOTIFICATIONS];

export function resetMockNotifications() {
  mockNotificationsCache = [...DEFAULT_MOCK_NOTIFICATIONS];
}

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
          return { items: [...mockNotificationsCache] };
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
          const newInvitation: InvitationResponse = {
            id: `inv-${Date.now()}`,
            organizationId,
            email: body.email,
            role: 'member',
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          };

          // Also add to mock notifications for recipient
          mockNotificationsCache.push({
            id: newInvitation.id,
            type: 'organization-invitation',
            organization: {
              id: organizationId,
              name: 'Nová skupina',
            },
            createdAt: newInvitation.createdAt,
            expiresAt: newInvitation.expiresAt,
          });

          return newInvitation;
        }
        throw err;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<NotificationFeedback | null>(null);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const acceptMutation = useMutation<
    void,
    Error,
    { invitationId: string; organizationName?: string; simulatedScenario?: InvitationErrorCode }
  >({
    mutationFn: async ({ invitationId, simulatedScenario }) => {
      if (simulatedScenario === 'INVALID_OR_NOT_FOUND') {
        throw new ApiError(
          'Pozvánka již není platná nebo skupina neexistuje.',
          404,
          'INVALID_OR_NOT_FOUND',
        );
      }
      if (simulatedScenario === 'ALREADY_MEMBER') {
        throw new ApiError('Jste již členem této skupiny.', 400, 'ALREADY_MEMBER');
      }
      if (simulatedScenario === 'CONNECTION_FAILED') {
        throw new ApiError('Nepodařilo se připojit ke skupině.', 500, 'CONNECTION_FAILED');
      }

      try {
        await acceptInvitation(invitationId);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          if (err instanceof ApiError && err.code !== 'UNKNOWN') {
            throw err;
          }
          // In dev mode when backend is unreachable, simulate successful accept
          mockNotificationsCache = mockNotificationsCache.filter((n) => n.id !== invitationId);
          return;
        }
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      const orgName = variables.organizationName ?? 'skupině';
      mockNotificationsCache = mockNotificationsCache.filter(
        (n) => n.id !== variables.invitationId,
      );
      setFeedback({
        type: 'success',
        title: 'Úspěšně připojeno',
        message: `Byli jste úspěšně připojeni ke skupině "${orgName}" s rolí běžného člena (member).`,
        organizationName: variables.organizationName,
        invitationId: variables.invitationId,
      });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error, variables) => {
      const classified =
        error instanceof ApiError
          ? classifyInvitationError(error.message, error.statusCode)
          : classifyInvitationError(error.message);

      setFeedback({
        type: classified.code === 'ALREADY_MEMBER' ? 'info' : 'error',
        title: classified.title,
        message: classified.description,
        code: classified.code,
        invitationId: variables.invitationId,
        organizationName: variables.organizationName,
      });
    },
  });

  const rejectMutation = useMutation<
    void,
    Error,
    { invitationId: string; organizationName?: string }
  >({
    mutationFn: async ({ invitationId }) => {
      try {
        await rejectInvitation(invitationId);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          mockNotificationsCache = mockNotificationsCache.filter((n) => n.id !== invitationId);
          return;
        }
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      const orgName = variables.organizationName ?? 'skupině';
      mockNotificationsCache = mockNotificationsCache.filter(
        (n) => n.id !== variables.invitationId,
      );
      setFeedback({
        type: 'info',
        title: 'Pozvánka odmítnuta',
        message: `Pozvánka do skupiny "${orgName}" byla odmítnuta a odstraněna ze seznamu.`,
        organizationName: variables.organizationName,
        invitationId: variables.invitationId,
      });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error, variables) => {
      setFeedback({
        type: 'error',
        title: 'Odmítnutí selhalo',
        message: error.message || 'Odmítnutí pozvánky selhalo. Zkuste to prosím znovu.',
        invitationId: variables.invitationId,
        organizationName: variables.organizationName,
      });
    },
  });

  const resetAllMockData = useCallback(() => {
    resetMockNotifications();
    clearFeedback();
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [clearFeedback, queryClient]);

  return {
    acceptInvitation: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    rejectInvitation: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    feedback,
    clearFeedback,
    resetAllMockData,
  };
}
