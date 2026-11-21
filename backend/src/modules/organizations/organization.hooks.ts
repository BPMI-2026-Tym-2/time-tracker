import { APIError } from 'better-auth/api';
import { prisma } from '../../db/prisma.js';

async function beforeAcceptInvitation({
  invitation,
  user,
}: {
  invitation: { id: string; organizationId: string };
  user: { id: string };
}): Promise<void> {
  const existingMember = await prisma.member.findFirst({
    where: { organizationId: invitation.organizationId, userId: user.id },
  });
  if (!existingMember) return;

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: 'accepted' },
  });
  throw new APIError('CONFLICT', {
    code: 'ALREADY_MEMBER_OF_ORGANIZATION',
    message: 'Jste již členem této skupiny.',
  });
}

export const organizationHooks = { beforeAcceptInvitation };
