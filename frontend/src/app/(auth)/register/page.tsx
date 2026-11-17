'use client';

import { RegisterForm } from '@/components/features/auth/register-form';
import { useRegister } from '@/hooks/use-register';
import { registerSchema, type RegisterSchema } from '@time-tracker/shared';
import { useLogin } from '@/hooks/use-login';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

export default function RegisterPage() {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { register: registerUser, isPending, error, resetError } = useRegister();
  const { googlePending, googleError, loginWithGoogle } = useLogin();

  const onSubmit: SubmitHandler<RegisterSchema> = (values) => {
    resetError();
    registerUser(values);
  };

  const displayedError = error ?? googleError;

  return (
    <RegisterForm
      isPending={isPending}
      googlePending={googlePending}
      errorMessage={displayedError instanceof Error ? displayedError?.message : undefined}
      form={form}
      onSubmit={onSubmit}
      onGoogleLogin={loginWithGoogle}
    />
  );
}
