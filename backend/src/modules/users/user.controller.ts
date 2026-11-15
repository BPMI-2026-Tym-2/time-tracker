import type { Request, Response } from 'express';
import { userProfileResponseSchema } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import userService from './user.service.js';

async function getMe(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new AppError('Uživatel není přihlášen!', 401);
  }

  const profile = await userService.getOwnProfile(request.user.id);

  sendData(response, userProfileResponseSchema.parse(profile));
}

const userController = {
  getMe,
};

export default userController;
