import { z } from 'zod';

export const TEST_MESSAGE = 'Ahoj!';

export const TaskSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  createdAt: z.date(),
});

// Zod automaticky vygeneruje TypeScript typ!
export type TaskSchemaDTO = z.infer<typeof TaskSchema>;

export * from './generated/index.js';
