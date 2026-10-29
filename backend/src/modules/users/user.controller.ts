import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import { getUserById } from './user.service.js';

export async function getCurrentUserController(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await getUserById(request.user.id);

  return sendData(response, user);
}

export async function getUserByIdController(request: Request, response: Response) {
  const { id } = request.params;

  if (typeof id !== 'string') {
    throw new AppError('User id is required', 400);
  }

  const user = await getUserById(id);

  return sendData(response, user);
}
