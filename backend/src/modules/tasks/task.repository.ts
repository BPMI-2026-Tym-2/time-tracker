import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
} satisfies Prisma.TaskSelect;

export type TaskRecord = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;

export function createTask(data: Prisma.TaskCreateInput): Promise<TaskRecord> {
  return prisma.task.create({
    data,
    select: taskSelect,
  });
}

export function findTaskById(id: string): Promise<TaskRecord | null> {
  return prisma.task.findUnique({
    where: { id },
    select: taskSelect,
  });
}
