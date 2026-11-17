import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env, requiredEnv } from './env.js';
import { prisma } from '../db/prisma.js';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { admin, oneTap, organization } from 'better-auth/plugins';
import { ac, admin as adminRole, owner, member, user } from '@time-tracker/shared';
import authService from '../modules/auth/auth.service.js';
import type { AccessControl } from 'better-auth/plugins/access';

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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') {
        return;
      }

      const input = authService.parseRegistrationInput(ctx.body);

      // Better Auth použije vrácené body, takže se uloží ořezané a normalizované hodnoty
      return { context: { ...ctx, body: { ...ctx.body, ...input } } };
    }),
  },
  plugins: [
    admin({
      ac: ac as AccessControl,
      defaultRole: 'user',
      roles: {
        admin: adminRole,
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
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
      mapProfileToUser: (profile) => {
        const name = profile.given_name?.trim();
        const surname = profile.family_name?.trim();

        if (!name) {
          throw new APIError('BAD_REQUEST', {
            code: 'GOOGLE_PROFILE_INCOMPLETE',
            message: 'Účet Google musí obsahovat jméno',
          });
        }

        if (!surname) {
          throw new APIError('BAD_REQUEST', {
            code: 'GOOGLE_PROFILE_INCOMPLETE',
            message: 'Účet Google musí obsahovat příjmení',
          });
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
