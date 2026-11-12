import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements } from 'better-auth/plugins/admin/access';
import { defaultStatements as organizationDefaultStatements } from 'better-auth/plugins/organization/access';

export const statement = {
  ...defaultStatements,
  ...organizationDefaultStatements,

  profile: ['read', 'update'],
  record: ['create', 'update', 'delete'],
  category: ['create', 'update', 'delete'],
  tag: ['create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...statement,
});

export const owner = ac.newRole({
  organization: ['update', 'delete'],
  member: ['delete'],
  invitation: ['create', 'cancel'],
  category: ['create', 'update', 'delete'],
  tag: ['create', 'update', 'delete'],
});

export const member = ac.newRole({
  record: ['create', 'update', 'delete'],
});

export const user = ac.newRole({
  profile: ['read', 'update'],
});
