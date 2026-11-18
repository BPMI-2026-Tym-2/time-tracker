import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { isAPIError } from 'better-auth/api';
import type { ListNotificationsResponse } from '@time-tracker/shared';
import { auth } from '../../config/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import { notificationMapper } from './notification.mapper.js';

async function list(request: Request): Promise<ListNotificationsResponse> {
  try {
    // Use session headers, never the server-only email query parameter.
    // Better Auth verifies email ownership before exposing invitation IDs.
    const invitations = await auth.api.listUserInvitations({
      headers: fromNodeHeaders(request.headers),
    });
    const now = Date.now();
    return {
      items: invitations
        .filter((invitation) => invitation.expiresAt.getTime() > now)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id))
        .map(notificationMapper.toInvitationNotification),
    };
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) {
      throw new AppError(error.message, error.statusCode);
    }
    console.error(error);
    throw new AppError('Oznámení se nepodařilo načíst', 500);
  }
}

export const notificationService = { list };
