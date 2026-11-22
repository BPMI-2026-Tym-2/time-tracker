import { z } from 'zod';

const role = z.enum(['member', 'owner']);

const organizationParams = z.object({
  organizationId: z.uuid('Neplatné ID skupiny'),
});

const invitationParams = z.object({
  invitationId: z.string().min(1),
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

const latinCzechNameRegex = /^[a-zA-Z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ ]+$/;
const latinCzechDescriptionRegex = /^[a-zA-Z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ .,!?:;\-\n\r]+$/;

const categoryOrTagItemSchema = z
  .string()
  .trim()
  .min(1, 'Položka nesmí být prázdná')
  .max(50, 'Položka nesmí přesáhnout 50 znaků')
  .regex(
    latinCzechNameRegex,
    'Položka může obsahovat pouze latinské a české znaky, čísla a mezery',
  );

const createOrganizationRequest = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Pole Název nesmí být prázdné')
    .max(50, 'Pole Název nesmí přesáhnout 50 znaků')
    .regex(
      latinCzechNameRegex,
      'Pole Název může obsahovat pouze latinské a české znaky, čísla a mezery',
    ),
  description: z
    .string()
    .trim()
    .min(1, 'Pole Popis nesmí být prázdné')
    .max(250, 'Pole Popis nesmí přesáhnout 250 znaků')
    .regex(
      latinCzechDescriptionRegex,
      'Pole Popis může obsahovat pouze latinské a české znaky, čísla, mezery a běžnou interpunkci',
    ),
  categories: z.array(categoryOrTagItemSchema),
  tags: z.array(categoryOrTagItemSchema),
});

const createOrganizationResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  createdAt: z.coerce.date(),
});

const organizationOwnerResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  surname: z.string(),
});

const organizationDetailResponse = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  logo: z.string().nullable(),
  createdAt: z.coerce.date(),
  owner: organizationOwnerResponse.nullable(),
  memberCount: z.number().int().min(0),
  currentUserRole: role.nullable(),
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

export const organizationSchema = {
  role,
  organizationParams,
  invitationParams,
  listMembersQuery,
  listMembersResponse,
  memberResponse,
  createOrganizationRequest,
  createOrganizationResponse,
  organizationDetailResponse,
  createInvitationRequest,
  invitationResponse,
};

export type OrganizationRole = z.infer<typeof role>;
export type OrganizationMemberResponse = z.infer<typeof memberResponse>;
export type ListOrganizationMembersQuery = z.infer<typeof listMembersQuery>;
export type ListOrganizationMembersResponse = z.infer<typeof listMembersResponse>;
export type CreateOrganizationRequest = z.infer<typeof createOrganizationRequest>;
export type CreateOrganizationResponse = z.infer<typeof createOrganizationResponse>;
export type OrganizationDetailResponse = z.infer<typeof organizationDetailResponse>;
export type CreateInvitationRequest = z.infer<typeof createInvitationRequest>;
export type InvitationResponse = z.infer<typeof invitationResponse>;
