import { z } from 'zod';

export const createGroupRequestSchema = z.object({
  name: z.string().trim().min(1, 'Název skupiny je povinný').max(100),
  description: z.string().trim().max(1000).optional(),
});

export const groupResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;
export type GroupResponse = z.infer<typeof groupResponseSchema>;
