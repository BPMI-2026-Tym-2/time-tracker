import invitationRepository from './invitation.repository.js';

export type AcceptInvitationCheck = { ok: true } | { ok: false; reason: 'ALREADY_MEMBER' };

// Pokud je uživatel už členem skupiny, pozvánku uzavře jako přijatou a přijetí odmítne.
async function checkAcceptInvitation(
  invitation: { id: string; organizationId: string },
  userId: string,
): Promise<AcceptInvitationCheck> {
  if (!(await invitationRepository.isMember(invitation.organizationId, userId))) {
    return { ok: true };
  }

  await invitationRepository.markAccepted(invitation.id);
  return { ok: false, reason: 'ALREADY_MEMBER' };
}

const invitationService = {
  checkAcceptInvitation,
};

export default invitationService;
