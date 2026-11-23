import { APIError } from 'better-auth/api';
import invitationService from './invitation.service.js';

async function beforeAcceptInvitation({
  invitation,
  user,
}: {
  invitation: { id: string; organizationId: string };
  user: { id: string };
}): Promise<void> {
  const result = await invitationService.checkAcceptInvitation(invitation, user.id);
  if (result.ok) return;

  throw new APIError('CONFLICT', {
    code: 'ALREADY_MEMBER_OF_ORGANIZATION',
    message: 'Jste již členem této skupiny.',
  });
}

export const organizationHooks = { beforeAcceptInvitation };
