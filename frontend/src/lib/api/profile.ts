import type { Profile } from '@/types/profile';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseProfile(value: unknown): Profile {
  if (
    !isRecord(value) ||
    typeof value.firstName !== 'string' ||
    typeof value.lastName !== 'string' ||
    typeof value.email !== 'string' ||
    (value.photoUrl !== null && typeof value.photoUrl !== 'string')
  ) {
    throw new Error('Backend returned an invalid profile response.');
  }

  return {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    photoUrl: value.photoUrl,
  };
}

export async function getProfile(signal: AbortSignal): Promise<Profile> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/api/users/profile`, {
    signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const body = await response.text();
    let payload: unknown;

    if (body) {
      try {
        payload = JSON.parse(body) as unknown;
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          throw error;
        }
      }
    }

    const message =
      isRecord(payload) && typeof payload.error === 'string'
        ? payload.error
        : `Profile request failed with status ${response.status}.`;

    throw new Error(message);
  }

  const payload: unknown = await response.json();
  return parseProfile(payload);
}
