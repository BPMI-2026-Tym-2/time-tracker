'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { GENERIC_AUTH_ERROR } from '@/lib/errors/auth';
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

      let result;

      try {
        result = await authClient.signIn.email(parsed.data);
      } catch {
        throw new Error(GENERIC_AUTH_ERROR);
      }

      if (result.error) {
        const isInvalidCredentials =
          result.error.code === 'INVALID_EMAIL_OR_PASSWORD' ||
          result.error.message === 'Invalid email or password';

        throw new Error(isInvalidCredentials ? 'Nesprávný e-mail nebo heslo.' : GENERIC_AUTH_ERROR);
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

  const googleMutation = useMutation({
    mutationFn: async () => {
      const frontendUrl = window.location.origin;
      let result;

      try {
        result = await authClient.signIn.social({
          provider: 'google',
          callbackURL: `${frontendUrl}/`,
          errorCallbackURL: `${frontendUrl}/login`,
        });
      } catch {
        throw new Error(GENERIC_AUTH_ERROR);
      }

      if (result.error) {
        throw new Error(GENERIC_AUTH_ERROR);
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
