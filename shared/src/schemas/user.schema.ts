import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  surname: z.string(),
  email: z.email(),
  profileImageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
});

const deleteParams = z.object({
  userId: z.uuid(),
});

const deleteResponse = z.object({
  message: z.literal('Účet byl odstraněn.'),
});

export const userSchema = {
  deleteParams,
  deleteResponse,
};

export type PublicUser = z.infer<typeof userResponseSchema>;
export type DeleteUserParams = z.infer<typeof deleteParams>;
export type DeleteUserResponse = z.infer<typeof deleteResponse>;
