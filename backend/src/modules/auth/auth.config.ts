import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';

export const auth = betterAuth({
  baseURL: env.betterAuthUrl ?? `http://localhost:${env.port}`,
  basePath: '/auth',
  secret: env.betterAuthSecret,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  user: {
    additionalFields: {
      surname: {
        type: 'string',
        required: true,
      },
    },
    fields: {
      image: 'profileImageUrl',
    },
  },
  trustedOrigins: [env.corsOrigin],
});
