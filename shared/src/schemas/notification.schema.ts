import { z } from 'zod';

const invitationNotification = z.object({
  id: z.string().min(1),
  type: z.literal('organization-invitation'),
  organization: z.object({ id: z.string().min(1), name: z.string() }),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
});

const listResponse = z.object({ items: z.array(invitationNotification) });

export const notificationSchema = { invitationNotification, listResponse };
export type InvitationNotification = z.infer<typeof invitationNotification>;
export type ListNotificationsResponse = z.infer<typeof listResponse>;
