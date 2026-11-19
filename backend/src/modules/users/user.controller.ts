import type { Request, Response } from 'express';
import { userProfileResponseSchema } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import userService from './user.service.js';

async function getProfile(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new AppError('Platnost přihlášení vypršela. Přihlaste se prosím znovu', 401);
  }

  const profile = await userService.getProfile(request.user.id);
  sendData(response, userProfileResponseSchema.parse(profile));
}

const userController = {
  getProfile,
};

export default userController;
