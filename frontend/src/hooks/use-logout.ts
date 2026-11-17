'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function useLogout() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message ?? 'Odhlášení se nepodařilo.');
      }
    },
    onSuccess: () => router.replace('/login'),
  });

  return {
    logout: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
