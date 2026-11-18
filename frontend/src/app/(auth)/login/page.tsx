'use client';

import { useEffect } from 'react';
import { LoginForm } from '@/components/features/auth/login-form';
import { useLogin } from '@/hooks/use-login';
import { authClient } from '@/lib/auth-client';
import { loginSchema, type LoginSchema } from '@time-tracker/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

export default function LoginPage() {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { login, loginPending, googlePending, loginWithGoogle, isPending, error, resetError } =
    useLogin();

  const onSubmit: SubmitHandler<LoginSchema> = (data) => {
    resetError();
    login(data);
  };

  useEffect(() => {
    async function initializeOneTap() {
      await authClient.oneTap();
    }

    void initializeOneTap();
  }, []);

  return (
    <LoginForm
      form={form}
      onSubmit={onSubmit}
      loginPending={loginPending}
      googlePending={googlePending}
      isPending={isPending}
      errorMessage={error instanceof Error ? error.message : undefined}
      onGoogleLogin={loginWithGoogle}
    />
  );
}
