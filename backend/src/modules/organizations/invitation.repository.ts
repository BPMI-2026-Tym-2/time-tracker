import { prisma } from '../../db/prisma.js';

export type InvitationRepository = {
  isMember: (organizationId: string, userId: string) => Promise<boolean>;
  markAccepted: (invitationId: string) => Promise<void>;
};

async function isMember(organizationId: string, userId: string): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: { organizationId, userId },
    select: { id: true },
  });

  return member !== null;
}

async function markAccepted(invitationId: string): Promise<void> {
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: 'accepted' },
  });
}

const invitationRepository: InvitationRepository = {
  isMember,
  markAccepted,
};

export default invitationRepository;
