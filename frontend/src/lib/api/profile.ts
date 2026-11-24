import {
  userSchema,
  type UpdateProfileRequest,
  type UserProfile,
} from '@time-tracker/shared';

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

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.text();

  if (!body) {
    return fallback;
  }

  try {
    const payload: unknown = JSON.parse(body);
    if (isRecord(payload) && typeof payload.error === 'string') {
      return payload.error;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  return fallback;
}

export async function getProfile(signal: AbortSignal): Promise<UserProfile> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/api/users/profile`, {
    signal,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, `Profile request failed with status ${response.status}.`),
    );
  }

  const payload: unknown = await response.json();
  return parseProfile(payload);
}

export async function updateProfile(values: UpdateProfileRequest): Promise<UserProfile> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/api/users/profile`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, `Profile update failed with status ${response.status}.`),
    );
  }

  const payload: unknown = await response.json();
  return parseProfile(payload);
}
