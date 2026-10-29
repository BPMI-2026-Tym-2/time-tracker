import type { Request, Response, NextFunction } from 'express';
import type { User, Session } from 'better-auth';
import { AppError } from '../../shared/errors/app-error.js';
import { getSession } from './auth.service.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const session = await getSession(request.headers);

  if (!session) {
    throw new AppError('Unauthorized', 401);
  }

  request.user = session.user;
  request.session = session.session;
  next();
}
