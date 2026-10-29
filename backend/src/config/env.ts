import 'dotenv/config';

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3001);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

export const env = {
  port: readPort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? 'time-tracker-better-auth-secret-key-32chars',
  betterAuthUrl: process.env.BETTER_AUTH_URL,
} as const;
