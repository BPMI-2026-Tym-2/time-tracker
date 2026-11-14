import type { Request, Response } from 'express';
import { userSchema } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import { auth } from '../../config/auth.js';
import userService from './user.service.js';

export type UserController = {
  deleteUser: (request: Request, response: Response) => Promise<void>;
};

async function deleteUser(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { userId } = userSchema.deleteParams.parse(request.params);
  const result = await userService.deleteUser(request.user, userId);

  // smazáním vlastního účtu je uživatel odhlášen i v prohlížeči

  if (request.user.id === userId) {
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
  deleteUser,
};

export default userController;
