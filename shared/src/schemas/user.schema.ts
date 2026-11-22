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

const profileResponse = userResponseSchema.pick({
  name: true,
  surname: true,
  email: true,
  profileImageUrl: true,
});

export const PROFILE_NAME_MAX_LENGTH = 50;

export const userNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Pole Jméno nesmí být prázdné!' })
  .max(PROFILE_NAME_MAX_LENGTH, { message: 'Jméno může mít maximálně 50 znaků.' });

export const userSurnameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Pole Příjmení nesmí být prázdné!' })
  .max(PROFILE_NAME_MAX_LENGTH, { message: 'Příjmení může mít maximálně 50 znaků.' });

const updateProfileRequest = z.strictObject({
  name: userNameSchema,
  surname: userSurnameSchema,
});

export const userSchema = {
  deleteParams,
  deleteResponse,
  profileResponse,
  updateProfileRequest,
};

export type PublicUser = z.infer<typeof userResponseSchema>;
export type DeleteUserParams = z.infer<typeof deleteParams>;
export type DeleteUserResponse = z.infer<typeof deleteResponse>;
export type UserProfile = z.infer<typeof profileResponse>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequest>;
