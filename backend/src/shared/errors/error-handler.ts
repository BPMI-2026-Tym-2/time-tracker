/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'Validation error',
      details: error.issues,
    });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
};
