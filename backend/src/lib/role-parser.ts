import { globalRoles, type GlobalRole } from '@time-tracker/shared';

const allowedRoles: ReadonlySet<string> = new Set(globalRoles);

export function parseRoles(role: string | string[] | null | undefined): GlobalRole[] {
  const values = Array.isArray(role)
    ? role
    : (role?.split(',') ?? ([] as string[])).map((value) => value.trim());

  const roles = values.filter((value): value is GlobalRole => allowedRoles.has(value));

  if (roles.length === 0) return [];

  return roles;
}
