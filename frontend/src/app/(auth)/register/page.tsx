'use client';

import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { RegisterForm } from '@/components/features/auth/register-form';
import { useRegister } from '@/hooks/use-register';
import { registerSchema } from '@time-tracker/shared';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isPending, error, resetRegisterError } = useRegister();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = registerSchema.safeParse({
      name,
      surname,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      return;
    }

    register(parsed.data);
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    resetRegisterError();
  }

  function handleSurnameChange(event: ChangeEvent<HTMLInputElement>) {
    setSurname(event.target.value);
    resetRegisterError();
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    resetRegisterError();
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    resetRegisterError();
  }

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
    resetRegisterError();
  }

  return (
    <RegisterForm
      name={name}
      surname={surname}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      isPending={isPending}
      errorMessage={error instanceof Error ? error.message : undefined}
      onNameChange={handleNameChange}
      onSurnameChange={handleSurnameChange}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onConfirmPasswordChange={handleConfirmPasswordChange}
      onSubmit={handleSubmit}
    />
  );
}
