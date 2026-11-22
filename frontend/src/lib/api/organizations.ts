import {
  organizationSchema,
  type CreateOrganizationRequest,
  type CreateOrganizationResponse,
  type OrganizationDetailResponse,
} from '@time-tracker/shared';
import { publicEnv } from '@/lib/env';

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
    if (typeof errorBody?.error === 'string') {
      return errorBody.error;
    }
    if (typeof errorBody?.error?.message === 'string') {
      return errorBody.error.message;
    }
    if (typeof errorBody?.message === 'string') {
      return errorBody.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || `Požadavek selhal s kódem ${response.status}`;
}

export async function getOrganization(organizationId: string): Promise<OrganizationDetailResponse> {
  const response = await fetch(
    `${publicEnv.apiUrl}/api/organizations/${encodeURIComponent(organizationId)}`,
    { method: 'GET', credentials: 'include' },
  );

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const json = await response.json();
  return organizationSchema.organizationDetailResponse.parse(json.data ?? json);
}

export async function createOrganization(
  input: CreateOrganizationRequest,
): Promise<CreateOrganizationResponse> {
  const response = await fetch(`${publicEnv.apiUrl}/api/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const json = await response.json();
  return organizationSchema.createOrganizationResponse.parse(json.data ?? json);
}
