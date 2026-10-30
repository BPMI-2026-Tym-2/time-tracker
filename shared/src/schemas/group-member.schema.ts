import { z } from 'zod';

export const groupRoleSchema = z.enum(['member', 'owner']);

export const listGroupMembersParamsSchema = z.object({
  groupId: z.uuid(),
});

export const listGroupMembersQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  role: groupRoleSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const groupMemberResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  surname: z.string(),
  // Vrací se jen zakladateli skupiny a super adminovi.
  email: z.email().optional(),
  role: groupRoleSchema,
  joinedAt: z.coerce.date(),
});

export const listGroupMembersResponseSchema = z.object({
  group: z.object({
    id: z.string().min(1),
    name: z.string(),
  }),
  items: z.array(groupMemberResponseSchema),
  pageInfo: z.object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
  }),
});

export type GroupRole = z.infer<typeof groupRoleSchema>;
export type ListGroupMembersParams = z.infer<typeof listGroupMembersParamsSchema>;
export type ListGroupMembersQuery = z.infer<typeof listGroupMembersQuerySchema>;
export type GroupMemberResponse = z.infer<typeof groupMemberResponseSchema>;
export type ListGroupMembersResponse = z.infer<typeof listGroupMembersResponseSchema>;
