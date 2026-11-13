import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../../config/auth.js';
import { AppError } from '../errors/app-error.js';
import { parseRoles } from '../../lib/role-parser.js';

export const requireAuth: RequestHandler = async (request, _response, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    next(new AppError('Uživatel není přihlášen!', 401));
    return;
  }

  const roles = parseRoles(session.user.role);

  if (roles.length === 0) {
    next(new AppError('Uživatel má neplatnou roli!', 500));
    return;
  }

  request.user = {
    id: session.user.id,
    roles,
  };

  next();
};
