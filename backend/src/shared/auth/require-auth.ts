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
    next(new AppError('Platnost přihlášení vypršela. Přihlaste se prosím znovu', 401));
    return;
  }

  // Každý uživatel má minimálně roli 'user'. Neplatná nebo prázdná hodnota se bere jako 'user'.
  const parsedRoles = parseRoles(session.user.role);
  const roles = parsedRoles.length > 0 ? parsedRoles : ['user' as const];

  request.user = {
    id: session.user.id,
    roles,
  };

  next();
};
