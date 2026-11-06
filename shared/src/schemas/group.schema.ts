import { z } from 'zod';

const role = z.enum(['member', 'owner']);

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
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  color: z.string().max(30).nullable().optional(),
  logo: z.string().max(30).nullable().optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

export const groupSchema = {
  role,
  listMembersParams,
  listMembersQuery,
  memberResponse,
  listMembersResponse,
  getSettingsParams,
  groupSettingsResponse,
  updateSettingsBody,
};

export type GroupRole = z.infer<typeof role>;
export type ListGroupMembersParams = z.infer<typeof listMembersParams>;
export type ListGroupMembersQuery = z.infer<typeof listMembersQuery>;
export type GroupMemberResponse = z.infer<typeof memberResponse>;
export type ListGroupMembersResponse = z.infer<typeof listMembersResponse>;
export type GetGroupSettingsParams = z.infer<typeof getSettingsParams>;
export type GroupSettingsResponse = z.infer<typeof groupSettingsResponse>;
export type UpdateGroupSettingsBody = z.infer<typeof updateSettingsBody>;
