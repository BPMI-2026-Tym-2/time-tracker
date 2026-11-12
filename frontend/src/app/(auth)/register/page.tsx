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
  const { googlePending, loginWithGoogle } = useLogin();

  const onSubmit: SubmitHandler<RegisterSchema> = (values) => {
    resetError();
    registerUser(values);
  };

  return (
    <RegisterForm
      isPending={isPending}
      googlePending={googlePending}
      errorMessage={error instanceof Error ? error.message : undefined}
      form={form}
      onSubmit={onSubmit}
      onGoogleLogin={loginWithGoogle}
    />
  );
}
