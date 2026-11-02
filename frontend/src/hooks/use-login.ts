'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type LoginValues = {
  email: string;
  password: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Přihlášení se nepodařilo. Zkontrolujte e-mail a heslo.';
}

export function useLogin() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginValues) => {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        throw new Error(result.error.message ?? 'Přihlášení se nepodařilo.');
      }

      return result.data;
    },
    onSuccess: () => {
      router.replace('/');
    },
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      const frontendUrl = window.location.origin;
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${frontendUrl}/`,
        errorCallbackURL: `${frontendUrl}/login`,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Přihlášení přes Google se nepodařilo.');
      }

      return result.data;
    },
  });

  return {
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    loginWithGoogle: googleMutation.mutate,
    googlePending: googleMutation.isPending,
    googleError: googleMutation.error,
    isPending: loginMutation.isPending || googleMutation.isPending,
    error: loginMutation.error ?? googleMutation.error,
    getErrorMessage,
  };
}
