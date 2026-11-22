import { z } from 'zod';
import { PROFILE_NAME_MAX_LENGTH } from './user.schema.js';

// Heslo: alespoň 8 znaků, bez mezer; alespoň jedno velké písmeno (včetně českých),
// jedno malé písmeno, jedna číslice a jeden speciální znak (cokoli, co není písmeno ani číslice).
const passwordRegex = /^(?=.*\p{Lu})(?=.*\p{Ll})(?=.*\d)(?=.*[^\p{L}\p{N}\s])\S{8,}$/u;

export const passwordSchema = z
  .string()
  .trim()
  .min(8, { message: 'Heslo musí mít alespoň 8 znaků' })
  .regex(passwordRegex, {
    message:
      'Heslo musí obsahovat alespoň jedno velké písmeno, jedno malé písmeno, jednu číslici a jeden speciální znak. Mezery nejsou povoleny.',
  });

// Pole odesílaná na backend při registraci (bez potvrzení hesla).
// Používá je auth.service v before hooku Better Auth, aby se pravidla nedala obejít přímým voláním API.
export const registerFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Jméno je povinné.' })
    .max(PROFILE_NAME_MAX_LENGTH, { message: 'Jméno může mít maximálně 50 znaků.' }),
  surname: z
    .string()
    .trim()
    .min(1, { message: 'Příjmení je povinné.' })
    .max(PROFILE_NAME_MAX_LENGTH, { message: 'Příjmení může mít maximálně 50 znaků.' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Neplatná e-mailová adresa' })),
  password: passwordSchema,
});

export const registerSchema = registerFieldsSchema
  .extend({
    confirmPassword: z.string().min(1, { message: 'Potvrzení hesla je povinné' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hesla se neshodují',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Neplatná e-mailová adresa' })),
  password: z.string().min(1, { message: 'Heslo je povinné' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterFieldsSchema = z.infer<typeof registerFieldsSchema>;
