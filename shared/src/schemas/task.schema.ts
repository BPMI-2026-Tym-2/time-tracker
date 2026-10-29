import { z } from 'zod';

export const createTaskRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
});

export const taskResponseSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
