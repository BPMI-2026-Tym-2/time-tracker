import type { RequestHandler } from 'express';
import { authCorsConfig } from '../../config/auth.js';

export const corsMiddleware: RequestHandler = (request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', authCorsConfig.origin);
  response.setHeader('Access-Control-Allow-Headers', authCorsConfig.headers);
  response.setHeader('Access-Control-Allow-Methods', authCorsConfig.methods);
  response.setHeader('Access-Control-Allow-Credentials', authCorsConfig.credentials);

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
};
