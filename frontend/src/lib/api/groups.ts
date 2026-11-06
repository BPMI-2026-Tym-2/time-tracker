import {
  groupSchema,
  type GroupSettingsResponse,
  type ListGroupMembersResponse,
  type UpdateGroupSettingsBody,
} from '@time-tracker/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const errorBody = await response.json();
    if (typeof errorBody?.error?.message === 'string') {
      return errorBody.error.message;
    }
    if (typeof errorBody?.message === 'string') {
      return errorBody.message;
    }
  } catch {
    // ignorovat chybu při parsování těla chyby
  }
  return response.statusText || `Požadavek selhal s kódem ${response.status}`;
}

export async function fetchGroupSettings(groupId: string): Promise<GroupSettingsResponse> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const data = await response.json();
  return groupSchema.groupSettingsResponse.parse(data);
}

export async function updateGroupSettings(
  groupId: string,
  body: UpdateGroupSettingsBody,
): Promise<GroupSettingsResponse> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const data = await response.json();
  return groupSchema.groupSettingsResponse.parse(data);
}

export async function fetchGroupMembers(groupId: string): Promise<ListGroupMembersResponse> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const data = await response.json();
  return groupSchema.listMembersResponse.parse(data);
}
