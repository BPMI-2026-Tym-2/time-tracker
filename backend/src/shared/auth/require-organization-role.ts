import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import type { OrganizationRole } from '@time-tracker/shared';
import { auth } from '../../config/auth.js';
import { AppError } from '../errors/app-error.js';
import { asyncHandler } from '../http/async-handler.js';

// Ověří členství uživatele v organizaci z URL parametru :organizationId
// a že má jednu z povolených organizačních rolí. Výsledek uloží do request.organization.
export function requireOrganizationRole(...allowedRoles: OrganizationRole[]): RequestHandler {
  return asyncHandler(async (request, _response, next) => {
    const rawOrganizationId = request.params.organizationId;
    const organizationId = Array.isArray(rawOrganizationId)
      ? rawOrganizationId[0]
      : rawOrganizationId;

    if (!organizationId) {
      next(new AppError('Chybí ID organizace', 400));
      return;
    }

    const memberRole = await auth.api.getActiveMemberRole({
      headers: fromNodeHeaders(request.headers),
      query: { organizationId },
    });

    const role = memberRole?.role as OrganizationRole | undefined;

    if (!role || !allowedRoles.includes(role)) {
      next(new AppError('Nemáte dostatečná oprávnění v této organizaci!', 403));
      return;
    }

    request.organization = { id: organizationId, role };
    next();
  });
}
