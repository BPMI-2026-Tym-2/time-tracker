import { env } from './env.js';

export const authCorsConfig = {
  origin: env.corsOrigin,
  headers: 'Content-Type, Authorization',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  credentials: 'true',
} as const;
