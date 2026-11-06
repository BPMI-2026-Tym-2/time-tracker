'use client';

import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { LoginForm } from '@/components/features/auth/login-form';
import { useLogin } from '@/hooks/use-login';
import { authClient } from '@/lib/auth-client';
import { loginSchema } from '@time-tracker/shared';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginPending, googlePending, loginWithGoogle, isPending, error, resetLoginError } =
    useLogin();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      return;
    }

    login({ email, password });
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    resetLoginError();
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    resetLoginError();
  }

  useEffect(() => {
    async function initializeOneTap() {
      await authClient.oneTap();
    }

    void initializeOneTap();
  }, []);

  return (
    <LoginForm
      email={email}
      password={password}
      isPending={isPending}
      loginPending={loginPending}
      googlePending={googlePending}
      errorMessage={error instanceof Error ? error.message : undefined}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
      onGoogleLogin={loginWithGoogle}
    />
  );
}
