'use client';

import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { LoginForm } from '@/components/features/auth/loginForm';
import { useLogin } from '@/hooks/use-login';
import { authClient } from '@/lib/auth-client';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, loginPending, googlePending, loginWithGoogle, isPending, error, getErrorMessage } =
    useLogin();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setValidationError('Zadejte e-mail.');
      return;
    }

    if (!emailPattern.test(email)) {
      setValidationError('Zadejte platnou e-mailovou adresu.');
      return;
    }

    if (!password) {
      setValidationError('Zadejte heslo.');
      return;
    }

    setValidationError('');
    login({ email, password });
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    setValidationError('');
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    setValidationError('');
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
      errorMessage={validationError || (error ? getErrorMessage(error) : undefined)}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
      onGoogleLogin={loginWithGoogle}
    />
  );
}
