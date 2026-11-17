import {
  organizationSchema,
  notificationSchema,
  type CreateInvitationRequest,
  type InvitationResponse,
  type ListNotificationsResponse,
} from '@time-tracker/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type InvitationErrorCode =
  'INVALID_OR_NOT_FOUND' | 'ALREADY_MEMBER' | 'CONNECTION_FAILED' | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: InvitationErrorCode = 'UNKNOWN',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function classifyInvitationError(
  message: string,
  status?: number,
): {
  code: InvitationErrorCode;
  title: string;
  description: string;
} {
  const lower = (message || '').toLowerCase();
  if (
    status === 404 ||
    lower.includes('expired') ||
    lower.includes('vyprš') ||
    lower.includes('neplatn') ||
    lower.includes('not found') ||
    lower.includes('neexistuje') ||
    lower.includes('invalid')
  ) {
    return {
      code: 'INVALID_OR_NOT_FOUND',
      title: 'Pozvánku nelze přijmout.',
      description: 'Pozvánka již není platná nebo skupina do které byl uživatel pozván neexistuje.',
    };
  }

  if (
    lower.includes('already member') ||
    lower.includes('already a member') ||
    lower.includes('již člen') ||
    lower.includes('uz je clen') ||
    lower.includes('already_member')
  ) {
    return {
      code: 'ALREADY_MEMBER',
      title: 'Jste již členem této skupiny.',
      description:
        'Aplikace informuje uživatele, že je již členem dané skupiny. Nové členství se nevytváří.',
    };
  }

  return {
    code: 'CONNECTION_FAILED',
    title: 'Nepodařilo se připojit ke skupině.',
    description: 'Aplikace upozorňuje na neúspěšné připojení ke skupině. Akci lze opakovat.',
  };
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
    const classification = classifyInvitationError(message, response.status);
    throw new ApiError(message, response.status, classification.code);
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
    const classification = classifyInvitationError(message, response.status);
    throw new ApiError(message, response.status, classification.code);
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
