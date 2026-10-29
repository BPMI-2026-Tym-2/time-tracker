import type { CreateTaskRequest } from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { createTask, findTaskById, type TaskRecord } from './task.repository.js';

export function createTaskService(input: CreateTaskRequest): Promise<TaskRecord> {
  return createTask({
    title: input.title,
    description: input.description,
  });
}

export async function getTaskById(id: string): Promise<TaskRecord> {
  const task = await findTaskById(id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
}
