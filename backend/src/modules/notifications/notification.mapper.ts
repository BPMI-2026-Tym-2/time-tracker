import type { InvitationNotification } from '@time-tracker/shared';

function toInvitationNotification(invitation: {
  id: string;
  organizationId: string;
  organizationName: string;
  createdAt: Date;
  expiresAt: Date;
}): InvitationNotification {
  return {
    id: invitation.id,
    type: 'organization-invitation',
    organization: { id: invitation.organizationId, name: invitation.organizationName },
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
  };
}

export const notificationMapper = { toInvitationNotification };
