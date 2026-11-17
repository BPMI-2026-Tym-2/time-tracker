import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env, requiredEnv } from './env.js';
import { prisma } from '../db/prisma.js';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { admin, oneTap, organization } from 'better-auth/plugins';
import {
  ac,
  admin as adminRole,
  owner,
  member,
  user,
  registerFieldsSchema,
} from '@time-tracker/shared';
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

      const parsed = registerFieldsSchema.safeParse(ctx.body);

      if (!parsed.success) {
        const message = parsed.error.issues.map((issue) => issue.message).join(', ');

        throw new APIError('BAD_REQUEST', { message });
      }
    }),
  },
  plugins: [
    admin({
      ac: ac as AccessControl,
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
          throw new Error('Google account must include a given name');
        }

        if (!surname) {
          throw new Error('Google account must include a family name');
        }

        return { name, surname };
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    // Stricter limits for credential endpoints. Storage is in-memory by default,
    // so limits are per process until secondary storage is configured.
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
    },
  },
  advanced: {
    database: {
      joins: true,
      generateId: 'uuid',
    },
  },
});
