import { z } from 'zod';

const role = z.enum(['member', 'owner']);

const organizationParams = z.object({
  organizationId: z.string().min(1),
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
  email: z.email().optional(),
  role,
  joinedAt: z.coerce.date(),
});

const listMembersResponse = z.object({
  organization: z.object({
    id: z.string().min(1),
    name: z.string(),
    slug: z.string(),
  }),
  items: z.array(memberResponse),
  pageInfo: z.object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
  }),
});

const createOrganizationRequest = z.object({
  name: z.string().trim().min(1, 'Název organizace je povinný').max(100),
  slug: z.string().trim().min(1, 'Slug organizace je povinný').max(100),
});

const createOrganizationResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  createdAt: z.coerce.date(),
});

export const organizationSchema = {
  role,
  organizationParams,
  listMembersQuery,
  listMembersResponse,
  memberResponse,
  createOrganizationRequest,
  createOrganizationResponse,
};

export type OrganizationRole = z.infer<typeof role>;
export type OrganizationMemberResponse = z.infer<typeof memberResponse>;
export type ListOrganizationMembersQuery = z.infer<typeof listMembersQuery>;
export type ListOrganizationMembersResponse = z.infer<typeof listMembersResponse>;
export type CreateOrganizationRequest = z.infer<typeof createOrganizationRequest>;
export type CreateOrganizationResponse = z.infer<typeof createOrganizationResponse>;
