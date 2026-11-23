import { prisma } from '../../db/prisma.js';

async function findOrganizationDetailById(organizationId: string, userId: string) {
  const [organization, ownerMember, currentMember, memberCount] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId } }),
    // Nejstarší vlastník; chybějící vlastník nesmí shodit endpoint
    prisma.member.findFirst({
      where: { organizationId, role: 'owner' },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true, surname: true } } },
    }),
    prisma.member.findFirst({
      where: { organizationId, userId },
      select: { role: true },
    }),
    prisma.member.count({ where: { organizationId } }),
  ]);

  if (!organization) {
    return null;
  }

  return {
    organization,
    owner: ownerMember?.user ?? null,
    memberCount,
    currentUserRole: currentMember?.role ?? null,
  };
}

const organizationRepository = {
  findOrganizationDetailById,
};

export default organizationRepository;
