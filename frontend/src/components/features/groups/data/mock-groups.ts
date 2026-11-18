import type {
  ListOrganizationsQuery,
  OrganizationItemResponse,
  OrganizationSettingsResponse,
} from '@time-tracker/shared';

export const mockGroups: OrganizationItemResponse[] = [
  {
    id: 'grp-prog',
    name: 'Programování',
    slug: 'programovani',
    role: 'owner',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'grp-fit',
    name: 'Fitness a zdraví',
    slug: 'fitness-a-zdravi',
    role: 'member',
    createdAt: new Date('2025-01-02'),
  },
  {
    id: 'grp-cest',
    name: 'Cestování',
    slug: 'cestovani',
    role: 'member',
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'grp-game',
    name: 'Gaming',
    slug: 'gaming',
    role: 'owner',
    createdAt: new Date('2025-01-04'),
  },
];

export function getMockGroupSettings(organizationId: string): OrganizationSettingsResponse {
  const group = mockGroups.find((g) => g.id === organizationId || g.slug === organizationId);
  return {
    id: group?.id ?? organizationId,
    name: group?.name ?? 'Programování',
    slug: group?.slug ?? 'programovani',
    invitationCode: group ? group.slug.toUpperCase() : 'SKUPINA1',
    owner: {
      id: 'owner-1',
      name: 'Jan',
      surname: 'Novák',
    },
    currentUserRole: 'owner',
    permissions: {
      canEdit: true,
      canDelete: true,
    },
  };
}

export function getFilteredMockGroups(query: Partial<ListOrganizationsQuery> = {}) {
  let items = [...mockGroups];

  if (query.role && query.role !== 'all') {
    items = items.filter((g) => g.role === query.role);
  }

  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    items = items.filter((g) => g.name.toLowerCase().includes(q));
  }

  if (query.sort === 'name_asc') {
    items.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  } else if (query.sort === 'name_desc') {
    items.sort((a, b) => b.name.localeCompare(a.name, 'cs'));
  }

  return items;
}
