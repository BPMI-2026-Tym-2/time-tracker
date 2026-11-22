import type { Request, Response } from 'express';
import { userSchema } from '@time-tracker/shared';
import type { RequestingUser } from '../../shared/auth/types.js';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import { auth } from '../../config/auth.js';
import userService from './user.service.js';

export type UserController = {
  getProfile: (request: Request, response: Response) => Promise<void>;
  updateProfile: (request: Request, response: Response) => Promise<void>;
  deleteUser: (request: Request, response: Response) => Promise<void>;
};

function requireRequestUser(request: Request): RequestingUser {
  if (!request.user) {
    throw new AppError('Platnost přihlášení vypršela. Přihlaste se prosím znovu', 401);
  }

  return request.user;
}

async function getProfile(request: Request, response: Response): Promise<void> {
  const user = requireRequestUser(request);
  const profile = await userService.getProfile(user.id);
  sendData(response, userSchema.profileResponse.parse(profile));
}

async function updateProfile(request: Request, response: Response): Promise<void> {
  const user = requireRequestUser(request);
  const body = userSchema.updateProfileRequest.parse(request.body);
  const profile = await userService.updateProfile(user.id, body);
  sendData(response, userSchema.profileResponse.parse(profile));
}

async function deleteUser(request: Request, response: Response) {
  const user = requireRequestUser(request);

  const { userId } = userSchema.deleteParams.parse(request.params);
  const result = await userService.deleteUser(user, userId);

  if (user.id === userId) {
    const { authCookies } = await auth.$context;
    for (const cookie of [
      authCookies.sessionToken,
      authCookies.sessionData,
      authCookies.dontRememberToken,
    ]) {
      const { domain, path, secure, httpOnly, sameSite, partitioned } = cookie.attributes;
      response.cookie(cookie.name, '', {
        domain,
        path,
        secure,
        httpOnly,
        sameSite: sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined,
        partitioned,
        maxAge: 0,
      });
    }
  }

  sendData(response, userSchema.deleteResponse.parse(result));
}

const userController: UserController = {
  getProfile,
  updateProfile,
  deleteUser,
};

export default userController;
