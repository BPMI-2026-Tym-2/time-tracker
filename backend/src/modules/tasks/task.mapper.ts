import type { TaskResponse } from '@time-tracker/shared';
import type { TaskRecord } from './task.repository.js';

export function toTaskResponse(task: TaskRecord): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    createdAt: task.createdAt,
  };
}
