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
  };
}
