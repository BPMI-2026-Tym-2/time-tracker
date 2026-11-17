import {
  organizationSchema,
  type OrganizationSettingsResponse,
  type UpdateOrganizationSettingsRequest,
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
    // ignore
  }
  return response.statusText || `Požadavek selhal s kódem ${response.status}`;
}

export async function fetchOrganizationSettings(
  organizationId: string,
): Promise<OrganizationSettingsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}/settings`, {
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
  return organizationSchema.organizationSettingsResponse.parse(json.data ?? json);
}

export async function updateOrganizationSettings(
  organizationId: string,
  body: UpdateOrganizationSettingsRequest,
): Promise<OrganizationSettingsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}/settings`, {
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

  const json = await response.json();
  return organizationSchema.organizationSettingsResponse.parse(json.data ?? json);
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }
}
