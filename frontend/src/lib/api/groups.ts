import {
  groupSchema,
  type GroupSettingsResponse,
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

export const MOCK_GROUP_SETTINGS: GroupSettingsResponse = {
  id: 'c7a8109d-0b73-424a-a2c7-0897a8ec9df4',
  name: 'Vývojový tým Alfa',
  description:
    'Tým zaměřený na vývoj klientského rozhraní, UX architekturu a komponentní knihovnu.',
  category: 'Vývoj aplikací',
  color: 'blue',
  logo: 'rocket',
  visibility: 'private',
  createdAt: new Date('2026-10-15T09:00:00.000Z'),
  updatedAt: new Date('2026-11-04T16:20:00.000Z'),
  owner: {
    id: 'u1-owner-uuid',
    name: 'Jan',
    surname: 'Novák',
    email: 'jan.novak@unicorn.cz',
  },
  membersCount: 8,
  currentUserRole: 'owner',
  permissions: {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canLeaveGroup: false,
  },
};

export async function fetchGroupSettings(groupId: string): Promise<GroupSettingsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return groupSchema.groupSettingsResponse.parse(data);
    }

    return {
      ...MOCK_GROUP_SETTINGS,
      id: groupId || MOCK_GROUP_SETTINGS.id,
    };
  } catch {
    return {
      ...MOCK_GROUP_SETTINGS,
      id: groupId || MOCK_GROUP_SETTINGS.id,
    };
  }
}

export async function updateGroupSettings(
  groupId: string,
  body: UpdateGroupSettingsBody,
): Promise<GroupSettingsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return groupSchema.groupSettingsResponse.parse(data);
    }
  } catch {
    // fallback
  }

  return {
    ...MOCK_GROUP_SETTINGS,
    id: groupId || MOCK_GROUP_SETTINGS.id,
    ...body,
    updatedAt: new Date(),
  };
}
