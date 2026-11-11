import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import type { GlobalRole } from './types.js';

export function requireRole(...requiredRoles: GlobalRole[]): RequestHandler {
  return (request, _response, next) => {
    const user = request.user;

    if (!user) {
      next(new AppError('Uživatel není přihlášen!', 401));
      return;
    }

    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRequiredRole) {
      next(new AppError('Nemáte dostatečná oprávnění!', 403));
      return;
    }

    next();
  };
}
