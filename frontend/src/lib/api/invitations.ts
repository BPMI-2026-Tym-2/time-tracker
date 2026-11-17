import {
  organizationSchema,
  notificationSchema,
  type CreateInvitationRequest,
  type InvitationResponse,
  type ListNotificationsResponse,
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
    if (typeof errorBody?.error === 'string') {
      return errorBody.error;
    }
    if (typeof errorBody?.message === 'string') {
      return errorBody.message;
    }
  } catch {
    // ignore
  }
  return response.statusText || `Požadavek selhal s kódem ${response.status}`;
}

export async function createInvitation(
  organizationId: string,
  body: CreateInvitationRequest,
): Promise<InvitationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}/invitations`, {
    method: 'POST',
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

  const json = await response.json();
  return organizationSchema.invitationResponse.parse(json.data ?? json);
}

export async function fetchNotifications(): Promise<ListNotificationsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const json = await response.json();
  return notificationSchema.listResponse.parse(json.data ?? json);
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/organization/accept-invitation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ invitationId }),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/organization/reject-invitation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ invitationId }),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }
}
