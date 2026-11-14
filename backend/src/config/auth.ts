import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env, requiredEnv } from './env.js';
import { prisma } from '../db/prisma.js';
import { admin, oneTap, organization } from 'better-auth/plugins';
import { ac, admin as adminRole, owner, member, user } from '@time-tracker/shared';
import type { AccessControl } from 'better-auth/plugins/access';
import { registrationHooks } from '../modules/auth/auth.hooks.js';

export const authCorsConfig = {
  origin: env.corsOrigin,
  headers: 'Content-Type, Authorization',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  credentials: 'true',
} as const;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  baseURL: requiredEnv('BETTER_AUTH_URL'),
  basePath: '/api/auth',
  secret: requiredEnv('BETTER_AUTH_SECRET'),
  trustedOrigins: [env.corsOrigin],
  hooks: registrationHooks,
  plugins: [
    admin({
      ac: ac as AccessControl,
      roles: {
        admin: adminRole,
        owner,
        member,
        user,
      },
    }),
    oneTap({
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
    }),
    organization({
      ac: ac as AccessControl,
      roles: {
        owner,
        member,
      },
      creatorRole: 'owner',
      allowUserToCreateOrganization: true,
      cancelPendingInvitationsOnReInvite: true,
    }),
  ],
  user: {
    additionalFields: {
      surname: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
      mapProfileToUser: (profile) => {
        const name = profile.given_name?.trim();
        const surname = profile.family_name?.trim();

        if (!name) {
          throw new Error('Google account must include a given name');
        }

        if (!surname) {
          throw new Error('Google account must include a family name');
        }

        return { name, surname };
      },
    },
  },
  advanced: {
    database: {
      joins: true,
      generateId: 'uuid',
    },
  },
});
