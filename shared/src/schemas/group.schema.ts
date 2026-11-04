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

export const groupSchema = {
  role,
  listMembersParams,
  listMembersQuery,
  memberResponse,
  listMembersResponse,
};

export type GroupRole = z.infer<typeof role>;
export type ListGroupMembersParams = z.infer<typeof listMembersParams>;
export type ListGroupMembersQuery = z.infer<typeof listMembersQuery>;
export type GroupMemberResponse = z.infer<typeof memberResponse>;
export type ListGroupMembersResponse = z.infer<typeof listMembersResponse>;
