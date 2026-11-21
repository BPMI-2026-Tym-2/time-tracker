import type { Request, Response } from 'express';
import { activitySchema } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import { activityService } from './activity.service.js';

async function listPersonal(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new AppError('Platnost přihlášení vypršela. Přihlaste se prosím znovu', 401);
  }

  const query = activitySchema.listQuery.parse(request.query);
  const result = await activityService.listActivities({ userId: request.user.id }, query);
  sendData(response, activitySchema.listResponse.parse(result));
}

async function listOrganization(request: Request, response: Response): Promise<void> {
  if (!request.organization) {
    throw new AppError('Nemáte dostatečná oprávnění v této organizaci!', 403);
  }

  const query = activitySchema.listQuery.parse(request.query);
  const result = await activityService.listActivities(
    { organizationId: request.organization.id },
    query,
  );
  sendData(response, activitySchema.listResponse.parse(result));
}

export const activityController = { listPersonal, listOrganization };
