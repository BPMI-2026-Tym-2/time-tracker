import { userSchema, type UpdateProfileRequest, type UserProfile } from '@time-tracker/shared';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseProfile(value: unknown): UserProfile {
  const result = userSchema.profileResponse.safeParse(value);

  if (!result.success) {
    throw new Error('Backend returned an invalid profile response.');
  }

  return result.data;
}

async function requestProfile(options: RequestInit): Promise<UserProfile> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/api/users/profile`, {
    ...options,
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

export function getProfile(signal: AbortSignal): Promise<UserProfile> {
  return requestProfile({ signal });
}

export function saveProfile(profile: UpdateProfileRequest): Promise<UserProfile> {
  return requestProfile({
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
}
