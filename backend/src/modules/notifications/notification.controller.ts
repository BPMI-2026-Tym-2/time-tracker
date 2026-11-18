import type { Request, Response } from 'express';
import { notificationSchema } from '@time-tracker/shared';
import { sendData } from '../../shared/http/response.js';
import { notificationService } from './notification.service.js';

async function list(request: Request, response: Response): Promise<void> {
  const result = await notificationService.list(request);
  sendData(response, notificationSchema.listResponse.parse(result));
}

export const notificationController = { list };
