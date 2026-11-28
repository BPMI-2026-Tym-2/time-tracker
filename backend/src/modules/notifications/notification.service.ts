import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { isAPIError } from 'better-auth/api';
import type { ListNotificationsResponse } from '@time-tracker/shared';
import { auth } from '../../config/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import { notificationMapper } from './notification.mapper.js';

async function list(request: Request): Promise<ListNotificationsResponse> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) {
      throw new AppError('Přihlášení je vyžadováno', 401);
    }

    // The email comes from the authenticated session. Never accept it from the request query.
    const invitations = await auth.api.listUserInvitations({
      query: { email: session.user.email },
    });
    const now = Date.now();
    return {
      items: invitations
        .filter((invitation) => invitation.expiresAt.getTime() > now)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id))
        .map(notificationMapper.toInvitationNotification),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError(error.message, error.statusCode);
    }
    console.error(error);
    throw new AppError('Oznámení se nepodařilo načíst', 500);
  }
}

export const notificationService = { list };
