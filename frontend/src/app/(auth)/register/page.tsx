'use client';

import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { RegisterForm } from '@/components/features/auth/registerForm';
import { useRegister } from '@/hooks/use-register';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isPending, error } = useRegister();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    register({ name, surname, email, password });
  }

  return (
    <RegisterForm
      name={name}
      surname={surname}
      email={email}
      password={password}
      isPending={isPending}
      errorMessage={error instanceof Error ? error.message : undefined}
      onNameChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
      onSurnameChange={(event: ChangeEvent<HTMLInputElement>) => setSurname(event.target.value)}
      onEmailChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
      onPasswordChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
      onSubmit={handleSubmit}
    />
  );
}
