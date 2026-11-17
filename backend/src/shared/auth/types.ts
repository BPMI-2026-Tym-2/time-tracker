import type { GlobalRole, OrganizationRole } from '@time-tracker/shared';

export type { GlobalRole };

// Členství v aktuální organizaci. Naplní organization middleware (requireOrganizationRole)
export type RequestingOrganization = {
  id: string;
  role: OrganizationRole;
};

// Přihlášený uživatel, který volá službu. Naplní ho auth middleware (Better Auth)
export type RequestingUser = {
  id: string;
  roles: GlobalRole[];
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestingUser;
    organization?: RequestingOrganization;
  }
}
