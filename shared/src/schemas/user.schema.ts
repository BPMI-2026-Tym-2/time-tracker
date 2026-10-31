import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  surname: z.string(),
  email: z.email(),
  profileImageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type PublicUser = z.infer<typeof userResponseSchema>;
