'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type RegisterValues = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export function useRegister() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      const result = await authClient.signUp.email(values);

      if (result.error) {
        throw new Error(result.error.message ?? 'Registrace se nepodařila.');
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
  };
}
