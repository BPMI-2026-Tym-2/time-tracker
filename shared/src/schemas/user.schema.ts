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
  message: z.enum(['Váš účet byl odstraněn', 'Účet byl odstraněn.']),
});

const profileResponse = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  photoUrl: z.string().nullable(),
});

const PROFILE_NAME_MAX_LENGTH = 50;

const updateProfileBody = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Pole Jméno nesmí být prázdné!' })
    .max(PROFILE_NAME_MAX_LENGTH, { message: 'Pozor, jméno je příliš dlouhé.' }),
  surname: z
    .string()
    .trim()
    .min(1, { message: 'Pole Příjmení nesmí být prázdné!' })
    .max(PROFILE_NAME_MAX_LENGTH, { message: 'Pozor, příjmení je příliš dlouhé.' }),
});

export const userSchema = {
  deleteParams,
  deleteResponse,
  profileResponse,
  updateProfileBody,
};

export type PublicUser = z.infer<typeof userResponseSchema>;
export type DeleteUserParams = z.infer<typeof deleteParams>;
export type DeleteUserResponse = z.infer<typeof deleteResponse>;
export type UserProfile = z.infer<typeof profileResponse>;
export type UpdateProfileBody = z.infer<typeof updateProfileBody>;
