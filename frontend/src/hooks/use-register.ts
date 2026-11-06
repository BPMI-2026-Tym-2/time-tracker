'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
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

      const result = await authClient.signUp.email(registrationData);

      if (result.error) {
        throw new Error(result.error.message ?? 'Registrace se nepodařila.');
      }

      const session = await authClient.getSession();

      if (session.error || !session.data) {
        throw new Error('Registrace proběhla, ale session se nepodařilo načíst.');
      }

      return result.data;
    },
    onSuccess: () => {
      router.push('/');
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    resetRegisterError: mutation.reset,
  };
}
