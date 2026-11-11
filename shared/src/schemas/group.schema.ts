import { z } from 'zod';

export const GROUP_CATEGORIES = ['Obecná', 'Studium', 'Projekt', 'Volný čas', 'Ostatní'] as const;

export const GROUP_THEMES = ['blue-sky', 'sunset', 'forest', 'navy', 'abstract'] as const;

export const GROUP_LOGOS = [
  'users',
  'rocket',
  'code',
  'flame',
  'zap',
  'target',
  'globe',
  'star',
  'folder',
] as const;

const role = z.enum(['member', 'admin', 'owner']);
const categoryPreset = z.enum(GROUP_CATEGORIES);
const themePreset = z.enum(GROUP_THEMES);
const logoPreset = z.enum(GROUP_LOGOS);

const listMembersParams = z.object({
  groupId: z.uuid(),
});

const listMembersQuery = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  role: role.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const memberResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  surname: z.string(),
  // Vrací se jen zakladateli skupiny a super adminovi.
  email: z.email().optional(),
  role: role,
  joinedAt: z.coerce.date(),
});

const listMembersResponse = z.object({
  group: z.object({
    id: z.string().min(1),
    name: z.string(),
  }),
  items: z.array(memberResponse),
  pageInfo: z.object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
  }),
});

const getSettingsParams = z.object({
  groupId: z.uuid(),
});

const groupSettingsResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  visibility: z.enum(['public', 'private']).default('private'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  invitationCode: z.string().optional(),
  owner: z
    .object({
      id: z.string().min(1),
      name: z.string(),
      surname: z.string(),
      email: z.string().email().optional(),
    })
    .nullable(),
  membersCount: z.number().int(),
  currentUserRole: role.nullable(),
  permissions: z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canManageMembers: z.boolean(),
    canLeaveGroup: z.boolean(),
  }),
});

const updateSettingsBody = z.object({
  name: z.string().trim().min(1, 'Název skupiny nesmí být prázdný').max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  category: categoryPreset.or(z.string().trim().max(50)).nullable().optional(),
  color: themePreset.or(z.string().trim().max(30)).nullable().optional(),
  logo: logoPreset.or(z.string().trim().max(30)).nullable().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  invitationCode: z.string().trim().max(20).nullable().optional(),
});

export const groupSchema = {
  role,
  categoryPreset,
  themePreset,
  logoPreset,
  listMembersParams,
  listMembersQuery,
  memberResponse,
  listMembersResponse,
  getSettingsParams,
  groupSettingsResponse,
  updateSettingsBody,
};

export type GroupRole = z.infer<typeof role>;
export type GroupCategory = z.infer<typeof categoryPreset>;
export type GroupTheme = z.infer<typeof themePreset>;
export type GroupLogo = z.infer<typeof logoPreset>;
export type ListGroupMembersParams = z.infer<typeof listMembersParams>;
export type ListGroupMembersQuery = z.infer<typeof listMembersQuery>;
export type GroupMemberResponse = z.infer<typeof memberResponse>;
export type ListGroupMembersResponse = z.infer<typeof listMembersResponse>;
export type GetGroupSettingsParams = z.infer<typeof getSettingsParams>;
export type GroupSettingsResponse = z.infer<typeof groupSettingsResponse>;
export type UpdateGroupSettingsBody = z.infer<typeof updateSettingsBody>;
