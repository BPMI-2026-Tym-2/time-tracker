import { activitySchema, type CreateActivityRequest } from '@time-tracker/shared';
import { publicEnv } from '@/lib/env';

function activityUrl(organizationId?: string): string {
  const path = organizationId
    ? `/api/organizations/${encodeURIComponent(organizationId)}/activities`
    : '/api/users/activities';
  return `${publicEnv.apiUrl.replace(/\/+$/, '')}${path}`;
}

export async function listActivities(
  from: string,
  to: string,
  signal: AbortSignal,
  organizationId?: string,
) {
  const query = new URLSearchParams({ from, to });
  const response = await fetch(`${activityUrl(organizationId)}?${query}`, {
    credentials: 'include',
    signal,
  });
  if (!response.ok) throw new Error('Aktivity se nepodařilo načíst.');
  return activitySchema.listResponse.parse(await response.json());
}

export async function createActivity(input: CreateActivityRequest, organizationId?: string) {
  const response = await fetch(activityUrl(organizationId), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Aktivitu se nepodařilo uložit. Zkuste to znovu.');
  return activitySchema.activityResponse.parse(await response.json());
}
