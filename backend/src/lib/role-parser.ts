import { GlobalRole } from '../shared/auth/types.js';

const allowedRoles = new Set<GlobalRole>(['user', 'admin']);

export function parseRoles(role: string | string[] | null | undefined): GlobalRole[] {
  const values = Array.isArray(role)
    ? role
    : (role?.split(',') ?? ([] as string[])).map((value) => value.trim());

  const roles = values.filter((value): value is GlobalRole =>
    allowedRoles.has(value as GlobalRole),
  );

  if (roles.length === 0) return [];

  return roles;
}
