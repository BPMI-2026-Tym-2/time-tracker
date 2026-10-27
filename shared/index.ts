// import { z } from 'zod';

// Názorná ukázka, jak definovat schéma pro validaci dat pomocí Zod
// export const TaskSchema = z.object({
//   id: z.uuid(),
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().optional(),
//   createdAt: z.date(),
// });

// Zod automaticky vygeneruje TypeScript typ!
// export type TaskSchemaDTO = z.infer<typeof TaskSchema>;

export * from './generated/index.js';
