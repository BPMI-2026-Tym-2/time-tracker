/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { APIError } from 'better-auth/api';
import { AppError } from './app-error.js';

// Jediné místo, kde se mapují chyby na HTTP odpovědi. Pravidla jsou popsaná
// v docs/backend/errors.md.
export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  // Vlastní chyby s explicitním statusem (401, 403, 404, ...)
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  // Chyby z Better Auth (např. neplatné vstupy v hookách, FORBIDDEN z pluginů)
  if (error instanceof APIError) {
    const statusCode = Number(error.statusCode);

    if (statusCode >= 500) {
      console.error(error);
      response.status(500).json({ error: 'Internal server error' });
      return;
    }

    response.status(statusCode).json({ error: error.message });
    return;
  }

  // Neplatná vstupní data z Zod schémat
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'Validation error',
      details: error.issues,
    });
    return;
  }

  // Neočekávané chyby: detail jen do logu, klientovi generická zpráva
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
};
