import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env, requiredEnv } from '../../config/env.js';
import { prisma } from '../../db/prisma.js';
import { oneTap } from 'better-auth/plugins';
import { registrationHooks } from './auth.hooks.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  baseURL: requiredEnv('BETTER_AUTH_URL'),
  basePath: '/auth',
  secret: requiredEnv('BETTER_AUTH_SECRET'),
  trustedOrigins: [env.corsOrigin],
  hooks: registrationHooks,
  plugins: [
    oneTap({
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
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
