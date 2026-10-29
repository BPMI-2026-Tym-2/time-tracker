import type { Request, Response } from 'express';
import { createTaskRequestSchema, taskResponseSchema } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import { createTaskService, getTaskById } from './task.service.js';
import { toTaskResponse } from './task.mapper.js';

export async function createTaskController(request: Request, response: Response) {
  const input = createTaskRequestSchema.parse(request.body);
  const task = await createTaskService(input);

  return sendData(response, taskResponseSchema.parse(toTaskResponse(task)), 201);
}

export async function getTaskController(request: Request, response: Response) {
  const { id } = request.params;

  if (typeof id !== 'string') {
    throw new AppError('Task id is required', 400);
  }

  const task = await getTaskById(id);

  return sendData(response, taskResponseSchema.parse(toTaskResponse(task)));
}
