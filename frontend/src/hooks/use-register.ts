'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { GENERIC_AUTH_ERROR } from '@/lib/errors/auth';
import { registerSchema, type RegisterSchema } from '@time-tracker/shared';

export function useRegister() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: RegisterSchema) => {
      const parsed = registerSchema.safeParse(values);

      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((err) => err.message).join(', ');
        throw new Error(`Chyba validace: ${errorMessages}`);
      }

      const registrationData = {
        name: parsed.data.name,
        surname: parsed.data.surname,
        email: parsed.data.email,
        password: parsed.data.password,
      };

      let result;

      try {
        result = await authClient.signUp.email(registrationData);
      } catch {
        throw new Error(GENERIC_AUTH_ERROR);
      }

      if (result.error) {
        throw new Error(result.error.message ?? GENERIC_AUTH_ERROR);
      }

      let session;

      try {
        session = await authClient.getSession();
      } catch {
        throw new Error(GENERIC_AUTH_ERROR);
      }

      if (session.error || !session.data) {
        throw new Error(GENERIC_AUTH_ERROR);
      }

      return result.data;
    },
    onSuccess: () => {
      router.replace('/');
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    resetError: mutation.reset,
  };
}
