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
  name: z.string().trim().min(1, 'Název Skupiny je povinný').max(100),
  slug: z.string().trim().min(1, 'Slug Skupiny je povinný').max(100),
});

const createOrganizationResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  createdAt: z.coerce.date(),
});

const createInvitationRequest = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email('Zadejte platnou e-mailovou adresu.')),
  })
  .strict();

const invitationResponse = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  email: z.email(),
  role: z.literal('member'),
  status: z.literal('pending'),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
});

const organizationSettingsResponse = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string(),
  owner: z.object({
    id: z.string().min(1),
    name: z.string(),
    surname: z.string(),
  }),
  currentUserRole: role.nullable(),
  permissions: z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
  }),
});

const updateOrganizationSettingsRequest = z.object({
  name: z.string().trim().min(1, 'Název skupiny je povinný').max(100),
});

const listOrganizationsQuery = z.object({
  search: z.string().trim().optional(),
  role: z.enum(['all', 'owner', 'member']).default('all'),
  sort: z.enum(['default', 'name_asc', 'name_desc']).default('default'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

const organizationItemResponse = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string(),
  logo: z.string().nullable().optional(),
  role: role,
  createdAt: z.coerce.date(),
});

const listOrganizationsResponse = z.object({
  items: z.array(organizationItemResponse),
  pageInfo: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const organizationSchema = {
  role,
  organizationParams,
  listMembersQuery,
  listMembersResponse,
  memberResponse,
  createOrganizationRequest,
  createOrganizationResponse,
  createInvitationRequest,
  invitationResponse,
  organizationSettingsResponse,
  updateOrganizationSettingsRequest,
  listOrganizationsQuery,
  organizationItemResponse,
  listOrganizationsResponse,
};

export type OrganizationRole = z.infer<typeof role>;
export type OrganizationMemberResponse = z.infer<typeof memberResponse>;
export type ListOrganizationMembersQuery = z.infer<typeof listMembersQuery>;
export type ListOrganizationMembersResponse = z.infer<typeof listMembersResponse>;
export type CreateOrganizationRequest = z.infer<typeof createOrganizationRequest>;
export type CreateOrganizationResponse = z.infer<typeof createOrganizationResponse>;
export type CreateInvitationRequest = z.infer<typeof createInvitationRequest>;
export type InvitationResponse = z.infer<typeof invitationResponse>;
export type OrganizationSettingsResponse = z.infer<typeof organizationSettingsResponse>;
export type UpdateOrganizationSettingsRequest = z.infer<typeof updateOrganizationSettingsRequest>;
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuery>;
export type OrganizationItemResponse = z.infer<typeof organizationItemResponse>;
export type ListOrganizationsResponse = z.infer<typeof listOrganizationsResponse>;
