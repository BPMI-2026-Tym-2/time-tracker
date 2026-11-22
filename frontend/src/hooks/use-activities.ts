'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateActivityRequest } from '@time-tracker/shared';
import { createActivity, listActivities } from '@/lib/api/activities';

function recorderKey(userId: string | undefined, organizationId?: string) {
  return ['activities', userId, organizationId] as const;
}

export function useActivities(
  userId: string | undefined,
  from: Date,
  to: Date,
  organizationId?: string,
) {
  const start = from.toISOString();
  const end = to.toISOString();

  return useQuery({
    queryKey: [...recorderKey(userId, organizationId), start, end],
    queryFn: ({ signal }) => listActivities(start, end, signal, organizationId),
    enabled: Boolean(userId),
  });
}

export function useCreateActivity(userId: string, organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityRequest) => createActivity(input, organizationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recorderKey(userId, organizationId) }),
  });
}
