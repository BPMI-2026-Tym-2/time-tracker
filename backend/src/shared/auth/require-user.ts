import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../../modules/auth/auth.config.js';
import { AppError } from '../errors/app-error.js';

export type AuthMiddleware = {
  requireUser: RequestHandler;
};

const requireUser: RequestHandler = async (request, _response, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) throw new AppError('Not authenticated', 401);
    request.user = { id: session.user.id, role: 'user' };
    next();
  } catch (error) {
    next(error);
  }
};

const authMiddleware: AuthMiddleware = {
  requireUser,
};

export default authMiddleware;
