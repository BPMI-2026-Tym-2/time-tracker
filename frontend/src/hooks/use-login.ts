'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { loginSchema, type LoginSchema } from '@time-tracker/shared';

export function useLogin() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (values: LoginSchema) => {
      const parsed = loginSchema.safeParse(values);

      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((error) => error.message).join(', ');

        throw new Error(`Chyba validace: ${errorMessages}`);
      }

      const result = await authClient.signIn.email(parsed.data);

      if (result.error) {
        const isInvalidCredentials =
          result.error.code === 'INVALID_EMAIL_OR_PASSWORD' ||
          result.error.message === 'Invalid email or password';

        throw new Error(
          isInvalidCredentials
            ? 'Nesprávný e-mail nebo heslo.'
            : (result.error.message ?? 'Přihlášení se nepodařilo.'),
        );
      }

      const session = await authClient.getSession();

      if (session.error || !session.data) {
        throw new Error('Přihlášení proběhlo, ale session se nepodařilo načíst.');
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

  const resetError = () => {
    loginMutation.reset();
    googleMutation.reset();
  };

  return {
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    resetError: resetError,
    loginWithGoogle: googleMutation.mutate,
    googlePending: googleMutation.isPending,
    googleError: googleMutation.error,
    isPending: loginMutation.isPending || googleMutation.isPending,
    error: loginMutation.error ?? googleMutation.error,
  };
}
