import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: 'Jméno je povinné.' }),
    surname: z.string().min(1, { message: 'Příjmení je povinné.' }),
    email: z.email({ message: 'Neplatná e-mailová adresa' }),
    password: z
      .string()
      .min(8, { message: 'Heslo musí mít alespoň 8 znaků' })
      .regex(passwordRegex, {
        message:
          'Heslo musí obsahovat alespoň jedno velké písmeno, jedno malé písmeno, jedno číslo a jeden speciální znak',
      }),
    confirmPassword: z.string().min(1, { message: 'Potvrzení hesla je povinné' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hesla se neshodují',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email({ message: 'Neplatná e-mailová adresa' }),
  password: z.string().min(1, { message: 'Heslo je povinné' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
